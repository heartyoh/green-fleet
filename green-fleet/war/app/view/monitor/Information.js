Ext.define('GreenFleet.view.monitor.Information', {
	extend : 'Ext.Container',
	alias : 'widget.monitor_information',
	
	id : 'monitor_information',

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

		var main = this;
		
		var form = this.down('form');
		var driverImage = this.down('[itemId=driverImage]');
		var vehicleImage = this.down('[itemId=vehicleImage]');
		var title = this.down('[itemId=title]');
		var mapbox = this.down('[itemId=map]');
		var map;
		mapbox.on('afterrender', function() {
			var options = {
				zoom : 10,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			map = new google.maps.Map(mapbox.getEl().down('.map').dom, options);
		});
		this.on('activate', function() {
			google.maps.event.trigger(map, 'resize');
		});
		
		var trackLine;
		var marker;
		function drawTrack(vehicle, driver) {
			if(trackLine) {
				trackLine.setMap(null);
				trackLine = null;
			}
			if(marker) {
				marker.setMap(null);
				marker = null;
			}
			
			var trackStore = Ext.getStore('TrackByVehicleStore');
			// TODO 시간 정보 필터가 필요(당일 주행분만 보이기 또는 일자 정보를 설정하도록 하여 해당일자만 필터링함.)
			trackStore.filters.clear();
			trackStore.filter('vehicle', vehicle); 
			trackStore.load(function(records, op, success) {
				if(!success)
					return;

				trackLine = new google.maps.Polyline({
					map : map,
				    strokeColor: '#000000',
				    strokeOpacity: 0.3,
				    strokeWeight: 4
				});
				
				var bounds;
				
				var path = trackLine.getPath();
				for(var i=0;i < records.length;i++) {
					var record = records[i];
					var latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
					path.push(latlng);
					if(!bounds)
						bounds = new google.maps.LatLngBounds(latlng, latlng);
					else
						bounds.extend(latlng);
				}
				
				if(!bounds) {
					var latlng = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
					bounds = new google.maps.LatLngBounds(latlng, latlng);
				}
				
				if(bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
					map.setCenter(bounds.getNorthEast());
				} else {
					map.fitBounds(bounds);
				}

				if(records.length > 0) {
					var last = records[records.length - 1];
					
					marker = new google.maps.Marker({
					    position: new google.maps.LatLng(last.get('lattitude'), last.get('longitude')),
					    map: map
					});
				}
				
				/*
				 * For Test Only.
				 */
				function addLatLng(event) {
					Ext.Ajax.request({
						url : 'track/save',
						method : 'POST',
						params : {
							vehicle : vehicle,
							driver : driver,
							lattitude : event.latLng.lat(),
							longitude : event.latLng.lng()
						},
						success : function(resp, opts) {
							var path = trackLine.getPath();
							path.push(event.latLng);
						},
						failure : function(resp, opts) {
							console.log('Failed');
							console.log(resp);
						}
					});
				}
				
				google.maps.event.addListener(map, 'click', addLatLng);
			});
		}
		
		var incidents = this.down('[itemId=incidents]');

		form.getComponent('id').on('change', function(field, vehicle) {
			var record = form.getRecord();
			
			/*
			 * Get Vehicle Information (Image, Registration #, ..) from VehicleStore
			 */
			var vehicleStore = Ext.getStore('VehicleStore');
			var vehicleRecord = vehicleStore.findRecord('id', record.get('id'));
			var vehicleImageClip = vehicleRecord.get('imageClip');
			if (vehicleImageClip) {
				vehicleImage.setSrc('download?blob-key=' + vehicleImageClip);
			} else {
				vehicleImage.setSrc('resources/image/bgVehicle.png');
			}
			
			title.vehicle.dom.innerHTML = vehicle + '[' + vehicleRecord.get('registrationNumber') + ']';
			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', record.get('driver'));
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('imageClip');
			if (driverImageClip) {
				driverImage.setSrc('download?blob-key=' + driverImageClip);
			} else {
				driverImage.setSrc('resources/image/bgDriver.png');
			}

			title.driver.dom.innerHTML = driver + '[' + driverRecord.get('name') + ']';

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
							form.getComponent('location').setValue(address);
						}
					} else {
						console.log("Geocoder failed due to: " + status);
					}
				});
			}
			
			/*
			 * Draw Track on Map.
			 */
			drawTrack(vehicle, driver);
		});
	},
	
	setVehicle : function(vehicleRecord) {
		var form = this.down('form');
		form.loadRecord(vehicleRecord);
	},
	
	listeners : {
		activate : function(panel) {
			var form = panel.down('form');
			if (panel.vehicle)
				form.loadRecord(panel.vehicle);
		}
	},

	layout : {
		type : 'vbox',
		align : 'stretch'
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
