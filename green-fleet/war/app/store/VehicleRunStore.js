Ext.define('GreenFleet.store.VehicleRunStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'month',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'run_dist',
		type : 'float'
	}, {
		name : 'run_time',
		type : 'integer'
	}, {
		name : 'consmpt',
		type : 'float'
	}, {
		name : 'co2_emss',
		type : 'float'
	}, {
		name : 'effcc',
		type : 'float'			
	} ],
	
	sorters : [ {
		property : 'month',
		direction : 'DESC'
	} ],	
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_run',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});