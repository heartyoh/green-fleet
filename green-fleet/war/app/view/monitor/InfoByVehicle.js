Ext.define('GreenFleet.view.monitor.InfoByVehicle', {
	extend : 'Ext.grid.Panel',
	
	alias : 'widget.monitor_info_by_vehicle',
	
	title : 'Information By Vehicle',

	store : 'VehicleInfoStore',

	autoScroll : true,

	columns : [ new Ext.grid.RowNumberer(), {
		dataIndex : 'key',
		text : 'Key',
		type : 'string',
		hidden : true
	}, {
		dataIndex : 'id',
		text : 'Vehicle Id',
		type : 'string'
	}, {
		dataIndex : 'registration_number',
		text : 'RegistrationNumber',
		type : 'string'
	}, {
		dataIndex : 'manufacturer',
		text : 'Manufacturer',
		type : 'string'
	}, {
		dataIndex : 'vehicle_type',
		text : 'VehicleType',
		type : 'string'
	}, {
		dataIndex : 'birth_year',
		text : 'BirthYear',
		type : 'string'
	}, {
		dataIndex : 'ownership_type',
		text : 'OwnershipType',
		type : 'string'
	}, {
		dataIndex : 'status',
		text : 'Status',
		type : 'string'
	}, {
		dataIndex : 'total_distance',
		text : 'TotalDistance',
		type : 'string'
	}, {
		dataIndex : 'remaining_fuel',
		text : 'RemainingFuel',
		type : 'string'
	}, {
		dataIndex : 'distance_since_new_oil',
		text : 'DistanceSinceNewOil',
		type : 'string'
	}, {
		dataIndex : 'engine_oil_status',
		text : 'EngineOilStatus',
		type : 'string'
	}, {
		dataIndex : 'fuel_filter_status',
		text : 'FuelFilterStatus',
		type : 'string'
	}, {
		dataIndex : 'brake_oil_status',
		text : 'BrakeOilStatus',
		type : 'string'
	}, {
		dataIndex : 'brake_pedal_status',
		text : 'BrakePedalStatus',
		type : 'string'
	}, {
		dataIndex : 'cooling_water_status',
		text : 'CoolingWaterStatus',
		type : 'string'
	}, {
		dataIndex : 'timing_belt_status',
		text : 'TimingBeltStatus',
		type : 'string'
	}, {
		dataIndex : 'spark_plug_status',
		text : 'SparkPlugStatus',
		type : 'string'
	}, {
		dataIndex : 'lattitude',
		text : 'Lattitude'
	}, {
		dataIndex : 'longitude',
		text : 'Longitude'
	}, {
		dataIndex : 'created_at',
		text : 'Created At',
		xtype : 'datecolumn',
		format : F('datetime'),
		width : 120
	}, {
		dataIndex : 'updated_at',
		text : 'Updated At',
		xtype : 'datecolumn',
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
		var id_filter = grid.down('textfield[name=id_filter]');
		var namefilter = grid.down('textfield[name=registration_number_field]');
		grid.store.clearFilter();

		grid.store.filter([ {
			property : 'id',
			value : id_filter.getValue()
		}, {
			property : 'registration_number',
			value : namefilter.getValue()
		} ]);
	},
	onReset : function(grid) {
		grid.down('textfield[name=id_filter]').setValue('');
		grid.down('textfield[name=registration_number_field]').setValue('');
	},
	tbar : [ 'ID', {
		xtype : 'textfield',
		name : 'id_filter',
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
		name : 'registration_number_field',
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