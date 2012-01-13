Ext.define('GreenFleet.view.monitor.Information', {
	extend : 'Ext.Container',
	alias : 'widget.monitor_information',
	
	id : 'monitor_information',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [this.ztitle, {
			xtype : 'container',
			height : 300,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ {
				xtype : 'container',
				width : 620,
				layout : {
					type : 'vbox',
					align : 'stretch'
				},
				items : [ this.zvehicleinfo, this.zincidents ]
			}, this.zmap ]
		}, this.ztabpanel];
		
		this.callParent();

		var self = this;
		
		this.getMapBox().on('afterrender', function(mapbox) {
			var options = {
				zoom : 10,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.setMap(new google.maps.Map(mapbox.getEl().down('.map').dom, options));

			/*
			 * For test only.
			 */
			google.maps.event.addListener(self.getMap(), 'click', function(e) {
				Ext.Ajax.request({
					url : 'track/save',
					method : 'POST',
					params : {
						vehicle : self.getVehicle(),
						driver : self.getDriver(),
						lattitude : e.latLng.lat(),
						longitude : e.latLng.lng()
					},
					success : function(resp, opts) {
						var path = self.getTrackLine().getPath();
						path.insertAt(0, e.latLng);
						Ext.getStore('VehicleStore').load();
					},
					failure : function(resp, opts) {
						console.log('Failed');
						console.log(resp);
					}
				});
			});
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
		});
		
		this.getTrackStore().on('load', function() {
			self.refreshTrack();
		});
		
		this.getVehicleField().on('change', function(field, vehicle) {
			var record = self.getForm().getRecord();
			
			/*
			 * Get Vehicle Information (Image, Registration #, ..) from VehicleStore
			 */
			var vehicleStore = Ext.getStore('VehicleStore');
			var vehicleRecord = vehicleStore.findRecord('id', record.get('id'));
			var vehicleImageClip = vehicleRecord.get('imageClip');
			if (vehicleImageClip) {
				self.getVehicleImage().setSrc('download?blob-key=' + vehicleImageClip);
			} else {
				self.getVehicleImage().setSrc('resources/image/bgVehicle.png');
			}
			
			self.getTitleBox().vehicle.dom.innerHTML = vehicle + '[' + vehicleRecord.get('registrationNumber') + ']';
			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', record.get('driver'));
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('imageClip');
			if (driverImageClip) {
				self.getDriverImage().setSrc('download?blob-key=' + driverImageClip);
			} else {
				self.getDriverImage().setSrc('resources/image/bgDriver.png');
			}

			self.getTitleBox().driver.dom.innerHTML = driver + '[' + driverRecord.get('name') + ']';

			/*
			 * Get Address of the location by ReverseGeoCode.
			 */
			var location = record.get('location');
			if (location == null || location.length == 0) {
				var lattitude = record.get('lattitude');
				var longitude = record.get('longitude');

				if (!lattitude || !longitude)
					return;

				var latlng = new google.maps.LatLng(lattitude, longitude);

				geocoder = new google.maps.Geocoder();
				geocoder.geocode({
					'latLng' : latlng
				}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							var address = results[0].formatted_address
							record.set('location', address);
							self.getLocationField().setValue(address);
						}
					} else {
						console.log("Geocoder failed due to: " + status);
					}
				});
			}

			/*
			 * TrackStore를 다시 로드함.
			 */
			// TODO 시간 정보 필터가 필요(당일 주행분만 보이기 또는 일자 정보를 설정하도록 하여 해당일자만 필터링함.)
			self.getTrackStore().clearFilter(true);
			self.getTrackStore().filter('vehicle', vehicle); 
			self.getTrackStore().load();
		});
	},
	
	setVehicle : function(vehicleRecord) {
		this.getForm().loadRecord(vehicleRecord);
	},
	
	getForm : function() {
		if(!this.form)
			this.form = this.down('form');
		return this.form;
	},
	
	getVehicleField : function() {
		if(!this.vehicleField)
			this.vehicleField = this.down('form > [itemId=id]');
		return this.vehicleField;
	}, 
	
	getDriverField : function() {
		if(!this.driverField)
			this.driverField = this.down('form > [itemId=driver]');
		return this.driverField;
	},
	
	getLocationField : function() {
		if(!this.locationField)
			this.locationField = this.down('form > [itemId=location]');
		return this.locationField;
	},
	
	getDriverImage : function() {
		if(!this.driverImage)
			this.driverImage = this.down('[itemId=driverImage]');
		return this.driverImage;
	},
	
	getVehicleImage : function() {
		if(!this.vehicleImage)
			this.vehicleImage = this.down('[itemId=vehicleImage]');
		return this.vehicleImage;
	},

	getTitleBox : function() {
		if(!this.titleBox)
			this.titleBox = this.down('[itemId=title]');
		return this.titleBox;
	},
	
	getMapBox : function() {
		if(!this.mapbox)
			this.mapbox = this.down('[itemId=map]');
		return this.mapbox;
	},
	
	getMap : function() {
		return this.map;
	},
	
	setMap : function(map) {
		this.map = map;
	},
	
	getTrackLine : function() {
		return this.trackline;
	},
	
	setTrackLine : function(trackline) {
		if(this.trackline)
			this.trackline.setMap(null);
		this.trackline = trackline;
	},
	
	getMarker : function() {
		return this.marker;
	},
	
	setMarker : function(marker) {
		if(this.marker)
			this.marker.setMap(null);
		this.marker = marker;
	},
	
	resetMarkers : function() {
		if(this.markers)
			this.markers.setMap(null);
		this.markers = null;
	},
	
	getTrackStore : function() {
		if(!this.trackStore)
			this.trackStore = Ext.getStore('TrackByVehicleStore');
		return this.trackStore;
	},
	
	getVehicle : function() {
		return this.getVehicleField().getValue();
	},
	
	getDriver : function() {
		return this.getDriverField().getValue();
	},
	
	refreshTrack : function() {
		this.setTrackLine(new google.maps.Polyline({
			map : this.getMap(),
		    strokeColor: '#000000',
		    strokeOpacity: 0.3,
		    strokeWeight: 4
		}));
		this.setMarker(null);

		var path = this.getTrackLine().getPath();
		var bounds;
		var latlng;

		this.getTrackStore().each(function(record) {
			latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
			path.push(latlng);
			if(!bounds)
				bounds = new google.maps.LatLngBounds(latlng, latlng);
			else
				bounds.extend(latlng);
		});
		
		if(!bounds) {
			var defaultLatlng = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
			bounds = new google.maps.LatLngBounds(defaultLatlng, defaultLatlng);
		}
		
		if(bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else {
			this.getMap().fitBounds(bounds);
		}

		var first = this.getTrackStore().first(); 
		if(first) {
			this.setMarker(new google.maps.Marker({
			    position: new google.maps.LatLng(first.get('lattitude'), first.get('longitude')),
			    map: this.getMap()
			}));
		}
	},

	ztitle : {
		xtype : 'box',
		cls : 'pageTitle',
		itemId : 'title',
		renderSelectors : {
			vehicle : 'span.vehicle',
			driver : 'span.driver'
		},
		renderTpl : '<h1>Vehicle : <span class="vehicle">Vehicle</span>, Driver : <span class="driver">Driver</span></h1>',
		height : 35
	},
	
	ztabpanel : {
		xtype : 'tabpanel',
		flex : 1,
		items : [ {
			xtype : 'monitor_info_by_vehicle',
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : 'Control By Vehicle'
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : 'Control By Driver'
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : 'Maintenance'
		} ]
	},
	
	zvehicleinfo : {
		xtype : 'panel',
		title : 'Vehicle Information',
		cls : 'paddingPanel',
		layout : {
			type : 'hbox'
		},
		items : [ {
			xtype : 'image',
			itemId : 'vehicleImage',
			cls : 'imgVehicle'
		}, {
			xtype : 'image',
			itemId : 'driverImage',
			cls : 'imgDriver'
		}, {
			xtype : 'form',
			height : 140,
			flex : 1,
			defaults : {
				labelWidth : 60,
				labelSeparator : '',
				anchor : '100%'
			},
			items : [ {
				xtype : 'displayfield',
				name : 'id',
				fieldLabel : 'Vehicle',
				itemId : 'id'
			}, {
				xtype : 'displayfield',
				name : 'driver',
				fieldLabel : 'Driver',
				itemId : 'driver'
			}, {
				xtype : 'displayfield',
				name : 'location',
				fieldLabel : 'Location',
				itemId : 'location'
			}, {
				xtype : 'displayfield',
				name : 'distance',
				fieldLabel : 'Run. Dist.'
			}, {
				xtype : 'displayfield',
				name : 'runningTime',
				fieldLabel : 'Run. Time'
			} ]
		} ]
	},
	
	zincidents : {
		xtype : 'panel',
		title : 'Incidents',
		layout : 'fit',
		cls : 'paddingPanel',
		height : 115,
		items : [ {
			xtype : 'container',
			itemId : 'incidents',
			layout : {
				type : 'hbox',
				align : 'left'
			},
			items : [ {
				xtype : 'box',
				cls : 'incidentThumb',
				html : '<div class="vehicle">V00001</div><div class="driver">HAHAHA001</div><div class="date">2012.01.25</div>'
			}, {
				xtype : 'box',
				cls : 'incidentThumb',
				html : '<div class="vehicle">V00001</div><div class="driver">HAHAHA001</div><div class="date">2012.01.25</div>'
			}, {
				xtype : 'box',
				cls : 'incidentThumb',
				html : '<div class="vehicle">V00001</div><div class="driver">HAHAHA001</div><div class="date">2012.01.25</div>'
			}, {
				xtype : 'box',
				cls : 'incidentThumb',
				html : '<div class="vehicle">V00001</div><div class="driver">HAHAHA001</div><div class="date">2012.01.25</div>'
			} ]
		} ]
	},
	
	zmap : {
		xtype : 'panel',
		title : 'Tracking Recent Driving',
		cls : 'paddingPanel',
		itemId : 'map',
		flex : 1,
		html : '<div class="map" style="width:100%;height:90%;border:1px solid #999;border-width:1px 2px 2px 1px"></div>'
	}
});
