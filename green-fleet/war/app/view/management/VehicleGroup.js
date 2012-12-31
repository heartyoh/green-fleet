Ext.define('GreenFleet.view.management.VehicleGroup', {
	extend : 'Ext.container.Container',
	
	alias : 'widget.management_vehicle_group',

	title : T('title.vehicle_group'),

	entityUrl : 'vehicle_group',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'vehicle_group/import',

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
	currentVehicleGroup : '',
		
	initComponent : function() {
		var self = this;

		this.items = [ {
			html : "<div class='listTitle'>" + T('title.vehicle_group_list') + "</div>"
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.buildVehicleGroupList(this), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.buildVehicleGroupForm(this), this.buildGroupedVehicleList(this) ]
			} ]
		} ],

		this.callParent(arguments);
		
		/**
		 * Vehicle Group 그리드 선택시 선택한 데이터로 우측 폼 로드
		 */  
		this.sub('grid').on('itemclick', function(grid, record) {
			self.currentVehicleGroup = record.get('id');
			self.sub('form').getForm().reset();
			self.sub('form').loadRecord(record);
		});
		
		/**
		 * 우측 폼의 키가 변경될 때마다 빈 값으로 변경된 것이 아니라면 
		 * 0. 선택한 VehicleGroup 전역변수를 설정 
		 * 1. 두 개의 Grid에 어떤 Vehicle Group이 선택되었는지 표시하기 위해 타이틀을 Refresh 
		 * 2. Vehicle List By Group가 그룹별로 Refresh
		 * 3. TODO : 맨 우측의 Vehicle List가 그룹별로 필터링  
		 */ 
		this.sub('form_vehicle_group_key').on('change', function(field, value) {
			if(value) {
				var record = self.sub('grid').store.findRecord('key', value);
				if(record) {
					self.currentVehicleGroup = record.get('id');
					self.sub('grouped_vehicles_grid').setTitle(T('title.drivers_by_group') + ' [' + record.get('id') + ']');
					self.sub('form').setTitle(T('title.group_details') + ' [' + record.get('id') + ']');
					self.searchGroupedVehicles();
				}
			}
		});
		
		/**
		 * Vehicle List By Group이 호출되기 전에 vehicle group id 파라미터 설정 
		 */
		this.sub('grouped_vehicles_grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			operation.params['vehicle_group_id'] = self.currentVehicleGroup;
		});
		
		/**
		 * Vehicle 검색 
		 */
		this.down('#search_all_vehicles').on('click', function() {
			self.searchAllVehicles(true);
		});	
		
		/**
		 * Reset 버튼 선택시 Vehicle 검색 조건 클리어 
		 */
		this.down('#search_reset_all_vehicles').on('click', function() {
			self.sub('all_vehicles_id_filter').setValue('');
			self.sub('all_vehicles_reg_no_filter').setValue('');
		});
		
		/**
		 * Vehicle Id 검색 조건 변경시 Vehicle 데이터 Local filtering
		 */
		this.sub('all_vehicles_id_filter').on('change', function(field, value) {
			self.searchAllVehicles(false);
		});

		/**
		 * Vehicle Reg No. 검색 조건 변경시 Vehicle 데이터 Local filtering 
		 */
		this.sub('all_vehicles_reg_no_filter').on('change', function(field, value) {
			self.searchAllVehicles(false);
		});		
		
		/**
		 * Vehicle List가 호출되기 전에 검색 조건이 파라미터에 설정 
		 */
		this.sub('all_vehicles_grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			var vehicle_id_filter = self.sub('all_vehicles_id_filter');
			var reg_no_filter = self.sub('all_vehicles_reg_no_filter');			
			operation.params['vehicle_id'] = vehicle_id_filter.getSubmitValue();
			operation.params['registration_number'] = reg_no_filter.getSubmitValue();
		});
		
		/**
		 * 선택한 Vehicle들을 그룹에 추가 
		 */
		this.down('button[itemId=moveLeft]').on('click', function(button) {
			
			if(!self.currentVehicleGroup) {
				Ext.MessageBox.alert(T('msg.none_selected'), T('msg.select_x_first', {x : T('label.vehicle_group')}));
				return;				
			}
			
			var selections = self.sub('all_vehicles_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.MessageBox.alert(T('msg.none_selected'), "Select the vehicles to add vehicle group [" + self.currentVehicleGroup + "]");
				return;
			}

			var vehicle_id_to_delete = [];
			for(var i = 0 ; i < selections.length ; i++) {
				vehicle_id_to_delete.push(selections[i].data.id);
			}	

			Ext.Ajax.request({
			    url: '/vehicle_relation/save',
			    method : 'POST',
			    params: {
			        vehicle_group_id: self.currentVehicleGroup,			        
			        vehicle_id : vehicle_id_to_delete
			    },
			    success: function(response) {
			        var resultObj = Ext.JSON.decode(response.responseText);
			        if(resultObj.success) {			        	
				        self.sub('all_vehicles_grid').getSelectionModel().deselectAll(true);
				        self.searchGroupedVehicles();
				        GreenFleet.msg(T('label.success'), resultObj.msg);
				        self.changedGroupedVehicleCount();
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
		 * 선택한 Vehicle들을 그룹에서 삭제 
		 */
		this.down('button[itemId=moveRight]').on('click', function(button) {
			if(!self.currentVehicleGroup) {
				Ext.Msg.alert(T('msg.none_selected'), T('msg.select_x_first', {x : T('label.vehicle_group')}));
				return;				
			}
			
			var selections = self.sub('grouped_vehicles_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.Msg.alert(T('msg.none_selected'), "Select the vehicles to remove from vehicle group [" + self.currentVehicleGroup + "]");
				return;
			}

			var vehicle_id_to_delete = [];
			for(var i = 0 ; i < selections.length ; i++) {
				vehicle_id_to_delete.push(selections[i].data.id);
			}	

			Ext.Ajax.request({
			    url: '/vehicle_relation/delete',
			    method : 'POST',
			    params: {
			        vehicle_group_id: self.currentVehicleGroup,			        
			        vehicle_id : vehicle_id_to_delete
			    },
			    success: function(response) {
			        var resultObj = Ext.JSON.decode(response.responseText);
			        if(resultObj.success) {
				        self.searchGroupedVehicles();
				        GreenFleet.msg(T('label.success'), resultObj.msg);
				        self.changedGroupedVehicleCount();
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
	
	searchAllVehicles : function(searchRemote) {
		
		if(searchRemote) {
			this.sub('all_vehicles_grid').store.load();
		} else {
			this.sub('all_vehicles_grid').store.clearFilter(true);			
			var id_value = this.sub('all_vehicles_id_filter').getValue();
			var reg_no_value = this.sub('all_vehicles_reg_no_filter').getValue();
			
			if(id_value || reg_no_value) {
				this.sub('all_vehicles_grid').store.filter([ {
					property : 'id',
					value : id_value
				}, {
					property : 'registration_number',
					value : reg_no_value
				} ]);
			}			
		}		
	},	
	
	searchGroupedVehicles : function() {
		this.sub('grouped_vehicles_pagingtoolbar').moveFirst();
	},
	
	/**
	 * Vehicle Group의 Vehicle 개수가 변경되었을 경우 
	 * 우측 Vehicle 검색 조건 (East.js)에 Vehicle Group 정보(Vehicle Group의 Vehicle 개수)를 Refresh 하라는 이벤트를 날려준다.
	 */
	changedGroupedVehicleCount : function() {
		Ext.getStore('VehicleGroupStore').load();
	},
	
	buildVehicleGroupList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'VehicleGroupStore',
			title : T('title.vehicle_group'),
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

	buildGroupedVehicleList : function(main) {
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
			 		itemId : 'grouped_vehicles_grid',
			 		store : 'VehicleByGroupStore',
			 		title : T('title.vehicles_by_group'),
			 		flex : 15,
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
			 		    	dataIndex : 'registration_number',
			 		    	text : T('label.reg_no')
			 		    }, {
			 		    	dataIndex : 'manufacturer',
			 		    	text : T('label.manufacturer'),
			 		    	type : 'string'
			 		    }, {
			 		    	dataIndex : 'vehicle_type',
			 		    	text : T('label.x_type', {x : T('label.vehicle')}),
			 		    	type : 'string'
			 		    }, {
			 		    	dataIndex : 'birth_year',
			 		    	text : T('label.birth_year'),
			 		    	type : 'string'
			 		    }, {
							dataIndex : 'ownership_type',
							text : T('label.x_type', {x : T('label.ownership')}),
							type : 'string'
						}, {
							dataIndex : 'status',
							text : T('label.status'),
							type : 'string'
						}, {
							dataIndex : 'total_distance',
							text : T('label.total_x', {x : T('label.distance')}),
							type : 'string'
						}
			 		],
					bbar: {
						xtype : 'pagingtoolbar',
						itemId : 'grouped_vehicles_pagingtoolbar',
			            store: 'VehicleByGroupStore',
			            cls : 'pagingtoolbar',
			            displayInfo: true,
			            displayMsg: 'Displaying vehicles {0} - {1} of {2}',
			            emptyMsg: "No vehicles to display"
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
			 		itemId : 'all_vehicles_grid',
			 		store : 'VehicleImageBriefStore',
			 		title : T('title.vehicle_list'),
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
			 		    	dataIndex : 'registration_number',
			 		    	text : T('label.reg_no')
			 		    } 
			 		],
					tbar : [ T('label.id'), {
						xtype : 'textfield',
						name : 'all_vehicles_id_filter',
						itemId : 'all_vehicles_id_filter',
						hideLabel : true,
						width : 70
					}, T('label.reg_no'), {
						xtype : 'textfield',
						name : 'all_vehicles_reg_no_filter',
						itemId : 'all_vehicles_reg_no_filter',
						hideLabel : true,
						width : 70
					}, ' ', {
						text : T('button.search'),
						itemId : 'search_all_vehicles'
					}, ' ', {
						text : T('button.reset'),
						itemId : 'search_reset_all_vehicles'
					} ],
					bbar: {
						xtype : 'pagingtoolbar',
						itemId : 'all_vehicles_pagingtoolbar',
			            store: 'VehicleImageBriefStore',
			            cls : 'pagingtoolbar',
			            displayInfo: true,
			            displayMsg: 'Displaying vehicles {0} - {1} of {2}',
			            emptyMsg: "No vehicles to display"
			        }
			 	}
			 ]
		}
	},

	buildVehicleGroupForm : function(main) {
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
				itemId : 'form_vehicle_group_key'
			}, {
				name : 'id',
				fieldLabel : T('label.group'),
				allowBlank: false,
				afterLabelTextTpl: required
			}, {
				name : 'desc',
				fieldLabel : T('label.desc'),
				allowBlank: false,
				afterLabelTextTpl: required
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