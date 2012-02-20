Ext.define('GreenFleet.store.ConsumableStore', {
	extend : 'Ext.data.Store',

	model : 'GreenFleet.model.ConsumableHealth',

	data : [ {
		item : 'Engine Oil',
		recent_date : '2011-12-28',
		running_qty : '4200 Km',
		threshold : '5000 Km',
		healthy : 84,
		status : 'impending',
		desc : ''
	}, {
		item : 'Timing Belt',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '50000 Km',
		healthy : 4.6,
		status : 'healthy',
		desc : ''
	}, {
		item : 'Spark Plug',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '50000 Km',
		healthy : 4.6,
		status : 'healthy',
		desc : ''
	}, {
		item : 'Cooling Water',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '50000 Km',
		healthy : 4.6,
		status : 'healthy',
		desc : ''
	}, {
		item : 'Brake Oil',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '50000 Km',
		healthy : 4.6,
		status : 'healthy',
		desc : ''
	}, {
		item : 'Fuel Filter',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '5000 Km',
		healthy : 84,
		status : 'impending',
		desc : ''
	} ]
});