Ext.define('GreenFleet.store.DashboardVehicleStore', {
	extend : 'Ext.data.Store',

	storeId : 'dashboard_vehicle_store',

	fields : [
		{
			name : 'name',
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
			id : 'vehicle_health'
		},
		reader : {
			type : 'json',
			root : 'items'
		}
	}
});