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
			name : 'evt_type',
			type : 'string'
		}, {
			name : 'evt_name',
			type : 'string'
		}, {
			name : 'evt_trg',
			type : 'string'
		}, {
			name : 'type',
			type : 'string'
		}, {
			name : 'always',
			type : 'boolean'
		}, {
			name : 'enabled',
			type : 'boolean'
		}, {
			name : 'from_date',
			type : 'string',
			//dateFormat:'time'
		}, {
			name : 'to_date',
			type : 'string',
			//dateFormat:'time'
		}, {
			name : 'vehicles',
			type : 'string'
		}, {
			name : 'dest',
			type : 'string'
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

	pageSize : 20,
	
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