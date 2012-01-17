Ext.define('GreenFleet.view.management.ControlData', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_control_data',

	title : 'ControlData',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			title : 'ControlData List',
			store : 'ControlDataStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'vehicle',
				text : 'Vehicle',
			}, {
				dataIndex : 'driver',
				text : 'Driver',
			}, {
				dataIndex : 'date',
				text : 'Date',
				xtype:'datecolumn',
				format:'d-m-Y'
			}, {
				dataIndex : 'startTime',
				text : 'Start Time',
				xtype:'datecolumn',
				format:'d-m-Y H:i:s'
			}, {
				dataIndex : 'endTime',
				text : 'End Time',
				xtype:'datecolumn',
				format:'d-m-Y H:i:s'
			}, {
				dataIndex : 'distance',
				text : 'Distance',
			}, {
				dataIndex : 'runningTime',
				text : 'Running Time',
			}, {
				dataIndex : 'averageSpeed',
				text : 'Average Speed',
			}, {
				dataIndex : 'highestSpeed',
				text : 'Highest Speed',
			}, {
				dataIndex : 'suddenAccelCount',
				text : 'Sudden Accel Count',
			}, {
				dataIndex : 'suddenBrakeCount',
				text : 'Sudden Brake Count',
			}, {
				dataIndex : 'econoDrivingRatio',
				text : 'Econo Driving Ratio',
			}, {
				dataIndex : 'fuelEfficiency',
				text : 'Fuel Efficiency',
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:'d-m-Y H:i:s'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:'d-m-Y H:i:s'
			} ],
			viewConfig : {

			},
			listeners : {
				itemclick : function(grid, record) {
					var form = main.down('form');
					form.loadRecord(record);
				}
			},
			onSearch : function(grid) {
				var vehicleFilter = grid.down('textfield[name=vehicleFilter]');
				var driverFilter = grid.down('textfield[name=driverFilter]');
				grid.store.load({
					filters : [ {
						property : 'vehicle',
						value : vehicleFilter.getValue()
					},{
						property : 'driver',
						value : driverFilter.getValue()
					} ]
				});
			},
			onReset : function(grid) {
				grid.down('textfield[name=vehicleFilter]').setValue('');
				grid.down('textfield[name=driverFilter]').setValue('');
			},
			tbar : [ {
				xtype : 'combo',
				name : 'vehicle',
				queryMode: 'local',
				store : 'VehicleStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Vehicle',
				name : 'vehicleFilter',
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, {
				xtype : 'combo',
				name : 'driver',
				queryMode: 'local',
				store : 'DriverStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Driver',
				name : 'driverFilter',
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, {
				xtype : 'button',
				text : 'Search',
				tooltip : 'Find ControlData',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'Reset',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onReset(grid);
				}
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			bodyPadding : 10,
			title : 'ControlData Details',
			autoScroll : true,
			flex : 1,
			items : [ {
				xtype : 'textfield',
				name : 'key',
				fieldLabel : 'Key',
				anchor : '100%',
				hidden : true
			}, {
				xtype : 'combo',
				name : 'vehicle',
				queryMode: 'local',
				store : 'VehicleStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Vehicle',
				anchor : '100%'
			}, {
				xtype : 'combo',
				name : 'driver',
				queryMode: 'local',
				store : 'DriverStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Driver',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'date',
				fieldLabel : 'Date',
				format: 'd-m-Y',
				submitFormat : 'U',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'startTime',
				fieldLabel : 'Start Time',
				format: 'd-m-Y H:i:s',
				submitFormat : 'U',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'endTime',
				fieldLabel : 'End Time',
				format: 'd-m-Y H:i:s',
				submitFormat : 'U',
				anchor : '100%'
			}, {
				name : 'distance',
				fieldLabel : 'Distance',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'runningTime',
				fieldLabel : 'Running Time',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'averageSpeed',
				fieldLabel : 'Average Speed',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'highestSpeed',
				fieldLabel : 'Highest Speed',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'suddenAccelCount',
				fieldLabel : 'Sudden Accel Count',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'suddenBrakeCount',
				fieldLabel : 'Sudden Brake Count',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'econoDrivingRatio',
				fieldLabel : 'Econo Driving Ratio',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'fuelEfficiency',
				fieldLabel : 'Fuel Efficiency',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				format: 'd-m-Y H:i:s',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'updatedAt',
				disabled : true,
				fieldLabel : 'Updated At',
				format: 'd-m-Y H:i:s',
				anchor : '100%'
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				layout : {
					align : 'middle',
					type : 'hbox'
				},
				items : [ {
					xtype : 'button',
					text : 'Save',
					handler : function() {
						var form = this.up('form').getForm();

						if (form.isValid()) {
							form.submit({
								url : 'control_data/save',
								success : function(form, action) {
									main.down('gridpanel').store.load();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result.msg);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'Delete',
					handler : function() {
						var form = this.up('form').getForm();

						if (form.isValid()) {
							form.submit({
								url : 'control_data/delete',
								success : function(form, action) {
									main.down('gridpanel').store.load();
									form.reset();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result.msg);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'Reset',
					handler : function() {
						this.up('form').getForm().reset();
					}
				} ]
			} ]
		}
	}
});