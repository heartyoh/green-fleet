Ext.define('GreenFleet.store.DriverSpeedStore', {
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
		name : 'spd_lt10',
		type : 'integer'
	}, {
		name : 'spd_lt20',
		type : 'integer'
	}, {
		name : 'spd_lt30',
		type : 'integer'
	}, {
		name : 'spd_lt40',
		type : 'integer'
	}, {
		name : 'spd_lt50',
		type : 'integer'
	}, {
		name : 'spd_lt60',
		type : 'integer'
	}, {
		name : 'spd_lt70',
		type : 'integer'
	}, {
		name : 'spd_lt80',
		type : 'integer'
	}, {
		name : 'spd_lt90',
		type : 'integer'
	}, {
		name : 'spd_lt100',
		type : 'integer'
	}, {
		name : 'spd_lt110',
		type : 'integer'
	}, {
		name : 'spd_lt120',
		type : 'integer'
	}, {
		name : 'spd_lt130',
		type : 'integer'
	}, {
		name : 'spd_lt140',
		type : 'integer'
	}, {
		name : 'spd_lt150',
		type : 'integer'
	}, {
		name : 'spd_lt160',
		type : 'integer'
	} ],
	
	sorters : [ {
		property : 'month',
		direction : 'ASC'
	} ],	
	
	proxy : {
		type : 'ajax',
		url : 'driver_run/speed',
		extraParams : {
			select : [ 'key', 'driver', 'month', 'spd_lt10', 'spd_lt20', 'spd_lt30', 'spd_lt40', 'spd_lt50', 'spd_lt60', 'spd_lt70', 'spd_lt80', 'spd_lt90', 'spd_lt100', 'spd_lt110', 'spd_lt120', 'spd_lt130', 'spd_lt140', 'spd_lt150', 'spd_lt160' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});