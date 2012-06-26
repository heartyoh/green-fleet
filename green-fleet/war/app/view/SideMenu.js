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
		handler : function() {
			new Ext.Window({
			    title : "Live Video",
			    width : 720,
			    height: 446,
			    layout : 'fit',
			    items : [{
			        xtype : "component",
			        autoEl : {
			            tag : "iframe",
			            src : "http://www.ustream.tv/embed/10627186"
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
			Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?', function(confirm) {
				if (confirm === 'yes') {
					document.location.href = '/logout.htm';
				}

			});
		}
	} ]
});