Ext.define('GreenFleet.view.vehicle.Information', {
	extend : 'Ext.Container',
	alias : 'widget.information',

	initComponent : function() {
		this.callParent();
		
		var form = this.down('form');
		var driverImage = this.down('image');
		
		form.getComponent('id').on('change', function(field) {
			var record = form.getRecord();
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', record.get('driver'));
			var driverImageClip = driverRecord.get('imageClip');
			if(driverImageClip) {
				driverImage.setSrc('download?blob-key=' + driverImageClip);
			} else {
				driverImage.setSrc('');
			}

			var location = record.get('location');
			if(location == null || location.length == 0) {
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
						if (results[1]) {
							var address = results[1].formatted_address
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
		xtype : 'panel',
		title : 'Vehicle Information',
		cls : 'paddingPanel',
		layout : {
			type : 'hbox'
		},
		items : [  {
			xtype : 'image',
			cls : 'imgVehicle'
		}, {
			xtype : 'image',
			cls : 'imgDriver'
		}, {
			xtype : 'form',
			align : 'stretch',
			height : 140,
			items : [ {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'Vehicle',
				itemId : 'id'
			}, {
				xtype : 'textfield',
				name : 'driver',
				fieldLabel : 'Driver'
			}, {
				xtype : 'textfield',
				name : 'location',
				fieldLabel : 'Current Location',
				itemId : 'location'
			}, {
				xtype : 'textfield',
				name : 'distance',
				fieldLabel : 'Running Distance'
			}, {
				xtype : 'textfield',
				name : 'runningTime',
				fieldLabel : 'Running Time'
			} ]
		}]
	}, {
		xtype : 'panel',
		flex : 1,
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
	}, {
		xtype : 'tabpanel',
		flex : 2,
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
