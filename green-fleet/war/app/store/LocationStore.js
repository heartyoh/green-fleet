Ext.define('GreenFleet.store.LocationStore', {
	extend : 'Ext.data.Store',

	storeId : 'location_store',
		
	fields : [ 
		{
			name : 'key',
			type : 'string'
		}, {
			name : 'name',
			type : 'string'
		}, {
			name : 'address',
			type : 'string'
		}, {
			name : 'lattitude',
			type : 'float'
		}, {
			name : 'longitude',
			type : 'float'
		}, {
			name : 'desc',
			type : 'string'				
		}, {
			name : 'created_at',
			type : 'date',
			dateFormat:'time'
		}, {
			name : 'updated_at',
			type : 'date',
			dateFormat:'time'
		}	
	],

	pageSize : 1000,
	
	sorters : [ {
		property : 'updated_at',		
		direction : 'DESC'
	} ],	

	proxy : {
		type : 'ajax',
		url : 'location',		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}	
	}
});