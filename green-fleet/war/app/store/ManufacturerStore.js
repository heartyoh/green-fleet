Ext.define('GreenFleet.store.ManufacturerStore', {
	extend : 'Ext.data.Store',

	storeId : 'manufacturer_store',

	fields : [ 'name' ],

	data : [ {
		"name" : "Audi"
	}, {
		"name" : "Volkswagon"
	}, {
		"name" : "Mercedes-Benz"
	}, {
		"name" : "Hyundai"
	}, {
		"name" : "Kia"
	} ]
});