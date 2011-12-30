Ext.define('GreenFleet.store.VehicleStatusStore', {
	extend : 'Ext.data.Store',

	storeId : 'vehiclestatus_store',

	fields : [ 'status', 'desc' ],

	data : [ {
		"name" : "Running",
		"desc" : "Running"
	}, {
		"name" : "Incident",
		"desc" : "Incident"
	}, {
		"name" : "Idle",
		"desc" : "Idle"
	} ]
});