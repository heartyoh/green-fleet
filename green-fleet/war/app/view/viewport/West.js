Ext.define('GreenFleet.view.viewport.West', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.west',
	cls : 'tool',

	layout : {
		type : 'vbox'
	},
	items : [ {
		xtype : 'button',
		cls : 'btnAdd',
		html : 'add'
	}, {
		xtype : 'button',
		cls : 'btnRemove',
		html : 'remove'
	}, {
		xtype : 'button',
		cls : 'btnRefresh',
		html : 'refresh'
	}, {
		xtype : 'button',
		cls : 'btnImport',
		html : 'import',
		handler : function() {
			GreenFleet.importData();
		}
	}, {
		xtype : 'button',
		cls : 'btnEvent',
		html : 'incident log',
		handler : function() {
			GreenFleet.uploadIncidentLog();
		}
	}, {
		xtype : 'button',
		cls : 'btnEvent',
		html : 'incident video',
		handler : function() {
			GreenFleet.uploadIncidentVideo();
		}
	}, {
		xtype : 'button',
		cls : 'btnSave',
		html : 'save'
	}, {
		xtype : 'button',
		cls : 'btnExport',
		html : 'export'
	} ]
});
