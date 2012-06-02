/*
 * This store only for local filtering. VehicleMapStore will load data on this
 * store. So, never Load this Store.
 */
Ext.define('GreenFleet.store.VehicleFilteredStore', {
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
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
		type : 'float'
	}, {
		name : 'location',
		type : 'string'
	} ]
});