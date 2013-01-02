Ext.define('GreenFleet.view.management.VehicleTrack', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_track',

	title : T('menu.track'),

	entityUrl : 'track',

	importUrl : 'track/import',

	afterImport : function() {
		this.search();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {
		var self = this;		
		this.items = [
		  		   {
		  		      xtype: 'panel',
					  height : 30,
					  
					  layout : {
							type : 'hbox',
							align : 'stretch'
					  }, 
					  tbar : [ T('label.vehicle') + ' : ',{
							xtype : 'combo',
							name : 'vehicle_filter',
							itemId : 'vehicle_filter',
							queryMode : 'local',
							store : 'VehicleBriefStore',
							displayField : 'id',
							valueField : 'id'
						}, T('label.driver')+ ' : ',{
							xtype : 'combo',
							name : 'driver_filter',
							itemId : 'driver_filter',
							queryMode : 'local',
							store : 'DriverBriefStore',
							displayField : 'id',
							valueField : 'id'
						}, T('label.date')+ ' : ',{
							xtype : 'datefield',
							name : 'date_filter',
							itemId : 'date_filter',
							format : 'Y-m-d',
							submitFormat : 'U',
							maxValue : new Date(),
							value : new Date()
						}, {
							text : T('button.search'),
							itemId : 'search'
						}, '  ', {
							itemId : 'today'
						} ,
						{
							itemId : 'yesterday'
						} ,{
							itemId : 'ago2days'
						} ,{
							itemId : 'ago3days'
						} ]
		  		   },
		  		   {
				    	xtype : 'container',
				    	flex : 1,
				    	anchor: '100% 100%',
				    	layout : {
					    	type : 'vbox',
					    	align : 'stretch'
					    },
					    items : [  this.zmap ]
				    }	
		  		];
		this.callParent(arguments);

		this.on('afterrender', function() {
			self.getMap();
			self.onInit();
		});	
		
		this.on('resize', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
		});
		
		

		/**
		 * 검색 버튼 선택시 
		 */
		this.down('#search').on('click', function() {
			self.search();
		});
		
		this.down('#today').on('click', function() {
			var date = new Date();
			self.sub('date_filter').setValue(date);
			self.search();
		});
		
		this.down('#yesterday').on('click', function() {
			var date = new Date();
			date.setDate(date.getDate() - 1);
			self.sub('date_filter').setValue(date);
			self.search();
		});
		
		this.down('#ago2days').on('click', function() {
			var date = new Date();
			date.setDate(date.getDate() - 2);
			self.sub('date_filter').setValue(date);
			self.search();
		});
		
		this.down('#ago3days').on('click', function() {
			var date = new Date();
			date.setDate(date.getDate() - 3);
			self.sub('date_filter').setValue(date);
			self.search();
		});
	},

	
	getFilter : function() {
		
		if(!this.sub('vehicle_filter') || !this.sub('driver_filter') || !this.sub('date_filter'))
			return null;
		
		if(!this.sub('vehicle_filter').getSubmitValue() && !this.sub('driver_filter').getSubmitValue() && !this.sub('date_filter').getSubmitValue())
			return null;
		
		var filters = [];
		
		if(this.sub('vehicle_filter').getSubmitValue()) {
			filters.push({"property" : "vehicle_id", "value" : this.sub('vehicle_filter').getSubmitValue()});
		}
		
		if(this.sub('date_filter').getSubmitValue()) {
			filters.push({"property" : "date", "value" : this.sub('date_filter').getSubmitValue()});
		}
				
		if(this.sub('driver_filter').getSubmitValue()) {
			filters.push({"property" : "driver_id", "value" : this.sub('driver_filter').getSubmitValue()});
		}		
		
		return filters;
	},	
	
	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		this.sub('vehicle_filter').setValue(this.vehicle);
		this.search();
	},
	
	search : function() {
		var self = this;
		var store = Ext.getStore('TrackStore');
		var filter = this.getFilter();
		store.clearFilter(true);
		store.filter(filter);
		store.load(function(records) {
			self.refreshMap(records);
		});
	},
	
	refreshMap : function(records) {
		var self = this;
		var map = this.getMap();
		
		this.resetTrackLines();
		this.setTripMarkers(null);
		this.resetPathMarkers();
		this.clearInfoWindow();

		var trip;
		var traces = [];
		var bounds, latlng, last;
		var v = [];
		var distance = 0;

		// TODO PathMarkers must be here.
		Ext.Array.each(records, function(record) {
			if(!trip) {
				trip = new google.maps.Polyline({
					map : map,
					strokeColor : '#FF0000',
					strokeOpacity : 1.0,
					strokeWeight : 4
				});
				path = trip.getPath();
				if(last) {
					path.push(latlng);
					traces.push(last);
					v.push(last.get('velocity'));
				}
			}
			
			var lat = record.get('lat');
			var lng = record.get('lng');

			if(lat !== 0 || lng !== 0) {
				latlng = new google.maps.LatLng(lat, lng);
				if (!bounds)
					bounds = new google.maps.LatLngBounds(latlng, latlng);
				else
					bounds.extend(latlng);
			}
			
			// 30분 Gap은 새로운 Trip으로 판단한다.
			if(last && (last.get('datetime') > record.get('datetime') + 30 * 60 * 1000)) {
				var avg_v = Ext.Array.sum(v) / v.length;
				self.addTrackLine(map, traces, trip, avg_v, distance);

				trip = null;
				path = [];
				traces = [];
				v = [];
				distance = 0;
			}
				
			if(trip) {
				path.push(latlng);
				traces.push(record);
				v.push(record.get('velocity'));
				if(traces.length > 1) {
					distance += GreenFleet.map.distance(last.get('lat'), last.get('lng'), record.get('lat'), record.get('lng'), 'K');
				}
			}

			last = record;
		});

		if (!bounds) {
			var defaultLatlng = new google.maps.LatLng(System.props.lat, System.props.lng);
			bounds = new google.maps.LatLngBounds(defaultLatlng, defaultLatlng);

			var content = [
				'<div class="bubbleWrap">',
				'<div>&nbsp;&nbsp;&nbsp;'+T('msg.noDriving')+'</div>',
				'</div>'
			].join('');

			if(!this.getInfoWindow()) {
				this.setInfoWindow(GreenFleet.label.create({
					map : map,
					xoffset : -110,
					yoffset : -100
				}));
			} else {
				this.getInfoWindow().setMap(map);
			}
			this.getInfoWindow().set('position', defaultLatlng);
			this.getInfoWindow().set('text', content);

			this.getInfoWindow().setVisible(true);
		} else {
			var avg_v = Ext.Array.sum(v) / v.length;
			this.addTrackLine(map, traces, trip, avg_v, distance);
		}

		if (bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			map.setCenter(bounds.getNorthEast());
		} else {
			map.fitBounds(bounds);
		}
	},
	
	getGeocoder : function() {
		return this.geocoder;
	},
	
	setGeocoder : function(geocoder) {
		this.geocoder = geocoder;
	},
	
	getMap : function() {
		if(!this.map) {
			this.setGeocoder(new google.maps.Geocoder());
			this.map = new google.maps.Map(this.sub('mapbox').getEl().down('.map').dom, {
				zoom : 10,
				maxZoom : 19,
				minZoom : 3,
				center : new google.maps.LatLng(System.props.lat, System.props.lng),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			});
		}
		return this.map;
	},

	setMap : function(map) {
		this.map = map;
	},
	
	zmap : {
		xtype : 'panel',
		flex : 1,
		itemId : 'mapbox',
		html : '<div class="map" style="height:100%"></div>'
	},
	
	
	onInit : function() {
		var self = this;
		
		var now = new Date();
		this.sub('today').setText(Ext.Date.format(now, 'D Y-m-d'));
		now.setDate(now.getDate() - 1);
		this.sub('yesterday').setText(Ext.Date.format(now, 'D Y-m-d'));
		now.setDate(now.getDate() - 1);
		this.sub('ago2days').setText(Ext.Date.format(now, 'D Y-m-d'));
		now.setDate(now.getDate() - 1);
		this.sub('ago3days').setText(Ext.Date.format(now, 'D Y-m-d'));
		
		function showPathMarkers() {
			var pathMarkers = self.getPathMarkers();
			if(!pathMarkers)
				return;
			
			var density = Math.max(1, (16 - self.getMap().getZoom()) * 3);
			var x = 0;
			for(var i = 0;i < pathMarkers.length;i++) {
				setTimeout(function() {
					pathMarkers[x++].setOptions({
						visible : x % density ? false : true,
						realVisible : x % density ? false : true,
						animation : google.maps.Animation.DROP
					});
				}, i * 20);
			}
		}
		
		function unselectTrip() {
			self.unselectTrip();
		}
		
		this.on('painted', function() {
			switch(self.config.queryOn) {
				case 'driver' :
					GreenFleet.setting.on('driver', self.refresh, self);
					break;
				case 'vehicle' :
					GreenFleet.setting.on('vehicle', self.refresh, self);
					break;
				default :
					GreenFleet.setting.on('driver', self.delayRefresh, self);
					GreenFleet.setting.on('vehicle', self.delayRefresh, self);
			}

			self.delayRefresh();
		});
		
		this.on('erased', function() {
			switch(self.config.queryOn) {
				case 'driver' :
					GreenFleet.setting.un('driver', self.refresh, self);
					break;
				case 'vehicle' :
					GreenFleet.setting.un('vehicle', self.refresh, self);
					break;
				default :
					GreenFleet.setting.un('driver', self.delayRefresh, self);
					GreenFleet.setting.un('vehicle', self.delayRefresh, self);
			}
		});
		
		this.on('resize', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
		});

		google.maps.event.addListener(self.getMap(), 'click', unselectTrip);
		google.maps.event.addListener(self.getMap(), 'zoom_changed', showPathMarkers);
	},
	
	
	
	
	resetTrackLines : function() {
		if(this.tracklines) {
			Ext.Array.each(this.tracklines, function(line) {
				line.setMap(null);
			});
		}
		
		this.tracklines = [];
	},
	
	unselectTrip: function() {
		this.clearInfoWindow();
		if(this.selectedTrack) {
			this.selectedTrack.setOptions({
				strokeColor : '#FF0000',
				strokeOpacity : 1,
				strokeWeight : 4
			});
		}
		
		if(this.tripMarkers){
			for(var i=0; i<this.tripMarkers.length; i++){
				this.tripMarkers[i].setVisible(true);
			}
		}
		
		if(this.pathMarkers){
			for(var i=0; i<this.pathMarkers.length; i++){
				if(this.pathMarkers[i].realVisible){
					this.pathMarkers[i].setVisible(true);
				}
			}
		}
	},
	
	addTrackLine : function(map, traces, line, avg_v, distance) {
		var self = this;
		this.tracklines.push(line);
		
		var path = line.getPath();

		var first = new google.maps.Marker({
			position : path.getAt(0),
			map : map
		});
		var end = new google.maps.Marker({
			position : path.getAt(path.getLength() - 1),
			icon : 'resources/image/iconStartPoint.png',
			map : map
		});
		this.addTripMarkers(first);
		this.addTripMarkers(end);
		
		var i = 0;
		path.forEach(function(point) {
			var marker = new google.maps.Marker({
				position : point,
				icon : 'resources/image/iconPin.png',
				map : map,
				visible : false,
				trace : traces[i++]
			});
			self.addPathMarkers(marker);
			google.maps.event.addListener(marker, 'click', selectPath);
		});
		
		function selectPath(e) {
			var marker = this;
			
			self.unselectTrip();

			self.selectedTrack = line;
			
			line.setOptions({
				strokeColor : '#CF0000',
				strokeOpacity : 0.2,
				strokeWeight : 2
			});
			
			for(var i=0; i<self.tripMarkers.length; i++){
				self.tripMarkers[i].setVisible(false);
			}
			
			for(var i=0; i<self.pathMarkers.length; i++){
				self.pathMarkers[i].setVisible(false);
			}
			
			self.clearInfoWindow();

			var trace = this.trace;
			var lat = trace.get('lat');
			var lng = trace.get('lng');
			
			GreenFleet.map.getLocation(lat, lng, function(address) {
				var content = [
					'<div class="bubbleWrap">',
						'<div class="close"></div>',
						'<div class="trackBubble">',
							'<div>' + address + '</div>',
							'<div><span>'+ T('label.latitude') + '/' + T('label.longitude') +'</span>' + trace.get('lat').toFixed(2) + ' / ' + trace.get('lng').toFixed(2) + '</div>',
							'<div><span>'+ T('label.velocity') +'</span>' + trace.get('velocity') + ' KM/H' + '</div>',
							'<div><span>'+ T('label.time') +'</span>' + Ext.Date.format(trace.get('datetime'), 'Y-m-d H:i:s') + '</div>',
						'</div>',
					'</div>'
				].join('');

				if(!self.infowindow) {
					self.infowindow = GreenFleet.label.create({
						map : marker.getMap(),
						xoffset : -110,
						yoffset : -150
					});
				}
				self.infowindow.set('position', e.latLng);
				self.infowindow.set('text', content);

				self.infowindow.setVisible(true);
			});
		}

		function selectTrip(e) {
			var marker = this;

			
			self.unselectTrip();

			self.selectedTrack = line;
			
			line.setOptions({
				strokeColor : '#CF0000',
				strokeOpacity : 0.2,
				strokeWeight : 2
			});
			
			for(var i=0; i<self.tripMarkers.length; i++){
				self.tripMarkers[i].setVisible(false);
			}
			
			for(var i=0; i<self.pathMarkers.length; i++){
				self.pathMarkers[i].setVisible(false);
			}
			
			var path = line.getPath();
			
			var startTime = Ext.Date.format(traces[traces.length - 1].get('datetime'), 'Y-m-d H:i:s');
			var endTime = Ext.Date.format(traces[0].get('datetime'), 'Y-m-d H:i:s');
			var driverId = traces[0].get('driver_id');
			var vehicleId = traces[0].get('vehicle_id');
			
			var driver = Ext.getStore('DriverBriefStore').getById(driverId);
			var vehicle = Ext.getStore('VehicleMapStore').getById(vehicleId);
			
			var content = [
				'<div class="bubbleWrap">',
					'<div class="close"></div>',
					'<div class="trackBubble">',
						'<div><span>'+ T('label.vehicle') +'</span>' + vehicleId + ' - ' + vehicle.get('registration_number') + '</div>',
						'<div><span>'+ T('label.driver') +'</span>' + driverId + ' - ' + driver.get('name') + '</div>',
						'<div><span>'+ T('label.driving') + T('label.start') +'</span>' + startTime + '</div>',
						'<div><span>'+ T('label.driving') + T('label.end') +'</span>' + endTime + '</div>',
						'<div><span>'+ T('label.average_speed') +'</span>' + Math.floor(avg_v) + ' KM/H</div>',
						'<div><span>'+ T('label.run_dist') +'</span>' + distance.toFixed(2) + ' KM</div>',
					'</div>',
				'</div>'
			].join('');

			if(!self.infowindow) {
				self.infowindow = GreenFleet.label.create({
					map : marker.getMap(),
					xoffset : -110,
					yoffset : -150
				});
			}
			self.infowindow.set('position', e.latLng);
			self.infowindow.set('text', content);

			self.infowindow.setVisible(true);
		}

		// TODO Remove EventListeners
		google.maps.event.addListener(line, 'click', selectTrip);
		google.maps.event.addListener(first, 'click', selectTrip);
		google.maps.event.addListener(end, 'click', selectTrip);
	},
	
	getTrackLines : function() {
		return this.tracklines;
	},
	
	getPathMarkers : function() {
		return this.pathMarkers;
	},
	
	setPathMarkers : function(markers) {
		if(this.pathMarkers) {
			Ext.each(this.pathMarkers, function(marker) {
				marker.setMap(null);
			});
		}
		this.pathMarkers = markers;
	},
	
	addPathMarkers : function(markers) {
		if(!this.pathMarkers)
			this.pathMarkers = [];
		this.pathMarkers.push(markers);
	},
	
	resetPathMarkers : function() {
		if(this.pathMarkers) {
			Ext.each(this.pathMarkers, function(marker) {
				marker.setMap(null);
			});
		}
		
		this.pathMarkers = null;
	},

	getTripMarkers : function() {
		return this.tripMarkers;
	},

	setTripMarkers : function(markers) {
		if (this.tripMarkers) {
			Ext.each(this.tripMarkers, function(marker) {
				marker.setMap(null);
			});
		}

		this.tripMarkers = markers;
	},
	
	addTripMarkers : function(markers) {
		if(!this.tripMarkers)
			this.tripMarkers = [];
		this.tripMarkers.push(markers);
	},

	resetTripMarkers : function() {
		if (this.tripMarkers) {
			Ext.each(this.tripMarkers, function(marker) {
				marker.setMap(null);
			});
		}

		this.tripMarkers = null;
	},

	clearInfoWindow : function() {
		if(this.infowindow)
			this.infowindow.setVisible(false);
	},
	
	getInfoWindow : function() {
		return this.infowindow;
	},

	setInfoWindow : function(infowindow) {
		if (this.infowindow) {
			this.infowindow.setMap(null);
		}
		
		this.infowindow = infowindow;
	}
	
});