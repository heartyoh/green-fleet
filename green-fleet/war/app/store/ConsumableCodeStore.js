Ext.define('GreenFleet.store.ConsumableCodeStore', {
	extend : 'Ext.data.Store',

	storeId : 'consumable_code_store',

	fields : [ 
		{
			name : 'key',
			type : 'string'
		}, {
			name : 'name',
			type : 'string'
		}, {
			name : 'repl_unit',
			type : 'string'
		}, {
			name : 'fst_repl_mileage',
			type : 'int'
		}, {
			name : 'fst_repl_time',
			type : 'int'
		}, {			
			name : 'repl_mileage',
			type : 'int'
		}, {
			name : 'repl_time',
			type : 'int'
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