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
		itemId : 'overview',
		cls : 'btnDashboard',
		text : T('menu.overview'),
		handler : function() {
			GreenFleet.doMenu('overview');
		}
	}, {
		xtype : 'button',
		itemId : 'monitor_map',
		cls : 'btnDashboard',
		text : T('menu.map'),
		handler : function() {
			GreenFleet.doMenu('monitor_map');
		}
	}, {
		xtype : 'button',
		itemId : 'information',
		cls : 'btnInfo',
		text : T('menu.info'),
		handler : function() {
			GreenFleet.doMenu('information');
		}		
	}, {
		xtype : 'button',
		itemId : 'monitor_incident',
		cls : 'btnIncidentInfo',
		text : T('menu.incident'),
		handler : function() {
			GreenFleet.doMenu('monitor_incident');
		}		
	}, {
		xtype : 'button',
		cls : 'btnImport',
		text : T('menu.import_data'),
		handler : function() {
			GreenFleet.importData();
		}
	}, {
//		xtype : 'button',
//		cls : 'btnEvent',
//		text : 'incident log',
//		handler : function() {
//			GreenFleet.uploadIncidentLog();
//		}
//	}, {
//		xtype : 'button',
//		cls : 'btnEvent',
//		text : 'incident video',
//		handler : function() {
//			GreenFleet.uploadIncidentVideo();
//		}
//	}, {
		xtype : 'button',
		cls : 'btnExport',
		text : T('menu.export_data')
	} ]
});
