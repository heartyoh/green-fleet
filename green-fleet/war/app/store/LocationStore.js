Ext.define('GreenFleet.store.LocationStore', {
	extend : 'Ext.data.Store',

	storeId : 'location_store',
		
	fields : [ {
			name : 'key',
			type : 'string' 
	    }, {
			name : 'name',
			type : 'string'
		}, {
			name : 'addr',
			type : 'string'
		}, {
			name : 'lat',
			type : 'float'
		}, {
			name : 'lng',
			type : 'float'
		}, {
			name : 'rad',
			type : 'int'
		}, {
			name : 'lat_lo',
			type : 'float'
		}, {
			name : 'lat_hi',
			type : 'float'
		}, {
			name : 'lng_lo',
			type : 'float'
		}, {
			name : 'lng_hi',
			type : 'float'				
		}, {
			name : 'expl',
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

	pageSize : 20,
	
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