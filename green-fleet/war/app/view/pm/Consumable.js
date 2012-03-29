Ext.define('GreenFleet.view.pm.Consumable', {
	extend : 'Ext.Container',

	alias : 'widget.pm_consumable',

	title : T('title.consumables'),

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;

		this.items = [ {
			html : "<div class='listTitle'>" + T('title.consumables_management') + "</div>"
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.zvehiclelist(self), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.zvehicleinfo, this.zconsumables, {
					xtype : 'container',
					flex : 1,
					layout : {
						type : 'hbox',
						align : 'stretch'
					},
					items : [ this.zconsumable_history, this.zbottom_separator, this.zmainthistory ]
				} ]
			} ]
		} ],

		this.callParent();

		this.sub('vehicle_info').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
			self.sub('consumable_history_grid').store.loadRecords([]);
			var consumChangeStore = self.sub('consumable_grid').store;
			consumChangeStore.getProxy().extraParams.vehicle_id = record.data.id;
			consumChangeStore.load();
			var repairStore = self.sub('repair_grid').store;
			repairStore.getProxy().extraParams.vehicle_id = record.data.id;
			repairStore.load();
		});

		this.sub('repair_grid').store.on('load', function(store, operation, opt) {
			var records = [];
			store.each(function(record) {
				records.push(record);
			});

			var repairListView = self.sub('repair_view');
			if(repairListView)
				repairListView.refreshRepair(records);
		});

		this.sub('consumable_grid').on('itemclick', function(grid, record) {
			self.refreshConsumableHistory(record.data.vehicle_id, record.data.consumable_item);
		});
		
		this.sub('consumable_grid').on('itemdblclick', function(grid, record) {
			var consumable = this.up('pm_consumable');
			consumable.showConsumableStatus(record);			
		});
	},
	
	setConsumable : function(consumable, status) {
		var vehicleListGrid = this.sub('vehicle_info');
		vehicleListGrid.vehicleList(vehicleListGrid, consumable, status);
	},

	refreshConsumableHistory : function(vehicleId, consumableItem) {
		var store = this.sub('consumable_history_grid').store;
		store.getProxy().extraParams.vehicle_id = vehicleId;
		store.getProxy().extraParams.consumable_item = consumableItem;
		store.load();
	},

	zvehiclelist : function(self) {
		return {
			xtype : 'gridpanel',
			itemId : 'vehicle_info',
			store : 'VehicleByHealthStore',
			title : T('title.vehicle_list'),
			width : 300,
			autoScroll : true,
			
			vehicleList : function(grid, consumable, status) {
				
				if(status == 'Healthy') {					
					grid.sub('check_impending').setValue(false);
					grid.sub('check_overdue').setValue(false);
					grid.sub('check_healthy').setValue(true);
					
				} else if(status == 'Impending') {
					grid.sub('check_healthy').setValue(false);					
					grid.sub('check_overdue').setValue(false);
					grid.sub('check_impending').setValue(true);
					
				} else if(status == 'Overdue') {
					grid.sub('check_healthy').setValue(false);
					grid.sub('check_impending').setValue(false);
					grid.sub('check_overdue').setValue(true);
				}
				
				grid.sub('consumables_combo').setValue(consumable);
			},

			filterVehicleList : function(grid) {

				var consumable = grid.sub('consumables_combo').getValue();
				var healthHvalue = grid.sub('check_healthy').getValue();
				var healthIvalue = grid.sub('check_impending').getValue();
				var healthOvalue = grid.sub('check_overdue').getValue();

				var healthStatus = [];

				if (healthHvalue)
					healthStatus.push('Healthy');

				if (healthIvalue)
					healthStatus.push('Impending');

				if (healthOvalue)
					healthStatus.push('Overdue');

				if (healthStatus.length > 0) {
					var vehicleStore = grid.store;
					var proxy = vehicleStore.getProxy();
					proxy.extraParams.consumable_item = consumable;
					proxy.extraParams.health_status = healthStatus;
					vehicleStore.load();

				} else {
					grid.store.loadRecords([]);
				}
			},

			columns : [ {
				xtype : 'templatecolumn',
				tpl : '<div class="iconHealth{health_status}" style="width:20px;height:20px;background-position:5px 3px"></div>',
				width : 35
			}, {
				dataIndex : 'id',
				text : T('label.id'),
				flex : 1
			}, {
				dataIndex : 'registration_number',
				text : T('label.reg_no'),
				flex : 1
			} ],

			tbar : [ {
				xtype : 'combo',
				itemId : 'consumables_combo',
				store : 'ConsumableCodeStore',
				queryMode : 'local',
				displayField : 'name',
				valueField : 'name',
				emptyText : T('msg.select_a_consumable'),
				listeners : {
					render : function(combo) {
						combo.store.load();
					},
					change : function(combo, currentValue, beforeValue) {
						var grid = combo.up('grid');
						grid.filterVehicleList(grid);
					}
				}
			}, {
				xtype : 'fieldcontainer',
				defaultType : 'checkboxfield',
				cls : 'paddingLeft5',
				items : [ {
					cls : 'iconHealthHealthy floatLeft',
					name : 'healthy',
					inputValue : '1',
					itemId : 'check_healthy',
					width : 45,
					handler : function(check) {
						var grid = check.up('grid');
						grid.filterVehicleList(grid);
					}
				}, {
					cls : 'iconHealthImpending floatLeft',
					name : 'impending',
					inputValue : '1',
					itemId : 'check_impending',
					width : 45,
					handler : function(check) {
						var grid = check.up('grid');
						grid.filterVehicleList(grid);
					}
				}, {
					cls : 'iconHealthOverdue floatLeft',
					name : 'overdue',
					inputValue : '1',
					itemId : 'check_overdue',
					width : 45,
					handler : function(check) {
						var grid = check.up('grid');
						grid.filterVehicleList(grid);
					}
				} ]
			} ]
		}
	},

	zvehicleinfo : {
		xtype : 'form',
		itemId : 'form',
		cls : 'hIndexbarZero',
		bodyCls : 'paddingAll10',
		title : T('title.vehicle_details'),
		height : 122,
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		items : [ {
			xtype : 'panel',
			flex : 1,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : T('label.id'),
				name : 'id'
			}, {
				fieldLabel : T('label.reg_no'),
				name : 'registration_number'
			}, {
				fieldLabel : T('label.health'),
				name : 'health_status'
			} ]
		}, {
			xtype : 'panel',
			flex : 1,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : T('label.type'),
				name : 'vehicle_type'
			}, {
				fieldLabel : T('label.total_x', {
					x : T('label.dist')
				}),
				name : 'total_distance',
				itemId : 'vehicle_mileage'
			}, {
				fieldLabel : T('label.birth_year'),
				name : 'birth_year'
			} ]
		} ]
	},

	zconsumables : {
		xtype : 'grid',
		itemId : 'consumable_grid',
		store : 'VehicleConsumableStore',
		cls : 'hIndexbar',
		title : T('title.consumable_item'),
		flex : 1,
		columns : [ {
			header : 'Key',
			dataIndex : 'key',
			hidden : true
		}, {
			header : T('label.item'),
			dataIndex : 'consumable_item'
		}, {
			header : T('label.repl_unit'),
			dataIndex : 'repl_unit'
		}, {
			header : T('label.repl_mileage') + " (km)",
			dataIndex : 'repl_mileage',
			width : 120
		}, {
			header : T('label.repl_time') + ' (month)',
			dataIndex : 'repl_time',
			width : 120
		}, {
			header : T('label.last_repl_date'),
			dataIndex : 'last_repl_date',
			xtype : 'datecolumn',
			format : F('date'),
			width : 90
		}, {
			header : T('label.miles_last_repl') + ' (km)',
			dataIndex : 'miles_last_repl',
			width : 140
		}, {
			header : T('label.miles_since_last_repl') + ' (km)',
			dataIndex : 'miles_since_last_repl',
			width : 145
		}, {
			header : T('label.next_repl_date'),
			dataIndex : 'next_repl_date',
			xtype : 'datecolumn',
			format : F('date'),
			width : 90
		}, {
			header : T('label.next_repl_mileage') + ' (km)',
			dataIndex : 'next_repl_mileage',
			width : 130
		}, {
			header : T('label.accrued_cost'),
			dataIndex : 'accrued_cost'
		}, {
			header : T('label.health_rate'),
			dataIndex : 'health_rate',
			xtype : 'progresscolumn'
		}, {
			header : T('label.status'),
			dataIndex : 'status',
			renderer : function(value) {
				if (value)
					return T('label.' + value);
				return '';
			}
		}, {
			xtype : 'actioncolumn',
			width : 50,
			align : 'center',
			items : [ {
				icon : '/resources/image/iconAddOn.png',
				tooltip : 'Consumables replacement',
				handler : function(grid, rowIndex, colIndex) {
					var vehicleMileage = grid.up('pm_consumable').sub('vehicle_mileage').getValue();
					var record = grid.store.getAt(rowIndex);
					var consumable = this.up('pm_consumable');
					var newRecord = {
						data : {
							vehicle_id : record.data.vehicle_id,
							consumable_item : record.data.consumable_item,
							miles_last_repl : vehicleMileage,
							last_repl_date : new Date()
						}
					};

					consumable.showConsumableChange(newRecord);
				}
			} ]
		}, {
			xtype : 'actioncolumn',
			width : 50,
			align : 'center',
			items : [ {
				icon : '/resources/image/iconRefreshOn.png',
				tooltip : 'Reset',
				handler : function(grid, rowIndex, colIndex) {
					var record = grid.store.getAt(rowIndex);
					Ext.Ajax.request({
						url : '/vehicle_consumable/reset',
						method : 'POST',
						params : {
							vehicle_id : record.data.vehicle_id,
							consumable_item : record.data.consumable_item
						},
						success : function(response) {
							var resultObj = Ext.JSON.decode(response.responseText);
							if (resultObj.success) {
								GreenFleet.msg(T('label.success'), resultObj.msg);
								var store = Ext.getStore('VehicleConsumableStore');
								store.getProxy().extraParams.vehicle_id = record.data.vehicle_id;
								store.load();
							} else {
								Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
							}
						},
						failure : function(response) {
							Ext.MessageBox.alert(T('label.failure'), response.responseText);
						}
					});
				}
			} ]
		} ]
	},

	zbottom_separator : {
		xtype : 'panel',
		width : 5
	},

	zconsumable_history : {
		xtype : 'grid',
		itemId : 'consumable_history_grid',
		store : 'ConsumableHistoryStore',
		cls : 'hIndexbar',
		title : T('title.consumable_change_history'),
		flex : 1,
		autoScroll : true,
		columns : [ {
			header : T('label.item'),
			dataIndex : 'consumable_item'
		}, {
			header : T('label.repl_date'),
			dataIndex : 'last_repl_date',
			xtype : 'datecolumn',
			format : F('date')
		}, {
			header : T('label.repl_mileage') + " (km)",
			dataIndex : 'miles_last_repl'
		}, {
			header : T('label.worker'),
			dataIndex : 'worker'
		}, {
			header : T('label.component'),
			dataIndex : 'component'
		}, {
			header : T('label.cost'),
			dataIndex : 'cost'
		}, {
			header : T('label.comment'),
			dataIndex : 'comment'
		}, {
			dataIndex : 'created_at',
			header : T('label.created_at'),
			xtype : 'datecolumn',
			format : F('datetime')
		} ],
		listeners : {
			itemdblclick : function(grid, record, htmlElement, indexOfItem, extEvent, eOpts) {
				grid.up('pm_consumable').showConsumableChange(record);
			}
		}
	},

	zmainthistory : {
		xtype : 'tabpanel',
		autoScroll : true,
		title : T('title.maintenence_history'),
		flex : 1,
		cls : 'hIndexbar',
		layout : 'fit',
		bbar : [ {
			xtype : 'tbfill'
		}, {
			xtype : 'button',
			text : T('button.add'),
			handler : function(btn, event) {

				var thisView = btn.up('pm_consumable');
				var selModel = thisView.sub('vehicle_info').getSelectionModel();
				var selVehicleId = '';
				if (selModel.lastSelected) {
					selVehicleId = selModel.lastSelected.data.id;
				}

				var nextRepairDate = new Date();
				nextRepairDate.setMilliseconds(nextRepairDate.getMilliseconds() + (1000 * 60 * 60 * 24 * 30 * 3));

				var win = new Ext.Window({
					title : T('title.add_repair'),
					modal : true,
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
							defaults : {
								anchor : '100%'
							},
							items : [ {
								name : 'key',
								fieldLabel : 'Key',
								hidden : true
							}, {
								itemId : 'vehicle_id',
								name : 'vehicle_id',
								fieldLabel : T('label.vehicle_id'),
								value : selVehicleId
							} ]
						}, {
							xtype : 'fieldset',
							title : T('label.repair'),
							defaultType : 'textfield',
							layout : 'anchor',
							padding : '10,5,5,5',
							defaults : {
								anchor : '100%'
							},
							items : [ {
								name : 'repair_date',
								fieldLabel : T('label.repair_date'),
								xtype : 'datefield',
								format : F('date'),
								value : new Date()
							}, {
								name : 'next_repair_date',
								fieldLabel : T('label.next_repair_date'),
								xtype : 'datefield',
								format : F('date'),
								value : nextRepairDate
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

										// refresh repair grid & list
										var repairStore = thisView.sub('repair_grid').store;
										repairStore.getProxy().extraParams.vehicle_id = selVehicleId;
										repairStore.load();
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

				win.show();
			}
		} ],
		items : [
				{
					xtype : 'panel',
					itemId : 'repair_view',
					title : T('tab.list_view'),
					autoScroll : true,
					flex : 1,
					layout : 'fit',
					html : "<div class='maintCell'><span>No Data</span>...</div>",
					refreshRepair : function(records) {
						var htmlStr = '';
						Ext.each(records, function(record) {
							htmlStr += "<div class='maintCell'><span>" + Ext.util.Format.date(record.data.repair_date, 'Y-m-d') + "</span>"
									+ record.data.content + "</div>";
						});

						if (htmlStr)
							this.update(htmlStr);
						else
							this.update("<div class='maintCell'><span>No Data</span>...</div>");
					}
				}, {
					xtype : 'grid',
					itemId : 'repair_grid',
					title : T('tab.grid_view'),
					store : 'RepairStore',
					flex : 1,
					autoScroll : true,
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
					} ]
				} ]
	},

	showConsumableStatus : function(selectedRecord) {
		this.consumableStatusWin(selectedRecord).show();
	},

	showConsumableChange : function(selectedRecord) {
		this.consumableChangeWin(selectedRecord).show();
	},

	consumableStatusWin : function(record) {
		return new Ext.Window({
			title : record.data.consumable_item + ' ' + T('label.status'),
			modal : true,
			listeners : {
				show : function(win, opts) {
					win.down('form').loadRecord(record);
				}
			},
			items : [ {
				xtype : 'form',
				itemId : 'consumable_status_form',
				bodyPadding : 10,
				cls : 'hIndexbar',
				width : 500,
				defaults : {
					xtype : 'textfield',
					anchor : '100%'
				},
				items : [ {
					xtype : 'fieldset',
					title : T('label.consumable_item'),
					defaultType : 'textfield',
					layout : 'anchor',
					collapsible : true,
					padding : '10,5,5,5',
					defaults : {
						anchor : '100%'
					},
					items : [ {
						name : 'key',
						fieldLabel : 'Key',
						hidden : true
					}, {
						name : 'vehicle_id',
						fieldLabel : T('label.vehicle_id'),
						disabled : true
					}, {
						name : 'consumable_item',
						fieldLabel : T('label.consumable_item'),
						disabled : true
					}, {
						name : 'repl_unit',
						fieldLabel : T('label.repl_unit'),
						disabled : true
					}, {
						name : 'repl_mileage',
						fieldLabel : T('label.repl_mileage'),
						disabled : true
					}, {
						name : 'repl_time',
						fieldLabel : T('label.repl_time') + '(month)',
						disabled : true
					} ]
				}, {
					xtype : 'fieldset',
					title : record.data.consumable_item,
					defaultType : 'textfield',
					layout : 'anchor',
					padding : '10,5,5,5',
					defaults : {
						anchor : '100%'
					},
					items : [ {
						name : 'last_repl_date',
						fieldLabel : T('label.last_repl_date'),
						xtype : 'datefield',
						format : F('date'),
						value : new Date()
					}, {
						xtype : 'numberfield',
						name : 'miles_last_repl',
						fieldLabel : T('label.miles_last_repl'),
						minValue : 0,
						step : 1000
					}, {
						name : 'next_repl_date',
						fieldLabel : T('label.next_repl_date'),
						xtype : 'datefield',
						format : F('date'),
						value : new Date()
					}, {
						xtype : 'numberfield',
						name : 'next_repl_mileage',
						fieldLabel : T('label.next_repl_mileage'),
						minValue : 0,
						step : 1000
					}, {
						xtype : 'numberfield',
						name : 'accrued_cost',
						fieldLabel : T('label.accrued_cost'),
						minValue : 0,
						step : 1000
					}, {
						xtype : 'numberfield',
						name : 'health_rate',
						fieldLabel : T('label.health_rate'),
						minValue : 0,
						step : 0.1
					}, {
						name : 'status',
						xtype : 'textfield',
						fieldLabel : T('label.status')
					} ]
				} ],
				fbar : [ {
					xtype : 'button',
					text : T('button.save'),
					handler : function() {
						var win = this.up('window');
						var thisForm = win.down('form');

						thisForm.getForm().submit({
							url : '/vehicle_consumable/save',
							submitEmptyText : false,
							waitMsg : T('msg.saving'),
							params : {
								vehicle_id : record.data.vehicle_id,
								consumable_item : record.data.consumable_item
							},
							success : function(form, action) {
								if (action.result.success) {
									GreenFleet.msg(T('label.success'), T('msg.processed_successfully'));
									win.close();

									// refresh consumable grid
									var store = Ext.getStore('VehicleConsumableStore');
									store.getProxy().extraParams.vehicle_id = record.data.vehicle_id;
									store.load();
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
					xtype : 'button',
					text : T('button.cancel'),
					handler : function() {
						this.up('window').close();
					}
				} ]
			} ]
		});
	},

	consumableChangeWin : function(record) {
		return new Ext.Window({
			title : record.data.consumable_item + ' ' + T('label.replacement'),
			modal : true,
			listeners : {
				show : function(win, opts) {
					win.down('form').loadRecord(record);
				}
			},
			items : [ {
				xtype : 'form',
				itemId : 'consumable_change_form',
				bodyPadding : 10,
				cls : 'hIndexbar',
				width : 500,
				defaults : {
					xtype : 'textfield',
					anchor : '100%'
				},

				items : [ {
					xtype : 'fieldset',
					title : T('label.consumable_item'),
					defaultType : 'textfield',
					layout : 'anchor',
					collapsible : true,
					padding : '10,5,5,5',
					defaults : {
						anchor : '100%'
					},
					items : [ {
						name : 'vehicle_id',
						fieldLabel : T('label.vehicle_id'),
						disabled : true
					}, {
						name : 'consumable_item',
						fieldLabel : T('label.consumable_item'),
						disabled : true
					} ]
				}, {
					xtype : 'fieldset',
					title : T('label.replacement'),
					defaultType : 'textfield',
					layout : 'anchor',
					padding : '10,5,5,5',
					defaults : {
						anchor : '100%'
					},
					items : [ {
						xtype : 'datefield',
						name : 'last_repl_date',
						fieldLabel : T('label.repl_date'),
						format : F('date'),
						maxValue : new Date()
					}, {
						xtype : 'numberfield',
						name : 'miles_last_repl',
						fieldLabel : T('label.repl_mileage'),
						minValue : 0,
						step : 1000,
						maxValue : 500000
					}, {
						xtype : 'numberfield',
						name : 'cost',
						fieldLabel : T('label.cost'),
						minValue : 0,
						step : 1000,
						value : 0,
						allowBlank : false
					}, {
						name : 'worker',
						fieldLabel : T('label.worker')
					}, {
						name : 'component',
						fieldLabel : T('label.component')
					}, {
						xtype : 'textarea',
						rows : 8,
						name : 'comment',
						fieldLabel : T('label.comment')
					} ]
				} ]
			} ],
			fbar : [ {
				xtype : 'button',
				text : T('button.save'),
				handler : function() {
					var win = this.up('window');
					var thisForm = win.down('form');

					thisForm.getForm().submit({
						url : '/vehicle_consumable/replace',
						submitEmptyText : false,
						waitMsg : T('msg.saving'),
						params : {
							vehicle_id : record.data.vehicle_id,
							consumable_item : record.data.consumable_item
						},
						success : function(form, action) {
							if (action.result.success) {
								GreenFleet.msg(T('label.success'), T('msg.processed_successfully'));
								win.close();

								// refresh consumable grid
								var store = Ext.getStore('VehicleConsumableStore');
								store.getProxy().extraParams.vehicle_id = record.data.vehicle_id;
								store.load();

								// refresh consumable history grid
								store = Ext.getStore('ConsumableHistoryStore');
								store.getProxy().extraParams.vehicle_id = record.data.vehicle_id;
								store.getProxy().extraParams.consumable_item = record.data.consumable_item;
								store.load();
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
				xtype : 'button',
				text : T('button.cancel'),
				handler : function() {
					this.up('window').close();
				}
			} ]
		});
	}
});