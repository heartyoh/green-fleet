Ext.define('GreenFleet.view.SystemMenu', {
	extend : 'Ext.toolbar.Toolbar',

	alias : 'widget.system_menu',

	items : [ {
		type : 'help',
		text : login.username,
		handler : function() {
		}
	}, {
		itemId : 'logout',
		type : 'logout',
		text : 'logout',
		handler : function() {
			Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?', function(confirm) {
				if (confirm === 'yes') {
					document.location.href = '/logout.htm';
				}

			});
		}
	}, {
		type : 'search',
		text : 'search',
		handler : function(event, target, owner, tool) {
		}
	} ]
});