Ext.define('GreenFleet.store.DashboardConsumableStore', {
	extend : 'Ext.data.Store',

	storeId : 'dashboard_consumable_store',

	fields : [ 
		{
			name : 'consumable',
			type : 'string'
		}, {
			name : 'summary',
			type : 'auto'
		}	
	],

	pageSize : 1000,

	proxy : {
		type : 'ajax',
		url : 'report/service',
		extraParams : {
			id : 'vehicle_health',
			health_type : 'consumable_health'
		},
		reader : {
			type : 'json',
			root : 'items'
		}
	}
});