Ext.define('GreenFleet.view.management.VehicleOverview', {
	extend : 'Ext.Container',

	alias : 'widget.management_vehicle_overview',

	title : T('title.vehicle_overview'),

	entityUrl : 'vehicle',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {
		var self = this;

		this.items = [
		    { html : "<div class='listTitle'>" + T('title.vehicle_overview') + "</div>"}, 
		    {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'hbox',
					align : 'stretch'
				},
				items : [ 
				    this.zvehiclelist(self), 
				    {
						xtype : 'container',
						flex : 1,
						cls : 'borderRightGray',
						layout : {
							align : 'stretch',
							type : 'vbox'
						},
						items : [ this.zinfo, this.zrunning,  this.zconsumables, this.zalerts ]
					} 
				]
		    }
		],

		this.callParent();
			
		this.sub('vehicle_list').on('itemclick', function(grid, record) {
		});
		
		/**
		 * Vehicle Id 검색 조건 변경시 Vehicle 데이터 Local filtering
		 */
		this.sub('id_filter').on('change', function(field, value) {
			self.searchVehicles(false);
		});

		/**
		 * Vehicle Reg No. 검색 조건 변경시 Vehicle 데이터 Local filtering 
		 */
		this.sub('reg_no_filter').on('change', function(field, value) {
			self.searchVehicles(false);
		});
	},
	
	/**
	 * 차량 조회 
	 */
	searchVehicles : function(searchRemote) {
		
		if(searchRemote) {
			this.sub('vehicle_list').store.load();
			
		} else {
			this.sub('vehicle_list').store.clearFilter(true);			
			var idValue = this.sub('id_filter').getValue();
			var regNoValue = this.sub('reg_no_filter').getValue();
			
			if(idValue || regNoValue) {
				this.sub('vehicle_list').store.filter([ {
					property : 'id',
					value : idValue
				}, {
					property : 'registration_number',
					value : regNoValue
				} ]);
			}			
		}		
	},		
	
	/**
	 * 차량 리스트 그리드 
	 */
	zvehiclelist : function(self) {
		return {
			xtype : 'gridpanel',
			itemId : 'vehicle_list',
			store : 'VehicleBriefStore',
			title : T('title.vehicle_list'),
			width : 280,
			autoScroll : true,
			
			columns : [ {
				dataIndex : 'id',
				text : T('label.id'),
				flex : 1
			}, {
				dataIndex : 'registration_number',
				text : T('label.reg_no'),
				flex : 1
			} ],

			tbar : [
			    T('label.id'),
				{
					xtype : 'textfield',
					name : 'id_filter',
					itemId : 'id_filter',
					width : 60
				}, 
				T('label.reg_no'),
				{
					xtype : 'textfield',
					name : 'reg_no_filter',
					itemId : 'reg_no_filter',
					width : 65
				},
				' ',
				{
					xtype : 'button',
					text : T('button.search'),
					handler : function(btn) {
						btn.up('management_vehicle_runstatus').searchVehicles(true);
					}
				}
			]
		}
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