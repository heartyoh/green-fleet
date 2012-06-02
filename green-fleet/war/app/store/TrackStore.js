Ext.define('GreenFleet.store.TrackStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
//	remoteFilter : true,
	
//	remoteSort : true,
	
	fields : [ {
		name : 'key',
		type : 'string'
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
		name : 'datetime',
		type : 'date',
		dateFormat : 'time'
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
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	sorters : [ {
		property : 'datetime',
		direction : 'DESC'
	} ],

	proxy : {
		type : 'ajax',
		url : 'track',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});