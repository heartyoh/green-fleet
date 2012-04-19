Ext.define('GreenFleet.view.MainMenu', {
	extend : 'Ext.toolbar.Toolbar',
	cls : 'appMenu',
	alias : 'widget.main_menu',

	initComponent : function() {
		var self = this;
		var active_menu_button;
		
		function menu_activate_handler(item) {
			var menutab = Ext.getCmp('menutab');
			var tab = menutab.getComponent(item.itemId);

			menutab.setActiveTab(tab);
		}
		
		function menu_button_handler(button) {
			if(button === active_menu_button)
				return;
			
			var content = Ext.getCmp('content');
			
			/*
			 * 이전 탭들을 삭제함.
			 * closable한 item들을 모두 찾아서, 제거함.
			 * Ext.Array.each 내부적으로 index를 이용하기 때문에, each 함수 내에서 제거하지 않도록 주의함.
			 */
			var tobe_removed = []; 
			content.items.each(function(item) {
				if(item.closable)
					tobe_removed.push(item);
			});
			
			for ( var i = 0; i < tobe_removed.length; i++) {
				content.remove(tobe_removed[i]);
			}

			var first = null;
			for (i = 0; i < button.submenus.length; i++) {
				var item = content.add(button.submenus[i]);
				first = first || item;
			}

			/*
			 * Active Top Level Menu의 Active 상태 클래스를 새 메뉴로 교체함.
			 */
			if(active_menu_button)
				active_menu_button.removeCls('menuActive');
			button.addCls('menuActive');
			active_menu_button = button;

			/*
			 * 첫번째 아이템을 실행하도록 함.
			 */
			if (first)
				GreenFleet.doMenu(first.itemId);
		}
		
		Ext.Array.each(this.items, function(button) {
			button.handler = menu_button_handler;
			Ext.Array.each(button.submenus, function(menu) {
				menu.listeners = {
					activate : menu_activate_handler
				}
			});
		})
		
		this.callParent();
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
		}, {
			title : T('menu.consumable_code'),
			xtype : 'management_consumable_code',
			itemId : 'consumable_code',
			closable : true
		}, {
			title : T('menu.location'),
			xtype : 'management_location',
			itemId : 'location',
			closable : true			
		}, {
			title : T('menu.alarm'),
			xtype : 'management_alarm',
			itemId : 'alarm',
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
		}, {
			title : T('menu.vehicle_runstatus'),
			xtype : 'management_vehicle_runstatus',
			itemId : 'vehicle_runstatus',
			closable : true			
		} ]
	}, {
		text : T('menu.driver'),
		submenus : [ {
			title : T('menu.driver'),
			xtype : 'management_driver',
			itemId : 'driver',
			closable : true
		}, {
			title : T('menu.driver_runstatus'),
			xtype : 'management_driver_runstatus',
			itemId : 'driver_runstatus',
			closable : true
		}, {
			title : T('menu.driver_speed_section'),
			xtype : 'management_driver_speed',
			itemId : 'driver_speed',
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
			title : T('menu.vehicle_health'),
			xtype : 'dashboard_vehicle_health',
			itemId : 'vehicle_health',
			closable : true
		}, {
			title : T('menu.consumable_health'),
			xtype : 'dashboard_consumable_health',
			itemId : 'consumable_health',
			closable : true			
		} ]
	} ]
});