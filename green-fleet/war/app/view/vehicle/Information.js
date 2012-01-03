Ext.define('GreenFleet.view.vehicle.Information', {
	extend : 'Ext.Container',
	alias : 'widget.information',

	listeners : {
		activate : function(panel) {
			var form = panel.down('form');
			if (panel.vehicle)
				form.loadRecord(panel.vehicle);
		}
	},

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	items : [ {
		xtype : 'panel',
		cls : 'pageTitle',
		html : '<h1>Information : Vehicle ID, Driver ID</h1>',
		height : 35
	}, {
		xtype : 'panel',
		title : 'Vehicle Information',
		cls : 'paddingPanel',
		layout : {
			type : 'hbox'
		},
		items : [ {
			xtype : 'box',
			cls : 'imgDriver'
		}, {
			xtype : 'form',
			align : 'stretch',
			height : 140,
			items : [ {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'textfield',
				name : 'driver',
				fieldLabel : 'Driver'
			}, {
				xtype : 'textfield',
				name : 'location',
				fieldLabel : 'Current Position'
			}, {
				xtype : 'textfield',
				name : 'distance',
				fieldLabel : 'Running Distance'
			}, {
				xtype : 'textfield',
				name : 'runningTime',
				fieldLabel : 'Running Time'
			} ]
		}]
	}, {
		xtype : 'panel',
		flex : 1,
		title : 'Incidents',
		layout : 'fit',
		cls : 'paddingPanel',
		height : 100,
		items : [ {
			xtype : 'container',
			layout : {
				type : 'hbox',
				align : 'left'
			},
			items : [ {
				xtype : 'box',
				height : 100,
				width : 100,
				html : '<div>HAHAHA001</div>'
			}, {
				xtype : 'box',
				height : 100,
				width : 100,
				html : '<div>HAHAHA002</div>'
			}, {
				xtype : 'box',
				height : 100,
				width : 100,
				html : '<div>HAHAHA003</div>'
			}, {
				xtype : 'box',
				height : 100,
				width : 100,
				html : '<div>HAHAHA004</div>'
			} ]
		} ]
	}, {
		xtype : 'tabpanel',
		flex : 2,
		items : [ {
			xtype : 'info_by_vehicle',
		}, {
			xtype : 'control_by_vehicle',
			title : 'Control By Vehicle'
		}, {
			xtype : 'control_by_vehicle',
			title : 'Control By Driver'
		}, {
			xtype : 'control_by_vehicle',
			title : 'Maintenance'
		} ]
	} ]
});