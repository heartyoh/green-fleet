Ext.define('GreenFleet.view.viewport.Center', {

	extend : 'Ext.panel.Panel',

	id : 'content',

	alias : 'widget.viewport.center',

	layout : 'card',

	listeners : {
		add : function(panel, item) {
			if (panel !== this)
				return;

			var menutab = Ext.getCmp('menutab');
			menutab.add({
				text : item.title,
				itemId : item.itemId,
				tooltip : item.title,
				handler : function(tab) {
					var content = Ext.getCmp('content');
					var comp = content.getComponent(tab.itemId);
					content.getLayout().setActiveItem(comp);
				},
				closable : false
			}).setCard(item);
		},
		remove : function(panel, item) {
			if (panel !== this)
				return;

			var menutab = Ext.getCmp('menutab');
			menutab.remove(item.itemId);
		}
	},

	defaults : {
		listeners : {
			activate : function(item) {
				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
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
		title : 'Incident Info',
		xtype : 'monitor_incident',
		itemId : 'monitor_incident'
	} ]
});