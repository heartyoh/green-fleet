Ext.define('GreenFleet.view.viewport.West', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.west',
	cls : 'tool',

	layout : {
		type : 'vbox'
	},
	items : [ {
		xtype : 'button',
		cls : 'btnDashboard',
		html : 'D.board'
	}, {
		xtype : 'button',
		cls : 'btnInfo',
		html : 'Info'
	}, {
		xtype : 'button',
		cls : 'btnIncidentInfo',
		html : 'Incident'
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
		cls : 'btnExport',
		html : 'export'
	} ]
});
