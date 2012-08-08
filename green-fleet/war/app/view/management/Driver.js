Ext.define('GreenFleet.view.management.Driver', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_driver',

	title : T('title.driver'),
	
	entityUrl : 'driver',

	importUrl : 'driver/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {
		var self = this;
		
		this.items = [
		    { html : "<div class='listTitle'>" + T('title.driver_list') + "</div>"}, 
		    { xtype : 'container',
		      flex : 1,
		      layout : {
					type : 'hbox',
					align : 'stretch'
		      },
		      items : [ this.zdriverlist, { 
		    	  		xtype : 'container',
						flex : 1,
						cls : 'borderRightGray',
						layout : {
							align : 'stretch',
							type : 'vbox'
						},
						items : [ this.ztabpanel ] } ]
		    }],

		this.callParent(arguments);

		/**
		 * Driver List에서 사용자가 운전자를 선택하는 경우 - 현재 선택된 탭의 정보를 리프레쉬 
		 */
		this.sub('driver_list').on('itemclick', function(grid, record) {			
			self.refresh(record.data.id, record.data.name);
		});
		
		/**
		 * Tab 선택이 변경될 때 - 해당 탭을 리프레쉬 
		 */
		this.sub('tabs').on('tabchange', function(tabPanel, newCard, oldCard, eOpts) {
			if(self.driver) {
				newCard.refresh(self.driver, self.driverName);
			}
		});		
		
		/**
		 * Driver Id 검색 조건 변경시 Driver 데이터 Local filtering
		 */
		this.sub('id_filter').on('change', function(field, value) {
			self.search(false);
		});

		/**
		 * Driver 이름 검색 조건 변경시 Driver 데이터 Local filtering 
		 */
		this.sub('name_filter').on('change', function(field, value) {
			self.search(false);
		});		
	},

	/**
	 * 운전자 조회 
	 */
	search : function(remote) {
		if(remote) {
			this.sub('driver_list').store.load();
			
		} else {
			this.sub('driver_list').store.clearFilter(true);			
			var idValue = this.sub('id_filter').getValue();
			var nameValue = this.sub('name_filter').getValue();
			
			if(idValue || nameValue) {
				this.sub('driver_list').store.filter([ {
					property : 'id',
					value : idValue
				}, {
					property : 'name',
					value : nameValue
				} ]);
			}			
		}
	},
	
	/**
	 * 선택된 탭의 driver 정보 리프레쉬   
	 */
	refresh : function(driverId, driverName) {
		this.driver = driverId;
		this.driverName = driverName;
		
		var tabs = this.sub('tabs');
		var activeTab = tabs.getActiveTab();
		if(activeTab.refresh && (typeof(activeTab.refresh) === 'function')) {
			activeTab.refresh(driverId, driverName);
		}
	},	
	
	/**
	 * 운전자 리스트 그리드 
	 */
	zdriverlist : {
		xtype : 'gridpanel',
		itemId : 'driver_list',
		store : 'DriverBriefStore',
		title : T('title.driver_list'),
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
			dataIndex : 'name',
			text : T('label.name'),
			flex : 1
		} ],

		tbar : [ T('label.id'),
		{
			xtype : 'textfield',
			name : 'id_filter',
			itemId : 'id_filter',
			width : 60
		}, T('label.name'),
		{
			xtype : 'textfield',
			name : 'name_filter',
			itemId : 'name_filter',
			width : 65
		}, ' ',
		{
			xtype : 'button',
			text : T('button.search'),
			handler : function(btn) {
				btn.up('management_driver').search(true);
			}
		} ]
	},
	
	ztabpanel : {
		itemId : 'tabs',
		xtype : 'tabpanel',
		flex : 1,
		items : [ {
			xtype : 'management_driver_detail'
		}, /*{
			xtype : 'management_driver_dashboard'
		}, */{
			xtype : 'management_driver_runstatus'
		}, {
			xtype : 'management_driver_speed'
		} ]
	}
});