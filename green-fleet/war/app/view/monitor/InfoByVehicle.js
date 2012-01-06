Ext.define('GreenFleet.view.monitor.InfoByVehicle', {
	extend : 'Ext.grid.Panel',
	
	alias : 'widget.monitor_info_by_vehicle',
	
	title : 'Information By Vehicle',

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