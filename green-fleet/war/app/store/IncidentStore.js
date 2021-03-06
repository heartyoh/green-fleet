Ext.define('GreenFleet.store.IncidentStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	pageSize : 25,
	
//	remoteFilter : true,
	
//	remoteSort : true,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
		type : 'float'
	}, {
		name : 'velocity',
		type : 'float'
	}, {
		name : 'impulse_abs',
		type : 'float'
	}, {
		name : 'impulse_x',
		type : 'float'
	}, {
		name : 'impulse_y',
		type : 'float'
	}, {
		name : 'impulse_z',
		type : 'float'
	}, {
		name : 'impulse_threshold',
		type : 'float'
	}, {
		name : 'obd_connected',
		type : 'boolean'
	}, {
		name : 'confirm',
		type : 'boolean'
	}, {
		name : 'engine_temp',
		type : 'float'
	}, {
		name : 'engine_temp_threshold',
		type : 'float'
	}, {
		name : 'video_clip',
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
	
	sorters : [ {
		property : 'datetime',
		direction : 'DESC'
	} ],

	proxy : {
		type : 'ajax',
		url : 'incident',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});