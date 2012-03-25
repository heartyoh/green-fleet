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
		url : 'dashboard/consumable/health',
		extraParams : {
		},
		reader : {
			type : 'json',
			root : 'items'
		}
	}
});