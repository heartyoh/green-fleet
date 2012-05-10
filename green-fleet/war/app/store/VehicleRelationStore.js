Ext.define('GreenFleet.store.VehicleRelationStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	pageSize : 10,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'vehicle_group_id',
		type : 'string'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_relation',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total',
			successProperty : 'success'
		}
	}
});