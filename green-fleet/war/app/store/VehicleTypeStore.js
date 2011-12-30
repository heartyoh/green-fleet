Ext.define('GreenFleet.store.VehicleTypeStore', {
	extend : 'Ext.data.Store',

	storeId : 'vehicletype_store',

	fields : [ 'name', 'desc' ],

	data : [ {
		"name" : "A",
		"desc" : "A 800-"
	}, {
		"name" : "B",
		"desc" : "B 800~1000"
	}, {
		"name" : "C",
		"desc" : "C 1000~1500"
	}, {
		"name" : "D",
		"desc" : "D 1500~1800"
	}, {
		"name" : "E",
		"desc" : "E 1800~2000"
	}, {
		"name" : "F",
		"desc" : "F 2000+"
	} ]
});