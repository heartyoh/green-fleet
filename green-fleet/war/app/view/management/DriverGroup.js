Ext.define('GreenFleet.view.management.DriverGroup', {
	extend : 'Ext.container.Container',
	
	alias : 'widget.management_driver_group',

	title : T('title.driver_group'),

	entityUrl : 'driver_group',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'driver_group/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	/**
	 * 선택한 Vehicle Group ID를 전역변수로 저장 
	 */
	currentDriverGroup : '',
		
	initComponent : function() {
		var self = this;

		this.items = [ {
			html : "<div class='listTitle'>" + T('title.driver_group_list') + "</div>"
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.buildDriverGroupList(this), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : { align : 'stretch', type : 'vbox' },
				items : [ this.buildDriverGroupForm(this), this.buildGroupedDriverList(this) ]
			} ]
		} ],

		this.callParent(arguments);
		
		/**
		 * Vehicle Group 그리드 선택시 선택한 데이터로 우측 폼 로드
		 */  
		this.sub('grid').on('itemclick', function(grid, record) {
			self.currentDriverGroup = record.get('id');
			self.sub('form').getForm().reset();
			self.sub('form').loadRecord(record);
		});
		
		/**
		 * 우측 폼의 키가 변경될 때마다 빈 값으로 변경된 것이 아니라면 
		 * 0. 선택한 Driver 전역변수를 설정 
		 * 1. 두 개의 Grid에 어떤 Driver Group이 선택되었는지 표시하기 위해 타이틀을 Refresh 
		 * 2. Driver List By Group가 그룹별로 Refresh
		 * 3. TODO : 맨 우측의 Vehicle List가 그룹별로 필터링  
		 */ 
		this.sub('form_driver_group_key').on('change', function(field, value) {
			if(value) {
				var record = self.sub('grid').store.findRecord('key', value);
				if(record) {
					self.currentDriverGroup = record.get('id');
					self.sub('grouped_drivers_grid').setTitle(T('title.drivers_by_group') + ' [' + record.get('id') + ']');
					self.sub('form').setTitle(T('title.group_details') + ' [' + record.get('id') + ']');
					self.searchGroupedDrivers();
				}
			}
		});
		
		/**
		 * Driver List By Group이 호출되기 전에 driver group id 파라미터 설정 
		 */
		this.sub('grouped_drivers_grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			operation.params['driver_group_id'] = self.currentDriverGroup;
		});
		
		/**
		 * Driver 검색 
		 */
		this.down('#search_all_drivers').on('click', function() {
			self.searchAllDrivers(true);
		});	
		
		/**
		 * Reset 버튼 선택시 Driver 검색 조건 클리어 
		 */
		this.down('#search_reset_all_drivers').on('click', function() {
			self.sub('all_drivers_id_filter').setValue('');
			self.sub('all_drivers_name_filter').setValue('');
		});
		
		/**
		 * Driver Id 검색 조건 변경시 Vehicle 데이터 Local filtering
		 */
		this.sub('all_drivers_id_filter').on('change', function(field, value) {
			self.searchAllDrivers(false);
		});

		/**
		 * Driver name 검색 조건 변경시 Vehicle 데이터 Local filtering 
		 */
		this.sub('all_drivers_name_filter').on('change', function(field, value) {
			self.searchAllDrivers(false);
		});		
		
		/**
		 * Driver List가 호출되기 전에 검색 조건이 파라미터에 설정 
		 */
		this.sub('all_drivers_grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			var driver_id_filter = self.sub('all_drivers_id_filter');
			var name_filter = self.sub('all_drivers_name_filter');			
			operation.params['driver_id'] = driver_id_filter.getSubmitValue();
			operation.params['name'] = name_filter.getSubmitValue();
		});
		
		/**
		 * 선택한 Driver들을 그룹에 추가 
		 */
		this.down('button[itemId=moveLeft]').on('click', function(button) {
			
			if(!self.currentDriverGroup) {
				Ext.MessageBox.alert(T('msg.none_selected'), T('msg.select_x_first', {x : T('label.driver_group')}));
				return;				
			}
			
			var selections = self.sub('all_drivers_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.MessageBox.alert(T('msg.none_selected'), "Select the drivers to add driver group [" + self.currentDriverGroup + "]");
				return;
			}

			var driver_id_to_delete = [];
			for(var i = 0 ; i < selections.length ; i++) {
				driver_id_to_delete.push(selections[i].data.id);
			}	

			Ext.Ajax.request({
			    url: '/driver_relation/save',
			    method : 'POST',
			    params: {
			        driver_group_id: self.currentDriverGroup,			        
			        driver_id : driver_id_to_delete
			    },
			    success: function(response) {
			        var resultObj = Ext.JSON.decode(response.responseText);
			        
			        if(resultObj.success) {			        	
				        self.sub('all_drivers_grid').getSelectionModel().deselectAll(true);
				        self.searchGroupedDrivers();
				        GreenFleet.msg(T('label.success'), resultObj.msg);
			        } else {
			        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
			        }
			    },
			    failure: function(response) {
			    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
			    }
			});			
 		});
		
		/**
		 * 선택한 Driver들을 그룹에서 삭제 
		 */
		this.down('button[itemId=moveRight]').on('click', function(button) {
			if(!self.currentDriverGroup) {
				Ext.Msg.alert(T('msg.none_selected'), T('msg.select_x_first', {x : T('label.driver_group')}));
				return;				
			}
			
			var selections = self.sub('grouped_drivers_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.Msg.alert(T('msg.none_selected'), "Select the drivers to remove from driver group [" + self.currentDriverGroup + "]");
				return;
			}

			var driver_id_to_delete = [];
			for(var i = 0 ; i < selections.length ; i++) {
				driver_id_to_delete.push(selections[i].data.id);
			}	

			Ext.Ajax.request({
			    url: '/driver_relation/delete',
			    method : 'POST',
			    params: {
			        driver_group_id: self.currentDriverGroup,			        
			        driver_id : driver_id_to_delete
			    },
			    success: function(response) {
			        var resultObj = Ext.JSON.decode(response.responseText);
			        
			        if(resultObj.success) {
				        self.searchGroupedDrivers();
				        GreenFleet.msg(T('label.success'), resultObj.msg);				        
			        } else {
			        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
			        }
			    },
			    failure: function(response) {
			        Ext.MessageBox.alert(T('label.failure'), response.responseText);
			    }
			});			
		});		
	},
	
	searchAllDrivers : function(searchRemote) {
				
		if(searchRemote) {
			this.sub('all_drivers_grid').store.load();			
			
		} else {
			this.sub('all_drivers_grid').store.clearFilter(true);			
			var idValue = this.sub('all_drivers_id_filter').getValue();
			var nameValue = this.sub('all_drivers_name_filter').getValue();
			
			if(idValue || nameValue) {
				this.sub('all_drivers_grid').store.filter([ {
					property : 'id',
					value : idValue
				}, {
					property : 'name',
					value : nameValue
				} ]);
			}			
		}		
	},	
	
	searchGroupedDrivers : function() {
		this.sub('grouped_drivers_pagingtoolbar').moveFirst();
	},
	
	buildDriverGroupList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'DriverGroupStore',
			title : T('title.driver_group'),
			width : 320,
			columns : [ new Ext.grid.RowNumberer(), 
			{
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'id',
				text : T('label.group'),
				width : 100
			}, {
				dataIndex : 'desc',
				text : T('label.desc'),
				width : 220
			} ]
		}
	},

	buildGroupedDriverList : function(main) {
		return {
			xtype : 'panel',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [
			 	{
			 		xtype : 'gridpanel',
			 		itemId : 'grouped_drivers_grid',
			 		store : 'DriverByGroupStore',
			 		title : T('title.drivers_by_group'),
			 		flex : 18.5,
			 		cls : 'hIndexbarZero',
			 		selModel : new Ext.selection.CheckboxModel(),
			 		columns : [ 
			 		    {	
			 		    	dataIndex : 'key',
			 		    	text : 'Key',
			 		    	hidden : true
			 		    }, {
			 		    	dataIndex : 'id',
			 		    	text : T('label.id')
			 		    }, {
			 		    	dataIndex : 'name',
			 		    	text : T('label.name')			 		    	
			 		    }, {
			 		    	dataIndex : 'division',
			 		    	text : T('label.division'),
			 		    	type : 'string'
			 		    }, {
			 		    	dataIndex : 'title',
			 		    	text : T('label.title'),
			 		    	type : 'string'
			 		    }, {
			 		    	dataIndex : 'social_id',
			 		    	text : T('label.social'),
			 		    	type : 'string'
			 		    }, {
							dataIndex : 'phone_no_1',
							text : T('label.phone_x', {x : 1}),
							type : 'string'
						}, {
							dataIndex : 'phone_no_2',
							text : T('label.phone_x', {x : 2}),
							type : 'string'
						}
			 		],
					bbar: {
						xtype : 'pagingtoolbar',
						itemId : 'grouped_drivers_pagingtoolbar',
			            store: 'DriverByGroupStore',
			            cls : 'pagingtoolbar',
			            displayInfo: true,
			            displayMsg: 'Displaying drivers {0} - {1} of {2}',
			            emptyMsg: "No drivers to display"
			        }			 		
			 	},
			 	{
			 		xtype : 'panel',
			 		flex : 1,
					layout : {
						type : 'vbox',
						align : 'center',
						pack : 'center'
					},			 		
			 		items : [
			 		     {
			 		    	 xtype : 'button',
			 		    	 itemId : 'moveLeft',
			 		    	 text : '<<'
			 		     },
			 		     {
			 		    	 xtype : 'label',
			 		    	 margins: '5 0 5 0'
			 		     },
			 		     {
			 		    	 xtype : 'button',
			 		    	itemId : 'moveRight',
			 		    	 text : ">>"
			 		     }
			 		]
			 	},
			 	{
			 		xtype : 'gridpanel',
			 		itemId : 'all_drivers_grid',
			 		store : 'DriverBriefStore',
			 		title : T('title.driver_list'),
			 		flex : 10,
			 		cls : 'hIndexbarZero',
			 		autoScroll : true,
			 		selModel : new Ext.selection.CheckboxModel(),
			 		columns : [ 
			 		    {	
			 		    	dataIndex : 'key',
			 		    	text : 'Key',
			 		    	hidden : true
			 		    }, {
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
			 		    	text : T('label.id')
			 		    }, {
			 		    	dataIndex : 'name',
			 		    	text : T('label.name')
			 		    } 
			 		],
					tbar : [ T('label.id'), {
						xtype : 'textfield',
						name : 'all_drivers_id_filter',
						itemId : 'all_drivers_id_filter',
						hideLabel : true,
						width : 70
					}, T('label.name'), {
						xtype : 'textfield',
						name : 'all_drivers_name_filter',
						itemId : 'all_drivers_name_filter',
						hideLabel : true,
						width : 70
					}, ' ', {
						text : T('button.search'),
						itemId : 'search_all_drivers'
					}, ' ', {
						text : T('button.reset'),
						itemId : 'search_reset_all_drivers'
					} ],
					bbar: {
						xtype : 'pagingtoolbar',
						itemId : 'all_drivers_pagingtoolbar',
			            store: 'DriverBriefStore',
			            cls : 'pagingtoolbar',
			            displayInfo: true,
			            displayMsg: 'Displaying drivers {0} - {1} of {2}',
			            emptyMsg: "No drivers to display"
			        }
			 	}
			 ]
		}
	},

	buildDriverGroupForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.group_details'),
			height : 170,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Key',
				hidden : true,
				itemId : 'form_driver_group_key'
			}, {
				name : 'id',
				fieldLabel : T('label.group'),
				allowBlank: false,
				afterLabelTextTpl: required
			}, {
				name : 'desc',
				fieldLabel : T('label.desc')
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : T('label.updated_at'),
				format : F('datetime')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : T('label.updated_at'),
				format : F('datetime')
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',				
				confirmMsgSave : T('msg.confirm_save'),				
				confirmMsgDelete : T('msg.confirm_delete'),				
				loader : {
					fn : function(callback) {
						main.sub('grid').store.load(callback);
					},
					scope : main
				}
			} ]
		}
	}
});