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
		dateFormat : 'YYYY-MM-DD',
		name : 'createdAt',
		type : 'date'
	}, {
		dateFormat : 'YYYY-MM-DD',
		name : 'updaatedAt',
		type : 'date'
	} ],
	proxy : {
		type : 'ajax',
		url : 'company',
		reader : {
			type : 'json'
		}
	}
});