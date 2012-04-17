Ext.define('GreenFleet.store.DriverRunStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'month',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'month_str',
		type : 'string',
	}, {
		name : 'run_dist',
		type : 'float'
	}, {
		name : 'run_time',
		type : 'integer'
	}, {
		name : 'consmpt',
		type : 'float'
	}, {
		name : 'co2_emss',
		type : 'float'
	}, {
		name : 'effcc',
		type : 'float'
	}, {
		name : 'sud_accel_cnt',
		type : 'integer'
	}, {
		name : 'sud_brake_cnt',
		type : 'integer'
	}, {
		name : 'eco_drv_time',
		type : 'integer'
	}, {
		name : 'ovr_spd_time',
		type : 'integer'
	}, {
		name : 'inc_cnt',
		type : 'integer'
	} ],
	
	sorters : [ {
		property : 'month',
		direction : 'ASC'
	} ],	
	
	proxy : {
		type : 'ajax',
		url : 'driver_run',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});