Ext.define('GreenFleet.view.viewport.Center', {

	extend : 'Ext.panel.Panel',

	id : 'content',

	alias : 'widget.viewport.center',

	layout : 'card',

	listeners : {
		add : function(panel, item) {
			var menutab = Ext.getCmp('menutab');
			menutab.add({
				text : item.title,
				itemId : item.itemId,
				handler : function(tab) {
					var content = Ext.getCmp('content');
					var comp = content.getComponent(tab.itemId);
					content.getLayout().setActiveItem(comp);
				},
				closable : false
			}).setCard(item);
		}
	},

	defaults : {
		listeners : {
			activate : function(item) {
				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
				/*
				 * TODO 동작하게 해보라
				 */
				menutab.setActiveTab(tab);
			}
		}
	},

	items : [ {
		title : 'Dashboard',
		xtype : 'monitor_map',
		itemId : 'map'
	}, {
		title : 'Info',
		xtype : 'monitor_information',
		itemId : 'information'
	}, {
		title : 'Incident',
		xtype : 'monitor_incident',
		itemId : 'monitor_incident'
	}, {
		title : 'Company',
		xtype : 'management_company',
		itemId : 'company'
	}, {
		title : 'Vehicle',
		xtype : 'management_vehicle',
		itemId : 'vehicle'
	}, {
		title : 'Driver',
		xtype : 'management_driver',
		itemId : 'driver'
	}, {
		title : 'Reservation',
		xtype : 'management_reservation',
		itemId : 'reservation'
	}, {
		title : 'Incident',
		xtype : 'management_incident',
		itemId : 'incident'
	}, {
		title : 'Track',
		xtype : 'management_track',
		itemId : 'track'
	}, {
		title : 'ControlData',
		xtype : 'management_control_data',
		itemId : 'control_data'
	}, {
		title : 'File',
		xtype : 'filemanager',
		itemId : 'filemanager'
	} ]
});