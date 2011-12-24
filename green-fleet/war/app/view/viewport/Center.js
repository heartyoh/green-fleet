Ext.define('GreenFleet.view.viewport.Center', {

	extend : 'Ext.tab.Panel',

	id : 'content',

	alias : 'widget.viewport.center',

	items : [ {
		xtype : 'map',
		closable : false
	}, {
		xtype : 'obd',
		closable : false
	}, {
		xtype : 'filemanager',
		closable : false
	}, {
		xtype : 'company',
		closable : false
	}, {
		xtype : 'vehicle',
		closable : false
	} ]
});