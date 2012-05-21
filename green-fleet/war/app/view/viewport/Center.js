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

	initComponent : function() {
		this.callParent();

		var self = this;

		Ext.getCmp('menutab').getComponent('overview').hide();
		Ext.getCmp('menutab').getComponent('monitor_map').hide();
		Ext.getCmp('menutab').getComponent('information').hide();
		Ext.getCmp('menutab').getComponent('monitor_incident').hide();
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
		xtype : 'overview',
		itemId : 'overview',
		listeners : {
			activate : function(item) {
				var west = Ext.getCmp('west');
				var tab = west.getComponent(item.itemId);
				tab.addClass('active');

				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
				menutab.setActiveTab(tab);
			},
			deactivate : function(item) {
				var menutab = Ext.getCmp('west');
				var tab = menutab.getComponent(item.itemId);
				tab.removeCls('active');
			}
		}
	},{
		xtype : 'monitor_map',
		itemId : 'monitor_map',
		listeners : {
			activate : function(item) {
				var west = Ext.getCmp('west');
				var tab = west.getComponent(item.itemId);
				tab.addClass('active');

				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
				menutab.setActiveTab(tab);
			},
			deactivate : function(item) {
				var menutab = Ext.getCmp('west');
				var tab = menutab.getComponent(item.itemId);
				tab.removeCls('active');
			}
		}
	}, {
		xtype : 'monitor_information',
		itemId : 'information',
		listeners : {
			activate : function(item) {
				var west = Ext.getCmp('west');
				var tab = west.getComponent(item.itemId);
				tab.addClass('active');
			
				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
				menutab.setActiveTab(tab);
			},
			deactivate : function(item) {
				var menutab = Ext.getCmp('west');
				var tab = menutab.getComponent(item.itemId);
				tab.removeCls('active');
			}
		}
	}, {
		xtype : 'monitor_incident',
		itemId : 'monitor_incident',
		listeners : {
			activate : function(item) {
				var west = Ext.getCmp('west');
				var tab = west.getComponent(item.itemId);
				tab.addClass('active');
			
				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
				menutab.setActiveTab(tab);
			},
			deactivate : function(item) {
				var menutab = Ext.getCmp('west');
				var tab = menutab.getComponent(item.itemId);
				tab.removeCls('active');
			}
		}
	} ]
});