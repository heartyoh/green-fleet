Ext.define('GreenFleet.view.viewport.North', {
	extend : 'Ext.Container',

	alias : 'widget.viewport.north',
	
	layout : {
		type : 'hbox',
		align : 'stretch'
	},

	items : [ {
		xtype : 'brand',
		width : 128
	}, {
		xtype : 'container',
		flex : 1,
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		items : [ {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ {
				xtype : 'main_menu',
				flex : 1
			}, {
				xtype : 'system_menu',
				width : 180
			} ]
		}, {
			xtype : 'tabbar',
			height: 23,
			defaults : {
				handler : function(item) {
					var content = Ext.getCmp('content');
					var comp = content.getComponent(item.itemId);
					if(!comp) {
						comp = content.add(item.view);
					}
					content.getLayout().setActiveItem(comp);
					item.setActive(true);
				},
				closable : false
			},
			items : [{
				text : 'Map',
				itemId : 'map',
				view : {
					xtype : 'map',
					itemId : 'map'
				}
			}, {
				text : 'File',
				itemId : 'filemanager',
				view : {
					xtype : 'filemanager',
					itemId : 'filemanager'
				}
			}, {
				text : 'Company',
				itemId : 'company',
				view : {
					xtype : 'company',
					itemId : 'company'
				}
			}, {
				text : 'Vehicle',
				itemId : 'vehicle',
				view : {
					xtype : 'vehicle',
					itemId : 'vehicle'
				}
			}, {
				text : 'Driver',
				itemId : 'driver',
				view : {
					xtype : 'driver',
					itemId : 'driver'
				}
			}, {
				text : 'Reservation',
				itemId : 'reservation',
				view : {
					xtype : 'reservation',
					itemId : 'reservation'
				}
			}, {
				text : 'Incident',
				itemId : 'incident',
				view : {
					xtype : 'incident',
					itemId : 'incident'
				}
			}, {
				text : 'Track',
				itemId : 'track',
				view : {
					xtype : 'track',
					itemId : 'track'
				}
			}, {
				text : 'ControlData',
				itemId : 'control_data',
				view : {
					xtype : 'control_data',
					itemId : 'control_data'
				}
			}]
		} ]
	} ]
});
