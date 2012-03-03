Ext.define('GreenFleet.store.TerminalStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 1000,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'serial_no',
		type : 'string'
	}, {
		name : 'buying_date',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'comment',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'terminal',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});