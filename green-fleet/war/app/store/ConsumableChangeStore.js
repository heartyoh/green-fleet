Ext.define('GreenFleet.store.ConsumableChangeStore', {
	extend : 'Ext.data.Store',

	storeId : 'consumable_change_store',
	
	fields : [ 
		{
			name : 'key',
			type : 'string'
		}, {
			name : 'vehicle_id',
			type : 'string'				
		}, {			
			name : 'consumable_item',
			type : 'string'
		}, {
			name : 'repl_date',
			type : 'date'
		}, {			
			name : 'repl_mileage',
			type : 'int'
		}, {
			name : 'worker',
			type : 'string'
		}, {
			name : 'component',
			type : 'string'
		}, {
			name : 'comment',
			type : 'string'
		}, {
			name : 'cost',
			type : 'int'				
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
		url : 'consumable_change',		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}	
	}
});