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
		xtype : 'map',
		itemId : 'map'
	}, {
		title : 'Info',
		xtype : 'information',
		itemId : 'information'
	}, {
		title : 'File',
		xtype : 'filemanager',
		itemId : 'filemanager'
	}, {
		title : 'Company',
		xtype : 'company',
		itemId : 'company'
	}, {
		title : 'Vehicle',
		xtype : 'vehicle',
		itemId : 'vehicle'
	}, {
		title : 'Driver',
		xtype : 'driver',
		itemId : 'driver'
	}, {
		title : 'Reservation',
		xtype : 'reservation',
		itemId : 'reservation'
	}, {
		title : 'Incident',
		xtype : 'incident',
		itemId : 'incident'
	}, {
		title : 'Track',
		xtype : 'track',
		itemId : 'track'
	}, {
		title : 'ControlData',
		xtype : 'control_data',
		itemId : 'control_data'
	} ]
});