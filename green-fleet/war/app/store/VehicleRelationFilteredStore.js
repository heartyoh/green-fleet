Ext.define('GreenFleet.store.VehicleRelationFilteredStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 100000,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'vehicle_group_id',
		type : 'string'
	} ]
});