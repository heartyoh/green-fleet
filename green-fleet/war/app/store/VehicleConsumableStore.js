Ext.define('GreenFleet.store.VehicleConsumableStore', {
	extend : 'Ext.data.Store',

	storeId : 'vehicle_consumable_store',

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
			name : 'repl_unit',
			type : 'string'
		}, {			
			name : 'repl_mileage',
			type : 'int'
		}, {
			name : 'repl_time',
			type : 'int'
		}, {
			name : 'last_repl_date',
			type : 'date',
			dateFormat : 'time'
		}, {
			name : 'miles_last_repl',
			type : 'int'
		}, {
			name : 'miles_since_last_repl',
			type : 'int'				
		}, {
			name : 'next_repl_mileage',
			type : 'int'
		}, {
			name : 'next_repl_date',
			type : 'date',
			dateFormat : 'time'
		}, {
			name : 'accrued_cost',
			type : 'float'
		}, {
			name : 'health_rate',
			type : 'float'
		}, {
			name : 'status',
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
		url : 'vehicle_consumable',		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}	
	}
});