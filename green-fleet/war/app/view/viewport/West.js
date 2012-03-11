Ext.define('GreenFleet.view.viewport.West', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.west',
	
	id : 'west',
		
	cls : 'tool',

	layout : {
		type : 'vbox'
	},
	items : [ {
		xtype : 'button',
		itemId : 'monitor_map',
		cls : 'btnDashboard',
		html : 'Map',
		handler : function() {
			GreenFleet.doMenu('monitor_map');
		}
	}, {
		xtype : 'button',
		itemId : 'information',
		cls : 'btnInfo',
		html : 'Info',
		handler : function() {
			GreenFleet.doMenu('information');
		}		
	}, {
		xtype : 'button',
		itemId : 'monitor_incident',
		cls : 'btnIncidentInfo',
		html : 'Incident',
		handler : function() {
			GreenFleet.doMenu('monitor_incident');
		}		
	}, {
		xtype : 'button',
		cls : 'btnImport',
		html : 'import',
		handler : function() {
			GreenFleet.importData();
		}
	}, {
//		xtype : 'button',
//		cls : 'btnEvent',
//		html : 'incident log',
//		handler : function() {
//			GreenFleet.uploadIncidentLog();
//		}
//	}, {
//		xtype : 'button',
//		cls : 'btnEvent',
//		html : 'incident video',
//		handler : function() {
//			GreenFleet.uploadIncidentVideo();
//		}
//	}, {
		xtype : 'button',
		cls : 'btnExport',
		html : 'export'
	} ]
});
