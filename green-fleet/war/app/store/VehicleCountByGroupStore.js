Ext.define('GreenFleet.store.VehicleCountByGroupStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	pageSize : 1000,

	fields : [ {
		name : 'vehicle_group_id',
		type : 'string'
	}, {
		name : 'vehicle_count',
		type : 'int'
	} ],

	proxy : {
		type : 'ajax',
		url : '/vehicle_relation/count',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total',
			successProperty : 'success'
		}
	}
});