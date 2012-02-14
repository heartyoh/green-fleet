Ext.define('GreenFleet.store.ReservationStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'reserved_date',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'vehicle_type',
		type : 'string'
	}, {
		name : 'delivery_place',
		type : 'string'
	}, {
		name : 'destination',
		type : 'string'
	}, {
		name : 'purpose',
		type : 'string'
	}, {
		name : 'status',
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
		url : 'reservation',
		reader : {
			type : 'json'
		}
	}
});