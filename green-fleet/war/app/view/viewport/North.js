Ext.define('GreenFleet.view.viewport.North', {
	extend : 'Ext.Container',

	alias : 'widget.viewport.north',
	
	layout : {
		type : 'hbox',
		align : 'stretch'
	},

	items : [ {
		xtype : 'brand',
		width : 135
	}, {
		xtype : 'container',
		flex : 1,
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		items : [ {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ {
				xtype : 'main_menu',
				flex : 1
			}, {
				xtype : 'side_menu',
				width : 180
			} ]
		}, {
			xtype : 'tabbar',
			id : 'menutab',
			listeners : {
				add : function() {
					console.trace();
				}
			},
			height: 23
		} ]
	} ]
});
