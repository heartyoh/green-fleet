Ext.define('GreenFleet.store.UserStore', {
	extend : 'Ext.data.Store',

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'email',
		type : 'string'
	}, {
		name : 'company',
		type : 'string'
	}, {
		name : 'forename',
		type : 'string'
	}, {
		name : 'nickname',
		type : 'string'
	}, {
		name : 'surname',
		type : 'string'
	}, {
		name : 'admin',
		type : 'boolean'
	}, {
		name : 'enabled',
		type : 'boolean'
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
		url : 'user',
		reader : {
			type : 'json'
		}
	}
});