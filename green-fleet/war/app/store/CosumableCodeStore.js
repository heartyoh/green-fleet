Ext.define('GreenFleet.store.VehicleTypeStore', {
	extend : 'Ext.data.Store',

	storeId : 'consumable_code_store',

	fields : [ 'name', 'desc' ],

	pageSize : 1000,

	proxy : {
		type : 'ajax',
		url : 'consumable_code',
		extraParams : {
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});