Ext.define('GreenFleet.store.VehicleStatusStore', {
	extend : 'Ext.data.Store',

	storeId : 'vehiclestatus_store',

	fields : [ 'status', 'desc' ],

	data : [ {
		"status" : "Running",
		"desc" : "Running"
	}, {
		"status" : "Incident",
		"desc" : "Incident"
	}, {
		"status" : "Idle",
		"desc" : "Idle"
	} ]
});