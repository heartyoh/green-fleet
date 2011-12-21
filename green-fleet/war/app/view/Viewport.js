Ext.define('GreenFleet.view.Viewport', {
	extend : 'Ext.container.Viewport',

	layout : 'border',

	defaults : {
		split : false,
		collapsible : false
	},

	items : [ {
		xtype : 'viewport.north',
		region : 'north',
		height : 48
	}, {
		xtype : 'viewport.west',
		region : 'west',
		width : 70
	}, {
		xtype : 'viewport.center',
		region : 'center'
	} ]
});
