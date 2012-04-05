Ext.define('GreenFleet.store.AlarmStore', {
	extend : 'Ext.data.Store',

	storeId : 'alarm_store',
	
	fields : [ 
		{
			name : 'key',
			type : 'string'
		}, {
			name : 'name',
			type : 'string'
		}, {
			name : 'vehicles',
			type : 'string'
		}, {
			name : 'evt_type',
			type : 'string'
		}, {
			name : 'loc',
			type : 'string'
		}, {
			name : 'rad',
			type : 'float'
		}, {
			name : 'evt_trg',
			type : 'string'
		}, {
			name : 'dest',
			type : 'string'
		}, {
			name : 'type',
			type : 'string'
		}, {
			name : 'always',
			type : 'boolean'
		}, {
			name : 'from_date',
			type : 'date',
			dateFormat:'time'
		}, {
			name : 'to_date',
			type : 'date',
			dateFormat:'time'
		}, {
			name : 'msg',
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
		url : 'alarm',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});