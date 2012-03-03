Ext.define('GreenFleet.store.RecentIncidentStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	pageSize : 5,
	
//	remoteFilter : true,

	// remoteSort : true,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat : 'time'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'impulse_abs',
		type : 'float'
	}, {
		name : 'engine_temp',
		type : 'float'
	}, {
		name : 'video_clip',
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

//	filters : [ {
//		property : 'confirm',
//		value : false
//	} ],

	sorters : [ {
		property : 'datetime',
		direction : 'DESC'
	} ],

	proxy : {
		type : 'ajax',
		url : 'incident',
		extraParams : {
			confirm : false
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});