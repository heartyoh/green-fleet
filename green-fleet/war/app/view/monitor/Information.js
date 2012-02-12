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
		
		this.sub('map').on('afterrender', function(mapbox) {
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
						vehicle_id : self.getVehicle(),
						driver_id : self.getDriver(),
						terminal_id : self.getTerminal(),
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
		
		this.getIncidentStore().on('load', function() {
			if(self.isVisible(true))
				self.refreshIncidents();
		});
		
		this.sub('id').on('change', function(field, vehicle) {
			var record = self.getForm().getRecord();
			
			/*
			 * Get Vehicle Information (Image, Registration #, ..) from VehicleStore
			 */
			var vehicleStore = Ext.getStore('VehicleStore');
			var vehicleRecord = vehicleStore.findRecord('id', record.get('id'));
			var vehicleImageClip = vehicleRecord.get('image_clip');
			if (vehicleImageClip) {
				self.sub('vehicleImage').setSrc('download?blob-key=' + vehicleImageClip);
			} else {
				self.sub('vehicleImage').setSrc('resources/image/bgVehicle.png');
			}
			
			self.sub('title').vehicle.dom.innerHTML = vehicle + '[' + vehicleRecord.get('registrationNumber') + ']';
			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', record.get('driver_id'));
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('image_clip');
			if (driverImageClip) {
				self.sub('driverImage').setSrc('download?blob-key=' + driverImageClip);
			} else {
				self.sub('driverImage').setSrc('resources/image/bgDriver.png');
			}

			self.sub('title').driver.dom.innerHTML = driver + '[' + driverRecord.get('name') + ']';

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
							self.sub('location').setValue(address);
						}
					} else {
						console.log("Geocoder failed due to: " + status);
					}
				});
			}

			/*
			 * TrackStore瑜��ㅼ� 濡����
			 */
			// TODO ��� ��낫 ���媛����(�뱀� 二쇳�遺�� 蹂댁�湲���� �쇱� ��낫瑜��ㅼ����濡���� �대��쇱�留����留��.)
			self.getTrackStore().clearFilter(true);
			self.getTrackStore().filter('vehicle_id', vehicle); 
			self.getTrackStore().load();
			
			/*
			 * IncidentStore瑜��ㅼ� 濡����
			 */
			self.getIncidentStore().clearFilter(true);
			self.getIncidentStore().filter('vehicle_id', vehicle);
			self.getIncidentStore().load();
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
	
	getMarkers : function() {
		return this.markers;
	},
	
	setMarkers : function(markers) {
		if(this.markers) {
			Ext.each(this.markers, function(marker) {
				marker.setMap(null);
			});
		}

		this.markers = markers;
	},
	
	resetMarkers : function() {
		if(this.markers) {
			Ext.each(this.markers, function(marker) {
				marker.setMap(null);
			});
		}

		this.markers = null;
	},
	
	getTrackStore : function() {
		if(!this.trackStore)
			this.trackStore = Ext.getStore('TrackByVehicleStore');
		return this.trackStore;
	},

	getIncidentStore : function() {
		if(!this.incidentStore)
			this.incidentStore = Ext.getStore('IncidentStore');
		return this.incidentStore;
	},
	
	getVehicle : function() {
		return this.sub('id').getValue();
	},
	
	getDriver : function() {
		return this.sub('driver').getValue();
	},
	
	getTerminal : function() {
		return this.sub('terminal').getValue();
	},
	
	refreshTrack : function() {
		this.setTrackLine(new google.maps.Polyline({
			map : this.getMap(),
		    strokeColor: '#FF0000',
		    strokeOpacity: 1.0,
		    strokeWeight: 4
		}));
		this.setMarkers(null);

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
			var start = new google.maps.Marker({
			    position: new google.maps.LatLng(first.get('lattitude'), first.get('longitude')),
			    map: this.getMap()
			});
			
			var last = this.getTrackStore().last();
			
			var end = new google.maps.Marker({
			    position: new google.maps.LatLng(last.get('lattitude'), last.get('longitude')),
			    icon : 'resources/image/iconStartPoint.png',
			    map: this.getMap()
			});
			
			this.setMarkers([start, end]);
		}
	},
	
	incidentHandler : function(e, el, incident) {
		GreenFleet.doMenu('monitor_incident');
		GreenFleet.getMenu('monitor_incident').setIncident(incident, true);
	},
	
	refreshIncidents : function() {
		this.sub('incidents').removeAll();
		var max = this.getIncidentStore().count() > 4 ? 4 : this.getIncidentStore().count();
		for(var i = 0;i < max;i++) {
			var incident = this.getIncidentStore().getAt(i);
			var self = this;
			this.sub('incidents').add({
				xtype : 'box',
				cls : 'incidentThumb',
				listeners : {
					'render' : function() {
						this.getEl().on('click', self.incidentHandler, self, incident);
					}
				},
				html : '<div class="vehicle">' + 
					incident.get('vehicle_id') + 
					'</div><div class="driver">' + 
					incident.get('driver_id') + 
					'</div><div class="date">' + 
					Ext.Date.format(incident.get('datetime'), 'Y-m-d H:i:s') +
					'</div>'
			})
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
				cls : 'dotUnderline',
				itemId : 'id'
			}, {
				xtype : 'displayfield',
				name : 'driver_id',
				fieldLabel : 'Driver',
				cls : 'dotUnderline',
				itemId : 'driver'
			}, {
				xtype : 'displayfield',
				name : 'terminal_id',
				fieldLabel : 'Terminal',
				cls : 'dotUnderline',
				itemId : 'terminal'
			}, {
				xtype : 'displayfield',
				name : 'location',
				fieldLabel : 'Location',
				cls : 'dotUnderline',
				itemId : 'location'
			}, {
				xtype : 'displayfield',
				name : 'distance',
				cls : 'dotUnderline',
				fieldLabel : 'Run. Dist.'
			}, {
				xtype : 'displayfield',
				name : 'running_time',
				fieldLabel : 'Run. Time',
				cls : 'dotUnderline'
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
			}
		} ]
	},
	
	zmap : {
		xtype : 'panel',
		title : 'Tracking Recent Driving',
		cls : 'paddingPanel backgroundGray borderLeftGray',
		itemId : 'map',
		flex : 1,
		html : '<div class="map"></div>'
	}
});
