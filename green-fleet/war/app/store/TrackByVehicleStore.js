Ext.define('GreenFleet.store.TrackByVehicleStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'lat',
		type : 'number'
	}, {
		name : 'lng',
		type : 'number'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat : 'time'
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