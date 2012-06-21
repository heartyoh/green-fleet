Ext.define('GreenFleet.store.DriverBriefStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	pageSize : 1000,

	fields : [ {
		name : 'name',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'driver',
		extraParams : {
			select : [ 'id', 'name', 'image_clip' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});