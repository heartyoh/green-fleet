Ext.define('GreenFleet.store.CheckinDataStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'distance',
		type : 'float'
	}, {
		name : 'runningTime',
		type : 'float'
	}, {
		name : 'averageSpeed',
		type : 'float'
	}, {
		name : 'highestSpeed',
		type : 'float'
	}, {
		name : 'suddenAccelCount',
		type : 'float'
	}, {
		name : 'suddenBrakeCount',
		type : 'float'
	}, {
		name : 'econoDrivingRatio',
		type : 'float'
	}, {
		name : 'fuelEfficiency',
		type : 'float'
	}, {
		name : 'idlingTime',
		type : 'float'
	}, {
		name : 'ecoDrivingTime',
		type : 'float'
	}, {
		name : 'overSpeedingTime',
		type : 'float'
	}, {
		name : 'co2Emissions',
		type : 'float'
	}, {
		name : 'maxCoolingWaterTemp',
		type : 'float'
	}, {
		name : 'avgBatteryVolt',
		type : 'float'
	}, {
		name : 'date',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'startTime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'endTime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'checkin_data',
		reader : {
			type : 'json'
		}
	}
});