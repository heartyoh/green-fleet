Ext.define('GreenFleet.view.dashboard.Reports', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_report',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	
	title : T('menu.dashboard'),

	initComponent : function() {
		var self = this;
		
		this.items = [{
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [
			    this.reportlist(), 
			    {
			    	itemId : 'report_view',
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : {
						align : 'stretch',
						type : 'vbox'
					},
					items : [ this.dashboard_body() ]
				} 
			]
	    }],

		this.callParent();
		
		this.sub('report_list').on('itemclick', function(grid, record) {
			self.sub('report_view').removeAll();
			self.sub('report_view').add(self.dashboard_body(record.get('id')));
		});
	},
	
	dashboard_body : function(dashboard_id) {
		
		if(!dashboard_id)
			dashboard_id = "vehicle_summary";
		
		return {
			xtype : 'dashboard_' + dashboard_id,
			itemId : 'dashboard_panel',
			cls : 'hIndexbar',
			title : T('report.report'),
			flex : 1,
			autoScroll : true
		};
	},
	
	zvehiclelist : {
		xtype : 'gridpanel',
		itemId : 'driver_list',
		store : 'DriverStore',
		title : T('title.driver_list'),
		width : 260,
		autoScroll : true,
		
		columns : [ {
			dataIndex : 'id',
			text : T('label.id'),
			flex : 1
		}, {
			dataIndex : 'name',
			text : T('label.name'),
			flex : 1
		} ]
	},	
	
	reportlist : function() {
		return {
			xtype : 'gridpanel',
			itemId : 'report_list',
			store : Ext.create('Ext.data.Store', {
				fields : [ 'id', 'name' ],		        
				data : [{ "id" : "vehicle_summary", 	"name" : T('report.vehicle_summary') },
				        { "id" : "driver_summary", 		"name" : T('report.driver_summary') },				        
				        { "id" : "vehicle_health", 		"name" : T('report.vehicle_health') },
				        { "id" : "consumable_health", 	"name" : T('report.consumable_health') },				        
				        { "id" : "mttr", 				"name" : T('report.mttr') },
				        { "id" : "mtbf", 				"name" : T('report.mtbf') },
				        { "id" : "driving_trend", 		"name" : T('report.driving_trend') },
				        { "id" : "maint_trend", 		"name" : T('report.maint_trend') },
				        { "id" : "effcc_trend", 		"name" : T('report.effcc_trend') },
				        { "id" : "eco_driving_trend", 	"name" : T('report.eco_driving_trend') },
				        { "id" : "effcc_consmpt", 		"name" : T('report.effcc_consmpt') },
				        { "id" : "habit_ecoindex", 		"name" : T('report.habit_ecoindex') },
				        { "id" : "co2emss_ecoindex", 	"name" : T('report.co2emss_ecoindex') },
				        { "id" : "consmpt_ecoindex",	"name" : T('report.consmpt_ecoindex') }]
			}),
			title : T('title.report_list'),
			width : 180,
			autoScroll : true,			
			columns : [ {
				dataIndex : 'name',
				text : T('label.name'),
				flex : 1
			} ]
		}
	}
});