Ext.define('GreenFleet.view.monitor.VehiclePopup', {
	extend : 'Ext.window.Window',
	
	alias : 'widget.monitor_vehiclepopup',
	
	title : 'Control Information',
	
	closable : true,
	
	modal : true,
	
	width : 800,
	height : 600,
	
	listeners : {
		afterrender : function(popup) {
			var form = popup.down('form');
			form.loadRecord(popup.vehicle);
		}
	},
	
	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	
	items : [{
		xtype : 'container',
		height : 200,
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
			title : T('title.incidents'), 
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
		}, {
			xtype : 'control_by_vehicle',
		}, {
			xtype : 'control_by_vehicle',
		}]
	}]
});