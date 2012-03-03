Ext.define('GreenFleet.store.VehicleBriefStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	pageSize : 1000,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'registration_number',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'vehicle',
		extraParams : {
			select : [ 'id', 'registration_number', 'image_clip' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});