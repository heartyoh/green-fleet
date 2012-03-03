Ext.define('GreenFleet.store.CheckinDataStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'distance',
		type : 'float'
	}, {
		name : 'running_time',
		type : 'integer'
	}, {
		name : 'less_than_10km',
		type : 'int'
	}, {
		name : 'less_than_20km',
		type : 'int'
	}, {
		name : 'less_than_30km',
		type : 'int'
	}, {
		name : 'less_than_40km',
		type : 'int'
	}, {
		name : 'less_than_50km',
		type : 'int'
	}, {
		name : 'less_than_60km',
		type : 'int'
	}, {
		name : 'less_than_70km',
		type : 'int'
	}, {
		name : 'less_than_80km',
		type : 'int'
	}, {
		name : 'less_than_90km',
		type : 'int'
	}, {
		name : 'less_than_100km',
		type : 'int'
	}, {
		name : 'less_than_110km',
		type : 'int'
	}, {
		name : 'less_than_120km',
		type : 'int'
	}, {
		name : 'less_than_130km',
		type : 'int'
	}, {
		name : 'less_than_140km',
		type : 'int'
	}, {
		name : 'less_than_150km',
		type : 'int'
	}, {
		name : 'less_than_160km',
		type : 'int'
	}, {
		name : 'engine_start_time',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'engine_end_time',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'average_speed',
		type : 'float'
	}, {
		name : 'max_speed',
		type : 'int'
	}, {
		name : 'fuel_consumption',
		type : 'float'
	}, {
		name : 'fuel_efficiency',
		type : 'float'
	}, {
		name : 'sudden_accel_count',
		type : 'int'
	}, {
		name : 'sudden_brake_count',
		type : 'int'
	}, {
		name : 'idle_time',
		type : 'int'
	}, {
		name : 'eco_driving_time',
		type : 'int'
	}, {
		name : 'over_speed_time',
		type : 'int'
	}, {
		name : 'co2_emissions',
		type : 'float'
	}, {
		name : 'max_cooling_water_temp',
		type : 'float'
	}, {
		name : 'avg_battery_volt',
		type : 'float'
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
		url : 'checkin_data',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});