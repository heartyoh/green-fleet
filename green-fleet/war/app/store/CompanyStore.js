Ext.define('GreenFleet.store.CompanyStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'name',
		type : 'string'
	}, {
		name : 'desc',
		type : 'string'
	}, {
		name : 'timezone',
		type : 'int'
	}, {
		name : 'image_clip',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat : 'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat : 'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'company',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});