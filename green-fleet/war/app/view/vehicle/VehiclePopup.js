Ext.define('GreenFleet.view.vehicle.VehiclePopup', {
	extend : 'Ext.window.Window',
	alias : 'widget.vehiclepopup',
	
	title : 'Control Information',
	
	closable : true,
	
	modal : true,
	
	width : 600,
	height : 400,
	
	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	
	items : [{
		xtype : 'container',
		flex : 2,
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		items : [{
			xtype : 'form',
			height : 140,
			items : [{
				xtype : 'textfield',
				name : 'driver',
				fieldLabel : 'Driver'
			}, {
				xtype : 'textfield',
				name : 'vehicle',
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'textfield',
				name : 'position',
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
			xtype : 'gridpanel',
			title : 'Information',
			store : 'VehicleStore',
			autoScroll : true,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'Vehicle Id',
				type : 'string'
			}, {
				dataIndex : 'registrationNumber',
				text : 'RegistrationNumber',
				type : 'string'
			}, {
				dataIndex : 'manufacturer',
				text : 'Manufacturer',
				type : 'string'
			}, {
				dataIndex : 'vehicleType',
				text : 'VehicleType',
				type : 'string'
			}, {
				dataIndex : 'birthYear',
				text : 'BirthYear',
				type : 'string'
			}, {
				dataIndex : 'ownershipType',
				text : 'OwnershipType',
				type : 'string'
			}, {
				dataIndex : 'status',
				text : 'Status',
				type : 'string'
			}, {
				dataIndex : 'imageClip',
				text : 'ImageClip',
				type : 'string'
			}, {
				dataIndex : 'totalDistance',
				text : 'TotalDistance',
				type : 'string'
			}, {
				dataIndex : 'remainingFuel',
				text : 'RemainingFuel',
				type : 'string'
			}, {
				dataIndex : 'distanceSinceNewOil',
				text : 'DistanceSinceNewOil',
				type : 'string'
			}, {
				dataIndex : 'engineOilStatus',
				text : 'EngineOilStatus',
				type : 'string'
			}, {
				dataIndex : 'fuelFilterStatus',
				text : 'FuelFilterStatus',
				type : 'string'
			}, {
				dataIndex : 'brakeOilStatus',
				text : 'BrakeOilStatus',
				type : 'string'
			}, {
				dataIndex : 'brakePedalStatus',
				text : 'BrakePedalStatus',
				type : 'string'
			}, {
				dataIndex : 'coolingWaterStatus',
				text : 'CoolingWaterStatus',
				type : 'string'
			}, {
				dataIndex : 'timingBeltStatus',
				text : 'TimingBeltStatus',
				type : 'string'
			}, {
				dataIndex : 'sparkPlugStatus',
				text : 'SparkPlugStatus',
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:'d/m/Y'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:'d/m/Y'
			} ]
		}, {
			title : 'Control - Vehicle'
		}, {
			title : 'Control - Driver'
		}, {
			title : 'Control - Maintenance'
		}]
	}]
});