Ext.define('GreenFleet.store.RecentIncidentStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	remoteFilter : true,
	
	remoteSort : true,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'incidentTime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'impulse',
		type : 'float'
	}, {
		name : 'videoClip',
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
		url : 'incident',
		reader : {
			type : 'json'
		}
	}
});