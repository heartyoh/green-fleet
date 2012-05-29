Ext.define('GreenFleet.store.ReportStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 50,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'name',
		type : 'string'
	}, {
		name : 'expl',
		type : 'string'
	}, {
		name : 'daily',
		type : 'boolean'
	}, {
		name : 'weekly',
		type : 'boolean'
	}, {
		name : 'monthly',
		type : 'boolean'
	}, {		
		name : 'send_to',
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
		url : 'report',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});