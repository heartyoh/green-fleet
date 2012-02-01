Ext.define('GreenFleet.view.monitor.InfoByVehicle', {
	extend : 'Ext.grid.Panel',
	
	alias : 'widget.monitor_info_by_vehicle',
	
	title : 'Information By Vehicle',

	store : 'VehicleStore',

	autoScroll : true,

	columns : [ {
		dataIndex : 'key',
		text : 'Key',
		hidden : true
	}, {
		dataIndex : 'id',
		text : 'Vehicle Id'
	}, {
		dataIndex : 'registrationNumber',
		text : 'RegistrationNumber'
	}, {
		dataIndex : 'manufacturer',
		text : 'Manufacturer'
	}, {
		dataIndex : 'vehicleType',
		text : 'VehicleType',
		width : 80
	}, {
		dataIndex : 'birthYear',
		text : 'BirthYear',
		width : 40,
		align : 'right'
	}, {
		dataIndex : 'ownershipType',
		text : 'OwnershipType',
		width : 40,
		align : 'center'
	}, {
		dataIndex : 'status',
		text : 'Status',
		type : 'string',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'imageClip',
		text : 'ImageClip',
		type : 'string',
		hidden : true
	}, {
		dataIndex : 'totalDistance',
		text : 'TotalDistance',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'remainingFuel',
		text : 'RemainingFuel',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'distanceSinceNewOil',
		text : 'DistanceSinceNewOil',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'engineOilStatus',
		text : 'EngineOilStatus',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'fuelFilterStatus',
		text : 'FuelFilterStatus',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'brakeOilStatus',
		text : 'BrakeOilStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'brakePedalStatus',
		text : 'BrakePedalStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'coolingWaterStatus',
		text : 'CoolingWaterStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'timingBeltStatus',
		text : 'TimingBeltStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'sparkPlugStatus',
		text : 'SparkPlugStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'lattitude',
		text : 'Lattitude',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'longitude',
		text : 'Longitude',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'createdAt',
		text : 'Created At',
		xtype:'datecolumn',
		format : F('datetime'),
		width : 120
	}, {
		dataIndex : 'updatedAt',
		text : 'Updated At',
		xtype:'datecolumn',
		format : F('datetime'),
		width : 120
	} ],
	viewConfig : {

	},
	listeners : {
		render : function(grid) {
			grid.store.load();
		},
		itemclick : function(grid, record) {
			var form = grid.up('monitor_information').down('form');
			form.loadRecord(record);
		}
	},
	onSearch : function(grid) {
		var idFilter = grid.down('textfield[name=idFilter]');
		var namefilter = grid.down('textfield[name=nameFilter]');
		grid.store.clearFilter();

		grid.store.filter([ {
			property : 'id',
			value : idFilter.getValue()
		}, {
			property : 'registrationNumber',
			value : namefilter.getValue()
		} ]);
	},
	onReset : function(grid) {
		grid.down('textfield[name=idFilter]').setValue('');
		grid.down('textfield[name=nameFilter]').setValue('');
	},
	tbar : [ 'ID', {
		xtype : 'textfield',
		name : 'idFilter',
		hideLabel : true,
		width : 200,
		listeners : {
			specialkey : function(field, e) {
				if (e.getKey() == e.ENTER) {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}
		}
	}, 'Registeration Number', {
		xtype : 'textfield',
		name : 'nameFilter',
		hideLabel : true,
		width : 200,
		listeners : {
			specialkey : function(field, e) {
				if (e.getKey() == e.ENTER) {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}
		}
	}, {
		xtype : 'button',
		text : 'Search',
		tooltip : 'Find Vehicle',
		handler : function() {
			var grid = this.up('gridpanel');
			grid.onSearch(grid);
		}
	}, {
		text : 'Reset',
		handler : function() {
			var grid = this.up('gridpanel');
			grid.onReset(grid);
		}
	} ]

});