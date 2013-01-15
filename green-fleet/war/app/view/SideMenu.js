Ext.define('GreenFleet.view.SideMenu', {
	extend : 'Ext.toolbar.Toolbar',

	alias : 'widget.side_menu',
	
	cls : 'sideMenu',
	
	items : [ '->',
	{
		type : 'help',
		text : login.username,
		handler : function() {
			Ext.create('GreenFleet.view.management.Profile').show();
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
		hidden : login.grade != "C",
		handler : function() {
			new Ext.Window({
			    title : "Live Video",
			    width : 690,
			    height: 560,
			    layout : 'fit',
			    items : [{
			        xtype : "component",
			        autoEl : {
			            tag : "iframe",
//			            src : "http://www.ustream.tv/embed/10627186"
			            src : "http://61.33.6.173/smart"
			        }
			    }]
			}).show();
		}
	}, {
		itemId : 'setting',
		type : 'setting',
		cls : 'btnEastHidden',
		handler : function() {
			Ext.getCmp('east').toggleHide();
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