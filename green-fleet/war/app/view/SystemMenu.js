Ext.define('GreenFleet.view.SystemMenu', {
	extend : 'Ext.toolbar.Toolbar',

	alias : 'widget.system_menu',

	items : [ {
		type : 'help',
		text : 'help',
		handler : function() {
		}
	}, {
		itemId : 'refresh',
		type : 'refresh',
		text : 'refresh',
		handler : function() {
		}
	}, {
		type : 'search',
		text : 'search',
		handler : function(event, target, owner, tool) {
		}
	} ]
});