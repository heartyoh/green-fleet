Ext.define('GreenFleet.view.management.VehicleOverview', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_overview',

	title : T('title.vehicle_overview'),

	entityUrl : 'vehicle',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {

		this.items = [ this.zinfo, this.zrunning,  this.zconsumables, this.zalerts ];

		this.callParent();
	},
	
	/**
	 * 리프레쉬
	 */
	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		
		// TODO 		
	},

	/**
	 * 차량 정보 
	 */
	zinfo : {
		xtype : 'panel',
		itemId : 'v_info_panel',
		cls : 'hIndexbar',
		title : T('title.information'),
		flex : 1,
		autoScroll : true
	},

	/**
	 * 주행 
	 */
	zrunning : {
		xtype : 'panel',
		itemId : 'v_running_panel',
		cls : 'hIndexbar',
		title : T('title.running'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 정비, 소모품  
	 */
	zconsumables : {
		xtype : 'panel',
		itemId : 'v_consumable_panel',
		cls : 'hIndexbar',
		title : T('title.consumables'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * alert  
	 */
	zalerts : {
		xtype : 'panel',
		itemId : 'v_alert_panel',
		cls : 'hIndexbar',
		title : T('title.alert'),
		flex : 1,
		autoScroll : true
	}	
});