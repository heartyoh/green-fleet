Ext.define('GreenFleet.store.CodeStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'group',
		type : 'string'
	}, {
		name : 'code',
		type : 'string'
	}, {
		name : 'desc',
		type : 'string'
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updatedAt',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'code',
		reader : {
			type : 'json'
		}
	}
});