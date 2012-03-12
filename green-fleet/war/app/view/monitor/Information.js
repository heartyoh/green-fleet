Ext.define('GreenFleet.view.monitor.Information', {
	extend : 'Ext.Container',
	alias : 'widget.monitor_information',

	id : 'monitor_information',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [ this.ztitle, {
			xtype : 'container',
			height : 320,
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
		}, this.ztabpanel ];

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
//			google.maps.event.addListener(self.getMap(), 'click', function(e) {
//				Ext.Ajax.request({
//					url : 'track/save',
//					method : 'POST',
//					params : {
//						vehicle_id : self.getVehicle(),
//						driver_id : self.getDriver(),
//						terminal_id : self.getTerminal(),
//						lattitude : e.latLng.lat(),
//						longitude : e.latLng.lng()
//					},
//					success : function(resp, opts) {
//						var path = self.getTrackLine().getPath();
//						path.insertAt(0, e.latLng);
//						Ext.getStore('VehicleStore').load();
//					},
//					failure : function(resp, opts) {
//						console.log('Failed');
//						console.log(resp);
//					}
//				});
//			});
		});

		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
		});

		this.getTrackStore().on('load', function() {
			self.refreshTrack();
		});

		this.getIncidentStore().on('load', function() {
			if (self.isVisible(true))
				self.refreshIncidents();
		});

		this.sub('id').on('change', function(field, vehicle) {
			var record = self.getForm().getRecord();

			/*
			 * Get Vehicle Information (Image, Registration #, ..) from
			 * VehicleStore
			 */
			var vehicleStore = Ext.getStore('VehicleBriefStore');
			var vehicleRecord = vehicleStore.findRecord('id', record.get('id'));
			var vehicleImageClip = vehicleRecord.get('image_clip');
			if (vehicleImageClip) {
				self.sub('vehicleImage').setSrc('download?blob-key=' + vehicleImageClip);
			} else {
				self.sub('vehicleImage').setSrc('resources/image/bgVehicle.png');
			}

			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverBriefStore');
			var driverRecord = driverStore.findRecord('id', record.get('driver_id'));
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('image_clip');
			if (driverImageClip) {
				self.sub('driverImage').setSrc('download?blob-key=' + driverImageClip);
			} else {
				self.sub('driverImage').setSrc('resources/image/bgDriver.png');
			}

			self.sub('title').update({
				vehicle : vehicle + ' (' + vehicleRecord.get('registration_number') + ')',
				driver : driver + ' (' + driverRecord.get('name') + ')'
			});

			/*
			 * Get Address of the location by ReverseGeoCode.
			 */
			var location = record.get('location');
			if (location == null || location.length == 0) {
				var lattitude = record.get('lattitude');
				var longitude = record.get('longitude');

				if (lattitude !== undefined && longitude !== undefined) {
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
			}

			/*
			 * TrackStore를 다시 로드함.
			 */
			self.getTrackStore().load({
				params : {
					vehicle_id : vehicle,
					/* for Unix timestamp (in seconds) */
					date : Math.round((new Date().getTime() - (60 * 60 * 24 * 1000)) / 1000),
					start : 0,
					limit : 1000
				}
//				filters : [ {
//					property : 'vehicle_id',
//					value : vehicle
//				}, {
//					property : 'date',
//					/* for Unix timestamp (in seconds) */
//					value : Math.round((new Date().getTime() - (60 * 60 * 24 * 1000)) / 1000)
//				} ]
			});

			/*
			 * IncidentStore를 다시 로드함.
			 */
			self.getIncidentStore().load({
				params : {
					vehicle_id : vehicle,
					confirm : false,
					start : 0,
					limit : 4
				}
			});
		});
	},

	setVehicle : function(vehicleRecord) {
		this.getForm().loadRecord(vehicleRecord);
	},

	getForm : function() {
		if (!this.form)
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
		if (this.trackline)
			this.trackline.setMap(null);
		this.trackline = trackline;
	},

	getMarkers : function() {
		return this.markers;
	},

	setMarkers : function(markers) {
		if (this.markers) {
			Ext.each(this.markers, function(marker) {
				marker.setMap(null);
			});
		}

		this.markers = markers;
	},

	resetMarkers : function() {
		if (this.markers) {
			Ext.each(this.markers, function(marker) {
				marker.setMap(null);
			});
		}

		this.markers = null;
	},

	getTrackStore : function() {
		if (!this.trackStore)
			this.trackStore = Ext.getStore('TrackByVehicleStore');
		return this.trackStore;
	},

	getIncidentStore : function() {
		if (!this.incidentStore)
			this.incidentStore = Ext.getStore('IncidentByVehicleStore');
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
			strokeColor : '#FF0000',
			strokeOpacity : 1.0,
			strokeWeight : 4
		}));
		this.setMarkers(null);

		var path = this.getTrackLine().getPath();
		var bounds;
		var latlng;

		this.getTrackStore().each(function(record) {
			var lat = record.get('lattitude');
			var lng = record.get('longitude');

			if(lat !== 0 || lng !== 0) {
				latlng = new google.maps.LatLng(lat, lng);
				path.push(latlng);
				if (!bounds)
					bounds = new google.maps.LatLngBounds(latlng, latlng);
				else
					bounds.extend(latlng);
			}
		});

		if (path.getLength() === 0) {
			var record = this.getForm().getRecord();
			var lat = record.get('lattitude');
			var lng = record.get('longitude');
			var defaultLatlng = null;
			
			if(lat === 0 && lng === 0) {
				defaultLatlng = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
			} else {
				defaultLatlng = new google.maps.LatLng(lat, lng);
			}
			path.push(defaultLatlng);
			bounds = new google.maps.LatLngBounds(defaultLatlng, defaultLatlng);
		}

		if (bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else {
			this.getMap().fitBounds(bounds);
		}

		var first = path.getAt(0);

		if (first) {
			var start = new google.maps.Marker({
				position : new google.maps.LatLng(first.lat(), first.lng()),
				map : this.getMap()
			});

			var last = path.getAt(path.getLength() - 1);

			var end = new google.maps.Marker({
				position : new google.maps.LatLng(last.lat(), last.lng()),
				icon : 'resources/image/iconStartPoint.png',
				map : this.getMap()
			});

			this.setMarkers([ start, end ]);
		}
	},

	incidentHandler : function(e, el, incident) {
		GreenFleet.doMenu('monitor_incident');
		GreenFleet.getMenu('monitor_incident').setIncident(incident, true);
	},

	refreshIncidents : function() {
		this.sub('incidents').removeAll();
		var max = this.getIncidentStore().count() > 4 ? 4 : this.getIncidentStore().count();
		for ( var i = 0; i < max; i++) {
			var incident = this.getIncidentStore().getAt(i);
			var self = this;
			this.sub('incidents').add(
					{
						xtype : 'box',
						cls : 'incidentThumb',
						listeners : {
							'render' : function() {
								this.getEl().on('click', self.incidentHandler, self, incident);
							}
						},
						data : {
							vehicle_id : incident.get('vehicle_id'),
							driver_id : incident.get('driver_id'),
							datetime : Ext.Date.format(incident.get('datetime'), 'Y-m-d H:i:s')
						},
						tpl : [ '<div class="vehicle">{vehicle_id}</div>', '<div class="driver">{driver_id}</div>',
								'<div class="date">{datetime}</div>' ]
					})
		}
	},

	ztitle : {
		xtype : 'box',
		cls : 'pageTitle',
		itemId : 'title',
		data : {
			vehicle : 'Vehicle',
			driver : 'Driver'
		},
		tpl : '<h1>' + T('label.vehicle') + ' : <span class="vehicle">{vehicle}</span>, ' + T('label.driver') + ' : <span class="driver">{driver}</span></h1>',
		height : 35
	},

	ztabpanel : {
		xtype : 'tabpanel',
		flex : 1,
		items : [ {
			xtype : 'monitor_info_by_vehicle'
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : T('tab.ctrl_by_vehicle')
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : T('tab.ctrl_by_driver')
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : T('tab.maintenance')
		} ]
	},

	zvehicleinfo : {
		xtype : 'panel',
		title : T('title.vehicle_information'),
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
			height : 160,
			flex : 1,
			defaults : {
				labelWidth : 60,
				labelSeparator : '',
				anchor : '100%'
			},
			items : [ {
				xtype : 'displayfield',
				name : 'id',
				fieldLabel : T('label.vehicle'),
				cls : 'dotUnderline',
				itemId : 'id'
			}, {
				xtype : 'displayfield',
				name : 'driver_id',
				fieldLabel : T('label.driver'),
				cls : 'dotUnderline',
				itemId : 'driver'
			}, {
				xtype : 'displayfield',
				name : 'terminal_id',
				fieldLabel : T('label.terminal'),
				cls : 'dotUnderline',
				itemId : 'terminal'
			}, {
				xtype : 'displayfield',
				name : 'location',
				fieldLabel : T('label.location'),
				cls : 'dotUnderline',
				itemId : 'location'
			}, {
				xtype : 'displayfield',
				name : 'distance',
				cls : 'dotUnderline',
				fieldLabel : T('label.run_dist'),
			}, {
				xtype : 'displayfield',
				name : 'running_time',
				fieldLabel : T('label.run_time'),
				cls : 'dotUnderline'
			} ]
		} ]
	},

	zincidents : {
		xtype : 'panel',
		title : T('title.incidents'),
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
		title : T('title.tracking_recent_driving'),
		cls : 'paddingPanel backgroundGray borderLeftGray',
		itemId : 'map',
		flex : 1,
		html : '<div class="map"></div>'
	}
});
