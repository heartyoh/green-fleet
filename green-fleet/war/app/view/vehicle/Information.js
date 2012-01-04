Ext.define('GreenFleet.view.vehicle.Information', {
	extend : 'Ext.Container',
	alias : 'widget.information',

	initComponent : function() {
		this.callParent();

		var form = this.down('form');
		var driverImage = form.up().getComponent('driverImage');
		var vehicleImage = form.up().getComponent('vehicleImage');
				
		form.getComponent('id').on('change', function(field, vehicle) {
			var record = form.getRecord();
			
			var vehicleStore = Ext.getStore('VehicleStore');
			var vehicleRecord = vehicleStore.findRecord('id', record.get('id'));
			var vehicleImageClip = vehicleRecord.get('imageClip');
			if (vehicleImageClip) {
				vehicleImage.setSrc('download?blob-key=' + vehicleImageClip);
			} else {
				vehicleImage.setSrc('resources/image/bgVehicle.png');
			}

			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', record.get('driver'));
			var driverImageClip = driverRecord.get('imageClip');
			if (driverImageClip) {
				driverImage.setSrc('download?blob-key=' + driverImageClip);
			} else {
				driverImage.setSrc('resources/image/bgDriver.png');
			}

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
		});
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

	items : [ {
		xtype : 'panel',
		cls : 'pageTitle',
		html : '<h1>Information : Vehicle ID, Driver ID</h1>',
		height : 35
	}, {
		xtype : 'container',
		height : 300,
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		items : [ {
			xtype : 'container',
			flex : 2,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			items : [ {
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
			}, {
				xtype : 'panel',
				title : 'Incidents',
				layout : 'fit',
				cls : 'paddingPanel',
				height : 100,
				items : [ {
					xtype : 'container',
					layout : {
						type : 'hbox',
						align : 'left'
					},
					items : [ {
						xtype : 'box',
						height : 100,
						width : 100,
						html : '<div>HAHAHA001</div>'
					}, {
						xtype : 'box',
						height : 100,
						width : 100,
						html : '<div>HAHAHA002</div>'
					}, {
						xtype : 'box',
						height : 100,
						width : 100,
						html : '<div>HAHAHA003</div>'
					}, {
						xtype : 'box',
						height : 100,
						width : 100,
						html : '<div>HAHAHA004</div>'
					} ]
				} ]
			} ]
		}, {
			xtype : 'panel',
			title : 'Tracking Recent Driving',
			flex : 1,
			html : '<div class="map" style="height:100%"></div>',
			listeners : {
				afterrender : function() {
//					parent.displayMap(this, 37.56, 126.97);
				}
			}
		} ]
	}, {
		xtype : 'tabpanel',
		flex : 1,
		items : [ {
			xtype : 'info_by_vehicle',
		}, {
			xtype : 'control_by_vehicle',
			title : 'Control By Vehicle'
		}, {
			xtype : 'control_by_vehicle',
			title : 'Control By Driver'
		}, {
			xtype : 'control_by_vehicle',
			title : 'Maintenance'
		} ]
	} ]
});
