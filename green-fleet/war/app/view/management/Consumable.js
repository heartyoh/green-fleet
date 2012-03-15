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
			var store = self.sub('consumable_grid').store;
			store.getProxy().extraParams.vehicle_id = record.get('id');
			store.load();
		});
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
				width : 135
			}, {
				header : T('label.accrued_cost'),
				dataIndex : 'accrued_cost'				
			}, {
				header : T('label.health_rate'),
				dataIndex : 'healthy',
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
                    		consumable.addConsumableChangeItem(record);
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
		itemId : 'consumable_grid',
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
			dataIndex : 'repl_date'
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
		} ]		
	},

	zmainthistory : {
		xtype : 'panel',
		autoScroll : true,
		title : T('title.maintenence_history'),
		flex : 1,
		cls : 'hIndexbar',
		layout : 'fit',
		html : '<div class="maintCell"><span>2011-11-16</span>Replaced Temperature Sensor</div>' 
			+ '<div class="maintCell"><span>2011-11-28</span>Replaced Timing Belt, Engine Oil, Spark Plug, Cooling Water, Brake Oil, Fuel Filter</div>'
	},
	
	modifyConsumableItemStatus : function(selectedRecord) {		
		this.consumableStatusWin(selectedRecord).show();
	},
	
	addConsumableChangeItem : function(selectedRecord) {
		this.consumableChangeWin(selectedRecord).show();
	},
	
	consumableStatusWin : function(record) {
		return 	new Ext.Window({
			title : 'Consumable Item (' + record.get('consumable_item') + ') Status',
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
							name : 'key',
							fieldLabel : 'Key',
							hidden : true
						}, {
							name : 'vehicle_id',
							fieldLabel : T('label.vehicle_id'),
							disabled : true,
						}, {
							name : 'consumable_item',
							fieldLabel : T('label.consumable_item'),
							disabled : true,
						}, {
							name : 'repl_unit',
							fieldLabel : T('label.repl_unit')
						}, {
							name : 'repl_mileage',
							fieldLabel : T('label.repl_mileage')
						}, {
							name : 'repl_time',
							fieldLabel : T('label.repl_time')
						}, {
							name : 'last_repl_date',
							fieldLabel : T('label.last_repl_date')
						}, {
							name : 'miles_last_repl',
							fieldLabel : T('label.miles_last_repl')
						}, {
							name : 'next_repl_mileage',
							fieldLabel : T('label.next_repl_mileage')
						}, {
							name : 'next_repl_date',
							fieldLabel : T('label.next_repl_date')
						}, {
							name : 'accrued_cost',
							fieldLabel : T('label.accrued_cost')
						}    
					],
					fbar : [
					    { 
					    	xtype : 'button', 
					    	text : T('button.save'),
					    	handler : function() {
					    		alert('save');
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
			title : 'Record Consumable (' + record.get('consumable_item') + ') replacement!',
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
							name : 'key',
							fieldLabel : 'Key',
							hidden : true
						}, {
							name : 'vehicle_id',
							fieldLabel : T('label.vehicle_id'),
							disabled : true,
						}, {
							name : 'consumable_item',
							fieldLabel : T('label.consumable_item'),
							disabled : true,
						}, {
							name : 'repl_date',
							fieldLabel : T('label.repl_date')
						}, {
							name : 'repl_mileage',
							fieldLabel : T('label.repl_mileage')
						}, {
							name : 'cost',
							fieldLabel : T('label.cost')
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
			],
			fbar : [
			    { 
			    	xtype : 'button', 
			    	text : T('button.save'),
			    	handler : function() {
			    		alert('save');
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
