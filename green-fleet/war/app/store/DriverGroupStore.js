Ext.define('GreenFleet.store.DriverGroupStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	pageSize : 1000,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'desc',
		type : 'string'
	}, {
		name : 'drivers',
		type : 'auto'
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
		url : 'driver_group',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});