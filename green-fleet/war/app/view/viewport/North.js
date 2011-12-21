Ext.define('GreenFleet.view.viewport.North', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.north',

	layout : {
		type : 'hbox',
		align : 'stretch'
	},
	
	items : [ {
		xtype : 'brand',
		width : 100
	}, {
		xtype : 'main_menu',
		flex : 1
	}, {
		xtype : 'system_menu',
		width : 130
	} ]
});