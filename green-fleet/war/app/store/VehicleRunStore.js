Ext.define('GreenFleet.store.VehicleRunStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'year',
		type : 'integer'
	}, {
		name : 'month',
		type : 'integer'		
	}, {
		name : 'month_str',
		type : 'string'
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
		name : 'eco_index',
		type : 'integer'
	}, {
		name : 'oos_cnt',
		type : 'integer'
	}, {
		name : 'mnt_cnt',
		type : 'integer'
	}, {
		name : 'mnt_time',
		type : 'integer'
	} ],
	
	sorters : [ {
		property : 'year',
		direction : 'ASC'
	},{
		property : 'month',
		direction : 'ASC'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_run',
		extraParams : {
			select : [ 'vehicle', 'year', 'month', 'run_dist', 'run_time', 'consmpt', 'co2_emss', 'effcc', 'eco_index', 'oos_cnt', 'mnt_cnt', 'mnt_time' ]
		},		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});