Ext.define('GreenFleet.view.vehicle.Information', {
	extend : 'Ext.Container',
	alias : 'widget.information',
	
	listeners : {
		activate : function(panel) {
			var form = panel.down('form');
			if(panel.vehicle)
				form.loadRecord(panel.vehicle);
		}
	},
	
	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	
	items : [{
		xtype : 'panel',
		title : 'Vehicle Information',
		
		height : 250,
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		items : [{
			xtype : 'form',
			height : 140,
			items : [{
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
			}]
		}, {
			xtype : 'panel',
			flex : 1, 
			title : 'Incidents', 
			layout : 'fit',
			items : [{
				xtype : 'container',
				layout : {
					type : 'hbox',
					align : 'left'
				},
				items : [{
					xtype : 'box',
					height : 100,
					width : 100,
					html : '<div>HAHAHA001</div>'
				},{
					xtype : 'box',
					height : 100,
					width : 100,
					html : '<div>HAHAHA002</div>'
				},{
					xtype : 'box',
					height : 100,
					width : 100,
					html : '<div>HAHAHA003</div>'
				},{
					xtype : 'box',
					height : 100,
					width : 100,
					html : '<div>HAHAHA004</div>'
				}]
			}]
		}]
	}, {
		xtype : 'tabpanel',
		flex : 1,
		items : [{
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
		}]
	}]
});