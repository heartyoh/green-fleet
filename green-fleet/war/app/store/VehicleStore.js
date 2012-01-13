Ext.define('GreenFleet.store.VehicleStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'registrationNumber',
		type : 'string'
	}, {
		name : 'manufacturer',
		type : 'string'
	}, {
		name : 'vehicleType',
		type : 'string'
	}, {
		name : 'birthYear',
		type : 'string'
	}, {
		name : 'ownershipType',
		type : 'string'
	}, {
		name : 'status',
		type : 'string'
	}, {
		name : 'imageClip',
		type : 'string'
	}, {
		name : 'totalDistance',
		type : 'string'
	}, {
		name : 'remainingFuel',
		type : 'string'
	}, {
		name : 'distanceSinceNewOil',
		type : 'string'
	}, {
		name : 'engineOilStatus',
		type : 'string'
	}, {
		name : 'fuelFilterStatus',
		type : 'string'
	}, {
		name : 'brakeOilStatus',
		type : 'string'
	}, {
		name : 'brakePedalStatus',
		type : 'string'
	}, {
		name : 'coolingWaterStatus',
		type : 'string'
	}, {
		name : 'timingBeltStatus',
		type : 'string'
	}, {
		name : 'sparkPlugStatus',
		type : 'string'
	}, {
		name : 'driver',
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
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updatedAt',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle',
		reader : {
			type : 'json'
		}
	}
});