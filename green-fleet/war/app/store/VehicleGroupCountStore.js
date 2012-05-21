Ext.define('GreenFleet.store.VehicleGroupCountStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	pageSize : 10,
	
	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'expl',
		type : 'string'
	}, {
		name : 'count',
		type : 'integer'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_group/group_count',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});