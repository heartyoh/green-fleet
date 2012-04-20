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
			dashboard_id = "runtime_by_vehicles";
		
		return {
			xtype : 'dashboard_' + dashboard_id,
			itemId : 'dashboard_panel',
			cls : 'hIndexbar',
			title : T('report.report') + ' Test',
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
				data : [{ "id" : "runtime_by_vehicles", 	"name" : T('report.runtime_by_vehicles') },
				        { "id" : "runtime_by_drivers", 		"name" : T('report.runtime_by_drivers') },
				        { "id" : "rundist_by_vehicles", 	"name" : T('report.rundist_by_vehicles') },
				        { "id" : "rundist_by_drivers", 		"name" : T('report.rundist_by_drivers') },
				        { "id" : "consumption_by_vehicles", "name" : T('report.consumption_by_vehicles') },
				        { "id" : "efficiency_by_vehicles", 	"name" : T('report.efficiency_by_vehicles') },
				        { "id" : "oprate_by_vehicles", 		"name" : T('report.oprate_by_vehicles') },
				        { "id" : "oprate_by_drivers", 		"name" : T('report.oprate_by_drivers') },
				        { "id" : "maint_times", 			"name" : T('report.maint_times') },
				        { "id" : "breakdown_times", 		"name" : T('report.breakdown_times') },
				        { "id" : "vehicle_effcc_rel", 		"name" : T('report.vehicle_effcc_rel') },
				        { "id" : "driver_effcc_rel", 		"name" : T('report.driver_effcc_rel') },
				        { "id" : "habit_effcc_rel", 		"name" : T('report.habit_effcc_rel') },
				        { "id" : "incident_effcc_rel", 		"name" : T('report.incident_effcc_rel') },
				        { "id" : "consumable_effcc_rel", 	"name" : T('report.consumable_effcc_rel') }]
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
	},
});