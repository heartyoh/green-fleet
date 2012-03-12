Ext.define('GreenFleet.view.MainMenu', {
	extend : 'Ext.toolbar.Toolbar',
	cls : 'appMenu',
	alias : 'widget.main_menu',

	defaults : {
		handler : function(button) {
			var content = Ext.getCmp('content');
			var closables = content.query('[closable=true]');
			for ( var i = 0; i < closables.length; i++) {
				content.remove(closables[i]);
			}

			var first = null;
			for (i = 0; i < button.submenus.length; i++) {
				button.submenus[i]['listeners'] = {
					activate : function(item) {
						var menutab = Ext.getCmp('menutab');
						var tab = menutab.getComponent(item.itemId);

						menutab.setActiveTab(tab);
					}
				};
				var item = content.add(button.submenus[i]);
				first = first || item;
			}

			if (first)
				GreenFleet.doMenu(first.itemId);
		}
	},

	items : [ {
//		text : 'Dashboard',
//		submenus : [ {
//			title : 'File',
//			xtype : 'filemanager',
//			itemId : 'filemanager',
//			closable : true
//		} ]
//	}, {
		text : T('menu.company'),
		submenus : [ {
			title : T('menu.company'),
			xtype : 'management_company',
			itemId : 'company',
			closable : true
		}, {
			title : T('menu.user'),
			xtype : 'management_user',
			itemId : 'user',
			closable : true
		}, {
			title : T('menu.code'),
			xtype : 'management_code',
			itemId : 'code',
			closable : true
		}, {
			title : T('menu.vehicle_group'),
			xtype : 'management_vehicle_group',
			itemId : 'vehicle_group',
			closable : true
		} ]
	}, {
		text : T('menu.vehicle'),
		submenus : [ {
			title : T('menu.vehicle'),
			xtype : 'management_vehicle',
			itemId : 'vehicle',
			closable : true
		}, {
			title : T('menu.incident'),
			xtype : 'management_incident',
			itemId : 'incident',
			closable : true
		}, {
			title : T('menu.track'),
			xtype : 'management_track',
			itemId : 'track',
			closable : true
		}, {
			title : T('menu.checkin_data'),
			xtype : 'management_checkin_data',
			itemId : 'checkin_data',
			closable : true
		} ]
	}, {
		text : T('menu.driver'),
		submenus : [ {
			title : T('menu.driver'),
			xtype : 'management_driver',
			itemId : 'driver',
			closable : true
		} ]
	}, {
		text : T('menu.terminal'),
		submenus : [ {
			title : T('menu.terminal'),
			xtype : 'management_terminal',
			itemId : 'terminal',
			closable : true
		} ]
	}, {
		text : T('menu.reservation'),
		submenus : [ {
			title : T('menu.reservation'),
			xtype : 'management_reservation',
			itemId : 'reservation',
			closable : true
		} ]
	}, {
		text : T('menu.maintenance'),
		submenus : [ {
			title : T('menu.consumables'),
			xtype : 'pm_consumable',
			itemId : 'consumable',
			closable : true
		}, {
			title : T('menu.health'),
			xtype : 'dashboard_health',
			itemId : 'health',
			closable : true
		} ]
	} ]
});