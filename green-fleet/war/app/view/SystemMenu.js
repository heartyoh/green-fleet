Ext.define('GreenFleet.view.SystemMenu', {
	extend : 'Ext.toolbar.Toolbar',

	alias : 'widget.system_menu',
	cls : 'sideMenu',

	items : [ {
		type : 'help',
		text : login.username,
		handler : function() {
		}
	}, {
		itemId : 'home',
		type : 'home',
		cls : 'btnHome',
		handler : function() {
		}
	}, {
		itemId : 'report',
		type : 'report',
		cls : 'btnReport',
		handler : function() {
		}
	}, {
		itemId : 'setting',
		type : 'setting',
		cls : 'btnSetting',
		handler : function() {
		}
	}, {
		itemId : 'logout',
		type : 'logout',
		cls : 'btnLogout',
		handler : function() {
			Ext.MessageBox.confirm(T('label.confirm'), T('msg.confirm_logout'), function(confirm) {
				if (confirm === 'yes') {
					document.location.href = '/logout.htm';
				}

			});
		}
	} ]
});