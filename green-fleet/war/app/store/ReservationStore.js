Ext.define('GreenFleet.store.ReservationStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'reservedDate',
		type : 'string'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'vehicleType',
		type : 'string'
	}, {
		name : 'deliveryType',
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
		url : 'reservation',
		reader : {
			type : 'json'
		}
	}
});