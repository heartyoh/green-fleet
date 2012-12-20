Ext.define('GreenFleet.view.pm.Maintenance', {
	extend : 'Ext.Container',

	alias : 'widget.pm_maintenance',

	title : T('title.maintenance'),

	layout : { align : 'stretch', type : 'vbox' },

	initComponent : function() {
		var self = this;

		this.items = [ {
			html : "<div class='listTitle'>" + T('title.maintenance') + "</div>"
		}, {
			xtype : 'container',
			flex : 1,
			layout : { type : 'hbox', align : 'stretch' },
			items : [ this.zvehiclelist(self), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : { align : 'stretch', type : 'vbox' },
				items : [ this.zmaintenances ]
			} ]
		} ],

		this.callParent();

		/**
		 * vehicle 선택시
		 */
		this.sub('vehicle_info').on('itemdblclick', function(grid, record) {
			var selVehicleId = (selectionModel.lastSelected) ? selectionModel.lastSelected.data.id : '';
			// TODO 1. 확인 alert
			// 		2. 트랜잭션 ...
		}); 
		
		/**
		 * vehicle 선택시
		 */
		this.sub('vehicle_info').on('selectionchange', function(selectionModel, selected, eOpts) {
			var selVehicleId = (selectionModel.lastSelected) ? selectionModel.lastSelected.data.id : '';
			self.sub('maintenance_grid').setTitle(T('title.maintenance_history') + '(' + selVehicleId + ')');
			self.refresh_maintenance_grid(selVehicleId);			
		});

		/**
		 * 정비 이력을 더블 클릭시  
		 */
		this.sub('maintenance_grid').on('itemdblclick', function(grid, record) {
			self.popup_maint(record);
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
		
		/**
		 * Status 검색 조건 변경시 Vehicle 데이터 Local filtering
		 */
		/*this.sub('status_filter').on('change', function(field, value) {
			self.searchVehicles(false);
		});*/
	},
	
	/**
	 * vehicle list를 조회 
	 */
	searchVehicles : function(searchRemote) {
		
		var store = this.sub('vehicle_info').store;
		
		if(searchRemote) {
			store.load();
		
		} else {			
			store.clearFilter(true);			
			var idValue = this.sub('id_filter').getValue();
			var regNoValue = this.sub('reg_no_filter').getValue();
			//var statusValue = this.sub('status_filter').getValue();
			
			store.filter([ {
				property : 'id',
				value : idValue
			}, {
				property : 'registration_number',
				value : regNoValue
			}/*, {
				property : 'status',
				value : statusValue
			}*/ ]);
		}
	},
	
	/**
	 * 좌측 vehicle list
	 */
	zvehiclelist : function(self) {
		return {
			xtype : 'gridpanel',
			itemId : 'vehicle_info',
			store : 'VehicleImageBriefStore',
			title : T('title.vehicle_list'),
			width : 300,
			autoScroll : true,
			columns : [ /*{
				dataIndex : 'status',
				width : 70,
				renderer : function(value) {
					if('Idle' == value || 'Incident' == value) {
						return "<a href='#'>[정비시작]</a>";
					} else if('Maint' == value) {
						return "<a href='#'>[정비종료]</a>";
					}
				}
            }, */{
				dataIndex : 'id',
				text : T('label.id'),
				width : 100
			}, {
				dataIndex : 'registration_number',
				text : T('label.reg_no'),
				width : 100
			}, {
				dataIndex : 'status',
				text : T('label.status')
			} ],
			
			tbar : [ T('label.id'),
				{
					xtype : 'textfield',
					name : 'id_filter',
					itemId : 'id_filter',
					width : 65
				}, 
				T('label.reg_no'),
				{
					xtype : 'textfield',
					name : 'reg_no_filter',
					itemId : 'reg_no_filter',
					width : 70
				},
				/*T('label.status'),
				{
					xtype : 'combo',
					store : 'VehicleStatusStore',
					name : 'status_filter',
					itemId : 'status_filter',					
					displayField: 'desc',
				    valueField: 'status',
				    width : 50
				},*/
				{
					xtype : 'button',
					text : T('button.search'),
					handler : function(btn) {
						btn.up('pm_maintenance').searchVehicles(true);
					}
				}
			]
		}
	},

	/**
	 * maintenance history grid
	 */
	zmaintenances : {
		xtype : 'grid',
		itemId : 'maintenance_grid',
		store : 'RepairStore',
		cls : 'hIndexbar',
		title : T('title.maintenance_history'),
		flex : 1,
		columns : [ {
			header : 'Key',
			dataIndex : 'key',
			hidden : true
		}, {
			header : T('label.vehicle_id'),
			dataIndex : 'vehicle_id',
			hidden : true
		}, {
			header : T('label.repair_date'),
			dataIndex : 'repair_date',
			xtype : 'datecolumn',
			format : F('date')
		}, {
			header : T('label.repair_time') + T('label.parentheses_min'),
			dataIndex : 'repair_time'
		}, {
			header : T('label.next_repair_date'),
			dataIndex : 'next_repair_date',
			xtype : 'datecolumn',
			format : F('date')
		}, {
			header : T('label.repair_mileage') + " (km)",
			dataIndex : 'repair_mileage',
			width : 120
		}, {
			header : T('label.repair_man'),
			dataIndex : 'repair_man'
		}, {
			header : T('label.repair_shop'),
			dataIndex : 'repair_shop'
		}, {
			header : T('label.cost'),
			dataIndex : 'cost'
		}, {
			header : T('label.content'),
			dataIndex : 'content',
			flex : 1
		} ],
		bbar : [ { xtype : 'tbfill' }, 
		{
			xtype : 'button',
			text : T('button.add'),
			handler : function(btn, event) {
				var thisView = btn.up('pm_maintenance');
				thisView.popup_maint();
			}
		}, 
		/**
		 * 삭제버튼 추가
		 */
		{
			xtype : 'button',
			text : T('button.del'),
			handler : function(btn, event) {
				
				var grid = btn.up('pm_maintenance').down('#maintenance_grid');
				var selectionModel = grid.getSelectionModel();
				var model = selectionModel.getSelection();
				
				if(model.length == 0) {
					Ext.Msg.alert('1개이상 선택 하세요');
				}else {
					Ext.MessageBox.show({
						title : T('title.confirmation'),
						buttons : Ext.MessageBox.YESNO,
						msg : T('msg.confirm_delete'),
						modal : true,
						fn : function(btn1) {
							if(btn1 != 'yes')
								return;
								
							Ext.Ajax.request({
								url : '/repair/delete',
								method: 'POST',
								params : {
									key : model[0].data.key
								},
								success : function (result, request) {
									GreenFleet.msg(T('label.success'), T('msg.processed_successfully'));
									btn.up('pm_maintenance').refresh_maintenance_grid(model[0].data.vehicle_id);
								},
								failure : function(resutl, request) {
									Ext.Msg.alert(T('msg.failed_to_delete'), T('msg.failed_to_delete'));
								}
							});
						}
					});
				}
			}
		}]
	},
	
	/**
	 * 정비 그리드 리프레쉬 
	 */
	refresh_maintenance_grid : function(selectedVehicleId) {
		
		var maintenanceStore = this.sub('maintenance_grid').store;
		maintenanceStore.getProxy().extraParams.vehicle_id = selectedVehicleId;
		maintenanceStore.load();
	},
	
	/**
	 * 정비 추가 팝업 show
	 */
	popup_maint : function(record) {
		
		var selModel = this.sub('vehicle_info').getSelectionModel();
		var selVehicleId = (selModel.lastSelected) ? selModel.lastSelected.data.id : '';
		var nextRepairDate = new Date();
		nextRepairDate.setMilliseconds(nextRepairDate.getMilliseconds() + (1000 * 60 * 60 * 24 * 30 * 3));		
		if(!record)
			record = { 'data' : { 'vehicle_id' : selVehicleId, 'repair_date' : new Date(), 'next_repair_date' : nextRepairDate } };
		var win = this.maintwin(this, record);
		win.show();
	},
	
	/**
	 * 정비 팝업 리턴
	 */
	maintwin : function(self, record) {
		
		return new Ext.Window({
			title : T('title.add_repair'),
			modal : true,
			listeners : {
				show : function(win, opts) {
					win.down('form').loadRecord(record);
				}
			},
			items : [ {
				xtype : 'form',
				itemId : 'repair_win',
				bodyPadding : 10,
				cls : 'hIndexbar',
				width : 500,
				defaults : {
					xtype : 'textfield',
					anchor : '100%'
				},
				items : [ {
					xtype : 'fieldset',
					title : T('label.vehicle'),
					defaultType : 'textfield',
					layout : 'anchor',
					collapsible : true,
					padding : '10,5,5,5',
					defaults : { anchor : '100%' },
					items : [ {
						name : 'key',
						fieldLabel : 'Key',
						hidden : true
					}, {
						itemId : 'vehicle_id',
						name : 'vehicle_id',
						fieldLabel : T('label.vehicle_id')
					} ]
				}, {
					xtype : 'fieldset',
					title : T('label.repair'),
					defaultType : 'textfield',
					layout : 'anchor',
					padding : '10,5,5,5',
					defaults : { anchor : '100%' },
					items : [ {
						name : 'oos',
						xtype : 'checkbox',
						boxLabel : T('label.outofservice')
					}, {
						name : 'repair_date',
						fieldLabel : T('label.repair_date'),
						xtype : 'datefield',
						format : F('date')
					}, {
						name : 'repair_time',
						fieldLabel : T('label.x_time', {x : T('label.repair')}) + T('label.parentheses_x', {x : T('label.minute_s')}),
						xtype : 'numberfield'
					}, {
						name : 'next_repair_date',
						fieldLabel : T('label.next_repair_date'),
						xtype : 'datefield',
						format : F('date')
					}, {
						xtype : 'numberfield',
						name : 'repair_mileage',
						fieldLabel : T('label.repair_mileage') + ' (km)',
						minValue : 0,
						step : 1000
					}, {
						name : 'repair_man',
						fieldLabel : T('label.repair_man')
					}, {
						name : 'repair_shop',
						fieldLabel : T('label.repair_shop')
					}, {
						xtype : 'numberfield',
						name : 'cost',
						fieldLabel : T('label.cost'),
						minValue : 0,
						step : 1000
					}, {
						xtype : 'textarea',
						name : 'content',
						fieldLabel : T('label.content')
					}, {
						name : 'comment',
						xtype : 'textarea',
						fieldLabel : T('label.comment')
					} ]
				} ]
			} ],
			
			buttons : [ {
				text : T('button.save'),
				handler : function() {
					var thisWin = this.up('window');
					var thisForm = thisWin.down('form');

					thisForm.getForm().submit({
						url : '/repair/save',
						submitEmptyText : false,
						waitMsg : T('msg.saving'),
						success : function(form, action) {
							if (action.result.success) {
								GreenFleet.msg(T('label.success'), T('msg.processed_successfully'));
								self.refresh_maintenance_grid(form.getRecord().data.vehicle_id);
								thisWin.close();
							} else {
								Ext.Msg.alert(T('label.failure'), action.result.msg);
							}
						},
						failure : function(form, action) {
							switch (action.failureType) {
								case Ext.form.action.Action.CLIENT_INVALID:
									Ext.Msg.alert(T('label.failure'), T('msg.invalid_form_values'));
									break;
								case Ext.form.action.Action.CONNECT_FAILURE:
									Ext.Msg.alert(T('label.failure'), T('msg.failed_to_ajax'));
									break;
								case Ext.form.action.Action.SERVER_INVALID:
									Ext.Msg.alert(T('label.failure'), action.result.msg);
							}
						}
					});
				}
			}, {
				text : T('button.cancel'),
				handler : function() {
					this.up('window').close();
				}
			} ]
		});		
	}
	
});