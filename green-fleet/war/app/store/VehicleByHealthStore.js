Ext.define('GreenFleet.store.VehicleByHealthStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	pageSize : 1000,

	fields : [ 
	   {
		   name : 'id',
		   type : 'string'
	   }, {
		   name : 'registration_number',
		   type : 'string'
	   }, {
		   name : 'vehicle_type',
		   type : 'string'
	   }, {
		   name : 'birth_year',
		   type : 'int'
	   }, {
		   name : 'total_distance',
		   type : 'float'
	   }, {
		   name : 'health_status',
		   type : 'string'
	   }
	],

	proxy : {
		type : 'ajax',
		url : 'vehicle/byhealth',
		extraParams : {
			select : [ 'id', 'registration_number', 'vehicle_type', 'birth_year', 'total_distance', 'health_status' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});