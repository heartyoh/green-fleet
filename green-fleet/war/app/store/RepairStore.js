Ext.define('GreenFleet.store.RepairStore', {
	extend : 'Ext.data.Store',

	storeId : 'repair_store',
		
	fields : [ 
		{
			name : 'key',
			type : 'string'
		}, {
			name : 'vehicle_id',
			type : 'string'
		}, {
			name : 'repair_date',
			type : 'date',
			dateFormat:'time'
		}, {
			name : 'repair_mileage',
			type : 'int'
		}, {
			name : 'repair_man',
			type : 'string'
		}, {
			name : 'repair_shop',
			type : 'string'
		}, {
			name : 'content',
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
		url : 'repair',		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}	
	}
});