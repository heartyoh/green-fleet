Ext.define('GreenFleet.store.DriverRelationStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	pageSize : 1000,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'driver_group_id',
		type : 'string'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'driver_relation',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total',
			successProperty : 'success'
		}
	}
});