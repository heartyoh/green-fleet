Ext.define('GreenFleet.store.VehicleMapStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	pageSize : 1000,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'registration_number',
		type : 'string'
	}, {
		name : 'status',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'location',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'vehicle',
		extraParams : {
			select : [ 'id', 'registration_number', 'status', 'driver_id', 'lattitude', 'longitude' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	},

	listeners : {
		load : function(store, data) {
			Ext.getStore('VehicleFilteredStore').loadData(data);
		}
	}
});