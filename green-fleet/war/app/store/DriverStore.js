Ext.define('GreenFleet.store.DriverStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'name',
		type : 'string'
	}, {
		name : 'employeeId',
		type : 'string'
	}, {
		name : 'division',
		type : 'string'
	}, {
		name : 'title',
		type : 'string'
	}, {
		name : 'imageClip',
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
		url : 'driver',
		reader : {
			type : 'json'
		}
	}
});