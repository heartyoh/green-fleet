Ext.define('GreenFleet.store.VehicleStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 1000,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'registration_number',
		type : 'string'
	}, {
		name : 'manufacturer',
		type : 'string'
	}, {
		name : 'vehicle_model',
		type : 'string'
	}, {
		name : 'fuel_type',
		type : 'string'
	}, {
		name : 'vehicle_type',
		type : 'string'
	}, {
		name : 'birth_year',
		type : 'int'
	}, {
		name : 'ownership_type',
		type : 'string'
	}, {
		name : 'status',
		type : 'string'
	}, {
		name : 'health_status',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	}, {
		name : 'total_distance',
		type : 'float'
	}, {
		name : 'total_run_time',
		type : 'int'
	}, {
		name : 'remaining_fuel',
		type : 'float'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'avg_effcc',
		type : 'float'
	}, {
		name : 'official_effcc',
		type : 'float'
	}, {
		name : 'eco_index',
		type : 'int'
	}, {
		name : 'eco_run_rate',
		type : 'int'
	}, {
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
		type : 'float'
	}, {
		name : 'location',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total',
			successProperty : 'success'
		}
	}
});