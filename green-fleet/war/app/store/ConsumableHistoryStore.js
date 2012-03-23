Ext.define('GreenFleet.store.ConsumableHistoryStore', {
	extend : 'Ext.data.Store',

	storeId : 'consumable_history_store',
	
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
			name : 'last_repl_date',
			type : 'date',
			dateFormat:'time'
		}, {			
			name : 'miles_last_repl',
			type : 'int'
		}, {
			name : 'worker',
			type : 'string'
		}, {
			name : 'component',
			type : 'string'
		}, {
			name : 'cost',
			type : 'int'				
		}, {
			name : 'comment',
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
		url : 'vehicle_consumable/history',		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}	
	}
});