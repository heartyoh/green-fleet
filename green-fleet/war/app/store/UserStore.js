Ext.define('GreenFleet.store.UserStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

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
		url : 'user',
		reader : {
			type : 'json'
		}
	}
});