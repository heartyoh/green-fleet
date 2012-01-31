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

	getMenu : function(menu) {
		return Ext.getCmp('content').getComponent(menu);
	},
	
	doMenu : function(menu) {
		var content = Ext.getCmp('content');
		content.getLayout().setActiveItem(content.getComponent(menu));
	}
});

Ext.define('GreenFleet.mixin.State', function() {
	return {
		show_running_vehicle : true,
		show_idle_vehicle : true,
		show_incident_vehicle : true
	};
}());
Ext.define('GreenFleet.mixin.SubItem', function() {
	Ext.Container.implement({
		sub : function(id) {
			if(!this.subitems)
				this.subitems = {};
			if(!this.subitems[id])
				this.subitems[id] = this.down('[itemId=' + id + ']');
			return this.subitems[id];
		}
	});

	return {
	};
}());
Ext.define('GreenFleet.mixin.Import', function() {
	function importFile() {
		var contentContainer = Ext.getCmp('content');
		var view = contentContainer.getLayout().getActiveItem();
		if (view.importUrl) {
			Ext.create('GreenFleet.view.common.ImportPopup', {
				importUrl : view.importUrl,
				client : view
			}).show();
		}
	}

	return {
		importData : importFile
	};
}());
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
			if (panel !== this)
				return;

			var menutab = Ext.getCmp('menutab');
			menutab.add({
				text : item.title,
				itemId : item.itemId,
				tooltip : item.title,
				handler : function(tab) {
					var content = Ext.getCmp('content');
					var comp = content.getComponent(tab.itemId);
					content.getLayout().setActiveItem(comp);
				},
				closable : false
			}).setCard(item);
		},
		remove : function(panel, item) {
			if (panel !== this)
				return;

			var menutab = Ext.getCmp('menutab');
			menutab.remove(item.itemId);
		}
	},

	defaults : {
		listeners : {
			activate : function(item) {
				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
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
			height : 23
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
		html : 'import',
		handler : function() {
			GreenFleet.importData();
		}
	}, {
		xtype : 'button',
		cls : 'btnSave',
		html : 'save'
	}, {
		xtype : 'button',
		cls : 'btnExport',
		html : 'export',
		
	} ]
});
Ext.define('GreenFleet.view.viewport.East', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.east',
	
	id : 'east',
	
	cls : 'summaryBoard',
	
	width : 200,

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.callParent();
		
		var self = this;
		
		this.sub('state_running').on('click', function() {
			GreenFleet.show_running_vehicle = true;
			if(GreenFleet.show_idle_vehicle) {
				GreenFleet.show_idle_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
			} else {
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
			}
		});
		
		this.sub('state_idle').on('click', function() {
			GreenFleet.show_idle_vehicle = true;
			if(GreenFleet.show_incident_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
			}
		});
		
		this.sub('state_incident').on('click', function() {
			GreenFleet.show_incident_vehicle = true;
			if(GreenFleet.show_running_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_idle_vehicle = false;
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_idle_vehicle = true;
			}
		});
		
		setInterval(function() {
			self.sub('time').update(Ext.Date.format(new Date(), 'D Y-m-d H:i:s'));
		}, 1000);
		
		this.on('afterrender', function() {
			Ext.getStore('RecentIncidentStore').on('load', self.refreshIncidents, self);
			Ext.getStore('RecentIncidentStore').load();
		});
	},
	
	refreshVehicleCounts : function() {
		var store = Ext.getStore('VehicleStore');
		
		var total = store.count();
		
		var running = 0;
		var idle = 0;
		var incident = 0;

		store.each(function(record) {
			switch(record.get('status')) {
			case 'Running' :
				running++;
				break;
			case 'Idle' :
				idle++;
				break;
			case 'Incident' :
				incident++;
				break;
			}
		});
		
		this.sub('state_running').update('Driving</br><span>' + running + '</span>');
		this.sub('state_idle').update('Idle</br><span>' + idle + '</span>');
		this.sub('state_incident').update('Incident</br><span>' + incident + '</span>');
		this.sub('vehicle_count').update('Total Running Vehicles : ' + total);
	},
	
	refreshIncidents : function(store) {
		if(!store)
			store = Ext.getStore('RecentIncidentsStore');
		
		this.sub('incidents').removeAll();
		
		var count = store.count() > 5 ? 5 : store.count();
		
		for(var i = 0;i < count;i++) {
			var incident = store.getAt(i);
			
			this.sub('incidents').add({
				xtype : 'button',
				listeners : {
					click : function(button) {
						GreenFleet.doMenu('monitor_incident');
						GreenFleet.getMenu('monitor_incident').setIncident(button.incident, true);
					}
				},
				incident : incident,
				html : '<a href="#">' + incident.get('vehicle') + ', ' + incident.get('driver') + '<span>' + 
					Ext.Date.format(incident.get('incidentTime'), 'D Y-m-d H:i:s') + '</span></a>'
			});
		}
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
		xtype : 'box',
		cls : 'count',
		itemId : 'vehicle_count',
		html : 'Total Running Vehicles : 0'
	}, {
		xtype : 'panel',
		title : '상황별 운행 현황',
		cls : 'statusPanel',
		items : [ {
			xtype : 'button',
			itemId : 'state_running',
			flex : 1,
			cls : 'btnDriving'
		}, {
			xtype : 'button',
			itemId : 'state_idle',
			flex : 1,
			cls : 'btnStop'
		}, {
			xtype : 'button',
			itemId : 'state_incident',
			flex : 1,
			cls : 'btnIncident'
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
		itemId : 'incidents',
		cls : 'incidentPanel'
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

	defaults : {
		handler : function(button) {
			var content = Ext.getCmp('content');
			var closables = content.query('[closable=true]');
			for ( var i = 0; i < closables.length; i++) {
				content.remove(closables[i]);
			}
			
			var first = null;
			for(i = 0;i < button.submenus.length;i++) {
				button.submenus[i]['listeners'] = {
					activate : function(item) {
						var menutab = Ext.getCmp('menutab');
						var tab = menutab.getComponent(item.itemId);

						menutab.setActiveTab(tab);
					}
				};
				var item = content.add(button.submenus[i]);
				first = first || item;
			}
			
			if(first)
				GreenFleet.doMenu(first.itemId);
		}
	},
	
	items : [ {
		text : 'Dashboard',
		submenus : [ {
			title : 'File',
			xtype : 'filemanager',
			itemId : 'filemanager',
			closable : true
		} ]
	}, {
		text : 'Company',
		submenus : [ {
			title : T('company'),
			xtype : 'management_company',
			itemId : 'company',
			closable : true
		} ]
	}, {
		text : 'Vehicle',
		submenus : [ {
			title : T('vehicle'),
			xtype : 'management_vehicle',
			itemId : 'vehicle',
			closable : true
		}, {
			title : T('incident'),
			xtype : 'management_incident',
			itemId : 'incident',
			closable : true
		}, {
			title : T('track'),
			xtype : 'management_track',
			itemId : 'track',
			closable : true
		}, {
			title : 'ControlData',
			xtype : 'management_control_data',
			itemId : 'control_data',
			closable : true
		} ]
	}, {
		text : T('employee'),
		submenus : [ {
			title : 'Driver',
			xtype : 'management_driver',
			itemId : 'driver',
			closable : true
		} ]
	}, {
		text : T('terminal'),
		submenus : [ {
			title : 'Terminal',
			xtype : 'management_terminal',
			itemId : 'terminal',
			closable : true
		} ]
	}, {
		text : 'Reservation',
		submenus : [ {
			title : 'Reservation',
			xtype : 'management_reservation',
			itemId : 'reservation',
			closable : true
		} ]
	}, {
		text : 'Maintenance',
		submenus : []
	} ]
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
	} ]
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
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
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
				format: F('datetime'),
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				format: F('datetime'),
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
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
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

	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'vehicle/import',
	
	afterImport : function() {
		this.down('gridpanel').store.load();
		this.form.getForm().reset();
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
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
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
					format : F('datetime'),
					anchor : '100%'
				}, {
					xtype : 'datefield',
					name : 'createdAt',
					disabled : true,
					fieldLabel : 'Created At',
					format : F('datetime'),
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
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
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
Ext.define('GreenFleet.view.management.Terminal', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_terminal',

	title : 'Terminal',

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

	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'terminal/import',
	
	afterImport : function() {
		this.down('gridpanel').store.load();
		this.form.getForm().reset();
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			title : 'Terminal List',
			store : 'TerminalStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'Employee Id',
				type : 'string'
			}, {
				dataIndex : 'serialNo',
				text : 'Serial No.',
				type : 'string'
			}, {
				dataIndex : 'buyingDate',
				text : 'Buying Date',
				xtype : 'datecolumn',
				format : F('date')
			}, {
				dataIndex : 'comment',
				text : 'Comment',
				type : 'string',
				width : 160
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
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
				var serialNoFilter = grid.down('textfield[name=serialNoFilter]');
				grid.store.clearFilter();
				
				grid.store.filter([ {
					property : 'id',
					value : idFilter.getValue()
				}, {
					property : 'serialNo',
					value : serialNoFilter.getValue()
				} ]);
			},
			onReset : function(grid) {
				grid.down('textfield[name=idFilter]').setValue('');
				grid.down('textfield[name=serialNoFilter]').setValue('');
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
				name : 'serialNoFilter',
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
				tooltip : 'Find Terminal',
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
			xtype : 'panel',
			itemId : 'details',
			bodyPadding : 10,
			title : 'Terminal Details',
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
					name : 'id',
					fieldLabel : 'Terminal Id',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'serialNo',
					fieldLabel : 'Serial No.',
					anchor : '100%'
				}, {
					xtype : 'datefield',
					name : 'buyingDate',
					fieldLabel : 'Buying Date',
					anchor : '100%',
					format : F('date'),
					submitFormat : 'U'
				}, {
					xtype : 'textarea',
					name : 'comment',
					fieldLabel : 'Comment',
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
					format: F('datetime'),
					anchor : '100%'
				}, {
					xtype : 'datefield',
					name : 'createdAt',
					disabled : true,
					fieldLabel : 'Created At',
					format: F('datetime'),
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
								img.setSrc('resources/image/bgTerminal.png');
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
								url : 'terminal/save',
								headers: {'Content-Type':'multipart/form-data; charset=UTF-8'},
								success : function(form, action) {
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
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
								url : 'terminal/delete',
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
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'ID',
				type : 'string'
			}, {
				dataIndex : 'reservedDate',
				text : 'Reserved Date',
				type : 'string',
				format : F('date')
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
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
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
			items : [{
				xtype : 'textfield',
				name : 'key',
				fieldLabel : 'Key',
				anchor : '100%',
				hidden : true
			}, {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'Reservation ID',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'reservedDate',
				disabled : true,
				fieldLabel : 'Reserved Date',
				format : F('date'),
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
				format: F('datetime'),
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				format: F('datetime'),
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
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
								},
								failure : function(form, action) {
									console.log(action);
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
				format : F('datetime')
			}, {
				dataIndex : 'driver',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'vehicle',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'terminal',
				text : 'Terminal',
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
				dataIndex : 'impulseThreshold',
				text : 'Impulse Threshold',
				type : 'number'
			}, {
				dataIndex : 'obdConnected',
				text : 'OBD Connected',
				type : 'boolean'
			}, {
				dataIndex : 'engineTemp',
				text : 'Engine Temp.',
				type : 'number'
			}, {
				dataIndex : 'engineTempThreshold',
				text : 'Engine Temp. Threshold',
				type : 'number'
			}, {
				dataIndex : 'remainingFuel',
				text : 'Remaining Fuel',
				type : 'number'
			}, {
				dataIndex : 'fuelThreshold',
				text : 'Fuel Threshold',
				type : 'number'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype : 'datecolumn',
				format : F('datetime')
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : F('datetime')
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
							xtype : 'combo',
							name : 'terminal',
							queryMode : 'local',
							store : 'TerminalStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : 'Terminal'
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
							xtype : 'textfield',
							name : 'impulseThreshold',
							fieldLabel : 'Impulse Threshold'
						}, {
							xtype : 'checkbox',
							name : 'obdConnected',
							fieldLabel : 'OBD Connected'
						}, {
							xtype : 'textfield',
							name : 'engineTemp',
							fieldLabel : 'Engine Temp.'
						}, {
							xtype : 'textfield',
							name : 'engineTempThreshold',
							fieldLabel : 'Engine Temp. Threshold'
						}, {
							xtype : 'textfield',
							name : 'remainingFuel',
							fieldLabel : 'Remaining Fuel'
						}, {
							xtype : 'textfield',
							name : 'fuelThreshold',
							fieldLabel : 'Fuel Threshhold'
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
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
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

	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'driver/import',
	
	afterImport : function() {
		this.down('gridpanel').store.load();
		this.form.getForm().reset();
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
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
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
					format: F('datetime'),
					anchor : '100%'
				}, {
					xtype : 'datefield',
					name : 'createdAt',
					disabled : true,
					fieldLabel : 'Created At',
					format: F('datetime'),
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
								headers: {'Content-Type':'multipart/form-data; charset=UTF-8'},
								success : function(form, action) {
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
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

	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'track/import',
	
	afterImport : function() {
		this.down('gridpanel').store.load();
		this.form.getForm().reset();
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
				format:F('datetime'),
				width : 120
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
				format: F('datetime'),
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
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
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
				format:F('date')
			}, {
				dataIndex : 'startTime',
				text : 'Start Time',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'endTime',
				text : 'End Time',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
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
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
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
				format: F('date'),
				submitFormat : 'U',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'startTime',
				fieldLabel : 'Start Time',
				format: F('datetime'),
				submitFormat : 'U',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'endTime',
				fieldLabel : 'End Time',
				format: F('datetime'),
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
				format: F('datetime'),
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'updatedAt',
				disabled : true,
				fieldLabel : 'Updated At',
				format: F('datetime'),
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
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
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
Ext.define('GreenFleet.view.monitor.Map', {
	extend : 'Ext.Container',

	alias : 'widget.monitor_map',

	title : 'Maps',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [ this.ztitle, this.zmap ];
		
		this.callParent();
		
		var self = this;
		
		this.on('afterrender', function() {
			var vehicleStore = Ext.getStore('VehicleStore');
			vehicleStore.on('load', self.refreshMap, self);
			vehicleStore.on('load', Ext.getCmp('east').refreshVehicleCounts, Ext.getCmp('east'));
			vehicleStore.load();
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
			if(self.sub('autofit').getValue())
				self.refreshMap(Ext.getStore('VehicleStore'));
		});
		
		Ext.getCmp('east').sub('state_running').on('click', function() {
			self.refreshMarkers();
		});
		
		Ext.getCmp('east').sub('state_idle').on('click', function() {
			self.refreshMarkers();
		});
		
		Ext.getCmp('east').sub('state_incident').on('click', function() {
			self.refreshMarkers();
		});

		this.sub('autofit').on('change', function(check, newValue) {
			if(newValue)
				self.refreshMap(Ext.getStore('VehicleStore'));
		});
	},
	
	refreshMarkers : function() {
		var markers = this.getMarkers();
		var labels = this.getLabels();
		
		for (var vehicle in markers) {
			var marker = markers[vehicle];
			var label = labels[vehicle]; 

			switch(marker.status) {
			case 'Running' :
				marker.setVisible(GreenFleet.show_running_vehicle);
				label.setVisible(GreenFleet.show_running_vehicle);
				break;
			case 'Idle' :
				marker.setVisible(GreenFleet.show_idle_vehicle);
				label.setVisible(GreenFleet.show_idle_vehicle);
				break;
			case 'Incident' :
				marker.setVisible(GreenFleet.show_incident_vehicle);
				label.setVisible(GreenFleet.show_incident_vehicle);
				break;
			}
		}
	},
	
	getMap : function() {
		if(!this.map) {
			this.map = new google.maps.Map(this.sub('mapbox').getEl().down('.map').dom, {
				zoom : 10,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			});
		}
		return this.map;
	},
	
	getMarkers : function() {
		if(!this.markers)
			this.markers = {};
		return this.markers;
	},
	
	getLabels : function() {
		if(!this.labels)
			this.labels = {};
		return this.labels;
	},
	
	resetLabels : function() {
		for ( var vehicle in this.labels) {
			this.labels[vehicle].setMap(null);
		}
		this.labels = {};
	},
	
	resetMarkers : function() {
		for ( var vehicle in this.markers) {
			google.maps.event.clearListeners(this.markers[vehicle]);
			this.markers[vehicle].setMap(null);
		}
		this.markers = {};
	},
	
	/*
	 * refreshMap : scope
	 */
	refreshMap : function(store) {
		this.resetMarkers();
		this.resetLabels();
		
		var images = {
			'Running' : 'resources/image/statusDriving.png',
			'Idle' : 'resources/image/statusStop.png',
			'Incident' : 'resources/image/statusIncident.png'
		};

		var bounds;
		
		store.each(function(record) {
			var vehicle = record.get('id');
			var driver = record.get('driver');
			var driverRecord = Ext.getStore('DriverStore').findRecord('id', driver);
			
			var latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
			
			var marker = new google.maps.Marker({
				position : latlng,
				map : this.getMap(),
				status : record.get('status'),
				icon : images[record.get('status')],
				title : driverRecord ? driverRecord.get('name') : driver,
				tooltip : record.get('registrationNumber') + "(" + (driverRecord ? driverRecord.get('name') : driver) + ")"
			});

			if(!bounds)
				bounds = new google.maps.LatLngBounds(latlng, latlng);
			else
				bounds.extend(latlng);
			
			var label = new Label({
				map : this.getMap()
			});
			label.bindTo('position', marker, 'position');
			label.bindTo('text', marker, 'tooltip');

			this.getMarkers()[vehicle] = marker;
			this.getLabels()[vehicle] = label;

			google.maps.event.addListener(marker, 'click', function() {
				GreenFleet.doMenu('information');
				GreenFleet.getMenu('information').setVehicle(record);
			});
		}, this);
		
		if(!bounds || bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(new google.maps.LatLng(System.props.lattitude, System.props.longitude));
		} else {
			this.getMap().fitBounds(bounds);
		}

		this.refreshMarkers();
	},
	
	ztitle : {
		xtype : 'container',
		cls :'pageTitle',
		height: 35,
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		items : [{
			flex : 1,
			html : '<h1>Information</h1>'
		}, {
			xtype : 'checkboxgroup',
			width : 80,
			defaults : {
				boxLabelAlign : 'before',
				width : 80,
				checked : true,
				labelWidth : 50,
				labelSeparator : ''
			},
			items : [{
				fieldLabel : 'Autofit',
				itemId : 'autofit'
			}]
		}]
	},
	
	zmap : {
		xtype : 'panel',
		flex : 1,
		itemId : 'mapbox',
		html : '<div class="map" style="height:100%"></div>'
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
		format : F('datetime'),
		width : 120
	}, {
		dataIndex : 'updatedAt',
		text : 'Updated At',
		xtype:'datecolumn',
		format : F('datetime'),
		width : 120
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
		hidden : true
	}, {
		dataIndex : 'id',
		text : 'Vehicle Id'
	}, {
		dataIndex : 'registrationNumber',
		text : 'RegistrationNumber'
	}, {
		dataIndex : 'manufacturer',
		text : 'Manufacturer'
	}, {
		dataIndex : 'vehicleType',
		text : 'VehicleType',
		width : 80
	}, {
		dataIndex : 'birthYear',
		text : 'BirthYear',
		width : 40,
		align : 'right'
	}, {
		dataIndex : 'ownershipType',
		text : 'OwnershipType',
		width : 40,
		align : 'center'
	}, {
		dataIndex : 'status',
		text : 'Status',
		type : 'string',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'imageClip',
		text : 'ImageClip',
		type : 'string',
		hidden : true
	}, {
		dataIndex : 'totalDistance',
		text : 'TotalDistance',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'remainingFuel',
		text : 'RemainingFuel',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'distanceSinceNewOil',
		text : 'DistanceSinceNewOil',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'engineOilStatus',
		text : 'EngineOilStatus',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'fuelFilterStatus',
		text : 'FuelFilterStatus',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'brakeOilStatus',
		text : 'BrakeOilStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'brakePedalStatus',
		text : 'BrakePedalStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'coolingWaterStatus',
		text : 'CoolingWaterStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'timingBeltStatus',
		text : 'TimingBeltStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'sparkPlugStatus',
		text : 'SparkPlugStatus',
		width : 60,
		align : 'center'
	}, {
		dataIndex : 'lattitude',
		text : 'Lattitude',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'longitude',
		text : 'Longitude',
		width : 60,
		align : 'right'
	}, {
		dataIndex : 'createdAt',
		text : 'Created At',
		xtype:'datecolumn',
		format : F('datetime'),
		width : 120
	}, {
		dataIndex : 'updatedAt',
		text : 'Updated At',
		xtype:'datecolumn',
		format : F('datetime'),
		width : 120
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
	
	id : 'monitor_information',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [this.ztitle, {
			xtype : 'container',
			height : 300,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ {
				xtype : 'container',
				width : 620,
				layout : {
					type : 'vbox',
					align : 'stretch'
				},
				items : [ this.zvehicleinfo, this.zincidents ]
			}, this.zmap ]
		}, this.ztabpanel];
		
		this.callParent();

		var self = this;
		
		this.sub('map').on('afterrender', function(mapbox) {
			var options = {
				zoom : 10,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.setMap(new google.maps.Map(mapbox.getEl().down('.map').dom, options));

			/*
			 * For test only.
			 */
			google.maps.event.addListener(self.getMap(), 'click', function(e) {
				Ext.Ajax.request({
					url : 'track/save',
					method : 'POST',
					params : {
						vehicle : self.getVehicle(),
						driver : self.getDriver(),
						lattitude : e.latLng.lat(),
						longitude : e.latLng.lng()
					},
					success : function(resp, opts) {
						var path = self.getTrackLine().getPath();
						path.insertAt(0, e.latLng);
						Ext.getStore('VehicleStore').load();
					},
					failure : function(resp, opts) {
						console.log('Failed');
						console.log(resp);
					}
				});
			});
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
		});
		
		this.getTrackStore().on('load', function() {
			self.refreshTrack();
		});
		
		this.getIncidentStore().on('load', function() {
			if(self.isVisible(true))
				self.refreshIncidents();
		});
		
		this.sub('id').on('change', function(field, vehicle) {
			var record = self.getForm().getRecord();
			
			/*
			 * Get Vehicle Information (Image, Registration #, ..) from VehicleStore
			 */
			var vehicleStore = Ext.getStore('VehicleStore');
			var vehicleRecord = vehicleStore.findRecord('id', record.get('id'));
			var vehicleImageClip = vehicleRecord.get('imageClip');
			if (vehicleImageClip) {
				self.sub('vehicleImage').setSrc('download?blob-key=' + vehicleImageClip);
			} else {
				self.sub('vehicleImage').setSrc('resources/image/bgVehicle.png');
			}
			
			self.sub('title').vehicle.dom.innerHTML = vehicle + '[' + vehicleRecord.get('registrationNumber') + ']';
			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', record.get('driver'));
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('imageClip');
			if (driverImageClip) {
				self.sub('driverImage').setSrc('download?blob-key=' + driverImageClip);
			} else {
				self.sub('driverImage').setSrc('resources/image/bgDriver.png');
			}

			self.sub('title').driver.dom.innerHTML = driver + '[' + driverRecord.get('name') + ']';

			/*
			 * Get Address of the location by ReverseGeoCode.
			 */
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
							self.sub('location').setValue(address);
						}
					} else {
						console.log("Geocoder failed due to: " + status);
					}
				});
			}

			/*
			 * TrackStore瑜��ㅼ� 濡����
			 */
			// TODO ��� ��낫 ���媛����(�뱀� 二쇳�遺�� 蹂댁�湲���� �쇱� ��낫瑜��ㅼ����濡���� �대��쇱�留����留��.)
			self.getTrackStore().clearFilter(true);
			self.getTrackStore().filter('vehicle', vehicle); 
			self.getTrackStore().load();
			
			/*
			 * IncidentStore瑜��ㅼ� 濡����
			 */
			self.getIncidentStore().clearFilter(true);
			self.getIncidentStore().filter('vehicle', vehicle);
			self.getIncidentStore().load();
		});
	},
	
	setVehicle : function(vehicleRecord) {
		this.getForm().loadRecord(vehicleRecord);
	},
	
	getForm : function() {
		if(!this.form)
			this.form = this.down('form');
		return this.form;
	},
	
	getMap : function() {
		return this.map;
	},
	
	setMap : function(map) {
		this.map = map;
	},
	
	getTrackLine : function() {
		return this.trackline;
	},
	
	setTrackLine : function(trackline) {
		if(this.trackline)
			this.trackline.setMap(null);
		this.trackline = trackline;
	},
	
	getMarker : function() {
		return this.marker;
	},
	
	setMarker : function(marker) {
		if(this.marker)
			this.marker.setMap(null);
		this.marker = marker;
	},
	
	resetMarkers : function() {
		if(this.markers)
			this.markers.setMap(null);
		this.markers = null;
	},
	
	getTrackStore : function() {
		if(!this.trackStore)
			this.trackStore = Ext.getStore('TrackByVehicleStore');
		return this.trackStore;
	},

	getIncidentStore : function() {
		if(!this.incidentStore)
			this.incidentStore = Ext.getStore('IncidentStore');
		return this.incidentStore;
	},
	
	getVehicle : function() {
		return this.sub('id').getValue();
	},
	
	getDriver : function() {
		return this.sub('driver').getValue();
	},
	
	refreshTrack : function() {
		this.setTrackLine(new google.maps.Polyline({
			map : this.getMap(),
		    strokeColor: '#770000',
		    strokeOpacity: 0.7,
		    strokeWeight: 4
		}));
		this.setMarker(null);

		var path = this.getTrackLine().getPath();
		var bounds;
		var latlng;

		this.getTrackStore().each(function(record) {
			latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
			path.push(latlng);
			if(!bounds)
				bounds = new google.maps.LatLngBounds(latlng, latlng);
			else
				bounds.extend(latlng);
		});
		
		if(!bounds) {
			var defaultLatlng = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
			bounds = new google.maps.LatLngBounds(defaultLatlng, defaultLatlng);
		}
		
		if(bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else {
			this.getMap().fitBounds(bounds);
		}

		var first = this.getTrackStore().first(); 
		if(first) {
			this.setMarker(new google.maps.Marker({
			    position: new google.maps.LatLng(first.get('lattitude'), first.get('longitude')),
			    map: this.getMap()
			}));
		}
	},
	
	incidentHandler : function(e, el, incident) {
		GreenFleet.doMenu('monitor_incident');
		GreenFleet.getMenu('monitor_incident').setIncident(incident, true);
	},
	
	refreshIncidents : function() {
		this.sub('incidents').removeAll();
		var max = this.getIncidentStore().count() > 4 ? 4 : this.getIncidentStore().count();
		for(var i = 0;i < max;i++) {
			var incident = this.getIncidentStore().getAt(i);
			var self = this;
			this.sub('incidents').add({
				xtype : 'box',
				cls : 'incidentThumb',
				listeners : {
					'render' : function() {
						this.getEl().on('click', self.incidentHandler, self, incident);
					}
				},
				html : '<div class="vehicle">' + 
					incident.get('vehicle') + 
					'</div><div class="driver">' + 
					incident.get('driver') + 
					'</div><div class="date">' + 
					Ext.Date.format(incident.get('incidentTime'), 'Y-m-d H:i:s') +
					'</div>'
			})
		}
	},

	ztitle : {
		xtype : 'box',
		cls : 'pageTitle',
		itemId : 'title',
		renderSelectors : {
			vehicle : 'span.vehicle',
			driver : 'span.driver'
		},
		renderTpl : '<h1>Vehicle : <span class="vehicle">Vehicle</span>, Driver : <span class="driver">Driver</span></h1>',
		height : 35
	},
	
	ztabpanel : {
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
	},
	
	zvehicleinfo : {
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
	},
	
	zincidents : {
		xtype : 'panel',
		title : 'Incidents',
		layout : 'fit',
		cls : 'paddingPanel',
		height : 115,
		items : [ {
			xtype : 'container',
			itemId : 'incidents',
			layout : {
				type : 'hbox',
				align : 'left'
			}
		} ]
	},
	
	zmap : {
		xtype : 'panel',
		title : 'Tracking Recent Driving',
		cls : 'paddingPanel backgroundGray borderLeftGray',
		itemId : 'map',
		flex : 1,
		html : '<div class="map"></div>'
	}
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
		this.items = [{
			xtype : 'container',
			autoScroll : true,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			flex : 1,
			items : [this.zInfo, this.zVideoAndMap]
		}, this.zList];
		
		this.callParent(arguments);

		/*
		 * Content
		 */

		var self = this;
		
		this.sub('map').on('afterrender', function() {
			var options = {
				zoom : 10,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.map = new google.maps.Map(self.sub('map').getEl().down('.map').dom, options);
		});
		
		this.on('activate', function(comp) {
			google.maps.event.trigger(self.getMap(), 'resize');
		});
		
		this.down('button[itemId=search]').on('click', function() {
			self.refreshIncidentList();
		});
		
		this.down('button[itemId=reset]').on('click', function() {
			self.resetIncidentList();
		});
		
		this.down('displayfield[name=videoClip]').on('change', function(field, value) {
			self.sub('video').update({
				value : value
			});
		});
		
		this.down('datefield[name=incidentTime]').on('change', function(field, value) {
			self.sub('incident_time').setValue(Ext.Date.format(value, 'D Y-m-d H:i:s'));
		});
		
		this.down('displayfield[name=driver]').on('change', function(field, value) {
			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', value);
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('imageClip');
			if (driverImageClip) {
				self.sub('driverImage').setSrc('download?blob-key=' + driverImageClip);
			} else {
				self.sub('driverImage').setSrc('resources/image/bgDriver.png');
			}
		});

		this.sub('driverFilter').on('specialkey', function(fleld, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			};
		});
		
		this.sub('vehicleFilter').on('specialkey', function(field, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			};
		});

		this.sub('grid').on('itemclick', function(grid, record) {
			self.setIncident(record, false);
		});
		
		this.sub('fullscreen').on('afterrender', function(comp) {
			comp.getEl().on('click', function() {
				if (!Ext.isWebKit)
					return;
				self.sub('video').getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
			});
		});
	},
	
	setIncident : function(incident, refresh) {
		this.incident = incident;
		if(refresh) {
			this.sub('vehicleFilter').setValue(incident.get('vehicle'));
			this.sub('driverFilter').reset();
			this.refreshIncidentList();
		}
		
		this.sub('incident_form').loadRecord(incident);
		this.refreshMap();
	},
	
	getIncident : function() {
		return this.incident;
	},
	
	refreshIncidentList : function() {
		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle',
				value : this.sub('vehicleFilter').getValue()
			}, {
				property : 'driver',
				value : this.sub('driverFilter').getValue()
			} ]
		});
	},
	
	resetIncidentList : function() {
		this.sub('vehicleFilter').reset();
		this.sub('driverFilter').reset();
		
		this.refreshIncidentList();
	},
	
	getMarker : function() {
		return this.marker;
	},
	
	setMarker : function(marker) {
		if(this.marker)
			this.marker.setMap(null);
		this.marker = marker;
	},
	
	refreshMap : function() {
		this.setMarker(null);
		
		var incident = this.getIncident();
		var location = null;
		if(!incident)
			location = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
		else
			location = new google.maps.LatLng(incident.get('lattitude'), incident.get('longitude'));
		
		this.getMap().setCenter(location);

		if(incident) {
			this.setMarker(new google.maps.Marker({
			    position: location,
			    map: this.getMap()
			}));
		}
	},
	
	getMap : function() {
		return this.map;
	},
	
	zInfo : {
		xtype : 'form',
		itemId : 'incident_form',
		cls : 'incidentSummary',
		height: 50,
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		autoScroll : true,
		defaults : {
			anchor : '100%',
			labelAlign : 'top',
			cls : 'summaryCell'
		},
		items : [ {
			xtype : 'image',
			itemId : 'driverImage',
			cls : 'imgDriverSmall',
			height: 37
		},{
			xtype : 'datefield',
			name : 'incidentTime',
			hidden : true,
			fieldLabel : 'Incident Time'
		},{
			xtype : 'displayfield',
			itemId : 'incident_time',
			width : 160,
			fieldLabel : 'Incident Time'
		}, {
			xtype : 'displayfield',
			name : 'vehicle',
			width : 100,
			fieldLabel : 'Vehicle'
		}, {
			xtype : 'displayfield',
			name : 'driver',
			width : 100,
			fieldLabel : 'Driver'
		}, {
			xtype : 'displayfield',
			name : 'impulse',
			width : 100,
			fieldLabel : 'Impulse'
		}, {
			xtype : 'displayfield',
			name : 'engineTemp',
			width : 100,
			fieldLabel : 'Engine Temp.'
		}, {
			xtype : 'displayfield',
			name : 'remainingFuel',
			width : 100,
			fieldLabel : 'Remaining Fuel'
		}, {
			xtype : 'displayfield',
			name : 'videoClip',
			hidden : true
		} ]
	},

	zVideoAndMap : {
		xtype : 'container',
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		flex : 1,
		items : [
				{
					xtype : 'panel',
					title : 'Incident Details',
					cls : 'paddingPanel incidentVOD',
					flex : 1,
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					items : [
							{
								xtype : 'box',
								itemId : 'fullscreen',
								html : '<div class="btnFullscreen"></div>'
							}, {
								xtype : 'box',
								cls : ' incidentDetail',
								itemId : 'video',
								tpl : [ '<video width="100%" height="95%" controls="controls">',
										'<source src="download?blob-key={value}" type="video/mp4" />',
										'Your browser does not support the video tag.', '</video>' ]
							} ]
				}, {
					xtype : 'panel',
					title : 'Position of Incident',
					cls : 'paddingPanel backgroundGray borderLeftGray',
					flex : 1,
					itemId : 'map',
					html : '<div class="map"></div>'
				} ]
	},

	zList : {
		xtype : 'gridpanel',
		itemId : 'grid',
		cls : 'hIndexbar',
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
			width : 120,
			format : 'd-m-Y H:i:s'
		}, {
			dataIndex : 'driver',
			text : 'Driver',
			type : 'string',
			width : 80
		}, {
			dataIndex : 'vehicle',
			text : 'Vehicle',
			type : 'string',
			width : 80
		}, {
			dataIndex : 'lattitude',
			text : 'Lattitude',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'longitude',
			text : 'Longitude',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse',
			text : 'Impulse',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulseThreshold',
			text : 'Impulse Threshold',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'obdConnected',
			text : 'OBD Connected',
			type : 'boolean',
			width : 80
		}, {
			dataIndex : 'engineTemp',
			text : 'Engine Temp.',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'engineTempThreshold',
			text : 'Engine Temp. Threshold',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'remainingFuel',
			text : 'Remaining Fuel',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'fuelThreshold',
			text : 'Fuel Threshold',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'createdAt',
			text : 'Created At',
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'updatedAt',
			text : 'Updated At',
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		} ],
		viewConfig : {
		},
		tbar : [ {
			xtype : 'combo',
			queryMode : 'local',
			store : 'VehicleStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : 'Vehicle',
			itemId : 'vehicleFilter',
			width : 200
		}, {
			xtype : 'combo',
			queryMode : 'local',
			store : 'DriverStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : 'Driver',
			itemId : 'driverFilter',
			width : 200
		}, {
			xtype : 'button',
			itemId : 'search',
			text : 'Search',
			tooltip : 'Find Incident'
		}, {
			xtype : 'button',
			itemId : 'reset',
			text : 'Reset'
		} ]
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

	autoLoad : false,
	
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
		type : 'int'
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
		type : 'float'
	}, {
		name : 'remainingFuel',
		type : 'float'
	}, {
		name : 'distanceSinceNewOil',
		type : 'float'
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
		name : 'key',
		type : 'string'
	}, {
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
		name : 'deliveryPlace',
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

	remoteFilter : true,
	
	remoteSort : true,
	
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
		name : 'terminal',
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
		name : 'impulseThreshold',
		type : 'float'
	}, {
		name : 'obdConnected',
		type : 'boolean'
	}, {
		name : 'engineTemp',
		type : 'float'
	}, {
		name : 'engineTempThreshold',
		type : 'float'
	}, {
		name : 'remainingFuel',
		type : 'float'
	}, {
		name : 'fuelThreshold',
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
	
	remoteFilter : true,
	
	remoteSort : true,
	
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
		dateFormat:'time'
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
Ext.define('GreenFleet.store.TrackByVehicleStore', {
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
		dateFormat : 'time'
	} ],

	sorters : [ {
		property : 'createdAt',
		direction : 'DESC'
	} ],

	proxy : {
		type : 'ajax',
		url : 'track',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.RecentIncidentStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	remoteFilter : true,
	
	remoteSort : true,
	
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
Ext.define('GreenFleet.store.TerminalStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'serialNo',
		type : 'string'
	}, {
		name : 'buyingDate',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'comment',
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
		url : 'terminal',
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
			'ManufacturerStore', 'VehicleTypeStore', 'OwnershipStore', 'VehicleStatusStore', 'ControlDataStore',
			'TrackByVehicleStore', 'RecentIncidentStore', 'TerminalStore' ],
	models : [],
	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 'SideMenu',
			'management.Company', 'management.Vehicle', 'management.Terminal', 'management.Reservation', 'management.Incident',
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


