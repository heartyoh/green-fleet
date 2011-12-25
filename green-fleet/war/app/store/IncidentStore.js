Ext.define('GreenFleet.store.IncidentStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'incidentTime',
		type : 'string'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'number'
	}, {
		name : 'longitude',
		type : 'number'
	}, {
		name : 'impulse',
		type : 'number'
	}, {
		name : 'videoClip',
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
		url : 'incident',
		reader : {
			type : 'json'
		}
	}
});