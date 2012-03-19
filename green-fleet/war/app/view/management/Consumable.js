Ext.define('GreenFleet.view.management.Consumable', {
	extend : 'Ext.Container',

	alias : 'widget.management_consumable',

	title : T('title.consumables'),

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;

		this.items = [ 
            {
            	html : "<div class='listTitle'>" + T('title.consumables_management') + "</div>"
            }, 
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
            	    	items : [ 
            	    	    this.zvehicleinfo, 
            	    	    this.zconsumables, 
            	    	    {
            	    			xtype : 'container',
            	    			flex : 1,
            	    			layout : {
            	    				type : 'hbox',
            	    				align : 'stretch'
            	    			},
            	    			items : [
            	    			    this.zconsumable_history,
            	    			    this.zbottom_separator,
            	    			    this.zmainthistory
            	    	        ]
            	    		}            	    	          
            	    	]
            	    } 
            	]
            } 
        ],

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
			
			self.sub('repair_view').refreshRepair(records);
		});		
		
		this.sub('consumable_grid').on('itemclick', function(grid, record) {
			self.refreshConsumableHistory(record.data.vehicle_id, record.data.consumable_item);
		});
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
	 		store : 'VehicleStore',
	 		title : T('title.vehicle_list'),
	 		width : 260,
	 		autoScroll : true,
	 		
	 		filterVehicleList : function(idValue, regNoValue) {

				var vehicleStore = this.up('grid').store;
				vehicleStore.clearFilter(true);
				
				vehicleStore.filter([ {
					property : 'id',
					value : idValue
				}, {
					property : 'registration_number',
					value : regNoValue
				} ]);
	 		},
	 		
	 		columns : [
	 		    {
	 		    	width : 10
	 		    },	 		           
	 		    {
	 		    	dataIndex : 'id',
	 		    	text : T('label.id'),
	 		    	flex : 1
	 		    }, {
	 		    	dataIndex : 'registration_number',
	 		    	text : T('label.reg_no'),
	 		    	flex : 1
	 		    } 
	 		],
	 		
			tbar : [ T('label.id'), {
				xtype : 'textfield',
				itemId : 'vehicles_id_filter',
				hideLabel : true,
				width : 60, 
				listeners: {
					'change': function(textField, newValue, oldValue, option) {
						var regNoValue = this.sub('vehicles_reg_no_filter').getValue();
						var gridPanel = textField.up('gridpanel');
						var filterFn = gridPanel.filterVehicleList;
						filterFn.call(textField, newValue, regNoValue);
			        }, scope : this
			    }
			}, T('label.reg_no'), {
				xtype : 'textfield',
				itemId : 'vehicles_reg_no_filter',
				hideLabel : true,
				width : 65, 
				listeners: {
					'change': function(textField, newValue, oldValue, option) {
						var idValue = this.sub('vehicles_id_filter').getValue();
						var gridPanel = textField.up('gridpanel');
						var filterFn = gridPanel.filterVehicleList;
						filterFn.call(textField, idValue, newValue);
			        }, scope : this
			    }
			}, ' ', {
				text : T('button.search'),
				itemId : 'search_vehicles',
				listeners: {
			        click: function(button, event, opts) {
			            var grid = button.up('grid');
			            grid.store.load();
			        },
			        scope : this
			    }
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
				fieldLabel : T('label.manufacturer'),
				name : 'manufacturer'
			} ]
		}, {
			xtype : 'panel',
			flex : 1,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : T('label.type'),
				name : 'vehicle_type'
			}, {
				fieldLabel : T('label.total_x', {x : T('label.dist')}),
				name : 'total_distance'
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
		columns : [
			{
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
				header : T('label.last_repl_date') + ' (month)',
				dataIndex : 'last_repl_date',
				xtype : 'datecolumn',
				format : F('date'),
				width : 130				
			}, {
				header : T('label.miles_last_repl') + ' (km)',
				dataIndex : 'miles_last_repl',
				width : 130
			}, {
				header : T('label.next_repl_mileage') + ' (km)',
				dataIndex : 'next_repl_mileage',
				width : 130
			}, {
				header : T('label.next_repl_date') + ' (month)',
				dataIndex : 'next_repl_date',
				xtype : 'datecolumn',
				format : F('date'),				
				width : 135
			}, {
				header : T('label.accrued_cost'),
				dataIndex : 'accrued_cost'				
			}, {
				header : T('label.health_rate'),
				dataIndex : 'health_rate',
				xtype : 'progresscolumn'
			}, {
				header : T('label.status'),
				dataIndex : 'status'
			}, {
				xtype:'actioncolumn',
				width : 50,
				align : 'center',
	            items: [
                    {
                    	icon : '/resources/image/iconInfoOff.png',
                    	tooltip: 'Modify consumable status!',
                    	handler: function(grid, rowIndex, colIndex) {
                    		var record = grid.store.getAt(rowIndex);
                    		var consumable = this.up('management_consumable');
                    		consumable.modifyConsumableItemStatus(record);
                    	}
                    }
                ]		
			}, {
				xtype:'actioncolumn',
				width : 50,
				align : 'center',
	            items: [
                    {
                    	icon : '/resources/image/iconAddOn.png',
                    	tooltip: 'Record consumables replacement information!',
                    	handler: function(grid, rowIndex, colIndex) {
                    		var record = grid.store.getAt(rowIndex);
                    		var consumable = this.up('management_consumable');
                    		var newRecord = {
                    			data : {
                    				vehicle_id : record.data.vehicle_id,
                    				consumable_item : record.data.consumable_item                    				
                    			}
                    		};
                    		consumable.addConsumableChangeItem(newRecord);
                    	}                 	
                    }
                ]		
			}
		]
	},
	
	zbottom_separator : {
		xtype : 'panel',
		width : 5
	},
	
	zconsumable_history : {
		xtype : 'grid',
		itemId : 'consumable_history_grid',
		store : 'ConsumableChangeStore',
		cls : 'hIndexbar',
		title : T('title.consumable_change_history'),		
		flex : 1,
		autoScroll : true,
		columns : [ {
			header : T('label.item'),
			dataIndex : 'consumable_item'
		}, {
			header : T('label.repl_date'),
			dataIndex : 'repl_date',
			xtype : 'datecolumn',
			format : F('date')
		}, {			
			header : T('label.repl_mileage') + " (km)",
			dataIndex : 'repl_mileage'
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
		}, {
			dataIndex : 'updated_at',
			header : T('label.updated_at'),
			xtype : 'datecolumn',
			format : F('datetime')
		} ],
		listeners : {
			itemdblclick : function(grid, record, htmlElement, indexOfItem, extEvent, eOpts) {
				grid.up('management_consumable').addConsumableChangeItem(record);
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
	    bbar : [
	        { xtype: 'tbfill'}, 
	        { 
	        	xtype: 'button', 
	        	text: T('button.add'), 
	        	handler : function(btn, event) {
	        		
	        		var thisView = btn.up('management_consumable');
	        		var selModel = thisView.sub('vehicle_info').getSelectionModel();
	        		var selVehicleId = '';
	        		if(selModel.lastSelected) {
	        			selVehicleId = selModel.lastSelected.data.id;
	        		}
	        		
	        		var nextRepairDate = new Date();
	        		nextRepairDate.setMilliseconds(nextRepairDate.getMilliseconds() + (1000 * 60 * 60 * 24 * 30 * 3));
	        		
	        		var win = new Ext.Window({
	        			title : 'Add Repair',
	        			items : [ 
	        			    {
	        					xtype : 'form',
	        					itemId : 'repair_win',
	        					bodyPadding : 10,
	        					cls : 'hIndexbar',
	        					width : 500,
	        					defaults : {
	        						xtype : 'textfield',
	        						anchor : '100%'
	        					},
	        					items : [
        					 		{
        							    xtype: 'fieldset',
        							    title: 'Vehicle',
        							    defaultType: 'textfield',
        							    layout: 'anchor',
        							    collapsible: true,
        							    padding : '10,5,5,5',
        							    defaults: {
        							        anchor: '100%'
        							    },
        							    items: [
        							        {
        										name : 'key',
        										fieldLabel : 'Key',
        										hidden : true
        							        },						            
        									{
        							        	itemId : 'vehicle_id',
        										name : 'vehicle_id',
        										fieldLabel : T('label.vehicle_id'),
        										value : selVehicleId
        									}
        							    ]
        							},
        							{
        							    xtype: 'fieldset',
        							    title: 'Repair',
        							    defaultType: 'textfield',
        							    layout: 'anchor',
        							    padding : '10,5,5,5',
        							    defaults: {
        							        anchor: '100%'
        							    },				
        							    items: [
        									{
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
        										fieldLabel : T('label.repair_mileage') + ' (km)'
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
        										minValue : 0					
        									}, {
        										xtype : 'textarea',
        										name : 'content',
        										fieldLabel : T('label.content')
        									}, {				
        										name : 'comment',
        										xtype : 'textarea',
        										fieldLabel : T('label.comment')
        									}						        
        							    ]							
        							}
	        					]
	        				}
	        			],
	        			buttons: [
        			  	    {
        			  	    	text: T('button.save'),
        			        	handler : function() {
        			        		var thisWin = this.up('window');
        			        		var thisForm = thisWin.down('form');
        			        		
        				    		thisForm.getForm().submit({
        			                    url: '/repair/save',
        			                    submitEmptyText: false,
        			                    waitMsg: 'Saving Data...',
        			                    success: function(form, action) {
        			                    	if(action.result.success) {		                    		
        			                    		GreenFleet.msg('Success', 'Saved successfully!');
        			                			var repairStore = thisView.sub('repair_grid').store;
        			                			repairStore.getProxy().extraParams.vehicle_id = selVehicleId;
        			                			repairStore.load();        			                    		
        			                    		thisWin.close();
        			                    	} else {
        			                    		Ext.Msg.alert('Failure', action.result.msg);
        			                    	}
        			                     },
        			                     failure: function(form, action) {
        			                         switch (action.failureType) {
        			                             case Ext.form.action.Action.CLIENT_INVALID:
        			                                 Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
        			                                 break;
        			                             case Ext.form.action.Action.CONNECT_FAILURE:
        			                                 Ext.Msg.alert('Failure', 'Ajax communication failed');
        			                                 break;
        			                             case Ext.form.action.Action.SERVER_INVALID:
        			                                Ext.Msg.alert('Failure', action.result.msg);
        			                        }
        			                     }		                    
        			                });        			        		
        			          	}        			  	    	
        			        }, {
        			        	text: T('button.cancel'),
        			        	handler : function() {
        			        		this.up('window').close();
        			          	}
        			        }
	        			]	        			
	        		});
	        		
	        		win.show();
	        	} 
	        }     
	    ],		
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
						htmlStr += "<div class='maintCell'><span>" + Ext.util.Format.date(record.data.repair_date, 'Y-m-d') + "</span>" + record.data.content + "</div>";
					});
					
					if(htmlStr)
						this.update(htmlStr);
					else
						this.update("<div class='maintCell'><span>No Data</span>...</div>");
				}
		    },
		    {
				xtype : 'grid',
				itemId : 'repair_grid',
				title : T('tab.grid_view'),
				store : 'RepairStore',
				flex : 1,
				autoScroll : true,
				columns : [
					{
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
					}
				]
		    }
        ]
	},
	
	modifyConsumableItemStatus : function(selectedRecord) {		
		this.consumableStatusWin(selectedRecord).show();
	},
	
	addConsumableChangeItem : function(selectedRecord) {
		this.consumableChangeWin(selectedRecord).show();
	},
	
	consumableStatusWin : function(record) {
		return 	new Ext.Window({
			title : 'Consumable Item (' + record.data.consumable_item + ') Status',
			listeners : {
				show : function(win, opts) {
					win.down('form').loadRecord(record);
				}
			},
			items : [ 
			    {
					xtype : 'form',
					itemId : 'consumable_status_form',
					bodyPadding : 10,
					cls : 'hIndexbar',
					width : 500,
					defaults : {
						xtype : 'textfield',
						anchor : '100%'
					},
					items : [ 
						{
						    xtype: 'fieldset',
						    title: 'Consumable Item',
						    defaultType: 'textfield',
						    layout: 'anchor',
						    collapsible: true,
						    padding : '10,5,5,5',
						    defaults: {
						        anchor: '100%'
						    },
						    items: [
						        {
									name : 'key',
									fieldLabel : 'Key',
									hidden : true						        	
						        },						            
								{
									name : 'vehicle_id',
									fieldLabel : T('label.vehicle_id'),
									disabled : true,
									value : record.data.vehicle_id
								}, {
									name : 'consumable_item',
									fieldLabel : T('label.consumable_item'),
									disabled : true,
									value : record.data.consumable_item
								}
						    ]
						},
						{
						    xtype: 'fieldset',
						    title: 'Consumable Status',
						    defaultType: 'textfield',
						    layout: 'anchor',
						    padding : '10,5,5,5',
						    defaults: {
						        anchor: '100%'
						    },
						    items: [
								{
									name : 'repl_unit',
									fieldLabel : T('label.repl_unit'),									
					            	xtype : 'codecombo',
									group : 'ReplacementUnit'									
								}, {
									xtype : 'numberfield',
									name : 'repl_mileage',
									fieldLabel : T('label.repl_mileage')
								}, {
									name : 'repl_time',
									fieldLabel : T('label.repl_time') + '(month)',
									xtype : 'numberfield',
									minValue : 0
								}, {
									name : 'last_repl_date',
									fieldLabel : T('label.last_repl_date'),
									xtype : 'datefield',
									format : F('date'),
									value : new Date()
								}, {
									xtype : 'numberfield',
									name : 'miles_last_repl',
									fieldLabel : T('label.miles_last_repl'),
									minValue : 0
								}, {
									xtype : 'numberfield',
									name : 'next_repl_mileage',
									fieldLabel : T('label.next_repl_mileage'),
									minValue : 0
								}, {									
									name : 'next_repl_date',
									fieldLabel : T('label.next_repl_date'),
									xtype : 'datefield',
									format : F('date'),
									value : new Date()									
								}, {
									xtype : 'numberfield',
									name : 'accrued_cost',
									fieldLabel : T('label.accrued_cost')
								}, {
									xtype : 'numberfield',
									name : 'health_rate',
									fieldLabel : T('label.health_rate')
								}, {
									name : 'status',
									xtype : 'textfield',
									fieldLabel : T('label.status')
								}
						    ]							
						}
					],
					fbar : [
					    { 
					    	xtype : 'button', 
					    	text : T('button.save'),
					    	handler : function() {
					    		var win = this.up('window');
					    		var thisForm = win.down('form');
					    		
					    		thisForm.getForm().submit({
				                    url: '/vehicle_consumable/save',
				                    submitEmptyText: false,
				                    waitMsg: 'Saving Data...',
				                    params: {
				                        vehicle_id: record.data.vehicle_id,
				                        consumable_item : record.data.consumable_item
				                    },
				                    success: function(form, action) {
				                    	if(action.result.success) {		                    		
				                    		GreenFleet.msg('Success', 'Saved successfully!');		                    				                    		
				                    		win.close();
				                    		var store = Ext.getStore('VehicleConsumableStore');
				                    		store.getProxy().extraParams.vehicle_id = record.data.vehicle_id;
				                    		store.load();
				                    	} else {
				                    		Ext.Msg.alert('Failure', action.result.msg);
				                    	}
				                     },
				                     failure: function(form, action) {
				                         switch (action.failureType) {
				                             case Ext.form.action.Action.CLIENT_INVALID:
				                                 Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
				                                 break;
				                             case Ext.form.action.Action.CONNECT_FAILURE:
				                                 Ext.Msg.alert('Failure', 'Ajax communication failed');
				                                 break;
				                             case Ext.form.action.Action.SERVER_INVALID:
				                                Ext.Msg.alert('Failure', action.result.msg);
				                        }
				                     }		                    
				                });
					    	}
					    },
					    { 
					    	xtype : 'button', 
					    	text : T('button.cancel'),
					    	handler : function() {
					    		this.up('window').close();
					    	}					    	
					    }
					]
				}
			]
		});
	},
	
	consumableChangeWin : function(record) {
		return new Ext.Window({
			title : 'Record Consumable (' + record.data.consumable_item + ') replacement!',
			modal : true,
			listeners : {
				show : function(win, opts) {
					win.down('form').loadRecord(record);
				}
			},
			items : [ 
			    {
					xtype : 'form',
					itemId : 'consumable_change_form',
					bodyPadding : 10,
					cls : 'hIndexbar',
					width : 500,
					defaults : {
						xtype : 'textfield',
						anchor : '100%'
					},
					
					items : [ 
						{
						    xtype: 'fieldset',
						    title: 'Consumable Item',
						    defaultType: 'textfield',
						    layout: 'anchor',
						    collapsible: true,
						    padding : '10,5,5,5',
						    defaults: {
						        anchor: '100%'
						    },
						    items: [
								{
									name : 'vehicle_id',
									fieldLabel : T('label.vehicle_id'),
									disabled : true
								}, {
									name : 'consumable_item',
									fieldLabel : T('label.consumable_item'),
									disabled : true
								}
						    ]
						},
						{
						    xtype: 'fieldset',
						    title: 'Consumable Change',
						    defaultType: 'textfield',
						    layout: 'anchor',
						    padding : '10,5,5,5',
						    defaults: {
						        anchor: '100%'
						    },
						    items: [
								{
									xtype : 'datefield',
									name : 'repl_date',
									fieldLabel : T('label.repl_date'),
									format : F('date'),
									value : new Date(),
									maxValue : new Date()
								}, 
								{
									xtype : 'numberfield',
									name : 'repl_mileage',
									fieldLabel : T('label.repl_mileage'),
									minValue : 0,
									maxValue : 500000
								}, {
									xtype : 'numberfield',
									name : 'cost',
									fieldLabel : T('label.cost'),
									minValue : 0,
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
								}						            
						    ]
						}    
					]				    	
				}
			],
			fbar : [
			    { 
			    	xtype : 'button', 
			    	text : T('button.save'),
			    	handler : function() {
			    		var win = this.up('window');
			    		var thisForm = win.down('form');
			    		
			    		thisForm.getForm().submit({
		                    url: '/consumable_change/save',
		                    submitEmptyText: false,
		                    waitMsg: 'Saving Data...',
		                    params: {
		                        vehicle_id: record.data.vehicle_id,
		                        consumable_item : record.data.consumable_item
		                    },
		                    success: function(form, action) {
		                    	if(action.result.success) {		                    		
		                    		GreenFleet.msg('Success', 'Saved successfully!');		                    				                    		
		                    		win.close();
		                    		var store = Ext.getStore('ConsumableChangeStore');
		                    		store.getProxy().extraParams.vehicle_id = record.data.vehicle_id;
		                    		store.getProxy().extraParams.consumable_item = record.data.consumable_item;
		                    		store.load();
		                    	} else {
		                    		Ext.Msg.alert('Failure', action.result.msg);
		                    	}
		                     },
		                     failure: function(form, action) {
		                         switch (action.failureType) {
		                             case Ext.form.action.Action.CLIENT_INVALID:
		                                 Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
		                                 break;
		                             case Ext.form.action.Action.CONNECT_FAILURE:
		                                 Ext.Msg.alert('Failure', 'Ajax communication failed');
		                                 break;
		                             case Ext.form.action.Action.SERVER_INVALID:
		                                Ext.Msg.alert('Failure', action.result.msg);
		                        }
		                     }		                    
		                });
			    	}
			    },
			    { 
			    	xtype : 'button', 
			    	text : T('button.cancel'),
			    	handler : function() {
			    		this.up('window').close();
			    	}					    	
			    }
			]
		});		
	}	
});
