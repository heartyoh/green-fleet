Ext.define('GreenFleet.store.IncidentLogChartStore', {
	extend : 'Ext.data.Store',

	fields : [ {
		name : 'datetime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'velocity',
		type : 'float'
	}, {
		name : 'accelate_x',
		type : 'float'
	}, {
		name : 'accelate_y',
		type : 'float'
	}, {
		name : 'accelate_z',
		type : 'float'
	} ],
	
	sorters : [ {
		property : 'datetime',
		direction : 'ASC'
	} ],
	
	data : []
});