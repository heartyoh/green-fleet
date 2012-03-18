Ext.define('GreenFleet.store.UserStore', {
	extend : 'Ext.data.Store',
	
	autoLoad : false,
	
	pageSize : 250,

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
		name : 'name',
		type : 'string'
	}, {
//		name : 'forename',
//		type : 'string'
//	}, {
//		name : 'nickname',
//		type : 'string'
//	}, {
//		name : 'surname',
//		type : 'string'
//	}, {
		name : 'admin',
		type : 'boolean'
	}, {
		name : 'enabled',
		type : 'boolean'
//	}, {
//		name : 'locale',
//		type : 'string'			
	}, {
		name : 'language',
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
		url : 'user',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});