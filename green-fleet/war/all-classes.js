/*
Copyright(c) 2011 HeartyOh.com
*/
Ext.define('GreenFleet.mixin.Msg', function(){
	var msgCt;

	function createBox(t, s) {
		return '<div class="msg"><h3>' + t + '</h3><p>' + s + '</p></div>';
	}
	
	function showMessage(t, s) {
		if (!msgCt) {
			msgCt = Ext.core.DomHelper.insertFirst(document.body, {
				id : 'msg-div'
			}, true);
		}
		var s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
		var m = Ext.core.DomHelper.append(msgCt, createBox(t, s), true);
		m.hide();
		m.slideIn('t').ghost("t", {
			delay : 1000,
			remove : true
		});
	}

	return {
		msg : showMessage
	};
}());

Ext.define('GreenFleet.mixin.User', function() {
	var current_user = login.username;

	function currentUser(user) {
		if (user !== undefined)
			current_user = user;
		return current_user;
	}

	return {
		login : {
			id : currentUser,
			name : currentUser
		}
	};
}());
Ext.define('GreenFleet.mixin.Mixin', {
	mixin : function(clazz, config) {
		try {
			switch (typeof (clazz)) {
			case 'string':
				Ext.apply(Ignite, Ext.create(clazz, config));
				return;
			case 'object':
				Ext.apply(Ignite, clazz);
			}
		} catch (e) {
			console.log(e.stack);
		}
	}
});
Ext.define('GreenFleet.mixin.UI', {
	addDockingNav : function(view, config) {
		var defaults = {
			tabConfig : {
				width : 29,
				height : 22,
				padding : '0 0 0 2px'
			}
		};

		try {
			Ext.getCmp('docked_nav').add(Ext.create(view, Ext.merge(defaults, config)));
		} catch (e) {
			console.log(e);
			console.trace();
		}
	},

	addSystemMenu : function(view, config) {
		try {
			var system_menu = Ext.getCmp('system_menu');
			var menu = Ext.create(view, config);

			system_menu.insert(0, menu);

			var width = 6; // TODO should be more systemic.

			system_menu.items.each(function(el) {
				width += el.getWidth();
			});

			system_menu.setSize(width, system_menu.getHeight());
		} catch (e) {
			// console.log(e);
		}
	},

	addContentView : function(view) {
		this.showBusy();
		var comp;

		if (typeof (view) === 'string') {
			comp = Ext.create(view, {
				closable : true
			});
		} else {
			comp = view;
		}
		
		Ext.getCmp('content').add(comp).show();
		
		this.clearStatus();
	},

	setStatus : function(state) {
		Ext.getCmp('statusbar').setStatus(state);
	},

	showBusy : function(o) {
		Ext.getCmp('statusbar').showBusy(o);
	},

	clearStatus : function() {
		Ext.getCmp('statusbar').clearStatus();
	},

	doMenu : function(menu) {
		if (menu.viewModel) {
			Ext.require(menu.viewModel, function() {
				GreenFleet.addContentView(Ext.create(menu.viewModel, {
					title : menu.text,
					tabConfig : {
						tooltip : menu.tooltip
					},
					closable : true
				}));
			});
		} else {
			GreenFleet.status.set({
				text : 'View Not Found!',
				iconCls : 'x-status-error',
				clear : true
			// auto-clear after a set interval
			});
		}
	}
});

Ext.define('GreenFleet.view.Viewport', {
	extend : 'Ext.container.Viewport',

	layout : 'border',
	cls :'wrap',

	defaults : {
		split : false,
		collapsible : false
	},

	items : [ {
		xtype : 'viewport.north',
		region : 'north',
		cls : 'header',
		height : 62
	}, {
		xtype : 'viewport.west',
		region : 'west',
		cls : 'tool',
		width : 50
	}, {
		xtype : 'viewport.center',
		region : 'center'
	} ]
});

Ext.define('GreenFleet.view.company.Company', {
	extend : 'Ext.container.Container',

	alias : 'widget.company',

	title : 'Company',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		Ext.applyIf(this, {
			items : [ this.buildList(this), this.buildForm(this) ],
		});

		this.callParent(arguments);
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			title : 'Company List',
			store : 'CompanyStore',
			flex : 3,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'ID'
			}, {
				dataIndex : 'name',
				text : 'Name'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:'d/m/Y'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:'d/m/Y'
			} ],
			viewConfig : {

			},
			listeners : {
				render : function(grid) {
					grid.store.load();
				},
				itemclick : function(grid, record) {
					var form = main.down('form');
					form.loadRecord(record);
				}
			},
			onSearch : function(grid) {
				var idFilter = grid.down('textfield[name=idFilter]');
				var nameFilter = grid.down('textfield[name=nameFilter]');
				grid.store.clearFilter();

				grid.store.filter([ {
					property : 'id',
					value : idFilter.getValue()
				}, {
					property : 'name',
					value : nameFilter.getValue()
				} ]);
			},
			onReset : function(grid) {
				grid.down('textfield[name=idFilter]').setValue('');
				grid.down('textfield[name=nameFilter]').setValue('');
			},
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'idFilter',
				hideLabel : true,
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, 'NAME', {
				xtype : 'textfield',
				name : 'nameFilter',
				hideLabel : true,
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
				tooltip : 'Find Company',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'reset',
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
			title : 'Company Details',
			flex : 2,
			items : [ {
				xtype : 'textfield',
				name : 'key',
				fieldLabel : 'Key',
				anchor : '100%',
				hidden : true
			}, {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'ID',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'name',
				fieldLabel : 'Name',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'updatedAt',
				disabled : true,
				fieldLabel : 'Updated At',
				format: 'd/m/Y',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				format: 'd/m/Y',
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
								url : 'company/save',
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
								url : 'company/delete',
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
Ext.define('GreenFleet.view.vehicle.Vehicle', {
	extend : 'Ext.container.Container',

	alias : 'widget.vehicle',

	title : 'Vehicle',

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
			title : 'Vehicle List',
			store : 'VehicleStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'Vehicle Id',
				type : 'string'
			}, {
				dataIndex : 'registrationNumber',
				text : 'RegistrationNumber',
				type : 'string'
			}, {
				dataIndex : 'manufacturer',
				text : 'Manufacturer',
				type : 'string'
			}, {
				dataIndex : 'vehicleType',
				text : 'VehicleType',
				type : 'string'
			}, {
				dataIndex : 'birthYear',
				text : 'BirthYear',
				type : 'string'
			}, {
				dataIndex : 'ownershipType',
				text : 'OwnershipType',
				type : 'string'
			}, {
				dataIndex : 'status',
				text : 'Status',
				type : 'string'
			}, {
				dataIndex : 'imageClip',
				text : 'ImageClip',
				type : 'string'
			}, {
				dataIndex : 'totalDistance',
				text : 'TotalDistance',
				type : 'string'
			}, {
				dataIndex : 'remainingFuel',
				text : 'RemainingFuel',
				type : 'string'
			}, {
				dataIndex : 'distanceSinceNewOil',
				text : 'DistanceSinceNewOil',
				type : 'string'
			}, {
				dataIndex : 'engineOilStatus',
				text : 'EngineOilStatus',
				type : 'string'
			}, {
				dataIndex : 'fuelFilterStatus',
				text : 'FuelFilterStatus',
				type : 'string'
			}, {
				dataIndex : 'brakeOilStatus',
				text : 'BrakeOilStatus',
				type : 'string'
			}, {
				dataIndex : 'brakePedalStatus',
				text : 'BrakePedalStatus',
				type : 'string'
			}, {
				dataIndex : 'coolingWaterStatus',
				text : 'CoolingWaterStatus',
				type : 'string'
			}, {
				dataIndex : 'timingBeltStatus',
				text : 'TimingBeltStatus',
				type : 'string'
			}, {
				dataIndex : 'sparkPlugStatus',
				text : 'SparkPlugStatus',
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:'d/m/Y'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:'d/m/Y'
			} ],
			viewConfig : {

			},
			listeners : {
				render : function(grid) {
					grid.store.load();
				},
				itemclick : function(grid, record) {
					var form = main.down('form');
					form.loadRecord(record);
				}
			},
			onSearch : function(grid) {
				var idFilter = grid.down('textfield[name=idFilter]');
				var namefilter = grid.down('textfield[name=nameFilter]');
				grid.store.clearFilter();

				grid.store.filter([ {
					property : 'id',
					value : idFilter.getValue()
				}, {
					property : 'registrationNumber',
					value : namefilter.getValue()
				} ]);
			},
			onReset : function(grid) {
				grid.down('textfield[name=idFilter]').setValue('');
				grid.down('textfield[name=nameFilter]').setValue('');
			},
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'idFilter',
				hideLabel : true,
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, 'Registeration Number', {
				xtype : 'textfield',
				name : 'nameFilter',
				hideLabel : true,
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
				tooltip : 'Find Vehicle',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'reset',
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
			title : 'Vehicle Details',
			autoScroll : true,
			flex : 1,
			items : [ {
				xtype : 'textfield',
				name : 'key',
				fieldLabel : 'Key',
				anchor : '100%',
				hidden : true
			}, {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'Vehicle Id',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'registrationNumber',
				fieldLabel : 'Registration Number',
				anchor : '100%'
			}, {
				xtype : 'combo',
				name : 'manufacturer',
				queryMode: 'local',
				store : 'ManufacturerStore',
				displayField: 'name',
			    valueField: 'name',
				fieldLabel : 'Manufacturer',
				anchor : '100%'
			}, {
				xtype : 'combo',
				name : 'vehicleType',
				queryMode: 'local',
				store : 'VehicleTypeStore',
				displayField: 'desc',
			    valueField: 'name',
				fieldLabel : 'Vehicle Type',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'birthYear',
				fieldLabel : 'BirthYear',
				anchor : '100%'
			}, {
				xtype : 'combo',
				name : 'ownershipType',
				queryMode: 'local',
				store : 'OwnershipStore',
				displayField: 'desc',
			    valueField: 'name',
				fieldLabel : 'Ownership Type',
				anchor : '100%'
			}, {
				xtype : 'combo',
				name : 'status',
				queryMode: 'local',
				store : 'VehicleStatusStore',
				displayField: 'desc',
			    valueField: 'status',
				fieldLabel : 'Status',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'totalDistance',
				fieldLabel : 'Total Distance',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'remainingFuel',
				fieldLabel : 'Remaining Fuel',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'distanceSinceNewOil',
				fieldLabel : 'Distance Since NewOil',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'engineOilStatus',
				fieldLabel : 'EngineOil Status',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'fuelFilterStatus',
				fieldLabel : 'FuelFilter Status',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'brakeOilStatus',
				fieldLabel : 'BrakeOil Status',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'brakePedalStatus',
				fieldLabel : 'BrakePedal Status',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'coolingWaterStatus',
				fieldLabel : 'CoolingWater Status',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'timingBeltStatus',
				fieldLabel : 'TimingBeltStatus',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'sparkPlugStatus',
				fieldLabel : 'SparkPlugStatus',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'lattitude',
				fieldLabel : 'Lattitude',
				disabled : true,
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'longitude',
				fieldLabel : 'Longitude',
				disabled : true,
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'updatedAt',
				disabled : true,
				fieldLabel : 'Updated At',
				format: 'd/m/Y',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				format: 'd/m/Y',
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
								url : 'vehicle/save',
								success : function(form, action) {
									main.down('gridpanel').store.load();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
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
								url : 'vehicle/delete',
								success : function(form, action) {
									main.down('gridpanel').store.load();
									form.reset();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'New',
					handler : function() {
						this.up('form').getForm().reset();
					}
				} ]
			} ]
		}
	}
});
Ext.define('GreenFleet.view.vehicle.Reservation', {
	extend : 'Ext.container.Container',

	alias : 'widget.reservation',

	title : 'Reservation',

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
			title : 'Reservation List',
			store : 'ReservationStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'id',
				text : 'ID',
				type : 'string'
			}, {
				dataIndex : 'reservedDate',
				text : 'Reserved Date',
				type : 'string'
			}, {
				dataIndex : 'driver',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'vehicle',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'vehicleType',
				text : 'Vehicle Type',
				type : 'string'
			}, {
				dataIndex : 'deliveryPlace',
				text : 'Delivery Place',
				type : 'string'
			}, {
				dataIndex : 'destination',
				text : 'Destination',
				type : 'string'
			}, {
				dataIndex : 'purpose',
				text : 'Purpose',
				type : 'string'
			}, {
				dataIndex : 'status',
				text : 'Status',
				type : 'string'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:'d/m/Y'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:'d/m/Y'
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
				var idfilter = grid.down('textfield[name=idFilter]');
				var vehicleFilter = grid.down('textfield[name=vehicleFilter]');
				grid.store.load({
					filters : [ {
						property : 'id',
						value : idfilter.getValue()
					}, {
						property : 'vehicle',
						value : vehicleFilter.getValue()
					} ]
				});
			},
			onReset : function(grid) {
				grid.down('textfield[name=idFilter]').setValue('');
				grid.down('textfield[name=vehicleFilter]').setValue('');
			},
			tbar : [ 'Reservation ID', {
				xtype : 'textfield',
				name : 'idFilter',
				hideLabel : true,
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, 'Vehicle', {
				xtype : 'textfield',
				name : 'vehicleFilter',
				hideLabel : true,
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
				tooltip : 'Find Reservation',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'reset',
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
			title : 'Reservation Details',
			autoScroll : true,
			flex : 1,
			items : [ {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'Reservation ID',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'reservedDate',
				disabled : true,
				fieldLabel : 'Reserved Date',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'vehicleType',
				fieldLabel : 'Vehicle Type',
				anchor : '100%'
			}, {
				xtype : 'combo',
				name : 'vehicle',
				queryMode: 'local',
				store : 'VehicleStore',
				displayField: 'id',
			    valueField: 'key',
				fieldLabel : 'Vehicle',
				anchor : '100%'
			}, {
				xtype : 'combo',
				name : 'driver',
				queryMode: 'local',
				store : 'DriverStore',
				displayField: 'name',
			    valueField: 'key',
				fieldLabel : 'Driver',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'status',
				fieldLabel : 'Status',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'deliveryPlace',
				fieldLabel : 'Delivery Place',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'destination',
				fieldLabel : 'Destination',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'purpose',
				fieldLabel : 'Purpose',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'updatedAt',
				disabled : true,
				fieldLabel : 'Updated At',
				format: 'd/m/Y',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				format: 'd/m/Y',
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
								url : 'reservation/save',
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
								url : 'reservation/delete',
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
Ext.define('GreenFleet.view.vehicle.Incident', {
	extend : 'Ext.container.Container',

	alias : 'widget.incident',

	title : 'Incident',

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
			title : 'Incident List',
			store : 'IncidentStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'id',
				text : 'ID',
				type : 'string'
			}, {
				dataIndex : 'incidentTime',
				text : 'Incident Time',
				type : 'string'
			}, {
				dataIndex : 'driver',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'vehicle',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude',
				type : 'number'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude',
				type : 'number'
			}, {
				dataIndex : 'impulse',
				text : 'Impulse',
				type : 'number'
			}, {
				dataIndex : 'videoClip',
				text : 'VideoClip',
				type : 'string'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:'d/m/Y'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:'d/m/Y'
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
				var idfilter = grid.down('textfield[name=idFilter]');
				var vehicleFilter = grid.down('textfield[name=vehicleFilter]');
				var driverFilter = grid.down('textfield[name=driverFilter]');
				grid.store.load({
					filters : [ {
						property : 'id',
						value : idfilter.getValue()
					}, {
						property : 'vehicle',
						value : vehicleFilter.getValue()
					}, {
						property : 'driver',
						value : driverFilter.getValue()
					} ]
				});
			},
			onReset : function(grid) {
				grid.down('textfield[name=idFilter]').setValue('');
				grid.down('textfield[name=vehicleFilter]').setValue('');
				grid.down('textfield[name=driverFilter]').setValue('');
			},
			tbar : [ 'Incident ID', {
				xtype : 'textfield',
				name : 'idFilter',
				hideLabel : true,
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, 'Vehicle', {
				xtype : 'textfield',
				name : 'vehicleFilter',
				hideLabel : true,
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, 'Driver', {
				xtype : 'textfield',
				name : 'driverFilter',
				hideLabel : true,
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
				tooltip : 'Find Incident',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'reset',
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
			title : 'Incident Details',
			autoScroll : true,
			flex : 1,
			items : [ {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'Incident ID',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'incidentTime',
				disabled : true,
				fieldLabel : 'Incident Date',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'vehicle',
				fieldLabel : 'Vehicle',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'driver',
				fieldLabel : 'Driver',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'lattitude',
				fieldLabel : 'Lattitude',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'longitude',
				fieldLabel : 'Longitude',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'impulse',
				fieldLabel : 'Impulse',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'videoClip',
				fieldLabel : 'VideoClip',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'updatedAt',
				disabled : true,
				fieldLabel : 'Updated At',
				format: 'd/m/Y',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				format: 'd/m/Y',
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
								url : 'incident/save',
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
								url : 'incident/delete',
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
Ext.define('GreenFleet.view.driver.Driver', {
	extend : 'Ext.container.Container',

	alias : 'widget.driver',

	title : 'Driver',

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
			title : 'Driver List',
			store : 'DriverStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'name',
				text : 'Name',
				type : 'string'
			}, {
				dataIndex : 'id',
				text : 'Employee Id',
				type : 'string'
			}, {
				dataIndex : 'division',
				text : 'Division',
				type : 'string'
			}, {
				dataIndex : 'title',
				text : 'Title',
				type : 'string'
			}, {
				dataIndex : 'imageClip',
				text : 'ImageClip',
				type : 'string'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:'d/m/Y'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:'d/m/Y'
			} ],
			viewConfig : {

			},
			listeners : {
				render : function(grid) {
					grid.store.load();
				},
				itemclick : function(grid, record) {
					var form = main.down('form');
					form.loadRecord(record);
				}
			},
			onSearch : function(grid) {
				var idFilter = grid.down('textfield[name=idFilter]');
				var namefilter = grid.down('textfield[name=nameFilter]');
				grid.store.clearFilter();
				
				grid.store.filter([ {
					property : 'id',
					value : idFilter.getValue()
				}, {
					property : 'name',
					value : namefilter.getValue()
				} ]);
			},
			onReset : function(grid) {
				grid.down('textfield[name=idFilter]').setValue('');
				grid.down('textfield[name=nameFilter]').setValue('');
			},
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'idFilter',
				hideLabel : true,
				width : 200,
				listeners : {
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							var grid = this.up('gridpanel');
							grid.onSearch(grid);
						}
					}
				}
			}, 'Name', {
				xtype : 'textfield',
				name : 'nameFilter',
				hideLabel : true,
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
				tooltip : 'Find Driver',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'reset',
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
			title : 'Vehicle Details',
			autoScroll : true,
			flex : 1,
			items : [ {
				xtype : 'textfield',
				name : 'key',
				fieldLabel : 'Key',
				anchor : '100%',
				hidden : true
			}, {
				xtype : 'textfield',
				name : 'name',
				fieldLabel : 'Name',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'Employee Id',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'division',
				fieldLabel : 'Division',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'title',
				fieldLabel : 'Title',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'imageClip',
				fieldLabel : 'ImageClip',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'updatedAt',
				disabled : true,
				fieldLabel : 'Updated At',
				format: 'd/m/Y',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				format: 'd/m/Y',
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
								url : 'driver/save',
								success : function(form, action) {
									main.down('gridpanel').store.load();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
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
								url : 'driver/delete',
								success : function(form, action) {
									main.down('gridpanel').store.load();
									form.reset();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'New',
					handler : function() {
						this.up('form').getForm().reset();
					}
				} ]
			} ]
		}
	}
});
function Label(opt_options) {
	// Initialization
	this.setValues(opt_options);

	// Label specific
	var span = this.span_ = document.createElement('span');
	span.style.cssText = 'position: relative; left: -50%; top: -50px; '
			+ 'white-space: nowrap; border: 1px solid blue; ' + 'padding: 2px; background-color: white';

	var div = this.div_ = document.createElement('div');
	div.appendChild(span);
	div.style.cssText = 'position: absolute; display: none';
};
Label.prototype = new google.maps.OverlayView;

// Implement onAdd
Label.prototype.onAdd = function() {
	var pane = this.getPanes().overlayLayer;
	pane.appendChild(this.div_);

	// Ensures the label is redrawn if the text or position is changed.
	var me = this;
	this.listeners_ = [ google.maps.event.addListener(this, 'position_changed', function() {
		me.draw();
	}), google.maps.event.addListener(this, 'text_changed', function() {
		me.draw();
	}) ];
};

// Implement onRemove
Label.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);

	// Label is removed from the map, stop updating its position/text.
	for ( var i = 0, I = this.listeners_.length; i < I; ++i) {
		google.maps.event.removeListener(this.listeners_[i]);
	}
};

// Implement draw
Label.prototype.draw = function() {
	var projection = this.getProjection();
	var position = projection.fromLatLngToDivPixel(this.get('position'));

	var div = this.div_;
	div.style.left = position.x + 'px';
	div.style.top = position.y + 'px';
	div.style.display = 'block';

	this.span_.innerHTML = this.get('text').toString();
};

Ext.define('GreenFleet.view.map.Map', {
	extend : 'Ext.Container',

	alias : 'widget.map',

	title : 'Maps',

	layout : {
		type : 'hbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.callParent();

		this.mapbox = this.add(this.buildMap(this));
		this.board = this.add(this.buildBoard(this));
	},

	displayMap : function(mapbox, lat, lng) {
		/*
		 * Setting map options
		 */
		var options = {
			zoom : 10,
			center : new google.maps.LatLng(lat, lng),
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};

		/*
		 * Draw map
		 */
		mapbox.map = new google.maps.Map(mapbox.getEl().first('.map').dom, options);

		/*
		 * Set map event listeners
		 */
		google.maps.event.addListener(mapbox.map, 'zoom_changed', function() {
			// setTimeout(function() {
			// mapbox.map.setCenter(options.center);
			// }, 3000);
		});

		/*
		 * Set map markers
		 */
		this.buildMarkers(mapbox);
	},

	/*
	 * refreshMarkers : scope
	 */
	refreshMarkers : function(store) {
		for ( var vehicle in this.markers) {
			this.markers[vehicle].setMap(null);
		}
		this.markers = {};

		store.each(function(record) {
			var vehicle = record.get('id');
			var marker = new google.maps.Marker({
				position : new google.maps.LatLng(record.get('lattitude'), record.get('longitude')),
				map : this.mapbox.map,
				title : vehicle,
				vehicle : vehicle,
				driver : 'V001',
				tooltip : vehicle + "(김형용)"
			});
			
			var label = new Label({
				map : this.mapbox.map
			});
			label.bindTo('position', marker, 'position');
			label.bindTo('text', marker, 'tooltip');
			
			this.markers[vehicle] = marker;

			var mapbox = this.mapbox;
			google.maps.event.addListener(marker, 'click', function() {
				Ext.create('GreenFleet.view.vehicle.VehiclePopup', {
					vehicle : vehicle,
					driver : 'V001'
				}).show();
				
//				var infowindow = new google.maps.InfoWindow({
//					content : marker.getTitle(),
//					size : new google.maps.Size(100, 100)
//				});
//				infowindow.open(mapbox.map, marker);
			});
		}, this);
	},

	buildMarkers : function() {
		this.markers = {};

		var vehicleStore = Ext.getStore('VehicleStore');
		vehicleStore.on('datachanged', this.refreshMarkers, this);

		this.refreshMarkers(vehicleStore);
	},

	buildMap : function(parent) {
		return {
			xtype : 'box',
			flex : 1,
			html : '<div class="map" style="height:100%"></div>',
			listeners : {
				afterrender : function() {
					parent.displayMap(this, 37.56, 126.97);
				}
			}
		};
	},

	buildBoard : function(parent) {
		return {
			xtype : 'panel',
			width : 200,
			items : [ {
				xtype : 'checkbox',
				fieldLabel : 'Markers',
				checked : true,
				name : 'markers',
				scope : this,
				handler : function(field, newValue) {
					for ( var vehicle in this.markers) {
						this.markers[vehicle].setVisible(newValue);
					}
				}
			} ]
		}
	}
});
Ext.define('GreenFleet.view.vehicle.Track', {
	extend : 'Ext.container.Container',

	alias : 'widget.track',

	title : 'Track',

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
			title : 'Track List',
			store : 'TrackStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'vehicle',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'driver',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude',
				type : 'number'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude',
				type : 'number'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
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
				tooltip : 'Find Track',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'reset',
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
			title : 'Tracking Details',
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
				xtype : 'textfield',
				name : 'lattitude',
				fieldLabel : 'Lattitude',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'longitude',
				fieldLabel : 'Longitude',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
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
								url : 'track/save',
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
								url : 'track/delete',
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
Ext.define('GreenFleet.view.vehicle.ControlData', {
	extend : 'Ext.container.Container',

	alias : 'widget.control_data',

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
				dataIndex : 'longitude',
				text : 'Longitude',
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
				text : 'reset',
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
				format: 'd-m-Y H:i:s',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'startTime',
				fieldLabel : 'Start Time',
				format: 'd-m-Y H:i:s',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'endTime',
				fieldLabel : 'End Time',
				format: 'd-m-Y H:i:s',
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
Ext.define('GreenFleet.store.CompanyStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'name',
		type : 'string'
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updatedAt',
		type : 'date',
		dateFormat:'time'
	} ],
	proxy : {
		type : 'ajax',
		url : 'company',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.VehicleStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'registrationNumber',
		type : 'string'
	}, {
		name : 'manufacturer',
		type : 'string'
	}, {
		name : 'vehicleType',
		type : 'string'
	}, {
		name : 'birthYear',
		type : 'string'
	}, {
		name : 'ownershipType',
		type : 'string'
	}, {
		name : 'status',
		type : 'string'
	}, {
		name : 'imageClip',
		type : 'string'
	}, {
		name : 'totalDistance',
		type : 'string'
	}, {
		name : 'remainingFuel',
		type : 'string'
	}, {
		name : 'distanceSinceNewOil',
		type : 'string'
	}, {
		name : 'engineOilStatus',
		type : 'string'
	}, {
		name : 'fuelFilterStatus',
		type : 'string'
	}, {
		name : 'brakeOilStatus',
		type : 'string'
	}, {
		name : 'brakePedalStatus',
		type : 'string'
	}, {
		name : 'coolingWaterStatus',
		type : 'string'
	}, {
		name : 'timingBeltStatus',
		type : 'string'
	}, {
		name : 'sparkPlugStatus',
		type : 'string'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updatedAt',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.DriverStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'name',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'division',
		type : 'string'
	}, {
		name : 'title',
		type : 'string'
	}, {
		name : 'imageClip',
		type : 'string'
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updatedAt',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'driver',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.ReservationStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'reservedDate',
		type : 'date',
		dateFormat : 'timestamp'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'vehicleType',
		type : 'string'
	}, {
		name : 'deliveryType',
		type : 'string'
	}, {
		name : 'destination',
		type : 'string'
	}, {
		name : 'purpose',
		type : 'string'
	}, {
		name : 'status',
		type : 'string'
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updatedAt',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'reservation',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.IncidentStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'incidentTime',
		type : 'string'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'impulse',
		type : 'float'
	}, {
		name : 'videoClip',
		type : 'string'
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updatedAt',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'incident',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.TrackStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'number'
	}, {
		name : 'longitude',
		type : 'number'
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'track',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.view.viewport.Center', {

	extend : 'Ext.panel.Panel',

	id : 'content',

	alias : 'widget.viewport.center',
	
//	tabBar : {
//		renderTo : Ext.getCmp('tabPosition')
//	},
	preventHeader : true,
	
	layout : 'card',
	
//	listeners : {
//		'render' : function(panel) {
//			var tab = panel.getTabBar();
//			tab.
//		}
//	},
	
	defaults : {
		preventHeader : true
	},

//	items : [  ]
});
Ext.define('GreenFleet.view.viewport.North', {
	extend : 'Ext.Container',

	alias : 'widget.viewport.north',
	
	layout : {
		type : 'hbox',
		align : 'stretch'
	},

	items : [ {
		xtype : 'brand',
		width : 128
	}, {
		xtype : 'container',
		flex : 1,
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		items : [ {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ {
				xtype : 'main_menu',
				flex : 1
			}, {
				xtype : 'system_menu',
				width : 180
			} ]
		}, {
			xtype : 'tabbar',
			height: 23,
			defaults : {
				handler : function(item) {
					var content = Ext.getCmp('content');
					var comp = content.getComponent(item.itemId);
					if(!comp) {
						comp = content.add(item.view);
					}
					content.getLayout().setActiveItem(comp);
					item.setActive(true);
				},
				closable : false
			},
			items : [{
				text : 'Map',
				itemId : 'map',
				view : {
					xtype : 'map',
					itemId : 'map'
				}
			}, {
				text : 'OBD',
				itemId : 'obd',
				view : {
					xtype : 'obd',
					itemId : 'obd'
				}
			}, {
				text : 'File',
				itemId : 'filemanager',
				view : {
					xtype : 'filemanager',
					itemId : 'filemanager'
				}
			}, {
				text : 'Company',
				itemId : 'company',
				view : {
					xtype : 'company',
					itemId : 'company'
				}
			}, {
				text : 'Vehicle',
				itemId : 'vehicle',
				view : {
					xtype : 'vehicle',
					itemId : 'vehicle'
				}
			}, {
				text : 'Driver',
				itemId : 'driver',
				view : {
					xtype : 'driver',
					itemId : 'driver'
				}
			}, {
				text : 'Reservation',
				itemId : 'reservation',
				view : {
					xtype : 'reservation',
					itemId : 'reservation'
				}
			}, {
				text : 'Incident',
				itemId : 'incident',
				view : {
					xtype : 'incident',
					itemId : 'incident'
				}
			}, {
				text : 'Track',
				itemId : 'track',
				view : {
					xtype : 'track',
					itemId : 'track'
				}
			}, {
				text : 'ControlData',
				itemId : 'control_data',
				view : {
					xtype : 'control_data',
					itemId : 'control_data'
				}
			}]
		} ]
	} ]
});

Ext.define('GreenFleet.view.viewport.West', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.west'
});
Ext.define('GreenFleet.view.Brand', {
	extend : 'Ext.panel.Panel',
	
	alias : 'widget.brand',
	
	html : '<h1>Green Fleet</h1>'
});
Ext.create('Ext.data.Store', {
    id:'menustore',

    fields : [{
    	name : 'text'
    }],

	data : [ {
		text : 'Vehicle'
	}, {
		text : 'Employees'
	}, {
		text : 'Allocation'
	}, {
		text : 'Incidents'
	}, {
		text : 'Maintenance'
	}, {
		text : 'Risk Assessment'
	}, {
		text : 'Purchase Order'
	} ],

});

//Ext.define('GreenFleet.view.MainMenu', {
//	extend : 'Ext.view.View',
//
//	alias : 'widget.main_menu',
//	
//	store : Ext.data.StoreManager.lookup('menustore'),
//
//	itemSelector : 'div.mainmenu',
//	
//	tpl : '<tpl for="."><div class="mainmenu"><span>{text}</span></div></tpl>'
//
//});

Ext.define('GreenFleet.view.MainMenu', {
	extend : 'Ext.toolbar.Toolbar',
	cls : 'appMenu',
	alias : 'widget.main_menu',
	
	items : [{
		text : 'Vehicle'
	}, {
		text : 'Employees'
	}, {
		text : 'Allocation'
	}, {
		text : 'Incidents'
	}, {
		text : 'Maintenance'
	}, {
		text : 'Risk Assessment'
	}, {
		text : 'Purchase Order'
	}]
});
Ext.define('GreenFleet.view.SystemMenu', {
	extend : 'Ext.toolbar.Toolbar',

	alias : 'widget.system_menu',

	items : [ {
		type : 'help',
		text : login.username,
		handler : function() {
		}
	}, {
		itemId : 'logout',
		type : 'logout',
		text : 'logout',
		handler : function() {
			Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?', function(confirm) {
				if (confirm === 'yes') {
					document.location.href = '/logout.htm';
				}

			});
		}
	}, {
		type : 'search',
		text : 'search',
		handler : function(event, target, owner, tool) {
		}
	} ]
});
Ext.define('GreenFleet.view.vehicle.VehiclePopup', {
	extend : 'Ext.window.Window',
	alias : 'widget.vehiclepopup',
	
	title : 'Control Information',
	
	closable : true,
	
	modal : true,
	
	width : 600,
	height : 400,
	
	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	
	items : [{
		xtype : 'container',
		flex : 2,
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		items : [{
			xtype : 'form',
			height : 140,
			items : [{
				xtype : 'textfield',
				name : 'driver',
				fieldLabel : 'Driver'
			}, {
				xtype : 'textfield',
				name : 'vehicle',
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'textfield',
				name : 'position',
				fieldLabel : 'Current Position'
			}, {
				xtype : 'textfield',
				name : 'distance',
				fieldLabel : 'Running Distance'
			}, {
				xtype : 'textfield',
				name : 'runningTime',
				fieldLabel : 'Running Time'
			}]
		}, {
			xtype : 'panel',
			flex : 1, 
			title : 'Incidents', 
			layout : 'fit',
			items : [{
				xtype : 'container',
				layout : {
					type : 'hbox',
					align : 'left'
				},
				items : [{
					xtype : 'box',
					height : 100,
					width : 100,
					html : '<div>HAHAHA001</div>'
				},{
					xtype : 'box',
					height : 100,
					width : 100,
					html : '<div>HAHAHA002</div>'
				},{
					xtype : 'box',
					height : 100,
					width : 100,
					html : '<div>HAHAHA003</div>'
				},{
					xtype : 'box',
					height : 100,
					width : 100,
					html : '<div>HAHAHA004</div>'
				}]
			}]
		}]
	}, {
		xtype : 'tabpanel',
		flex : 1,
		items : [{
			xtype : 'gridpanel',
			title : 'Information',
			store : 'VehicleStore',
			autoScroll : true,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'Vehicle Id',
				type : 'string'
			}, {
				dataIndex : 'registrationNumber',
				text : 'RegistrationNumber',
				type : 'string'
			}, {
				dataIndex : 'manufacturer',
				text : 'Manufacturer',
				type : 'string'
			}, {
				dataIndex : 'vehicleType',
				text : 'VehicleType',
				type : 'string'
			}, {
				dataIndex : 'birthYear',
				text : 'BirthYear',
				type : 'string'
			}, {
				dataIndex : 'ownershipType',
				text : 'OwnershipType',
				type : 'string'
			}, {
				dataIndex : 'status',
				text : 'Status',
				type : 'string'
			}, {
				dataIndex : 'imageClip',
				text : 'ImageClip',
				type : 'string'
			}, {
				dataIndex : 'totalDistance',
				text : 'TotalDistance',
				type : 'string'
			}, {
				dataIndex : 'remainingFuel',
				text : 'RemainingFuel',
				type : 'string'
			}, {
				dataIndex : 'distanceSinceNewOil',
				text : 'DistanceSinceNewOil',
				type : 'string'
			}, {
				dataIndex : 'engineOilStatus',
				text : 'EngineOilStatus',
				type : 'string'
			}, {
				dataIndex : 'fuelFilterStatus',
				text : 'FuelFilterStatus',
				type : 'string'
			}, {
				dataIndex : 'brakeOilStatus',
				text : 'BrakeOilStatus',
				type : 'string'
			}, {
				dataIndex : 'brakePedalStatus',
				text : 'BrakePedalStatus',
				type : 'string'
			}, {
				dataIndex : 'coolingWaterStatus',
				text : 'CoolingWaterStatus',
				type : 'string'
			}, {
				dataIndex : 'timingBeltStatus',
				text : 'TimingBeltStatus',
				type : 'string'
			}, {
				dataIndex : 'sparkPlugStatus',
				text : 'SparkPlugStatus',
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:'d/m/Y'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:'d/m/Y'
			} ]
		}, {
			title : 'Control - Vehicle'
		}, {
			title : 'Control - Driver'
		}, {
			title : 'Control - Maintenance'
		}]
	}]
});
Ext.define('GreenFleet.store.ManufacturerStore', {
	extend : 'Ext.data.Store',

	storeId : 'manufacturer_store',

	fields : [ 'name' ],

	data : [ {
		"name" : "Audi"
	}, {
		"name" : "Volkswagon"
	}, {
		"name" : "Mercedes-Benz"
	}, {
		"name" : "Hyundai"
	}, {
		"name" : "Kia"
	} ]
});
Ext.define('GreenFleet.store.VehicleTypeStore', {
	extend : 'Ext.data.Store',

	storeId : 'vehicletype_store',

	fields : [ 'name', 'desc' ],

	data : [ {
		"name" : "A",
		"desc" : "A 800-"
	}, {
		"name" : "B",
		"desc" : "B 800~1000"
	}, {
		"name" : "C",
		"desc" : "C 1000~1500"
	}, {
		"name" : "D",
		"desc" : "D 1500~1800"
	}, {
		"name" : "E",
		"desc" : "E 1800~2000"
	}, {
		"name" : "F",
		"desc" : "F 2000+"
	} ]
});
Ext.define('GreenFleet.store.OwnershipStore', {
	extend : 'Ext.data.Store',

	storeId : 'ownership_store',

	fields : [ 'name', 'desc' ],

	data : [ {
		"name" : "A",
		"desc" : "A Self"
	}, {
		"name" : "B",
		"desc" : "B Company"
	}, {
		"name" : "C",
		"desc" : "C Rent"
	} ]
});
Ext.define('GreenFleet.store.VehicleStatusStore', {
	extend : 'Ext.data.Store',

	storeId : 'vehiclestatus_store',

	fields : [ 'status', 'desc' ],

	data : [ {
		"name" : "Running",
		"desc" : "Running"
	}, {
		"name" : "Incident",
		"desc" : "Incident"
	}, {
		"name" : "Idle",
		"desc" : "Idle"
	} ]
});
Ext.define('GreenFleet.store.ControlDataStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'distance',
		type : 'float'
	}, {
		name : 'runningTime',
		type : 'float'
	}, {
		name : 'averageSpeed',
		type : 'float'
	}, {
		name : 'highestSpeed',
		type : 'float'
	}, {
		name : 'suddenAccelCount',
		type : 'float'
	}, {
		name : 'suddenBrakeCount',
		type : 'float'
	}, {
		name : 'econoDrivingRatio',
		type : 'float'
	}, {
		name : 'fuelEfficiency',
		type : 'float'
	}, {
		name : 'date',
		type : 'date',
		dateFormat:'timestamp'
	}, {
		name : 'startTime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'endTime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updatedAt',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'control_data',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.model.File', {
    extend: 'Ext.data.Model',
    
    fields: [
        {name: 'filename', type: 'string'},
        {name: 'creation', type: 'number'},
        {name: 'md5_hash', type: 'string'},
        {name: 'content_type', type: 'string'},
        {name: 'size', type: 'string'}
    ]
});

Ext.define('GreenFleet.view.file.FileManager', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.filemanager',
	
	title : 'FileManager',

	layout : {
		type : 'vbox',
		align : 'stretch',
		pack : 'start'
	},

	initComponent : function() {
		this.callParent();

		this.add(Ext.create('GreenFleet.view.file.FileViewer', {
			flex : 1
		}));
		this.add(Ext.create('GreenFleet.view.file.FileUploader', {
			flex : 1
		}));
		this.add(Ext.create('GreenFleet.view.file.FileList', {
			flex : 2
		}));
	}
});
Ext.define('GreenFleet.store.FileStore', {
	extend : 'Ext.data.Store',
	
	storeId : 'filestore',
	
	model: 'GreenFleet.model.File',
    
	proxy: {
        type: 'ajax',
        url : '/data/files.json',
        reader: {
            type: 'json'
        }
    },
    
    autoLoad: true
});
Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller',

	stores : [ 'CompanyStore', 'VehicleStore', 'DriverStore', 'ReservationStore', 'IncidentStore', 'TrackStore' ],
	models : [],
	views : [ 'company.Company', 'vehicle.Vehicle', 'vehicle.Reservation', 'vehicle.Incident', 'driver.Driver',
			'map.Map', 'vehicle.Track', 'vehicle.ControlData' ],

	init : function() {
		this.control({
			'viewport' : {
				afterrender : this.onViewportRendered
			}
		});
	},

	onViewportRendered : function() {
	}
});
Ext.define('GreenFleet.controller.FrameController', {
	extend : 'Ext.app.Controller',

	stores : [],
	models : [],
	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'Brand', 'MainMenu', 'SystemMenu' ],

	init : function() {
		this.control({
			'viewport' : {
				afterrender : this.onViewportRendered
			}
		});

		// GreenFleet.mixin('GreenFleet.mixin.Selector');
	},

	onViewportRendered : function() {
	}

});
Ext.define('GreenFleet.controller.VehicleController', {
	extend : 'Ext.app.Controller',

	stores : [ 'ManufacturerStore', 'VehicleTypeStore' , 'OwnershipStore', 'VehicleStatusStore', 'ControlDataStore'],
	models : [],
	views : [ 'vehicle.VehiclePopup' ],

	init : function() {
		this.control({
			'viewport' : {
				afterrender : this.onViewportRendered
			}
		});

		// GreenFleet.mixin('GreenFleet.mixin.Selector');
	},

	onViewportRendered : function() {
	}

});
Ext.define('GreenFleet.controller.FileController', {
	extend : 'Ext.app.Controller',

	stores : [ 'FileStore' ],
	models : [ 'File' ],
	views : [ 'file.FileManager' ],

	init : function() {
		this.control({
			'viewport' : {
				afterrender : this.onViewportRendered
			}
		});
	},

	onViewportRendered : function() {
	}

});


