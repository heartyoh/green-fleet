Ext.define('GreenFleet.store.TerminalBriefStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'serial_no',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'terminal',
		extraParams : {
			select : [ 'id', 'serial_no' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});