Ext.define('GreenFleet.model.ConsumableHealth', {
	extend : 'Ext.data.Model',
	
	fields : [ {
		name : 'item'
	}, {
		name : 'recent_date'
	}, {
		name : 'running_qty',
	}, {
		name : 'threshold'
	}, {
		name : 'healthy'
	}, {
		name : 'status'
	}, {
		name : 'desc'
	} ]
});