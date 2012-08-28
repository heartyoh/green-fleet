Ext.define('GreenFleet.view.management.Vehicle', {
	extend : 'Ext.Container',

	alias : 'widget.management_vehicle',

	title : T('title.vehicle'),

	entityUrl : 'vehicle',
	
	importUrl : 'vehicle/import',

	afterImport : function() {
	},
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
		
	initComponent : function() {
		
		var self = this;

		this.items = [
		    { html : "<div class='listTitle'>" + T('title.vehicle_list') + "</div>"}, 
		    { xtype : 'container',
		      flex : 1,
		      layout : {
					type : 'hbox',
					align : 'stretch'
		      },
		      items : [ this.zvehiclelist, { 
		    	  		xtype : 'container',
						flex : 1,
						cls : 'borderRightGray',
						layout : {
							align : 'stretch',
							type : 'vbox'
						},
						items : [ this.ztabpanel ] } ]
		    }],

		this.callParent();
		
		/**
		 * Vehicle List에서 사용자가 차량을 선택하는 경우 - 현재 선택된 탭의 정보를 리프레쉬 
		 */
		this.sub('vehicle_list').on('itemclick', function(grid, record) {
			self.refresh(record.data.id, record.data.registration_number);
		});
		
		/**
		 * Tab 선택이 변경될 때 - 해당 탭을 리프레쉬 
		 */
		this.sub('tabs').on('tabchange', function(tabPanel, newCard, oldCard, eOpts) {
			if(self.vehicle) {
				newCard.refresh(self.vehicle, self.regNo);
			}
		});		
				
		/**
		 * Vehicle Id 검색 조건 변경시 Vehicle 데이터 Local filtering
		 */
		this.sub('id_filter').on('change', function(field, value) {
			self.search(false);
		});

		/**
		 * Vehicle Reg No. 검색 조건 변경시 Vehicle 데이터 Local filtering 
		 */
		this.sub('reg_no_filter').on('change', function(field, value) {
			self.search(false);
		});
	},
		
	/**
	 * 차량 조회 
	 */
	search : function(remote) {
		
		if(remote) {
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
	 * 선택된 탭의 vehicle 정보 리프레쉬 
	 */
	refresh : function(vehicleId, regNo) {
		this.vehicle = vehicleId;
		this.regNo = regNo;
		
		var tabs = this.sub('tabs');
		var activeTab = tabs.getActiveTab();
		if(activeTab.refresh && (typeof(activeTab.refresh) === 'function')) {
			activeTab.refresh(vehicleId, regNo);
		}
	},
	
	/**
	 * 차량 리스트 그리드 
	 */
	zvehiclelist : {
		xtype : 'gridpanel',
		itemId : 'vehicle_list',
		store : 'VehicleImageBriefStore',
		title : T('title.vehicle_list'),
		width : 280,
		autoScroll : true,
		
		columns : [ {
	    	dataIndex : 'image_clip',
	    	text : 'Image',
	    	renderer : function(image_clip) {
 		   		var imgTag = "<img src='";
 				
 				if(image_clip) {
 					imgTag += "download?blob-key=" + image_clip;
 				} else {
 					imgTag += "resources/image/bgVehicle.png";
 				}
 				
 				imgTag += "' width='80' height='80'/>";
 				return imgTag;
	    	}
	    }, {
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
		}, T('label.reg_no'),
		{
			xtype : 'textfield',
			name : 'reg_no_filter',
			itemId : 'reg_no_filter',
			width : 65
		}, ' ',
		{
			xtype : 'button',
			text : T('button.search'),
			handler : function(btn) {
				btn.up('management_vehicle').search(true);
			}
		}]
	},
	
	ztabpanel : {
		itemId : 'tabs',
		xtype : 'tabpanel',
		flex : 1,
		items : [ /*{
			xtype : 'management_vehicle_overview'
		}, */{
			xtype : 'management_vehicle_detail'
		}, {
			xtype : 'management_vehicle_consumables'
		}, {
			xtype : 'management_vehicle_track'
		}, {
			xtype : 'management_vehicle_incident'
		}, {
			xtype : 'management_vehicle_checkin'
		}, {
			xtype : 'management_vehicle_runstatus'
		}, {
			xtype : 'management_vehicle_speed'
		} ]
	},	
});