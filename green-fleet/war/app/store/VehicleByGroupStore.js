Ext.define('GreenFleet.store.VehicleByGroupStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 10,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'registration_number',
		type : 'string'
	}, {
		name : 'manufacturer',
		type : 'string'
	}, {
		name : 'vehicle_type',
		type : 'string'
	}, {
		name : 'birth_year',
		type : 'int'
	}, {
		name : 'ownership_type',
		type : 'string'
	}, {
		name : 'status',
		type : 'string'
	}, {
		name : 'total_distance',
		type : 'float'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_group/vehicles',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total',
			successProperty : 'success'
		}
	}
});