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

	getMenu : function(menu) {
		return Ext.getCmp('content').getComponent(menu);
	},
	
	doMenu : function(menu) {
		var content = Ext.getCmp('content');
		content.getLayout().setActiveItem(content.getComponent(menu));
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
		xtype : 'viewport.east',
		region : 'east',
		cls : 'summaryBoard',
		width : 200
	}, {
		xtype : 'viewport.center',
		region : 'center'
	} ]
});

Ext.define('GreenFleet.view.viewport.Center', {

	extend : 'Ext.panel.Panel',

	id : 'content',

	alias : 'widget.viewport.center',

	layout : 'card',

	listeners : {
		add : function(panel, item) {
			var menutab = Ext.getCmp('menutab');
			menutab.add({
				text : item.title,
				itemId : item.itemId,
				handler : function(tab) {
					var content = Ext.getCmp('content');
					var comp = content.getComponent(tab.itemId);
					content.getLayout().setActiveItem(comp);
				},
				closable : false
			}).setCard(item);
		}
	},

	defaults : {
		listeners : {
			activate : function(item) {
				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
				/*
				 * TODO 동작하게 해보라
				 */
				menutab.setActiveTab(tab);
			}
		}
	},

	items : [ {
		title : 'Dashboard',
		xtype : 'monitor_map',
		itemId : 'map'
	}, {
		title : 'Info',
		xtype : 'monitor_information',
		itemId : 'information'
	}, {
		title : 'Incident',
		xtype : 'monitor_incident',
		itemId : 'monitor_incident'
	}, {
		title : 'Company',
		xtype : 'management_company',
		itemId : 'company'
	}, {
		title : 'Vehicle',
		xtype : 'management_vehicle',
		itemId : 'vehicle'
	}, {
		title : 'Driver',
		xtype : 'management_driver',
		itemId : 'driver'
	}, {
		title : 'Reservation',
		xtype : 'management_reservation',
		itemId : 'reservation'
	}, {
		title : 'Incident',
		xtype : 'management_incident',
		itemId : 'incident'
	}, {
		title : 'Track',
		xtype : 'management_track',
		itemId : 'track'
	}, {
		title : 'ControlData',
		xtype : 'management_control_data',
		itemId : 'control_data'
	}, {
		title : 'File',
		xtype : 'filemanager',
		itemId : 'filemanager'
	} ]
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
		width : 135
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
				xtype : 'side_menu',
				width : 180
			} ]
		}, {
			xtype : 'tabbar',
			id : 'menutab',
			height: 23
		} ]
	} ]
});

Ext.define('GreenFleet.view.viewport.West', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.west',
	cls : 'tool',
	
	layout : {
		type : 'vbox'
	},
	items : [ {
		xtype : 'button',
		cls : 'btnAdd',
		html : 'add'
	}, {
		xtype : 'button',
		cls : 'btnRemove',
		html : 'remove'
	}, {
		xtype : 'button',
		cls : 'btnRefresh',
		html : 'refresh'
	}, {
		xtype : 'button',
		cls : 'btnEvent',
		html : 'event'
	}, {
		xtype : 'button',
		cls : 'btnSave',
		html : 'save'
	}, {
		xtype : 'button',
		cls : 'btnExport',
		html : 'export'
	} ]
});
Ext.define('GreenFleet.view.viewport.East', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.east',
	
	cls : 'summaryBoard',
	
	width : 200,

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	items : [ {
		xtype : 'combo',
		cls : 'searchField',
		fieldLabel : 'Search',
		labelWidth : 50,
		labelSeparator : '',
		itemId : 'search'
	}, {
		xtype : 'component',
		cls : 'time',
		itemId : 'time',
		html : Ext.Date.format(new Date(), 'D Y-m-d H:i:s')
	}, {
		xtype : 'component',
		cls : 'count',
		itemId : 'vehicle_count',
		html : 'Total Running Vehicles : 6'
	}, {
		xtype : 'panel',
		title : '상황별 운행 현황',
		cls : 'statusPanel',
		items : [ {
			xtype : 'button',
			flex : 1,
			cls : 'btnDriving',
			html : 'Driving</br><span>4</span>'
		}, {
			xtype : 'button',
			flex : 1,
			cls : 'btnStop',
			html : 'Stop</br><span>2</span>'
		}, {
			xtype : 'button',
			flex : 1,
			cls : 'btnIncident',
			html : 'Incident</br><span>1</span>'
		} ]
	}, {
		xtype : 'panel',
		title : 'Group',
		cls :'groupPanel',
		items : [{
			html : '<a href="#">강남 ~ 분당노선 1 <span>(14)</span></a><a href="#">강남 ~ 분당노선 1 <span>(14)</span></a>'
		}]
	}, {
		xtype : 'panel',
		title : 'Incidents Alarm',
		cls : 'incidentPanel',
		items : [{
			html : '<a href="#">id_KS937362, 김형용<span>2011.12.30 16:25:41</span></a><a href="#">id_KS937362, 변사또<span>2011.12.30 16:25:41</span></a>'
		}]
	} ]
});
Ext.define('GreenFleet.view.Brand', {
	extend : 'Ext.panel.Panel',
	
	alias : 'widget.brand',
	
	html : '<a></a>'
});
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
Ext.define('GreenFleet.view.SideMenu', {
	extend : 'Ext.toolbar.Toolbar',

	alias : 'widget.side_menu',
	cls : 'sideMenu',

	items : [ {
		type : 'help',
		text : login.username,
		handler : function() {
		}
	}, {
		itemId : 'home',
		type : 'home',
		cls : 'btnHome',
		handler : function() {
		}
	}, {
		itemId : 'report',
		type : 'report',
		cls : 'btnReport',
		handler : function() {
		}
	}, {
		itemId : 'setting',
		type : 'setting',
		cls : 'btnSetting',
		handler : function() {
		}
	}, {
		itemId : 'logout',
		type : 'logout',
		cls : 'btnLogout',
		handler : function() {
			Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?', function(confirm) {
				if (confirm === 'yes') {
					document.location.href = '/logout.htm';
				}

			});
		}
	}/*, {
		type : 'search',
		text : 'search',
		handler : function(event, target, owner, tool) {
		}
	}*/ ]
});
Ext.define('GreenFleet.view.management.Company', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_company',

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
Ext.define('GreenFleet.view.management.Vehicle', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle',

	title : 'Vehicle',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		this.callParent(arguments);

		this.list = this.add(this.buildList(this));
		var detail = this.add(this.buildForm(this));
		this.form = detail.down('form'); 
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
				dataIndex : 'imageClip',
				text : 'ImageClip',
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
				xtype : 'datecolumn',
				format : 'd/m/Y'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : 'd/m/Y'
			} ],
			viewConfig : {

			},
			listeners : {
				render : function(grid) {
					grid.store.load();
				},
				itemclick : function(grid, record) {
					var form = main.form;
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
				text : 'Reset',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onReset(grid);
				}
			} ],
			rbar : [ {
				xtype : 'form',
				items : [ {
					xtype : 'filefield',
					name : 'file',
					fieldLabel : 'Import(CSV)',
					msgTarget : 'side',
					labelAlign : 'top',
					allowBlank : true,
					buttonText : 'file...'
				}, {
					xtype : 'button',
					text : 'Import',
					handler : function() {
						var form = main.form.getForm();

						if (form.isValid()) {
							form.submit({
								url : 'vehicle/import',
								success : function(form, action) {
									main.down('gridpanel').store.load();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				} ]
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			title : 'Vehicle Details',
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [ {
				xtype : 'form',
				flex : 1,
				autoScroll : true,
				defaults : {
					anchor : '100%',
				},
				items : [ {
					xtype : 'textfield',
					name : 'key',
					fieldLabel : 'Key',
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
					queryMode : 'local',
					store : 'ManufacturerStore',
					displayField : 'name',
					valueField : 'name',
					fieldLabel : 'Manufacturer',
					anchor : '100%'
				}, {
					xtype : 'combo',
					name : 'vehicleType',
					queryMode : 'local',
					store : 'VehicleTypeStore',
					displayField : 'desc',
					valueField : 'name',
					fieldLabel : 'Vehicle Type',
					anchor : '100%'
				}, {
					xtype : 'filefield',
					name : 'imageFile',
					fieldLabel : 'Image Upload',
					msgTarget : 'side',
					allowBlank : true,
					anchor : '100%',
					buttonText : 'file...'
				}, {
					xtype : 'textfield',
					name : 'birthYear',
					fieldLabel : 'BirthYear',
					anchor : '100%'
				}, {
					xtype : 'combo',
					name : 'ownershipType',
					queryMode : 'local',
					store : 'OwnershipStore',
					displayField : 'desc',
					valueField : 'name',
					fieldLabel : 'Ownership Type',
					anchor : '100%'
				}, {
					xtype : 'combo',
					name : 'status',
					queryMode : 'local',
					store : 'VehicleStatusStore',
					displayField : 'desc',
					valueField : 'status',
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
					format : 'd/m/Y',
					anchor : '100%'
				}, {
					xtype : 'datefield',
					name : 'createdAt',
					disabled : true,
					fieldLabel : 'Created At',
					format : 'd/m/Y',
					anchor : '100%'
				}, {
					xtype : 'displayfield',
					name : 'imageClip',
					hidden : true,
					listeners : {
						change : function(field, value) {
							var img = main.form.nextSibling('container').down('image');
							if(value != null && value.length > 0)
								img.setSrc('download?blob-key=' + value);
							else
								img.setSrc('resources/image/bgVehicle.png');
						}
					}
				} ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'vbox',
					align : 'stretch'	
				},
				items : [ {
					xtype : 'image',
					height : 200,
					itemId : 'image'
				} ]
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
						var form = main.form.getForm();

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
						var form = main.form.getForm();

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
						main.form.getForm().reset();
					}
				} ]
			} ]
		}
	}
});
Ext.define('GreenFleet.view.management.Reservation', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_reservation',

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
Ext.define('GreenFleet.view.management.Incident', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_incident',

	title : 'Incident',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		this.callParent(arguments);

		this.list = this.add(this.buildList(this));
		var detail = this.add(this.buildForm(this));
		this.form = detail.down('form');
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			title : 'Incident List',
			store : 'IncidentStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'incidentTime',
				text : 'Incident Time',
				xtype : 'datecolumn',
				format : 'd-m-Y H:i:s'
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
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype : 'datecolumn',
				format : 'd-m-Y H:i:s'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : 'd-m-Y H:i:s'
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
					}, {
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
				queryMode : 'local',
				store : 'VehicleStore',
				displayField : 'id',
				valueField : 'id',
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
				queryMode : 'local',
				store : 'DriverStore',
				displayField : 'id',
				valueField : 'id',
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
				tooltip : 'Find Incident',
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
			} ],
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			title : 'Incident Details',
			autoScroll : true,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [
					{
						xtype : 'form',
						flex : 1,
						autoScroll : true,
						defaults : {
							anchor : '100%'
						},
						items : [ {
							xtype : 'textfield',
							name : 'key',
							fieldLabel : 'Key',
							hidden : true
						}, {
							xtype : 'datefield',
							name : 'incidentTime',
							fieldLabel : 'Incident Time',
							submitFormat : 'U'
						}, {
							xtype : 'combo',
							name : 'vehicle',
							queryMode : 'local',
							store : 'VehicleStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : 'Vehicle'
						}, {
							xtype : 'combo',
							name : 'driver',
							queryMode : 'local',
							store : 'DriverStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : 'Driver'
						}, {
							xtype : 'textfield',
							name : 'lattitude',
							fieldLabel : 'Lattitude'
						}, {
							xtype : 'textfield',
							name : 'longitude',
							fieldLabel : 'Longitude'
						}, {
							xtype : 'textfield',
							name : 'impulse',
							fieldLabel : 'Impulse'
						}, {
							xtype : 'filefield',
							name : 'videoFile',
							fieldLabel : 'Video Upload',
							msgTarget : 'side',
							allowBlank : true,
							buttonText : 'file...'
						}, {
							xtype : 'datefield',
							name : 'updatedAt',
							disabled : true,
							fieldLabel : 'Updated At',
							format : 'd-m-Y H:i:s'
						}, {
							xtype : 'datefield',
							name : 'createdAt',
							disabled : true,
							fieldLabel : 'Created At',
							format : 'd-m-Y H:i:s'
						}, {
							xtype : 'displayfield',
							name : 'videoClip',
							hidden : true,
							listeners : {
								change : function(field, value) {
									var video = main.form.nextSibling('container').getComponent('video');
									video.update({
										value : value
									});
								}
							}
						} ]
					},
					{
						xtype : 'container',
						flex : 1,
						layout : {
							type : 'vbox',
							align : 'stretch'
						},
						items : [
								{
									xtype : 'box',
									itemId : 'video',
									tpl : [ '<video width="300" height="200" controls="controls">',
											'<source src="download?blob-key={value}" type="video/mp4" />',
											'Your browser does not support the video tag.', '</video>' ]
								}, {
									xtype : 'button',
									text : 'FullScreen(WebKit Only)',
									handler : function(button) {
										if(!Ext.isWebKit)
											return;
										var video = button.up('container').getComponent('video');
										video.getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
									}
								} ]
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
						var form = main.form.getForm();

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
						var form = main.form.getForm();

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
						main.form.getForm().reset();
					}
				} ]
			} ]
		}
	}
});
Ext.define('GreenFleet.view.management.Driver', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_driver',

	title : 'Driver',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		this.callParent(arguments);

		this.list = this.add(this.buildList(this));
		var detail = this.add(this.buildForm(this));
		this.form = detail.down('form');
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
					var form = main.form;
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
				text : 'Reset',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onReset(grid);
				}
			} ],
			rbar : [{
				xtype : 'form',
				items : [{
					xtype : 'filefield',
					name : 'file',
					fieldLabel : 'Import(CSV)',
					msgTarget : 'side',
					labelAlign : 'top',
					allowBlank : true,
					buttonText : 'file...' 
				},{
					xtype : 'button',
					text : 'Import',
					handler : function() {
						var form = main.form.getForm();

						if (form.isValid()) {
							form.submit({
								url : 'driver/import',
								success : function(form, action) {
									main.down('gridpanel').store.load();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				}]
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			itemId : 'details',
			bodyPadding : 10,
			title : 'Driver Details',
			autoScroll : true,
			layout : {
				type : 'hbox',
				align : 'stretch'	
			},
			flex : 1,
			items : [ {
				xtype : 'form',
				flex : 1,
				items : [{
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
					xtype : 'filefield',
					name : 'imageFile',
					fieldLabel : 'Image Upload',
					msgTarget : 'side',
					allowBlank : true,
					anchor : '100%',
					buttonText : 'file...'
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
				}, {
					xtype : 'displayfield',
					name : 'imageClip',
					hidden : true,
					listeners : {
						change : function(field, value) {
							var img = main.form.nextSibling('container').down('image');
							if(value != null && value.length > 0)
								img.setSrc('download?blob-key=' + value);
							else
								img.setSrc('resources/image/bgDriver.png');
						}
					}
				} ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'vbox',
					align : 'stretch'	
				},
				items : [ {
					xtype : 'image',
					height : 200,
					itemId : 'image'
				} ]
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
						var form = main.form.getForm();

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
						var form = main.form.getForm();

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
						main.form.getForm().reset();
					}
				} ]
			} ]
		}
	}
});
Ext.define('GreenFleet.view.management.Track', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_track',

	title : 'Track',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		this.callParent(arguments);

		this.list = this.add(this.buildList(this));
		this.form = this.add(this.buildForm(this));
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
					var form = main.form;
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
				text : 'Reset',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onReset(grid);
				}
			} ],
			rbar : [{
				xtype : 'form',
				items : [{
					xtype : 'filefield',
					name : 'file',
					fieldLabel : 'Import(CSV)',
					labelAlign : 'top',
					msgTarget : 'side',
					allowBlank : true,
					buttonText : 'file...' 
				},{
					xtype : 'button',
					text : 'Import',
					handler : function() {
						var form = this.up('form').getForm();

						if (form.isValid()) {
							form.submit({
								url : 'track/import',
								success : function(form, action) {
									main.down('gridpanel').store.load();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				}]
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
function Label(opt_options) {
	// Initialization
	this.setValues(opt_options);

	// Label specific
	var span = this.span_ = document.createElement('span');
	this.span_.setAttribute('class', 'mapTipID');

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

Ext.define('GreenFleet.view.monitor.Map', {
	extend : 'Ext.Container',

	alias : 'widget.monitor_map',

	title : 'Maps',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.callParent();
		
		var title = this.add({
			xtype : 'panel',
			cls :'pageTitle',
			html : '<h1>Information</h1>',
			height: 35,
			rbar : [{
				xtype : 'checkbox',
				fieldLabel : 'Markers',
				checked : true,
				boxLabelAlign : 'before',
				labelWidth : 45,
				labelSeparator : '',
				itemId : 'markers',
				scope : this,
				handler : function(field, newValue) {
					for ( var vehicle in this.markers) {
						this.markers[vehicle].setVisible(newValue);
					}
				}
			}]
		});
		this.mapbox = this.add(this.buildMap(this));
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
		mapbox.map = new google.maps.Map(mapbox.getEl().down('.map').dom, options);

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
		
		var images = {
			'Running' : 'resources/image/statusDriving.png',
			'Idle' : 'resources/image/statusStop.png',
			'Incident' : 'resources/image/statusIncident.png'
		};

		store.each(function(record) {
			var vehicle = record.get('id');
			var driver = record.get('driver');
			
			var marker = new google.maps.Marker({
				position : new google.maps.LatLng(record.get('lattitude'), record.get('longitude')),
				map : this.mapbox.map,
				icon : images[record.get('status')],
				title : vehicle,
				tooltip : vehicle + "(" + driver + ")"
			});

			var label = new Label({
				map : this.mapbox.map
			});
			label.bindTo('position', marker, 'position');
			label.bindTo('text', marker, 'tooltip');

			this.markers[vehicle] = marker;

			var mapbox = this.mapbox;
			google.maps.event.addListener(marker, 'click', function() {
				GreenFleet.getMenu('information').vehicle = record;
				GreenFleet.doMenu('information');
//				Ext.create('GreenFleet.view.vehicle.VehiclePopup', {
//					vehicle : record,
//				}).show();
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
			xtype : 'panel',
			flex : 1,
			html : '<div class="map" style="height:100%"></div>',
			listeners : {
				afterrender : function() {
					parent.displayMap(this, 37.56, 126.97);
				}
			}
		};
	}
});

Ext.define('GreenFleet.view.monitor.ControlByVehicle', {			
	extend : 'Ext.grid.Panel',

	alias : 'widget.monitor_control_by_vehicle',
	
	title : 'Control By Vehicle',
	
	store : 'ControlDataStore',
	autoScroll : true,
	
	listeners : {
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
	} ],

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
	} ]

});

Ext.define('GreenFleet.view.monitor.InfoByVehicle', {
	extend : 'Ext.grid.Panel',
	
	alias : 'widget.monitor_info_by_vehicle',
	
	title : 'Information By Vehicle',

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
	} ],
	viewConfig : {

	},
	listeners : {
		render : function(grid) {
			grid.store.load();
		},
		itemclick : function(grid, record) {
			var form = grid.up('monitor_information').down('form');
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
		text : 'Reset',
		handler : function() {
			var grid = this.up('gridpanel');
			grid.onReset(grid);
		}
	} ]

});
Ext.define('GreenFleet.view.monitor.Information', {
	extend : 'Ext.Container',
	alias : 'widget.monitor_information',

	initComponent : function() {
		this.callParent();

		var form = this.down('form');
		var driverImage = form.up().getComponent('driverImage');
		var vehicleImage = form.up().getComponent('vehicleImage');
				
		form.getComponent('id').on('change', function(field, vehicle) {
			var record = form.getRecord();
			
			var vehicleStore = Ext.getStore('VehicleStore');
			var vehicleRecord = vehicleStore.findRecord('id', record.get('id'));
			var vehicleImageClip = vehicleRecord.get('imageClip');
			if (vehicleImageClip) {
				vehicleImage.setSrc('download?blob-key=' + vehicleImageClip);
			} else {
				vehicleImage.setSrc('resources/image/bgVehicle.png');
			}

			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', record.get('driver'));
			var driverImageClip = driverRecord.get('imageClip');
			if (driverImageClip) {
				driverImage.setSrc('download?blob-key=' + driverImageClip);
			} else {
				driverImage.setSrc('resources/image/bgDriver.png');
			}

			var location = record.get('location');
			if (location == null || location.length == 0) {
				var lattitude = record.get('lattitude');
				var longitude = record.get('longitude');

				if (!lattitude || !longitude)
					return;

				var latlng = new google.maps.LatLng(lattitude, longitude);

				geocoder = new google.maps.Geocoder();
				geocoder.geocode({
					'latLng' : latlng
				}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							var address = results[0].formatted_address
							record.set('location', address);
							form.getComponent('location').setValue(address);
						}
					} else {
						console.log("Geocoder failed due to: " + status);
					}
				});
			}
		});
	},

	listeners : {
		activate : function(panel) {
			var form = panel.down('form');
			if (panel.vehicle)
				form.loadRecord(panel.vehicle);
		}
	},

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	items : [ {
		xtype : 'panel',
		cls : 'pageTitle',
		html : '<h1>Information : Vehicle ID, Driver ID</h1>',
		height : 35
	}, {
		xtype : 'container',
		height : 300,
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		items : [ {
			xtype : 'container',
			flex : 2,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			items : [ {
				xtype : 'panel',
				title : 'Vehicle Information',
				cls : 'paddingPanel',
				layout : {
					type : 'hbox'
				},
				items : [ {
					xtype : 'image',
					itemId : 'vehicleImage',
					cls : 'imgVehicle'
				}, {
					xtype : 'image',
					itemId : 'driverImage',
					cls : 'imgDriver'
				}, {
					xtype : 'form',
					height : 140,
					flex : 1,
					defaults : {
						labelWidth : 60,
						labelSeparator : '',
						anchor : '100%'
					},
					items : [ {
						xtype : 'displayfield',
						name : 'id',
						fieldLabel : 'Vehicle',
						itemId : 'id'
					}, {
						xtype : 'displayfield',
						name : 'driver',
						fieldLabel : 'Driver',
						itemId : 'driver'
					}, {
						xtype : 'displayfield',
						name : 'location',
						fieldLabel : 'Location',
						itemId : 'location'
					}, {
						xtype : 'displayfield',
						name : 'distance',
						fieldLabel : 'Run. Dist.'
					}, {
						xtype : 'displayfield',
						name : 'runningTime',
						fieldLabel : 'Run. Time'
					} ]
				} ]
			}, {
				xtype : 'panel',
				title : 'Incidents',
				layout : 'fit',
				cls : 'paddingPanel',
				height : 115,
				items : [ {
					xtype : 'container',
					layout : {
						type : 'hbox',
						align : 'left'
					},
					items : [ {
						xtype : 'box',
						cls : 'incidentThumb',
						html : '<div class="vehicle">V00001</div><div class="driver">HAHAHA001</div><div class="date">2012.01.25 23:11:15</div><div class="latitude">37.66</div>'
					}, {
						xtype : 'box',
						cls : 'incidentThumb',
						html : '<div class="vehicle">V00002</div><div class="driver">HAHAHA001</div><div class="date">2012.01.25 23:11:15</div><div class="latitude">37.66</div>'
					}, {
						xtype : 'box',
						cls : 'incidentThumb',
						html : '<div class="vehicle">V00003</div><div class="driver">HAHAHA001</div><div class="date">2012.01.25 23:11:15</div><div class="latitude">37.66</div>'
					}, {
						xtype : 'box',
						cls : 'incidentThumb',
						html : '<div class="vehicle">V00004</div><div class="driver">HAHAHA001</div><div class="date">2012.01.25 23:11:15</div><div class="latitude">37.66</div>'
					} ]
				} ]
			} ]
		}, {
			xtype : 'panel',
			title : 'Tracking Recent Driving',
			flex : 1,
			html : '<div class="map" style="height:100%"></div>',
			listeners : {
				afterrender : function() {
//					parent.displayMap(this, 37.56, 126.97);
				}
			}
		} ]
	}, {
		xtype : 'tabpanel',
		flex : 1,
		items : [ {
			xtype : 'monitor_info_by_vehicle',
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : 'Control By Vehicle'
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : 'Control By Driver'
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : 'Maintenance'
		} ]
	} ]
});

Ext.define('GreenFleet.view.monitor.IncidentView', {
	extend : 'Ext.container.Container',

	alias : 'widget.monitor_incident',

	title : 'Incident View',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.callParent(arguments);

		/*
		 * Title
		 */
		this.add({
			xtype : 'panel',
			cls : 'pageTitle',
			html : '<h1>Incident : Vehicle ID or Driver ID</h1>',
			height : 35
		});

		/*
		 * Content
		 */
		var incident = this.add({
			xtype : 'container',
			autoScroll : true,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			flex : 1
		});

		incident.add(this.buildInfo(this));
		incident.add(this.buildVideoAndMap(this));

		this.add(this.buildList(this));
	},

	buildInfo : function(main) {
		return {
			xtype : 'form',
			title : 'Incident Information.',
			height : 40,
			autoScroll : true,
			defaults : {
				anchor : '100%'
			},
			items : [ {
				xtype : 'displayfield',
				name : 'incidentTime',
				fieldLabel : 'Incident Time'
			}, {
				xtype : 'displayfield',
				name : 'vehicle',
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'displayfield',
				name : 'driver',
				fieldLabel : 'Driver'
			}, {
				xtype : 'displayfield',
				name : 'impulse',
				fieldLabel : 'Impulse'
			}, {
				xtype : 'displayfield',
				name : 'videoClip',
				hidden : true,
				listeners : {
					change : function(field, value) {
						var video = main.down('[itemId=video]');
						video.update({
							value : value
						});
					}
				}
			} ]
		};
	},

	buildVideoAndMap : function(main) {
		return {
			xtype : 'container',
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [
					{
						xtype : 'panel',
						bodyPadding : 10,
						title : 'Incident Details',
						flex : 1,
						layout : {
							type : 'vbox',
							align : 'stretch'
						},
						items : [
								{
									xtype : 'box',
									itemId : 'video',
									tpl : [ '<video width="300" height="200" controls="controls">',
											'<source src="download?blob-key={value}" type="video/mp4" />',
											'Your browser does not support the video tag.', '</video>' ]
								}, {
									xtype : 'button',
									text : 'FullScreen(WebKit Only)',
									handler : function(button) {
										if (!Ext.isWebKit)
											return;
										var video = button.previousSibling('box');
										video.getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
									}
								} ]
					}, {
						xtype : 'panel',
						title : 'Position of Incident',
						flex : 1,
						html : '<div class="map" style="height:100%"></div>',
						listeners : {
							afterrender : function() {
								// parent.displayMap(this, 37.56, 126.97);
							}
						}
					} ]
		};
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			title : 'Incident List',
			store : 'IncidentStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'incidentTime',
				text : 'Incident Time',
				xtype : 'datecolumn',
				format : 'd-m-Y H:i:s'
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
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype : 'datecolumn',
				format : 'd-m-Y H:i:s'
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : 'd-m-Y H:i:s'
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
					}, {
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
				queryMode : 'local',
				store : 'VehicleStore',
				displayField : 'id',
				valueField : 'id',
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
				queryMode : 'local',
				store : 'DriverStore',
				displayField : 'id',
				valueField : 'id',
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
				tooltip : 'Find Incident',
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
		name : 'location',
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
		name : 'key',
		type : 'string'
	}, {
		name : 'incidentTime',
		type : 'date',
		dateFormat:'time'
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
		"status" : "Running",
		"desc" : "Running"
	}, {
		"status" : "Incident",
		"desc" : "Incident"
	}, {
		"status" : "Idle",
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

	stores : [ 'CompanyStore', 'VehicleStore', 'DriverStore', 'ReservationStore', 'IncidentStore', 'TrackStore',
			'ManufacturerStore', 'VehicleTypeStore', 'OwnershipStore', 'VehicleStatusStore', 'ControlDataStore' ],
	models : [],
	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 'SideMenu',
			'management.Company', 'management.Vehicle', 'management.Reservation', 'management.Incident',
			'management.Driver', 'management.Track', 'management.ControlData', 'monitor.Map',
			'monitor.ControlByVehicle', 'monitor.InfoByVehicle', 'monitor.Information', 'monitor.IncidentView' ],

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


