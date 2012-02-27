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
				client : view,
				title : 'Import'
			}).show();
		}
	}
	
	function uploadIncidentLog() {
		Ext.create('GreenFleet.view.common.ImportPopup', {
			importUrl : 'incident/upload_log',
			title : 'Upload Incident Log'
		}).show();
	}

	function uploadIncidentVideo() {
		Ext.create('GreenFleet.view.common.ImportPopup', {
			importUrl : 'incident/upload_video',
			title : 'Upload Incident Video'
		}).show();
	}

	return {
		importData : importFile,
		uploadIncidentLog : uploadIncidentLog,
		uploadIncidentVideo : uploadIncidentVideo
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

Ext.define('GreenFleet.model.Code', {
    extend: 'Ext.data.Model',
    
    fields: [
        {name: 'code', type: 'string'},
        {name: 'desc', type: 'number'}
    ]
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
		title : 'Incident Info',
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
		cls : 'btnImport',
		html : 'import',
		handler : function() {
			GreenFleet.importData();
		}
	}, {
		xtype : 'button',
		cls : 'btnEvent',
		html : 'incident log',
		handler : function() {
			GreenFleet.uploadIncidentLog();
		}
	}, {
		xtype : 'button',
		cls : 'btnEvent',
		html : 'incident video',
		handler : function() {
			GreenFleet.uploadIncidentVideo();
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
			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');
			
			GreenFleet.show_running_vehicle = true;
			if(GreenFleet.show_idle_vehicle) {
				GreenFleet.show_idle_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				store.filter([{
					property : 'status',
					value : 'Running'
				}])
			} else {
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
			}
		});
		
		this.sub('state_idle').on('click', function() {
			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');
			
			GreenFleet.show_idle_vehicle = true;
			if(GreenFleet.show_incident_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				store.filter([{
					property : 'status',
					value : 'Idle'
				}])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
			}
		});
		
		this.sub('state_incident').on('click', function() {
			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');
			
			GreenFleet.show_incident_vehicle = true;
			if(GreenFleet.show_running_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_idle_vehicle = false;
				store.filter([{
					property : 'status',
					value : 'Incident'
				}])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_idle_vehicle = true;
			}
		});
		
		setInterval(function() {
			self.sub('time').update(Ext.Date.format(new Date(), 'D Y-m-d H:i:s'));
		}, 1000);
		
		this.on('afterrender', function() {
			Ext.getStore('VehicleMapStore').on('load', self.refreshVehicleCounts, self);
			Ext.getStore('RecentIncidentStore').on('load', self.refreshIncidents, self);
			Ext.getStore('RecentIncidentStore').load();
		});
	},
	
	refreshVehicleCounts : function() {
		var store = Ext.getStore('VehicleMapStore');

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
				html : '<a href="#">' + incident.get('vehicle_id') + ', ' + incident.get('driver_id') + '<span>' + 
					Ext.Date.format(incident.get('datetime'), 'D Y-m-d H:i:s') + '</span></a>'
			});
		}
	},
	
	items : [ {
		xtype : 'searchfield',
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
			for (i = 0; i < button.submenus.length; i++) {
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

			if (first)
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
		}, {
			title : 'Users',
			xtype : 'management_user',
			itemId : 'user',
			closable : true
		}, {
			title : 'Code Mgmt.',
			xtype : 'management_code',
			itemId : 'code',
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
			title : 'CheckinData',
			xtype : 'management_checkin_data',
			itemId : 'checkin_data',
			closable : true
		} ]
	}, {
		text : T('driver'),
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
		submenus : [ {
			title : 'Consumables',
			xtype : 'pm_consumable',
			itemId : 'consumable',
			closable : true
		}, {
			title : 'Health',
			xtype : 'dashboard_health',
			itemId : 'health',
			closable : true
		} ]
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

	entityUrl : 'company',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : '<div class="listTitle">Company List</div>'
	},

	initComponent : function() {
		var self = this;

		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
			grid.store.load();
		});

		this.sub('id_filter').on('change', function(field, value) {
			self.search();
		});

		this.sub('name_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('id_filter').setValue('');
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
		});

	},

	search : function() {
		this.sub('grid').store.clearFilter();

		this.sub('grid').store.filter([ {
			property : 'id',
			value : this.sub('id_filter').getValue()
		}, {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
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
				dataIndex : 'desc',
				text : 'Description'
			}, {
				dataIndex : 'timezone',
				text : 'TimeZone'
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			onReset : function(grid) {
				grid.down('textfield[name=id_filter]').setValue('');
				grid.down('textfield[name=name_filter]').setValue('');
			},
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, 'NAME', {
				xtype : 'textfield',
				name : 'name_filter',
				itemId : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				text : 'Search',
				itemId : 'search'
			}, {
				text : 'reset',
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			autoScroll : true,
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Company Details',
			flex : 2,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Key',
				hidden : true
			}, {
				name : 'id',
				fieldLabel : 'ID'
			}, {
				name : 'name',
				fieldLabel : 'Name'
			}, {
				name : 'desc',
				fieldLabel : 'Description'
			}, {
				xtype : 'tzcombo',
				name : 'timezone',
				fieldLabel : 'TimeZone'
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
				format : F('datetime')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
				format : F('datetime')
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
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
Ext.define('GreenFleet.view.management.User', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_user',

	title : 'User',
	
	entityUrl : 'user',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;
		
		this.items = [ {
			html : '<div class="listTitle">User List</div>'
		}, this.buildList(this), this.buildForm(this) ],

		this.callParent(arguments);
		
		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});
		
		this.sub('grid').on('render', function(grid) {
			grid.store.load();
		});
		
		this.sub('email_filter').on('change', function(field, value) {
			self.search();
		});
		
		this.sub('name_filter').on('change', function(field, value) {
			self.search();
		});
		
		this.down('#search_reset').on('click', function() {
			self.sub('email_filter').setValue('');
			self.sub('name_filter').setValue('');
		});
		
		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
		});
		
	},

	search : function() {
		this.sub('grid').store.clearFilter();

		this.sub('grid').store.filter([ {
			property : 'email',
			value : this.sub('email_filter').getValue()
		}, {
			property : 'surname',
			value : this.sub('name_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'UserStore',
			flex : 3,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'email',
				text : 'email'
			}, {
				dataIndex : 'surname',
				text : 'Sur Name'
			}, {
				dataIndex : 'nickname',
				text : 'Nick Name'
			}, {
				dataIndex : 'forename',
				text : 'For Name'
			}, {
				dataIndex : 'enabled',
				text : 'Enabled'
			}, {
				dataIndex : 'admin',
				text : 'Admin'
			}, {
				dataIndex : 'company',
				text : 'Company'
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ 'e-mail', {
				xtype : 'textfield',
				itemId : 'email_filter',
				name : 'email_filter',
				hideLabel : true,
				width : 200
			}, 'NAME', {
				xtype : 'textfield',
				itemId : 'name_filter',
				name : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				xtype : 'button',
				itemId : 'search',
				text : 'Search',
				tooltip : 'Find User'
			}, {
				text : 'reset',
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'User Details',
			flex : 2,
			autoScroll : true,
			items : [ {
				xtype : 'textfield',
				name : 'key',
				fieldLabel : 'Key',
				anchor : '100%',
				hidden : true
			}, {
				xtype : 'textfield',
				name : 'email',
				fieldLabel : 'e-mail',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'surname',
				fieldLabel : 'Sur Name',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'nickname',
				fieldLabel : 'Nick Name',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'forename',
				fieldLabel : 'Fore Name',
				anchor : '100%'
			}, {
				xtype : 'checkbox',
				name : 'enabled',
				fieldLabel : 'Enabled',
				uncheckedValue : 'off',
				anchor : '100%'
			}, {
				xtype : 'checkbox',
				name : 'admin',
				fieldLabel : 'Admin',
				uncheckedValue : 'off',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'company',
				fieldLabel : 'Company',
				disable : true,
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
				format : F('datetime'),
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
				format : F('datetime'),
				anchor : '100%'
			} ],
			
			dockedItems : [ {
				xtype : 'entity_form_buttons',
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
Ext.define('GreenFleet.view.management.Code', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_code',

	title : 'Code Mgmt.',

	entityUrl : 'code',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'code/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;

		this.items = [ {
			html : '<div class="listTitle">Code List</div>'
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.buildGroupList(this), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.buildCodeList(this), this.buildForm(this) ]
			} ]
		} ],

		this.callParent(arguments);

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
			grid.store.clearFilter(true);
			var group = self.sub('grouplist').store.first().get('group');
			grid.store.filter('group', group);
			self.sub('form').getForm().setValues({
				group : group
			});
		});

		this.sub('grouplist').on('itemclick', function(grid, record) {
			self.sub('grid').store.clearFilter(true);
			self.sub('grid').store.filter('group', record.get('group'));
			self.sub('form').getForm().reset();
			self.sub('form').getForm().setValues({
				group : record.get('group')
			});
		});
	},

	buildGroupList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grouplist',
			store : 'CodeGroupStore',
			title : 'Code Group',
			width : 320,
			columns : [ {
				dataIndex : 'group',
				text : 'Group',
				width : 100
			}, {
				dataIndex : 'desc',
				text : 'Description',
				width : 220
			} ]
		}
	},

	buildCodeList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'CodeStore',
			title : 'Code List',
			flex : 1,
			cls : 'hIndexbarZero',
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'group',
				text : 'Group'
			}, {
				dataIndex : 'code',
				text : 'Code'
			}, {
				dataIndex : 'desc',
				text : 'Description'
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Code Details',
			height : 200,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Key',
				hidden : true
			}, {
				xtype : 'combo',
				name : 'group',
				fieldLabel : 'Group',
				queryMode : 'local',
				store : 'CodeGroupStore',
				displayField : 'group',
				valueField : 'group'
			}, {
				name : 'code',
				fieldLabel : 'Code'
			}, {
				name : 'desc',
				fieldLabel : 'Description'
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
				format : F('datetime')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
				format : F('datetime')
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
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
Ext.define('GreenFleet.view.management.Vehicle', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle',

	title : 'Vehicle',

	entityUrl : 'vehicle',
	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'vehicle/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items: {
		html : '<div class="listTitle">Vehicle List</div>'
	},

	initComponent : function() {
		var self = this;
		
		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
			grid.store.load();
		});

		this.sub('id_filter').on('change', function(field, value) {
			self.search();
		});

		this.sub('registration_number_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('id_filter').setValue('');
			self.sub('registration_number_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
		});
		
		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgVehicle.png');
		})
		
	},

	search : function() {
		this.sub('grid').store.clearFilter();

		this.sub('grid').store.filter([ {
			property : 'id',
			value : this.sub('id_filter').getValue()
		}, {
			property : 'registration_number',
			value : this.sub('registration_number_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
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
				dataIndex : 'registration_number',
				text : 'RegistrationNumber',
				type : 'string'
			}, {
				dataIndex : 'manufacturer',
				text : 'Manufacturer',
				type : 'string'
			}, {
				dataIndex : 'vehicle_type',
				text : 'VehicleType',
				type : 'string'
			}, {
				dataIndex : 'birth_year',
				text : 'BirthYear',
				type : 'string'
			}, {
				dataIndex : 'ownership_type',
				text : 'OwnershipType',
				type : 'string'
			}, {
				dataIndex : 'status',
				text : 'Status',
				type : 'string'
			}, {
				dataIndex : 'total_distance',
				text : 'TotalDistance',
				type : 'string'
			}, {
				dataIndex : 'remaining_fuel',
				text : 'RemainingFuel',
				type : 'string'
			}, {
				dataIndex : 'distance_since_new_oil',
				text : 'DistanceSinceNewOil',
				type : 'string'
			}, {
				dataIndex : 'engine_oil_status',
				text : 'EngineOilStatus',
				type : 'string'
			}, {
				dataIndex : 'fuel_filter_status',
				text : 'FuelFilterStatus',
				type : 'string'
			}, {
				dataIndex : 'brake_oil_status',
				text : 'BrakeOilStatus',
				type : 'string'
			}, {
				dataIndex : 'brake_pedal_status',
				text : 'BrakePedalStatus',
				type : 'string'
			}, {
				dataIndex : 'cooling_water_status',
				text : 'CoolingWaterStatus',
				type : 'string'
			}, {
				dataIndex : 'timing_belt_status',
				text : 'TimingBeltStatus',
				type : 'string'
			}, {
				dataIndex : 'spark_plug_status',
				text : 'SparkPlugStatus',
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude'
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, 'Registeration Number', {
				xtype : 'textfield',
				name : 'registration_number_filter',
				itemId : 'registration_number_filter',
				hideLabel : true,
				width : 200
			}, {
				text : 'Search',
				itemId : 'search'
			}, {
				text : 'Reset',
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Vehicle Details',
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [ {
				xtype : 'form',
				itemId : 'form',
				flex : 1,
				autoScroll : true,
				defaults : {
					xtype : 'textfield',
					anchor : '100%'
				},
				items : [ {
					name : 'key',
					fieldLabel : 'Key',
					hidden : true
				}, {
					name : 'id',
					fieldLabel : 'Vehicle Id'
				}, {
					name : 'registration_number',
					fieldLabel : 'Registration Number'
				}, {
					xtype : 'codecombo',
					name : 'manufacturer',
					group : 'V-Maker',
					fieldLabel : 'Manufacturer'
				}, {
					xtype : 'codecombo',
					name : 'vehicle_type',
					group : 'V-Type1',
					fieldLabel : 'Vehicle Type'
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : 'Image Upload',
					msgTarget : 'side',
					allowBlank : true,
					buttonText : 'file...'
				}, {
					xtype : 'codecombo',
					name : 'birth_year',
					group : 'V-BirthYear',
					name : 'birth_year',
					fieldLabel : 'BirthYear'
				}, {
					xtype : 'combo',
					name : 'ownership_type',
					queryMode : 'local',
					store : 'OwnershipStore',
					displayField : 'desc',
					valueField : 'name',
					fieldLabel : 'Ownership Type'
				}, {
					xtype : 'combo',
					name : 'status',
					queryMode : 'local',
					store : 'VehicleStatusStore',
					displayField : 'desc',
					valueField : 'status',
					fieldLabel : 'Status'
				}, {
					name : 'total_distance',
					fieldLabel : 'Total Distance'
				}, {
					name : 'remaining_fuel',
					fieldLabel : 'Remaining Fuel'
				}, {
					name : 'distance_since_new_oil',
					fieldLabel : 'Distance Since NewOil'
				}, {
					name : 'engine_oil_status',
					fieldLabel : 'EngineOil Status'
				}, {
					name : 'fuel_filter_status',
					fieldLabel : 'FuelFilter Status'
				}, {
					name : 'brake_oil_status',
					fieldLabel : 'BrakeOil Status'
				}, {
					name : 'brake_pedal_status',
					fieldLabel : 'BrakePedal Status'
				}, {
					name : 'cooling_water_status',
					fieldLabel : 'CoolingWater Status'
				}, {
					name : 'timing_belt_status',
					fieldLabel : 'TimingBeltStatus'
				}, {
					name : 'spark_plug_status',
					fieldLabel : 'SparkPlugStatus'
				}, {
					name : 'driver_id',
					fieldLabel : 'Driver',
					disabled : true
				}, {
					name : 'terminal_id',
					fieldLabel : 'Terminal',
					disabled : true
				}, {
					name : 'lattitude',
					fieldLabel : 'Lattitude',
					disabled : true
				}, {
					name : 'longitude',
					fieldLabel : 'Longitude',
					disabled : true
				}, {
					xtype : 'datefield',
					name : 'updated_at',
					disabled : true,
					fieldLabel : 'Updated At',
					format : F('datetime')
				}, {
					xtype : 'datefield',
					name : 'created_at',
					disabled : true,
					fieldLabel : 'Created At',
					format : F('datetime')
				}, {
					xtype : 'displayfield',
					name : 'image_clip',
					itemId : 'image_clip',
					hidden : true
				} ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'vbox',
					align : 'stretch'	
				},
				cls : 'noImage paddingLeft10',
				items : [ {
					xtype : 'image',
					height : '100%',
					itemId : 'image'
				} ]
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
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

Ext.define('GreenFleet.view.management.Terminal', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_terminal',

	title : 'Terminal',

	entityUrl : 'terminal',
	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'terminal/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	items: {
		html : '<div class="listTitle">Terminal List</div>'
	},
	
	initComponent : function() {
		var self = this;
		
		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
			grid.store.load();
		});

		this.sub('id_filter').on('change', function(field, value) {
			self.search();
		});

		this.sub('serial_no_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('id_filter').setValue('');
			self.sub('serial_no_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
		});
		
		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgVehicle.png');
		})
		
	},

	search : function() {
		this.sub('grid').store.clearFilter();

		this.sub('grid').store.filter([ {
			property : 'id',
			value : this.sub('id_filter').getValue()
		}, {
			property : 'serial_no',
			value : this.sub('serial_no_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
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
				text : 'Terminal Id',
				type : 'string'
			}, {
				dataIndex : 'serial_no',
				text : 'Serial No.',
				type : 'string'
			}, {
				dataIndex : 'buying_date',
				text : 'Buying Date',
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'comment',
				text : 'Comment',
				type : 'string',
				width : 160
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, 'Serial No.', {
				xtype : 'textfield',
				name : 'serial_no_filter',
				itemId : 'serial_no_filter',
				hideLabel : true,
				width : 200
			}, {
				text : 'Search',
				itemId : 'search'
			}, {
				text : 'Reset',
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			itemId : 'details',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Terminal Details',
			layout : {
				type : 'hbox',
				align : 'stretch'	
			},
			flex : 1,
			items : [ {
				xtype : 'form',
				itemId : 'form',
				autoScroll : true,
				flex : 1,
				defaults : {
					xtype : 'textfield',
					anchor : '100%'
				},
				items : [{
					name : 'key',
					fieldLabel : 'Key',
					hidden : true
				}, {
					name : 'id',
					fieldLabel : 'Terminal Id'
				}, {
					name : 'serial_no',
					fieldLabel : 'Serial No.'
				}, {
					xtype : 'datefield',
					name : 'buying_date',
					fieldLabel : 'Buying Date',
					format : F('date')
				}, {
					xtype : 'textarea',
					name : 'comment',
					fieldLabel : 'Comment'
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : 'Image Upload',
					msgTarget : 'side',
					allowBlank : true,
					buttonText : 'file...'
				}, {
					xtype : 'datefield',
					name : 'updated_at',
					disabled : true,
					fieldLabel : 'Updated At',
					format: F('datetime')
				}, {
					xtype : 'datefield',
					name : 'created_at',
					disabled : true,
					fieldLabel : 'Created At',
					format: F('datetime')
				}, {
					xtype : 'displayfield',
					name : 'image_clip',
					itemId : 'image_clip',
					hidden : true
				} ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'vbox',
					align : 'stretch'	
				},
				cls : 'noImage paddingLeft10',
				items : [ {
					xtype : 'image',
					height : '100%',
					itemId : 'image'
				} ]
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
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
Ext.define('GreenFleet.view.management.Reservation', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_reservation',

	title : 'Reservation',

	entityUrl : 'reservation',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : '<div class="listTitle">Reservation List</div>'
	},

	initComponent : function() {
		var self = this;

		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
//			grid.store.load();
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
			self.search();
		});

		this.sub('reserved_date_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('reserved_date_filter').setValue('');
		});

		this.down('#search').on('click', function() {
//			self.sub('grid').store.load();
			self.sub('grid').search();
		});

	},

	search : function(callback) {
		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle_id',
				value : self.sub('vehicle_filter').getSubmitValue()
			}, {
				property : 'reserved_date',
				value : self.sub('reserved_date_filter').getSubmitValue()
			} ],
			callback : callback
		});
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'ReservationStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'ID',
				type : 'string'
			}, {
				dataIndex : 'reserved_date',
				text : 'Reserved Date',
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'driver_id',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'vehicle_id',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'vehicle_type',
				text : 'Vehicle Type',
				type : 'string'
			}, {
				dataIndex : 'delivery_place',
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
				dataIndex : 'created_at',
				text : 'Created At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ 'Vehicle', {
				xtype : 'textfield',
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				hideLabel : true,
				width : 200
			}, 'Date', {
				xtype : 'datefield',
				name : 'reserved_date_filter',
				itemId : 'reserved_date_filter',
				hideLabel : true,
				width : 200
			}, {
				text : 'Search',
				itemId : 'search'
			}, {
				text : 'reset',
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Reservation Details',
			autoScroll : true,
			flex : 1,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Reservation ID',
				disabled : true
			}, {
				xtype : 'datefield',
				name : 'reserved_date',
				fieldLabel : 'Reserved Date',
				format : F('date')
			}, {
				name : 'vehicle_type',
				fieldLabel : 'Vehicle Type'
			}, {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode : 'local',
				store : 'VehicleStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode : 'local',
				store : 'DriverStore',
				displayField : 'name',
				valueField : 'id',
				fieldLabel : 'Driver'
			}, {
				name : 'status',
				fieldLabel : 'Status'
			}, {
				name : 'delivery_place',
				fieldLabel : 'Delivery Place'
			}, {
				name : 'destination',
				fieldLabel : 'Destination'
			}, {
				name : 'purpose',
				fieldLabel : 'Purpose'
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
				format : F('datetime')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
				format : F('datetime')
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : main.search,
					scope : main
				}
			} ]
		}
	}
});
Ext.define('GreenFleet.view.management.Incident', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_incident',

	title : 'Incident',

	entityUrl : 'incident',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : '<div class="listTitle">Incident List</div>'
	},

	initComponent : function() {
		var self = this;

		this.callParent();

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
//			grid.store.load();
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
			/* 
			 * Remote Filter를 사용하는 경우에는 검색 아이템의 선택에 바로 반응하지 않는다.
			 * Search 버튼을 누를때만, 반응한다.
			 */
//			self.search();
		});

		this.sub('driver_filter').on('change', function(field, value) {
//			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('driver_filter').setValue('');
			self.sub('date_filter').setValue(new Date());
		});

		this.down('#search').on('click', function() {
//			self.sub('grid').store.load();
			self.search();
		});

		this.down('#video_clip').on('change', function(field, value) {
			var video = self.sub('video');

			var url = '';
			if (value != null && value.length > 1)
				url = 'src="download?blob-key=' + value + '"'

			video.update({
				value : url
			});
		})

	},

	search : function(callback) {
		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle_id',
				value : this.sub('vehicle_filter').getValue()
			}, {
				property : 'driver_id',
				value : this.sub('driver_filter').getValue()
			}, {
				property : 'date',
				value : this.sub('date_filter').getSubmitValue()
			} ],
			callback : callback
		})
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'IncidentStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'datetime',
				text : 'Incident Time',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'driver_id',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'vehicle_id',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'terminal_id',
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
				dataIndex : 'velocity',
				text : 'Velocity',
				type : 'number'
			}, {
				dataIndex : 'impulse_abs',
				text : 'Impulse',
				type : 'number'
			}, {
				dataIndex : 'impulse_x',
				text : 'Impulse X',
				type : 'number'
			}, {
				dataIndex : 'impulse_y',
				text : 'Impulse Y',
				type : 'number'
			}, {
				dataIndex : 'impulse_z',
				text : 'Impulse Z',
				type : 'number'
			}, {
				dataIndex : 'impulse_threshold',
				text : 'Impulse Threshold',
				type : 'number'
			}, {
				dataIndex : 'engine_temp',
				text : 'Engine Temp',
				type : 'number'
			}, {
				dataIndex : 'engine_temp_threshold',
				text : 'Engine Temp Threshold',
				type : 'number'
			}, {
				dataIndex : 'obd_connected',
				text : 'OBD Connected',
				type : 'boolean'
			}, {
				dataIndex : 'confirm',
				text : 'Confirm',
				type : 'boolean'
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype : 'datecolumn',
				format : F('datetime')
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : F('datetime')
			} ],
			viewConfig : {

			},
			tbar : [ {
				xtype : 'combo',
				name : 'vehicle',
				queryMode : 'local',
				store : 'VehicleStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : 'Vehicle',
				itemId : 'vehicle_filter',
				name : 'vehicle_filter',
				width : 200
			}, {
				xtype : 'combo',
				name : 'driver',
				queryMode : 'local',
				store : 'DriverStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : 'Driver',
				itemId : 'driver_filter',
				name : 'driver_filter',
				width : 200
			}, {
		        xtype: 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : 'Date',
				format: 'Y-m-d',
				submitFormat : 'U',
		        maxValue: new Date(),  // limited to the current date or prior
		        value : new Date(),
				width : 200
			}, {
				text : 'Search',
				itemId : 'search'
			}, {
				text : 'Reset',
				itemId : 'search_reset'
			} ],
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Incident Details',
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [
					{
						xtype : 'form',
						itemId : 'form',
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
							name : 'datetime',
							fieldLabel : 'Incident Time',
							submitFormat : F('datetime')
						}, {
							xtype : 'combo',
							name : 'vehicle_id',
							queryMode : 'local',
							store : 'VehicleStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : 'Vehicle'
						}, {
							xtype : 'combo',
							name : 'driver_id',
							queryMode : 'local',
							store : 'DriverStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : 'Driver'
						}, {
							xtype : 'combo',
							name : 'terminal_id',
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
							name : 'velocity',
							fieldLabel : 'Velocity'
						}, {
							xtype : 'textfield',
							name : 'impulse_abs',
							fieldLabel : 'Impulse'
						}, {
							xtype : 'textfield',
							name : 'impulse_x',
							fieldLabel : 'Impulse X'
						}, {
							xtype : 'textfield',
							name : 'impulse_y',
							fieldLabel : 'Impulse Y'
						}, {
							xtype : 'textfield',
							name : 'impulse_z',
							fieldLabel : 'Impulse Z'
						}, {
							xtype : 'textfield',
							name : 'impulse_threshold',
							fieldLabel : 'Impulse Threshold'
						}, {
							xtype : 'textfield',
							name : 'engine_temp',
							fieldLabel : 'Engine Temp.'
						}, {
							xtype : 'textfield',
							name : 'engine_temp_threshold',
							fieldLabel : 'Engine Temp. Threshold'
						}, {
							xtype : 'checkbox',
							name : 'obd_connected',
							uncheckedValue : 'off',
							fieldLabel : 'OBD Connected'
						}, {
							xtype : 'checkbox',
							name : 'confirm',
							uncheckedValue : 'off',
							fieldLabel : 'Confirm'
						}, {
							xtype : 'filefield',
							name : 'video_file',
							fieldLabel : 'Video Upload',
							msgTarget : 'side',
							allowBlank : true,
							buttonText : 'file...'
						}, {
							xtype : 'datefield',
							name : 'updated_at',
							disabled : true,
							fieldLabel : 'Updated At',
							format : 'd-m-Y H:i:s'
						}, {
							xtype : 'datefield',
							name : 'created_at',
							disabled : true,
							fieldLabel : 'Created At',
							format : 'd-m-Y H:i:s'
						}, {
							xtype : 'displayfield',
							name : 'video_clip',
							itemId : 'video_clip',
							hidden : true
						} ]
					},
					{
						xtype : 'panel',
						flex : 1,

						cls : 'incidentVOD paddingLeft10',

						layout : {
							type : 'vbox',
							align : 'stretch',
							itemCls : 'test'
						},

						items : [
								{
									xtype : 'box',
									html : '<div class="btnFullscreen"></div>',
									handler : function(button) {
										if (!Ext.isWebKit)
											return;
										var video = button.up('container').getComponent('video');
										video.getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
									}
									
								}, {
									xtype : 'box',
									itemId : 'video',
									cls : 'incidentDetail',
									tpl : [ '<video width="100%" height="100%" controls="controls">', '<source {value} type="video/mp4" />',
											'Your browser does not support the video tag.', '</video>' ]
								} ]
					} ],

			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : main.search,
					scope : main
				}
			} ]
		}
	}
});

Ext.define('GreenFleet.view.management.Driver', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_driver',

	title : 'Driver',
	
	entityUrl : 'driver',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'driver/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	items: {
		html : '<div class="listTitle">Driver List</div>'
	},
	
	initComponent : function() {
		var self = this;
		
		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
			grid.store.load();
		});

		this.sub('id_filter').on('change', function(field, value) {
			self.search();
		});

		this.sub('name_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('id_filter').setValue('');
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
		});
		
		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgVehicle.png');
		})
		
	},

	search : function() {
		this.sub('grid').store.clearFilter();

		this.sub('grid').store.filter([ {
			property : 'id',
			value : this.sub('id_filter').getValue()
		}, {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
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
				dataIndex : 'social_id',
				text : 'Social Id.',
				type : 'string'
			}, {
				dataIndex : 'phone_no_1',
				text : 'Phone #1',
				type : 'string'
			}, {
				dataIndex : 'phone_no_2',
				text : 'Phone #2',
				type : 'string'
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, 'Name', {
				xtype : 'textfield',
				name : 'name_filter',
				itemId : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				text : 'Search',
				itemId : 'search'
			}, {
				text : 'Reset',
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			itemId : 'details',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Driver Details',
			layout : {
				type : 'hbox',
				align : 'stretch'	
			},
			flex : 1,
			items : [ {
				xtype : 'form',
				itemId : 'form',
				autoScroll : true,
				flex : 1,
				defaults : {
					xtype : 'textfield',
					anchor : '100%'
				},
				items : [{
					name : 'key',
					fieldLabel : 'Key',
					hidden : true
				}, {
					name : 'name',
					fieldLabel : 'Name'
				}, {
					name : 'id',
					fieldLabel : 'Employee Id'
				}, {
					xtype : 'codecombo',
					name : 'division',
					group : 'Division',
					fieldLabel : 'Division'
				}, {
					xtype : 'codecombo',
					name : 'title',
					group : 'EmployeeTitle',
					fieldLabel : 'Title'
				}, {
					name : 'social_id',
					fieldLabel : 'Social Id.'
				}, {
					name : 'phone_no_1',
					fieldLabel : 'Phone #1'
				}, {
					name : 'phone_no_2',
					fieldLabel : 'Phone #2'
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : 'Image Upload',
					msgTarget : 'side',
					allowBlank : true,
					buttonText : 'file...'
				}, {
					xtype : 'datefield',
					name : 'updated_at',
					disabled : true,
					fieldLabel : 'Updated At',
					format: F('datetime')
				}, {
					xtype : 'datefield',
					name : 'created_at',
					disabled : true,
					fieldLabel : 'Created At',
					format: F('datetime')
				}, {
					xtype : 'displayfield',
					name : 'image_clip',
					itemId : 'image_clip',
					hidden : true
				} ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'vbox',
					align : 'stretch'	
				},
				cls : 'noImage paddingLeft10',
				items : [ {
					xtype : 'image',
					height : '100%',
					itemId : 'image'
				} ]
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
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
Ext.define('GreenFleet.view.management.Track', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_track',

	title : 'Track',

	entityUrl : 'track',
	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'track/import',

	afterImport : function() {
		this.search();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : '<div class="listTitle">Tracking List</div>'
	},

	initComponent : function() {
		var self = this;

		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
			// grid.store.load();
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
			/*
			 * Remote Filter를 사용하는 경우에는 검색 아이템의 선택에 바로 반응하지 않는다. Search 버튼을
			 * 누를때만, 반응한다.
			 */
			// self.search();
		});

		this.sub('date_filter').on('change', function(field, value) {
			// self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('date_filter').setValue(new Date());
		});

		this.down('#search').on('click', function() {
			self.search();
		});

	},

	search : function(callback) {
		if (!this.sub('vehicle_filter').getValue() || !this.sub('date_filter').getSubmitValue()) {
			Ext.Msg.alert('Condition', 'Please select conditions!');
			return;
		}

		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle_id',
				value : this.sub('vehicle_filter').getValue()
			}, {
				property : 'date',
				value : this.sub('date_filter').getSubmitValue()
			} ],
			callback : callback
		});
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'TrackStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'terminal_id',
				text : 'Terminal',
				type : 'string'
			}, {
				dataIndex : 'vehicle_id',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'driver_id',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'datetime',
				text : 'DateTime',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude',
				type : 'number'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude',
				type : 'number'
			}, {
				dataIndex : 'velocity',
				text : 'Velocity',
				type : 'number'
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ {
				xtype : 'combo',
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				queryMode : 'local',
				store : 'VehicleStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : 'Vehicle',
				width : 200
			}, {
				xtype : 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : 'Date',
				format : 'Y-m-d',
				submitFormat : 'U',
				maxValue : new Date(), // limited to the current date or prior
				value : new Date(),
				width : 200
			}, {
				text : 'Search',
				itemId : 'search'
			}, {
				text : 'Reset',
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Tracking Details',
			autoScroll : true,
			flex : 1,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Key',
				hidden : true
			}, {
				xtype : 'combo',
				name : 'terminal_id',
				queryMode : 'local',
				store : 'TerminalStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : 'Terminal'
			}, {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode : 'local',
				store : 'VehicleStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode : 'local',
				store : 'DriverStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : 'Driver'
			}, {
				xtype : 'datefield',
				name : 'datetime',
				fieldLabel : 'DateTime',
				format : F('datetime')
			}, {
				name : 'lattitude',
				fieldLabel : 'Lattitude'
			}, {
				name : 'longitude',
				fieldLabel : 'Longitude'
			}, {
				name : 'velocity',
				fieldLabel : 'Velocity'
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
				format : F('datetime')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
				format : F('datetime')
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : main.search,
					scope : main
				}
			} ]
		}
	}
});
Ext.define('GreenFleet.view.management.CheckinData', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_checkin_data',

	entityUrl : 'checkin_data',
	
	title : 'CheckinData',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	items: {
		html : '<div class="listTitle">CheckinData List</div>'
	},
	
	initComponent : function() {
		var self = this;

		this.callParent();

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
//			grid.store.load();
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
//			self.search();
		});

		this.sub('driver_filter').on('change', function(field, value) {
//			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('driver_filter').setValue('');
		});

		this.down('#search').on('click', function() {
//			self.sub('grid').store.load();
			self.sub('grid').search();
		});
		
	},

	search : function(callback) {
//		self.sub('grid').store.clearFilter();
//
//		self.sub('grid').store.filter([ {
//			property : 'vehicle_filter',
//			value : self.sub('vehicle_filter').getValue()
//		}, {
//			property : 'driver_filter',
//			value : self.sub('driver_filter').getValue()
//		} ]);
		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle_id',
				value : this.sub('vehicle_filter').getValue()
			}, {
				property : 'driver_id',
				value : this.sub('driver_filter').getValue()
			}, {
				property : 'date',
				value : this.sub('date_filter').getSubmitValue()
			} ],
			callback : callback
		})
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'CheckinDataStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'terminal_id',
				text : 'Terminal',
			}, {
				dataIndex : 'vehicle_id',
				text : 'Vehicle',
			}, {
				dataIndex : 'driver_id',
				text : 'Driver',
			}, {
				dataIndex : 'datetime',
				text : 'Date/Time',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'distance',
				text : 'Distance',
			}, {
				dataIndex : 'running_time',
				text : 'Running Time',
			}, {
				dataIndex : 'less_than_10km',
				text : 'Less Than 10Km',
			}, {
				dataIndex : 'less_than_20km',
				text : 'Less Than 20Km',
			}, {
				dataIndex : 'less_than_30km',
				text : 'Less Than 30Km',
			}, {
				dataIndex : 'less_than_40km',
				text : 'Less Than 40Km',
			}, {
				dataIndex : 'less_than_50km',
				text : 'Less Than 50Km',
			}, {
				dataIndex : 'less_than_60km',
				text : 'Less Than 60Km',
			}, {
				dataIndex : 'less_than_70km',
				text : 'Less Than 70Km',
			}, {
				dataIndex : 'less_than_80km',
				text : 'Less Than 80Km',
			}, {
				dataIndex : 'less_than_90km',
				text : 'Less Than 90Km',
			}, {
				dataIndex : 'less_than_100km',
				text : 'Less Than 100Km',
			}, {
				dataIndex : 'less_than_110km',
				text : 'Less Than 110Km',
			}, {
				dataIndex : 'less_than_120km',
				text : 'Less Than 120Km',
			}, {
				dataIndex : 'less_than_130km',
				text : 'Less Than 130Km',
			}, {
				dataIndex : 'less_than_140km',
				text : 'Less Than 140Km',
			}, {
				dataIndex : 'less_than_150km',
				text : 'Less Than 150Km',
			}, {
				dataIndex : 'less_than_160km',
				text : 'Less Than 160Km',
			}, {
				dataIndex : 'engine_start_time',
				text : 'Start Time',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'engine_end_time',
				text : 'End Time',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'average_speed',
				text : 'Average Speed',
			}, {
				dataIndex : 'max_speed',
				text : 'Highest Speed',
			}, {
				dataIndex : 'fuel_consumption',
				text : 'Fuel Consumption',
			}, {
				dataIndex : 'fuel_efficiency',
				text : 'Fuel Efficiency',
			}, {
				dataIndex : 'sudden_accel_count',
				text : 'Sudden Accel Count',
			}, {
				dataIndex : 'sudden_brake_count',
				text : 'Sudden Brake Count',
			}, {
				dataIndex : 'idle_time',
				text : 'Idling Time'
			}, {
				dataIndex : 'eco_driving_time',
				text : 'Econo Driving Time',
			}, {
				dataIndex : 'over_speed_time',
				text : 'Over Speeding Time'
			}, {
				dataIndex : 'co2_emissions',
				text : 'CO2 Emissions'
			}, {
				dataIndex : 'max_cooling_water_temp',
				text : 'Max Cooling Water Temp'
			}, {
				dataIndex : 'avg_battery_volt',
				text : 'Average Battery Voltage'
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode: 'local',
				store : 'VehicleStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Vehicle',
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				width : 200
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode: 'local',
				store : 'DriverStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Driver',
				name : 'driver_filter',
				itemId : 'driver_filter',
				width : 200
			}, {
		        xtype: 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : 'Date',
				format: 'Y-m-d',
				submitFormat : 'U',
		        maxValue: new Date(),  // limited to the current date or prior
		        value : new Date(),
				width : 200
			}, {
				itemId : 'search',
				text : 'Search'
			}, {
				text : 'Reset',
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'CheckinData Details',
			autoScroll : true,
			flex : 1,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Key',
				hidden : true
			}, {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode: 'local',
				store : 'VehicleStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode: 'local',
				store : 'DriverStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Driver'
			}, {
				xtype : 'combo',
				name : 'terminal_id',
				queryMode: 'local',
				store : 'TerminalStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Terminal'
			}, {
				xtype : 'datefield',
				name : 'datetime',
				fieldLabel : 'Date/Time',
				format: F('datetime')
			}, {
				name : 'distance',
				fieldLabel : 'Distance'
			}, {
				name : 'running_time',
				fieldLabel : 'Running Time'
			}, {
				name : 'less_than_10km',
				fieldLabel : 'Less Than 10Km'
			}, {
				name : 'less_than_20km',
				fieldLabel : 'Less Than 20Km'
			}, {
				name : 'less_than_30km',
				fieldLabel : 'Less Than 30Km'
			}, {
				name : 'less_than_40km',
				fieldLabel : 'Less Than 40Km'
			}, {
				name : 'less_than_50km',
				fieldLabel : 'Less Than 50Km'
			}, {
				name : 'less_than_60km',
				fieldLabel : 'Less Than 60Km'
			}, {
				name : 'less_than_70km',
				fieldLabel : 'Less Than 70Km'
			}, {
				name : 'less_than_80km',
				fieldLabel : 'Less Than 80Km'
			}, {
				name : 'less_than_90km',
				fieldLabel : 'Less Than 90Km'
			}, {
				name : 'less_than_100km',
				fieldLabel : 'Less Than 100Km'
			}, {
				name : 'less_than_110km',
				fieldLabel : 'Less Than 110Km'
			}, {
				name : 'less_than_120km',
				fieldLabel : 'Less Than 120Km'
			}, {
				name : 'less_than_130km',
				fieldLabel : 'Less Than 130Km'
			}, {
				name : 'less_than_140km',
				fieldLabel : 'Less Than 140Km'
			}, {
				name : 'less_than_150km',
				fieldLabel : 'Less Than 150Km'
			}, {
				name : 'less_than_160km',
				fieldLabel : 'Less Than 160Km'
			}, {
				xtype : 'datefield',
				name : 'engine_start_time',
				fieldLabel : 'Start Time',
				format: F('datetime')
			}, {
				xtype : 'datefield',
				name : 'engine_end_time',
				fieldLabel : 'End Time',
				format: F('datetime')
			}, {
				name : 'average_speed',
				fieldLabel : 'Average Speed'
			}, {
				name : 'max_speed',
				fieldLabel : 'Highest Speed'
			}, {
				name : 'fuel_consumption',
				fieldLabel : 'Fuel Consumption'
			}, {
				name : 'fuel_efficiency',
				fieldLabel : 'Fuel Efficiency'
			}, {
				name : 'sudden_accel_count',
				fieldLabel : 'Sudden Accel Count'
			}, {
				name : 'sudden_brake_count',
				fieldLabel : 'Sudden Brake Count'
			}, {
				name : 'idle_time',
				fieldLabel : 'Idling Time'
			}, {
				name : 'eco_driving_time',
				fieldLabel : 'Eco-Driving Time'
			}, {
				name : 'over_speed_time',
				fieldLabel : 'Over Speeding Time'
			}, {
				name : 'co2_emissions',
				fieldLabel : 'CO2 Emissions'
			}, {
				name : 'max_cooling_water_temp',
				fieldLabel : 'Max Cooling Water Temp.'
			}, {
				name : 'avg_battery_volt',
				fieldLabel : 'Average Bettery Voltage'
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
				format: F('datetime')
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
				format: F('datetime')
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : main.search,
					scope : main
				}
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
			var vehicleMapStore = Ext.getStore('VehicleMapStore');
			var vehicleFilteredStore = Ext.getStore('VehicleFilteredStore');
			var incidentStore = Ext.getStore('RecentIncidentStore');
			
			vehicleFilteredStore.on('datachanged', function() {
				self.refreshMap(vehicleFilteredStore);
			});
			
			vehicleMapStore.load();
			
			/*
			 * TODO 1분에 한번씩 리프레쉬하도록 함.
			 */
			setInterval(function() {
				vehicleMapStore.load();
				incidentStore.load();
			}, 10000);
			
			var vehicleStore = Ext.getStore('VehicleStore');
			vehicleStore.load();
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
			if(self.sub('autofit').getValue())
				self.refreshMap(Ext.getStore('VehicleFilteredStore'));
		});
		
		this.sub('autofit').on('change', function(check, newValue) {
			if(newValue)
				self.refreshMap(Ext.getStore('VehicleFilteredStore'));
		});
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
			var driver = record.get('driver_id');
			var driverRecord = Ext.getStore('DriverStore').findRecord('id', driver);
			
			var latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
			
			var marker = new google.maps.Marker({
				position : latlng,
				map : this.getMap(),
				status : record.get('status'),
				icon : images[record.get('status')],
				title : driverRecord ? driverRecord.get('name') : driver,
				tooltip : record.get('registration_number') + "(" + (driverRecord ? driverRecord.get('name') : driver) + ")"
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
		
		if(!bounds) {
			this.getMap().setCenter(new google.maps.LatLng(System.props.lattitude, System.props.longitude));
		} else if(bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else {
			this.getMap().fitBounds(bounds);
		}
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

Ext.define('GreenFleet.view.monitor.CheckinByVehicle', {			
	extend : 'Ext.grid.Panel',

	alias : 'widget.monitor_control_by_vehicle',
	
	title : 'Control By Vehicle',
	
	store : 'CheckinDataStore',
	autoScroll : true,
	
	listeners : {
	},
	
	onSearch : function(grid) {
		var vehicle_filter = grid.down('textfield[name=vehicle_filter]');
		var driver_filter = grid.down('textfield[name=driver_filter]');
		grid.store.load({
			filters : [ {
				property : 'vehicle_id',
				value : vehicle_filter.getValue()
			},{
				property : 'driver_id',
				value : driver_filter.getValue()
			} ]
		});
	},

	onReset : function(grid) {
		grid.down('textfield[name=vehicle_filter]').setValue('');
		grid.down('textfield[name=driver_filter]').setValue('');
	},
	tbar : [ {
		xtype : 'combo',
		name : 'vehicle_filter',
		queryMode: 'local',
		store : 'VehicleStore',
		displayField: 'id',
	    valueField: 'id',
		fieldLabel : 'Vehicle',
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
		name : 'driver_filter',
		queryMode: 'local',
		store : 'DriverStore',
		displayField: 'id',
	    valueField: 'id',
		fieldLabel : 'Driver',
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
		tooltip : 'Find Checkin Data',
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
		dataIndex : 'terminal_id',
		text : 'Terminal',
	}, {
		dataIndex : 'vehicle_id',
		text : 'Vehicle',
	}, {
		dataIndex : 'driver_id',
		text : 'Driver',
	}, {
		dataIndex : 'datetime',
		text : 'Date',
		xtype:'datecolumn',
		format:F('date')
	}, {
		dataIndex : 'distance',
		text : 'Distance',
	}, {
		dataIndex : 'running_time',
		text : 'Running Time',
	}, {
		dataIndex : 'less_than_10km',
		text : 'Less Than 10Km',
	}, {
		dataIndex : 'less_than_20km',
		text : 'Less Than 20Km',
	}, {
		dataIndex : 'less_than_30km',
		text : 'Less Than 30Km',
	}, {
		dataIndex : 'less_than_40km',
		text : 'Less Than 40Km',
	}, {
		dataIndex : 'less_than_50km',
		text : 'Less Than 50Km',
	}, {
		dataIndex : 'less_than_60km',
		text : 'Less Than 60Km',
	}, {
		dataIndex : 'less_than_70km',
		text : 'Less Than 70Km',
	}, {
		dataIndex : 'less_than_80km',
		text : 'Less Than 80Km',
	}, {
		dataIndex : 'less_than_90km',
		text : 'Less Than 90Km',
	}, {
		dataIndex : 'less_than_100km',
		text : 'Less Than 100Km',
	}, {
		dataIndex : 'less_than_110km',
		text : 'Less Than 110Km',
	}, {
		dataIndex : 'less_than_120km',
		text : 'Less Than 120Km',
	}, {
		dataIndex : 'less_than_130km',
		text : 'Less Than 130Km',
	}, {
		dataIndex : 'less_than_140km',
		text : 'Less Than 140Km',
	}, {
		dataIndex : 'less_than_150km',
		text : 'Less Than 150Km',
	}, {
		dataIndex : 'less_than_160km',
		text : 'Less Than 160Km',
	}, {
		dataIndex : 'engine_start_time',
		text : 'Start Time',
		xtype:'datecolumn',
		format:F('datetime'),
		width : 120
	}, {
		dataIndex : 'engine_end_time',
		text : 'End Time',
		xtype:'datecolumn',
		format:F('datetime'),
		width : 120
	}, {
		dataIndex : 'average_speed',
		text : 'Average Speed',
	}, {
		dataIndex : 'max_speed',
		text : 'Highest Speed',
	}, {
		dataIndex : 'fuel_consumption',
		text : 'Fuel Consumption',
	}, {
		dataIndex : 'fuel_efficiency',
		text : 'Fuel Efficiency',
	}, {
		dataIndex : 'sudden_accel_count',
		text : 'Sudden Accel Count',
	}, {
		dataIndex : 'sudden_brake_count',
		text : 'Sudden Brake Count',
	}, {
		dataIndex : 'idle_time',
		text : 'Idling Time'
	}, {
		dataIndex : 'eco_driving_time',
		text : 'Econo Driving Time',
	}, {
		dataIndex : 'over_speed_time',
		text : 'Over Speeding Time'
	}, {
		dataIndex : 'co2_emissions',
		text : 'CO2 Emissions'
	}, {
		dataIndex : 'max_cooling_water_temp',
		text : 'Max Cooling Water Temp'
	}, {
		dataIndex : 'avg_battery_volt',
		text : 'Average Battery Voltage'
	}, {
		dataIndex : 'created_at',
		text : 'Created At',
		xtype:'datecolumn',
		format:F('datetime'),
		width : 120
	}, {
		dataIndex : 'updated_at',
		text : 'Updated At',
		xtype:'datecolumn',
		format:F('datetime'),
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
		type : 'string',
		hidden : true
	}, {
		dataIndex : 'id',
		text : 'Vehicle Id',
		type : 'string'
	}, {
		dataIndex : 'registration_number',
		text : 'RegistrationNumber',
		type : 'string'
	}, {
		dataIndex : 'manufacturer',
		text : 'Manufacturer',
		type : 'string'
	}, {
		dataIndex : 'vehicle_type',
		text : 'VehicleType',
		type : 'string'
	}, {
		dataIndex : 'birth_year',
		text : 'BirthYear',
		type : 'string'
	}, {
		dataIndex : 'ownership_type',
		text : 'OwnershipType',
		type : 'string'
	}, {
		dataIndex : 'status',
		text : 'Status',
		type : 'string'
	}, {
		dataIndex : 'total_distance',
		text : 'TotalDistance',
		type : 'string'
	}, {
		dataIndex : 'remaining_fuel',
		text : 'RemainingFuel',
		type : 'string'
	}, {
		dataIndex : 'distance_since_new_oil',
		text : 'DistanceSinceNewOil',
		type : 'string'
	}, {
		dataIndex : 'engine_oil_status',
		text : 'EngineOilStatus',
		type : 'string'
	}, {
		dataIndex : 'fuel_filter_status',
		text : 'FuelFilterStatus',
		type : 'string'
	}, {
		dataIndex : 'brake_oil_status',
		text : 'BrakeOilStatus',
		type : 'string'
	}, {
		dataIndex : 'brake_pedal_status',
		text : 'BrakePedalStatus',
		type : 'string'
	}, {
		dataIndex : 'cooling_water_status',
		text : 'CoolingWaterStatus',
		type : 'string'
	}, {
		dataIndex : 'timing_belt_status',
		text : 'TimingBeltStatus',
		type : 'string'
	}, {
		dataIndex : 'spark_plug_status',
		text : 'SparkPlugStatus',
		type : 'string'
	}, {
		dataIndex : 'lattitude',
		text : 'Lattitude'
	}, {
		dataIndex : 'longitude',
		text : 'Longitude'
	}, {
		dataIndex : 'created_at',
		text : 'Created At',
		xtype : 'datecolumn',
		format : F('datetime'),
		width : 120
	}, {
		dataIndex : 'updated_at',
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
			var form = grid.up('monitor_information').down('form');
			form.loadRecord(record);
		}
	},
	onSearch : function(grid) {
		var id_filter = grid.down('textfield[name=id_filter]');
		var namefilter = grid.down('textfield[name=registration_number_field]');
		grid.store.clearFilter();

		grid.store.filter([ {
			property : 'id',
			value : id_filter.getValue()
		}, {
			property : 'registration_number',
			value : namefilter.getValue()
		} ]);
	},
	onReset : function(grid) {
		grid.down('textfield[name=id_filter]').setValue('');
		grid.down('textfield[name=registration_number_field]').setValue('');
	},
	tbar : [ 'ID', {
		xtype : 'textfield',
		name : 'id_filter',
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
		name : 'registration_number_field',
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
		this.items = [ this.ztitle, {
			xtype : 'container',
			height : 320,
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
		}, this.ztabpanel ];

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
//			google.maps.event.addListener(self.getMap(), 'click', function(e) {
//				Ext.Ajax.request({
//					url : 'track/save',
//					method : 'POST',
//					params : {
//						vehicle_id : self.getVehicle(),
//						driver_id : self.getDriver(),
//						terminal_id : self.getTerminal(),
//						lattitude : e.latLng.lat(),
//						longitude : e.latLng.lng()
//					},
//					success : function(resp, opts) {
//						var path = self.getTrackLine().getPath();
//						path.insertAt(0, e.latLng);
//						Ext.getStore('VehicleStore').load();
//					},
//					failure : function(resp, opts) {
//						console.log('Failed');
//						console.log(resp);
//					}
//				});
//			});
		});

		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
		});

		this.getTrackStore().on('load', function() {
			self.refreshTrack();
		});

		this.getIncidentStore().on('load', function() {
			if (self.isVisible(true))
				self.refreshIncidents();
		});

		this.sub('id').on('change', function(field, vehicle) {
			var record = self.getForm().getRecord();

			/*
			 * Get Vehicle Information (Image, Registration #, ..) from
			 * VehicleStore
			 */
			var vehicleStore = Ext.getStore('VehicleStore');
			var vehicleRecord = vehicleStore.findRecord('id', record.get('id'));
			var vehicleImageClip = vehicleRecord.get('image_clip');
			if (vehicleImageClip) {
				self.sub('vehicleImage').setSrc('download?blob-key=' + vehicleImageClip);
			} else {
				self.sub('vehicleImage').setSrc('resources/image/bgVehicle.png');
			}

			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', record.get('driver_id'));
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('image_clip');
			if (driverImageClip) {
				self.sub('driverImage').setSrc('download?blob-key=' + driverImageClip);
			} else {
				self.sub('driverImage').setSrc('resources/image/bgDriver.png');
			}

			self.sub('title').update({
				vehicle : vehicle + ' (' + vehicleRecord.get('registration_number') + ')',
				driver : driver + ' (' + driverRecord.get('name') + ')'
			});

			/*
			 * Get Address of the location by ReverseGeoCode.
			 */
			var location = record.get('location');
			if (location == null || location.length == 0) {
				var lattitude = record.get('lattitude');
				var longitude = record.get('longitude');

				if (lattitude !== undefined && longitude !== undefined) {
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
			}

			/*
			 * TrackStore를 다시 로드함.
			 */
			self.getTrackStore().load({
				filters : [ {
					property : 'vehicle_id',
					value : vehicle
				}, {
					property : 'date',
					/* for Unix timestamp (in seconds) */
					value : Math.round((new Date().getTime() - (60 * 60 * 24 * 1000)) / 1000)
				} ]
			});

			/*
			 * IncidentStore를 다시 로드함.
			 */
			self.getIncidentStore().load({
				filters : [ {
					property : 'vehicle_id',
					value : vehicle
				}, {
					property : 'confirm',
					value : false
				} ]
			});
		});
	},

	setVehicle : function(vehicleRecord) {
		this.getForm().loadRecord(vehicleRecord);
	},

	getForm : function() {
		if (!this.form)
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
		if (this.trackline)
			this.trackline.setMap(null);
		this.trackline = trackline;
	},

	getMarkers : function() {
		return this.markers;
	},

	setMarkers : function(markers) {
		if (this.markers) {
			Ext.each(this.markers, function(marker) {
				marker.setMap(null);
			});
		}

		this.markers = markers;
	},

	resetMarkers : function() {
		if (this.markers) {
			Ext.each(this.markers, function(marker) {
				marker.setMap(null);
			});
		}

		this.markers = null;
	},

	getTrackStore : function() {
		if (!this.trackStore)
			this.trackStore = Ext.getStore('TrackByVehicleStore');
		return this.trackStore;
	},

	getIncidentStore : function() {
		if (!this.incidentStore)
			this.incidentStore = Ext.getStore('IncidentByVehicleStore');
		return this.incidentStore;
	},

	getVehicle : function() {
		return this.sub('id').getValue();
	},

	getDriver : function() {
		return this.sub('driver').getValue();
	},

	getTerminal : function() {
		return this.sub('terminal').getValue();
	},

	refreshTrack : function() {
		this.setTrackLine(new google.maps.Polyline({
			map : this.getMap(),
			strokeColor : '#FF0000',
			strokeOpacity : 1.0,
			strokeWeight : 4
		}));
		this.setMarkers(null);

		var path = this.getTrackLine().getPath();
		var bounds;
		var latlng;

		this.getTrackStore().each(function(record) {
			latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
			path.push(latlng);
			if (!bounds)
				bounds = new google.maps.LatLngBounds(latlng, latlng);
			else
				bounds.extend(latlng);
		});

		if (!bounds) {
			var defaultLatlng = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
			bounds = new google.maps.LatLngBounds(defaultLatlng, defaultLatlng);
		}

		if (bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else {
			this.getMap().fitBounds(bounds);
		}

		var first = this.getTrackStore().first();
		if (first) {
			var start = new google.maps.Marker({
				position : new google.maps.LatLng(first.get('lattitude'), first.get('longitude')),
				map : this.getMap()
			});

			var last = this.getTrackStore().last();

			var end = new google.maps.Marker({
				position : new google.maps.LatLng(last.get('lattitude'), last.get('longitude')),
				icon : 'resources/image/iconStartPoint.png',
				map : this.getMap()
			});

			this.setMarkers([ start, end ]);
		}
	},

	incidentHandler : function(e, el, incident) {
		GreenFleet.doMenu('monitor_incident');
		GreenFleet.getMenu('monitor_incident').setIncident(incident, true);
	},

	refreshIncidents : function() {
		this.sub('incidents').removeAll();
		var max = this.getIncidentStore().count() > 4 ? 4 : this.getIncidentStore().count();
		for ( var i = 0; i < max; i++) {
			var incident = this.getIncidentStore().getAt(i);
			var self = this;
			this.sub('incidents').add(
					{
						xtype : 'box',
						cls : 'incidentThumb',
						listeners : {
							'render' : function() {
								this.getEl().on('click', self.incidentHandler, self, incident);
							}
						},
						data : {
							vehicle_id : incident.get('vehicle_id'),
							driver_id : incident.get('driver_id'),
							datetime : Ext.Date.format(incident.get('datetime'), 'Y-m-d H:i:s')
						},
						tpl : [ '<div class="vehicle">{vehicle_id}</div>', '<div class="driver">{driver_id}</div>',
								'<div class="date">{datetime}</div>' ]
					})
		}
	},

	ztitle : {
		xtype : 'box',
		cls : 'pageTitle',
		itemId : 'title',
		data : {
			vehicle : 'Vehicle',
			driver : 'Driver'
		},
		tpl : '<h1>Vehicle : <span class="vehicle">{vehicle}</span>, Driver : <span class="driver">{driver}</span></h1>',
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
			height : 160,
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
				cls : 'dotUnderline',
				itemId : 'id'
			}, {
				xtype : 'displayfield',
				name : 'driver_id',
				fieldLabel : 'Driver',
				cls : 'dotUnderline',
				itemId : 'driver'
			}, {
				xtype : 'displayfield',
				name : 'terminal_id',
				fieldLabel : 'Terminal',
				cls : 'dotUnderline',
				itemId : 'terminal'
			}, {
				xtype : 'displayfield',
				name : 'location',
				fieldLabel : 'Location',
				cls : 'dotUnderline',
				itemId : 'location'
			}, {
				xtype : 'displayfield',
				name : 'distance',
				cls : 'dotUnderline',
				fieldLabel : 'Run. Dist.'
			}, {
				xtype : 'displayfield',
				name : 'running_time',
				fieldLabel : 'Run. Time',
				cls : 'dotUnderline'
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
		this.items = [ {
			xtype : 'container',
			autoScroll : true,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			flex : 1,
			items : [ this.zInfo, this.zVideoAndMap ]
		}, this.zList ];

		this.callParent(arguments);

		/*
		 * Content
		 */

		var self = this;

		this.sub('map').on('afterrender', function() {
			var options = {
				zoom : 12,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.map = new google.maps.Map(self.sub('map').getEl().down('.map').dom, options);

			self.getLogStore().on('load', function() {
				self.refreshTrack();
			});
		});

		this.on('activate', function(comp) {
			google.maps.event.trigger(self.getMap(), 'resize');
		});

		this.down('button[itemId=search]').on('click', function() {
			self.refreshIncidentList();
		});

		this.down('button[itemId=reset]').on('click', function() {
			self.sub('vehicle_filter').reset();
			self.sub('driver_filter').reset();
		});

		this.down('displayfield[name=video_clip]').on('change', function(field, value) {
			var url = '';
			if (value != null && value.length > 1)
				url = 'src="download?blob-key=' + value + '"'

			self.sub('video').update({
				value : url
			});
		});

		this.down('datefield[name=datetime]').on('change', function(field, value) {
			self.sub('incident_time').setValue(Ext.Date.format(value, 'D Y-m-d H:i:s'));
		});

		this.down('displayfield[name=driver_id]').on('change', function(field, value) {
			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', value);
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('image_clip');
			if (driverImageClip) {
				self.sub('driverImage').setSrc('download?blob-key=' + driverImageClip);
			} else {
				self.sub('driverImage').setSrc('resources/image/bgDriver.png');
			}
		});

		this.sub('driver_filter').on('specialkey', function(fleld, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			}
		});

		this.sub('vehicle_filter').on('specialkey', function(field, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			}
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

		this.sub('incident_form').on('afterrender', function(form) {
			this.down('[itemId=confirm]').getEl().on('click', function(checkbox, dirty) {
				var form = self.sub('incident_form').getForm();

				if (form.getRecord() != null) {
					form.submit({
						url : 'incident/save',
						success : function(form, action) {
							self.refreshIncidentList(function() {
								/* Confirm 이후에는 그리드 리스트에서 사라지므로 찾을 수 없음. */
								// form.loadRecord(self.sub('grid').store.findRecord('key',
								// action.result.key));
							});
						},
						failure : function(form, action) {
							GreenFleet.msg('Failed', action.result.msg);
						}
					});
				}
			});
		});

	},

	getLogStore : function() {
		if (!this.logStore)
			this.logStore = Ext.getStore('IncidentLogStore');
		return this.logStore;
	},

	setIncident : function(incident, refresh) {
		this.incident = incident;
		if (refresh) {
			this.sub('vehicle_filter').setValue(incident.get('vehicle_id'));
			this.sub('driver_filter').reset();
			this.refreshIncidentList();
		}

		this.sub('incident_form').loadRecord(incident);
		this.refreshMap();
	},

	getIncident : function() {
		return this.incident;
	},

	refreshIncidentList : function(callback) {
		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle_id',
				value : this.sub('vehicle_filter').getValue()
			}, {
				property : 'driver_id',
				value : this.sub('driver_filter').getValue()
			}, {
				property : 'confirm',
				value : false
			} ],
			callback : callback
		});
	},

	getTrackLine : function() {
		return this.trackline;
	},

	setTrackLine : function(trackline) {
		if (this.trackline)
			this.trackline.setMap(null);
		this.trackline = trackline;
	},

	getMarker : function() {
		return this.marker;
	},

	setMarker : function(marker) {
		if (this.marker)
			this.marker.setMap(null);
		this.marker = marker;
	},

	refreshMap : function() {
		this.setMarker(null);

		var incident = this.getIncident();
		var location = null;
		if (!incident)
			location = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
		else
			location = new google.maps.LatLng(incident.get('lattitude'), incident.get('longitude'));

		this.getMap().setCenter(location);

		if (!incident)
			return;

		this.setMarker(new google.maps.Marker({
			position : location,
			map : this.getMap()
		}));

		this.getLogStore().clearFilter(true);
		this.getLogStore().filter([ {
			property : "incident",
			value : incident.get('key')
		} ]);
		this.getLogStore().load();
	},

	refreshTrack : function() {
		this.setTrackLine(new google.maps.Polyline({
			map : this.getMap(),
			strokeColor : '#FF0000',
			strokeOpacity : 1.0,
			strokeWeight : 4
		}));

		var path = this.getTrackLine().getPath();
		var bounds;
		var latlng;

		this.getLogStore().each(function(record) {
			latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
			path.push(latlng);
			if (!bounds)
				bounds = new google.maps.LatLngBounds(latlng, latlng);
			else
				bounds.extend(latlng);
		});

		if (!bounds)
			return;

		if (bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else {
			this.getMap().fitBounds(bounds);
		}
	},

	getMap : function() {
		return this.map;
	},

	zInfo : {
		xtype : 'form',
		itemId : 'incident_form',
		cls : 'incidentSummary',
		height : 50,
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
			xtype : 'textfield',
			name : 'key',
			hidden : true
		}, {
			xtype : 'image',
			itemId : 'driverImage',
			cls : 'imgDriverSmall',
			height : 37
		}, {
			xtype : 'datefield',
			name : 'datetime',
			hidden : true,
			format : 'd-m-Y H:i:s'
		}, {
			xtype : 'displayfield',
			itemId : 'incident_time',
			width : 160,
			fieldLabel : 'Incident Time'
		}, {
			xtype : 'displayfield',
			name : 'vehicle_id',
			width : 100,
			fieldLabel : 'Vehicle'
		}, {
			xtype : 'displayfield',
			name : 'driver_id',
			width : 100,
			fieldLabel : 'Driver'
		}, {
			xtype : 'displayfield',
			name : 'impulse_abs',
			width : 100,
			fieldLabel : 'Impulse'
		}, {
			xtype : 'displayfield',
			name : 'engine_temp',
			width : 100,
			fieldLabel : 'Engine Temp.'
		}, {
			xtype : 'checkbox',
			name : 'confirm',
			itemId : 'confirm',
			fieldLabel : 'Confirm',
			uncheckedValue : 'off',
			labelCls : 'labelStyle1',
			cls : 'backgroundNone'
		}, {
			xtype : 'displayfield',
			name : 'video_clip',
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
							},
							{
								xtype : 'box',
								cls : 'incidentDetail',
								itemId : 'video',
								tpl : [ '<video width="100%" height="95%" controls="controls">', '<source {value} type="video/mp4" />',
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
		store : 'IncidentByVehicleStore',
		autoScroll : true,
		flex : 1,
		columns : [ {
			dataIndex : 'key',
			text : 'Key',
			type : 'string',
			hidden : true
		}, {
			dataIndex : 'video_clip',
			text : 'V',
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			width : 20
		}, {
			dataIndex : 'confirm',
			text : 'Confirm',
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			align : 'center',
			width : 50
		}, {
			dataIndex : 'datetime',
			text : 'Incident Time',
			xtype : 'datecolumn',
			width : 120,
			format : 'd-m-Y H:i:s'
		}, {
			dataIndex : 'driver_id',
			text : 'Driver',
			type : 'string',
			width : 80
		}, {
			dataIndex : 'vehicle_id',
			text : 'Vehicle',
			type : 'string',
			width : 80
		}, {
			dataIndex : 'terminal_id',
			text : 'Terminal',
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
			dataIndex : 'velocity',
			text : 'Velocity',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_abs',
			text : 'Impulse',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_x',
			text : 'Impulse X',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_y',
			text : 'Impulse Y',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_z',
			text : 'Impulse Z',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_threshold',
			text : 'Impulse Threshold',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'obd_connected',
			text : 'OBD',
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			align : 'center',
			width : 40
		}, {
			dataIndex : 'engine_temp',
			text : 'Engine Temp.',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'engine_temp_threshold',
			text : 'Engine Temp. Threshold',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'created_at',
			text : 'Created At',
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'updated_at',
			text : 'Updated At',
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		} ],
		viewConfig : {},
		tbar : [ {
			xtype : 'combo',
			queryMode : 'local',
			store : 'VehicleStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : 'Vehicle',
			itemId : 'vehicle_filter',
			width : 200
		}, {
			xtype : 'combo',
			queryMode : 'local',
			store : 'DriverStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : 'Driver',
			itemId : 'driver_filter',
			width : 200
		}, {
			itemId : 'search',
			text : 'Search'
		}, {
			itemId : 'reset',
			text : 'Reset'
		} ]
	}
});

Ext.define('GreenFleet.view.common.CodeCombo', {
	extend : 'Ext.form.field.ComboBox',

	alias : 'widget.codecombo',
	
	queryMode : 'local',
	
	displayField: 'code',
	
	matchFieldWidth : false,

    typeAhead: true,
    
    emptyText : 'Alt+Q',
    
	group : 'V-Maker',
	
    initComponent : function() {
    	this.store = Ext.getStore('CodeStore').substore(this.group);
    	this.emptyText = this.fieldLabel;

    	this.callParent();
    },
	
	listConfig : {
		getInnerTpl : function() {
			return '<div class="codelist"><span class="code">{code}</span> ({desc})</div>'; 
		}, 
		minWidth : 200
	}
});

Ext.define('GreenFleet.view.form.TimeZoneCombo', {
	extend : 'Ext.form.field.ComboBox',
	
	alias : 'widget.tzcombo',
	
	fieldLabel: 'Choose TimeZone',
	
    store: 'TimeZoneStore',
    
    queryMode: 'local',
    
    displayField: 'display',
    
    valueField: 'value'
});
Ext.define('GreenFleet.view.form.DateTimeField', {
	extend : 'Ext.form.FieldContainer',
	alias: 'widget.datetimex',
	
	cls :'hboxLine',
	
	layout: {
        type: 'hbox',
        align:'top'
    },
	
    defaults:{margins:'0 3 0 0'},
	
	initComponent:function() {
		this.items = this.buildItems();
		
		this.callParent();
	},
	buildItems : function(){
		//var type = this.type; // date,time,datetime,datetimeto,dateto,timeto,
		var fieldId = 'valueField'; // + 1
		var items= [this.buildValue(fieldId)];
		if(this.type == 'date')			items.push(this.buildDate(fieldId,1));
		else if(this.type == 'time')	items.push(this.buildTime(fieldId,1));
		else if(this.type == 'datetime')	items.push(this.buildDate(fieldId,3),this.buildTime(fieldId,2));
		
		return items;
	},
	buildValue : function(fieldId){
		return {
			xtype : 'textfield',
			hidden : true,
			name : this.name,
			itemId : fieldId,
			value : this.getDefaultValue()
		};
	},
	buildDate : function(fieldId,flex){
		var valueDateFormat = this.getValueDateFormat();
		var valueTimeFormat = this.getValueTimeFormat();
		return {
			listeners : {
				change : function(field, newValue, oldValue){ 
					var targetField = this.up('fieldcontainer').getComponent(fieldId);
					var timeField = this.up('fieldcontainer').getComponent('time'+fieldId);
					var timeVal = '';
					var dateString = '';
					
					if(newValue)
						dateString = Ext.Date.format(newValue,valueDateFormat);
					
					if(timeField){
						timeVal = timeField.getValue();
						if (!timeVal)	timeVal = ''; 
						else timeVal = Ext.Date.format(timeVal,valueTimeFormat);
						targetField.setValue(dateString+timeVal);
					}
					else
						targetField.setValue(dateString);
                }
			},
			xtype: 'datefield',
			format : this.getDateFormat(), 
			name :  this.name+'_date',
			value : this.defaultValue,
			itemId : 'date'+fieldId,
			flex: flex
		};
	},
	
	buildTime : function(fieldId,flex){
		var valueDateFormat = this.getValueDateFormat();
		var valueTimeFormat = this.getValueTimeFormat();
		return {
			listeners : {
				change : function(field, newValue, oldValue){ 
					var targetField = this.up('fieldcontainer').getComponent(fieldId);
					var dateField = this.up('fieldcontainer').getComponent('date'+fieldId);
					var dateVal = '';
					var timeString = '';
					
					if(newValue)
						timeString = Ext.Date.format(newValue,valueTimeFormat);
					
					if(dateField){
						dateVal = dateField.getValue();
						if (!dateVal)	return; 
						dateVal = Ext.Date.format(dateVal,valueDateFormat);
						targetField.setValue(dateVal+timeString);
					}
					else
						targetField.setValue(timeString);
				}
			},
			xtype: 'timefield',
			format : this.getTimeFormat(),
			name : this.name+'_time',
			value : this.defaultValue,
			itemId : 'time'+fieldId,
			flex: flex
		};
	},
	getDefaultValue : function(){
		var valueFormat = this.getDateFormat()+this.getTimeFormat();
		if(this.defaultValue){	
			if (this.type == 'date'){
				valueFormatthis.getDateFormat();
			}
			else if (this.type == 'time'){
				valueFormat = this.getTimeFormat();
			}
			return Ext.Date.format(this.defaultValue,valueFormat);
		}
		return '';
	},
	getValueDateFormat : function(){
		if (this.valueDateFormat)
			return this.valueDateFormat;
		return 'Ymd'; //99991231
	},
	getValueTimeFormat : function(){
		if (this.valueTimeFormat)
			return this.valueTimeFormat;
		return 'Hi'; //2301
	},
	getDateFormat : function(){
		if (this.dateFormat)
			return this.dateFormat;
		return 'Y-m-d';// 9999-12-31
	},
	getTimeFormat : function(){
		if (this.timeFormat)
			return this.timeFormat;
		return 'H:i'; //23:01
	}
});
Ext.define('GreenFleet.view.form.SearchField', {
	extend : 'Ext.form.field.ComboBox',
	
	alias : 'widget.searchfield',
	
	queryMode : 'local',
	
	displayField : 'id',
	
	matchFieldWidth : false,
	
	typeAhead: true,
	
	emptyText : 'Alt+Q',
	
	store : 'VehicleStore',
	
	initComponent : function() {
		
		this.callParent();
		
		new Ext.util.KeyMap(document, {
			key : 'q',
			alt : true,
			fn : this.focus,
			scope : this
		});
	},
	
	listConfig : {
		loadingText : 'Searching...',
		emptyText : 'No matching vehicles found.',
		getInnerTpl : function() {
			return '<div class="appSearchItem"><span class="id">{id}</span> <span class="registration_number">{registration_number}</span></div>';
		},
		minWidth : 190
	},
	
	listeners : {
		'select' : function(combo, records, eOpts) {
			var store = Ext.getStore('VehicleFilteredStore');
			
			store.clearFilter();
			
			store.filter([ {
				property : 'id',
				value : records[0].get('id')
			} ]);
		}
	}
	
});

Ext.define('GreenFleet.view.common.EntityFormButtons', {
	extend : 'Ext.toolbar.Toolbar',
	
	alias : 'widget.entity_form_buttons',
	
	dock : 'bottom',
	
	layout : {
		align : 'middle',
		type : 'hbox'
	},
	
	items : [ {
		xtype : 'tbfill'
	}, {
		text : 'Save',
		itemId : 'save'
	}, {
		text : 'Delete',
		itemId : 'delete'
	}, {
		text : 'Reset',
		itemId : 'reset'
	} ],
	
	initComponent : function() {
		this.callParent();
		
		var self = this;
		
		this.down('#save').on('click', function() {
			var client = self.up('[entityUrl]');
			var url = client.entityUrl;
				
			var form = client.sub('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : url + '/save',
					success : function(form, action) {
						if(self.loader && typeof(self.loader.fn) === 'function') {
							self.loader.fn.call(self.loader.scope || client, function(records) {
								var store = client.sub('grid').store;
								form.loadRecord(store.findRecord('key', action.result.key));
							});
						}
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result.msg);
					}
				});
			}
		});

		this.down('#delete').on('click', function() {
			var client = self.up('[entityUrl]');
			var url = client.entityUrl;
				
			var form = client.sub('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : url + '/delete',
					success : function(form, action) {
//						client.sub('grid').store.load();
						if(self.loader && typeof(self.loader.fn) === 'function') {
							self.loader.fn.call(self.loader.scope || client, null);
						}
						form.reset();
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result.msg);
					}
				});
			}
		});

		this.down('#reset').on('click', function() {
			var client = self.up('[entityUrl]');

			client.sub('form').getForm().reset();
		});

	}
});
Ext.define('GreenFleet.view.dashboard.VehicleHealth', {
	extend : 'Ext.Container',
	
	alias : 'widget.dashboard_health',
	
	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	
	items : [{
		xtype : 'container',
		cls :'pageTitle',
		height: 35,
		html : '<h1>Vehicle Health</h1>'
	}],
	
	initComponent : function() {
		this.callParent();

		var content = this.add({
			xtype : 'panel',
			flex : 1,
			cls : 'paddingAll10',
			autoScroll : true,
			layout : {
				type : 'vbox',
				align : 'stretch'
			}
		})
		var row1 = content.add({
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			}
		});
		
		var row2 = content.add({
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			}
		});
		
		var store1 = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'age', 'data2', 'data3', 'data4', 'data5'],
		    data: [
		        { 'name': '~ 1Y',   'age': 10, 'data2': 12, 'data3': 14, 'data4': 8,  'data5': 13 },
		        { 'name': '1Y ~ 2Y',   'age': 13,  'data2': 8,  'data3': 16, 'data4': 10, 'data5': 3  },
		        { 'name': '2Y ~ 3Y', 'age': 18,  'data2': 2,  'data3': 14, 'data4': 12, 'data5': 7  },
		        { 'name': '3Y ~ 5Y',  'age': 5,  'data2': 14, 'data3': 6,  'data4': 1,  'data5': 23 },
		        { 'name': '5Y ~ 10Y',  'age': 3, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 },
		        { 'name': '10Y ~',  'age': 1, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 }
		    ]
		});

		var store2 = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'rd', 'data2', 'data3', 'data4', 'data5'],
		    data: [
		        { 'name': '~ 10K',   'rd': 1, 'data2': 12, 'data3': 14, 'data4': 8,  'data5': 13 },
		        { 'name': '10K ~ 30K',   'rd': 4,  'data2': 8,  'data3': 16, 'data4': 10, 'data5': 3  },
		        { 'name': '30K ~ 50K', 'rd': 5,  'data2': 2,  'data3': 14, 'data4': 12, 'data5': 7  },
		        { 'name': '50K ~ 100K',  'rd': 22,  'data2': 14, 'data3': 6,  'data4': 1,  'data5': 23 },
		        { 'name': '100K ~ 200K',  'rd': 12, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 },
		        { 'name': '200K ~',  'rd': 6, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 }
		    ]
		});

		var store3 = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'tb', 'eo', 'data3', 'data4', 'data5'],
		    data: [
		        { 'name': 'Health',   'tb': 31, 'eo': 27, 'data3': 14, 'data4': 8,  'data5': 13 },
		        { 'name': 'Impending',   'tb': 17,  'eo': 19,  'data3': 16, 'data4': 10, 'data5': 3  },
		        { 'name': 'Overdue', 'tb': 2,  'eo': 4,  'data3': 14, 'data4': 12, 'data5': 7  }
		    ]
		});

		row1.add(this.buildHealthChart('Vehicle Age', store1, 'age'));
		row1.add(this.buildHealthChart('Running Distance', store2, 'rd'));
		row2.add(this.buildHealthChart('Timing Belt Health', store3, 'tb'));
		row2.add(this.buildHealthChart('Engine Oil Health', store3, 'eo'));
		
	},
	
	buildHealthChart : function(title, store, idx) {
		return {
			xtype : 'panel',
			title : title,
			cls : 'paddingPanel healthDashboard',
			flex:1,
			height : 280,
			items : [{
				xtype: 'chart',
		        animate: true,
		        store: store,
				width : 440,
				height : 270,
		        shadow: true,
		        legend: {
		            position: 'right',
		            labelFont : '10px',
		            boxStroke : '#cfcfcf'
		        },
		        insetPadding: 15,
		        theme: 'Base:gradients',
		        series: [{
		            type: 'pie',
		            field: idx,
		            showInLegend: true,
		            donut: false,
		            tips: {
		              trackMouse: true,
		              width: 140,
		              height: 25,
		              renderer: function(storeItem, item) {
		                // calculate percentage.
		                var total = 0;
		                store.each(function(rec) {
		                    total += rec.get(idx);
		                });
		                this.setTitle(storeItem.get('name') + ': ' + Math.round(storeItem.get(idx) / total * 100) + '%');
		              }
		            },
		            highlight: {
		              segment: {
		                margin: 20
		              }
		            },
		            label: {
		                field: 'name',
		                display: 'rotate',
		                contrast: true,
		                font: '14px Arial'
		            }
		        }]
			}]
		}
	}

});
Ext.define('GreenFleet.view.pm.Consumable', {
	extend : 'Ext.Container',

	alias : 'widget.pm_consumable',

	title : 'Consumables',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;

		var consumables = Ext.create('Ext.data.Store', {
			fields : [ 'name', 'value' ],
			data : [ {
				name : 'Engine Oil',
				value : 'EngineOil'
			}, {
				name : 'Timing Belt',
				value : 'TimingBelt'
			}, {
				name : 'Spark Plug',
				value : 'SparkPlug'
			}, {
				name : 'Cooling Water',
				value : 'CoolingWater'
			}, {
				name : 'Brake Oil',
				value : 'BrakeOil'
			}, {
				name : 'Fuel Filter',
				value : 'FuelFilter'
			} ]
		});

		this.items = [ {
			html : '<div class="listTitle">Consumables Management</div>'
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.zvehiclelist(self, consumables), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.zvehicleinfo, this.zconsumables, this.zmainthistory ]
			} ]
		} ],

		this.callParent();

		this.sub('vehicle_info').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});
	},

	zvehiclelist : function(self, consumables) {
		return {
			xtype : 'gridpanel',
			itemId : 'vehicle_info',
			store : 'VehicleStore',
			title : 'Vehicle List',
			width : 300,
			tbar : [ {
				xtype : 'combo',
				itemId : 'consumables_combo',
				store : consumables,
				queryMode : 'local',
				displayField : 'name',
				valueField : 'value'
			}, {
				xtype : 'fieldcontainer',
				defaultType : 'checkboxfield',
				cls :'paddingLeft5',
				items : [ {
					cls : 'iconHealthH floatLeft',
					name : 'healthy',
					inputValue : '1',
					itemId : 'check_healthy',
					width:45
				}, {
//					boxLabel : 'Impending',
					cls : 'iconHealthI floatLeft',
					name : 'impending',
					inputValue : '1',
					itemId : 'check_impending',
					width:45
				}, {
//					boxLabel : 'Overdue',
					cls : 'iconHealthO floatLeft',
					name : 'overdue',
					inputValue : '1',
					itemId : 'check_overdue',
					width:45
				} ]
			} ],
			
			/*
			 * iconHealthH
			 * iconHealthI
			 * iconHealthO
			 */
			columns : [ {
				xtype:'templatecolumn',
				tpl:'<div class="iconHealthH" style="width:20px;height:20px;background-position:5px 3px"></div>',
				width : 35
			}, {
				dataIndex : 'id',
				text : 'Id',
				width : 100
			}, {
				dataIndex : 'registration_number',
				text : 'Reg. Number',
				width : 160
			} ]
		}
	},

	zvehicleinfo : {
		xtype : 'form',
		itemId : 'form',
		cls : 'hIndexbarZero',
		bodyCls : 'paddingAll10',
		title : 'Consumable Parts',
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
				fieldLabel : 'ID',
				name : 'id'
			}, {
				fieldLabel : 'Reg. Number',
				name : 'registration_number'
			}, {
				fieldLabel : 'Manufacturer',
				name : 'manufacturer'
			} ]
		}, {
			xtype : 'panel',
			flex : 1,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : 'Type',
				name : 'vehicle_type'
			}, {
				fieldLabel : 'Total Dist.',
				name : 'total_distance'
			}, {
				fieldLabel : 'Birth Year',
				name : 'birth_year'
			} ]
		} ]
	},

	zconsumables : {
		xtype : 'grid',
		store : 'ConsumableStore',
		cls : 'hIndexbar',
		flex : 1,
		columns : [ {
			header : 'Item',
			dataIndex : 'item'
		}, {
			header : 'Recent Replacement',
			dataIndex : 'recent_date'
		}, {
			header : 'Running Dist.',
			dataIndex : 'running_qty'
		}, {
			header : 'Replacement Dist.',
			dataIndex : 'threshold'
		}, {
			header : 'Health Rate',
			dataIndex : 'healthy',
			xtype : 'progresscolumn'
		}, {
			header : 'state',
			dataIndex : 'status'
		}, {
			header : 'Description',
			dataIndex : 'desc',
			flex : 1
		} ]
	},

	zmainthistory : {
		xtype : 'panel',
		autoScroll:true,
		title : 'Maint. History',
		flex : 1,
		cls : 'hIndexbar',
		layout : 'fit',
		html : '<div class="maintCell"><span>2011-11-16</span>Replaced Temperature Sensor</div>' 
			+ '<div class="maintCell"><span>2011-11-28</span>Replaced Timing Belt, Engine Oil, Spark Plug, Cooling Water, Brake Oil, Fuel Filter</div>'
//		items : [{
//			xtype : 'textarea',
//			value : '2011-11-16 Replaced Temperature Sensor\n' +
//			'2011-12-28 Replaced Timing Belt, Engine Oil, Spark Plug, Cooling Water, Brake Oil, Fuel Filter\n'
//		}]
	}
});

/**
 * @class Ext.ux.grid.column.Progress
 * @extends Ext.grid.Column
 * <p>
 * A Grid column type which renders a numeric value as a progress bar.
 * </p>
 * <p>
 * <b>Notes:</b><ul>
 * <li>Compatible with Ext 4.0</li>
 * </ul>
 * </p>
 * Example usage:
 * <pre><code>
    var grid = new Ext.grid.Panel({
        columns: [{
            dataIndex: 'progress'
            ,xtype: 'progresscolumn'
        },{
           ...
        ]}
        ...
    });
 * </code></pre>
 * <p>The column can be at any index in the columns array, and a grid can have any number of progress columns.</p>
 * @author Phil Crawford
 * @license Licensed under the terms of the Open Source <a href="http://www.gnu.org/licenses/lgpl.html">LGPL 3.0 license</a>.  Commercial use is permitted to the extent that the code/component(s) do NOT become part of another Open Source or Commercially licensed development library or toolkit without explicit permission.
 * @version 0.1 (June 30, 2011)
 * @constructor
 * @param {Object} config 
 */
Ext.define('GreenFleet.view.common.ProgressColumn', {
    extend: 'Ext.grid.column.Column'
    ,alias: 'widget.progresscolumn'
    
    ,cls: 'x-progress-column'
    
    /**
     * @cfg {String} progressCls
     */
    ,progressCls: 'x-progress'
    /**
     * @cfg {String} progressText
     */
    ,progressText: '{0} %'
    
    /**
     * @private
     * @param {Object} config
     */
    ,constructor: function(config){
        var me = this
            ,cfg = Ext.apply({}, config)
            ,cls = me.progressCls;

        me.callParent([cfg]);

//      Renderer closure iterates through items creating an <img> element for each and tagging with an identifying 
//      class name x-action-col-{n}
        me.renderer = function(v, meta) {
            var text, newWidth;
            
            newWidth = Math.floor(v * me.getWidth(true)); //me = column
            
//          Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
            v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments)||v : v; //this = renderer scope
            text = Ext.String.format(me.progressText,Math.round(v*100));
            
            meta.tdCls += ' ' + cls + ' ' + cls + '-' + me.ui;
            v = '<div class="' + cls + '-text ' + cls + '-text-back">' +
                    '<div>' + text + '</div>' +
                '</div>' +
                '<div class="' + cls + '-bar" style="width: '+ newWidth + 'px;">' +
                    '<div class="' + cls + '-text">' +
                        '<div>' + text + '</div>' +
                    '</div>' +
                '</div>' 
            return v;
        };    
        
    }//eof constructor
    

    /**
     * @private
     */
    ,destroy: function() {
        delete this.renderer;
        return this.callParent(arguments);
    }//eof destroy
    
}); //eo extend

//end of file
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
		name : 'desc',
		type : 'string'
	}, {
		name : 'timezone',
		type : 'int'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
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
Ext.define('GreenFleet.store.UserStore', {
	extend : 'Ext.data.Store',

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'email',
		type : 'string'
	}, {
		name : 'company',
		type : 'string'
	}, {
		name : 'forename',
		type : 'string'
	}, {
		name : 'nickname',
		type : 'string'
	}, {
		name : 'surname',
		type : 'string'
	}, {
		name : 'admin',
		type : 'boolean'
	}, {
		name : 'enabled',
		type : 'boolean'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'user',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.CodeGroupStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	fields : [ {
		name : 'group',
		type : 'string'
	}, {
		name : 'desc',
		type : 'string'
	} ],

	data : [ {
		group : 'V-Type1',
		desc : 'Type 1 of Vehicles'
	}, {
		group : 'V-Type2',
		desc : 'Type 2 of Vehicles'
	}, {
		group : 'V-Type3',
		desc : 'Type 3 of Vehicles'
	}, {
		group : 'V-Size',
		desc : 'Size of Vehicles'
	}, {
		group : 'V-Maker',
		desc : 'Vehicle Makers'
	}, {
		group : 'V-Model',
		desc : 'Vehicle Model'
	}, {
		group : 'V-BirthYear',
		desc : 'Vehicle Birth-Years'
	}, {
		group : 'V-Seat',
		desc : 'Count of Seat of Vehicle'
	}, {
		group : 'V-Fuel',
		desc : 'Types of Fuel of Vehicle'
	}, {
		group : 'ResvPurpose',
		desc : 'Type of Reservation Purpose'
	}, {
		group : 'ResvStatus',
		desc : 'Status of Reservation'
	}, {
		group : 'EmployeeTitle',
		desc : 'Titles of Employee'
	}, {
		group : 'Division',
		desc : 'Devisions of Company'
	}, {
		group : 'Consumable',
		desc : 'Kinds of Consumables'
	} ]
});
Ext.define('GreenFleet.store.CodeStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'group',
		type : 'string'
	}, {
		name : 'code',
		type : 'string'
	}, {
		name : 'desc',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'code',
		reader : {
			type : 'json'
		}
	},
	
	groupField: 'group',
    
	groupDir  : 'DESC',
	
	substore : function(group) {
		if(!this.substores)
			return null;
		return this.substores[group];
	},
	
	listeners : {
		load : function(store, records, success) {
			if(!success)
				return;
			store.substores = {};
			
			groups = store.getGroups();
			
			Ext.each(groups, function(group) {
				store.substores[group.name] = Ext.create('Ext.data.Store', {
					model : 'GreenFleet.model.Code',
					data : group.children
				})
			});
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
		name : 'registration_number',
		type : 'string'
	}, {
		name : 'manufacturer',
		type : 'string'
	}, {
		name : 'vehicle_type',
		type : 'string'
	}, {
		name : 'birth_year',
		type : 'int'
	}, {
		name : 'ownership_type',
		type : 'string'
	}, {
		name : 'status',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	}, {
		name : 'total_distance',
		type : 'float'
	}, {
		name : 'remaining_fuel',
		type : 'float'
	}, {
		name : 'distance_since_new_oil',
		type : 'float'
	}, {
		name : 'engine_oil_status',
		type : 'string'
	}, {
		name : 'fuel_filter_status',
		type : 'string'
	}, {
		name : 'brake_oil_status',
		type : 'string'
	}, {
		name : 'brake_pedal_status',
		type : 'string'
	}, {
		name : 'cooling_water_status',
		type : 'string'
	}, {
		name : 'timing_belt_status',
		type : 'string'
	}, {
		name : 'spark_plug_status',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'location',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
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
Ext.define('GreenFleet.store.VehicleMapStore', {
	extend : 'GreenFleet.store.VehicleStore',
	
	listeners : {
		load : function(store, data) {
			Ext.getStore('VehicleFilteredStore').loadData(data);
		}
	}
});
/*
 * This store only for local filtering. VehicleMapStore will load data on this
 * store. So, never Load this Store.
 */
Ext.define('GreenFleet.store.VehicleFilteredStore', {
	extend : 'GreenFleet.store.VehicleStore'
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
		name : 'social_id',
		type : 'string'
	}, {
		name : 'phone_no_1',
		type : 'string'
	}, {
		name : 'phone_no_2',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
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
		name : 'reserved_date',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'vehicle_type',
		type : 'string'
	}, {
		name : 'delivery_place',
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
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
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
	
//	remoteSort : true,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'velocity',
		type : 'float'
	}, {
		name : 'impulse_abs',
		type : 'float'
	}, {
		name : 'impulse_x',
		type : 'float'
	}, {
		name : 'impulse_y',
		type : 'float'
	}, {
		name : 'impulse_z',
		type : 'float'
	}, {
		name : 'impulse_threshold',
		type : 'float'
	}, {
		name : 'obd_connected',
		type : 'boolean'
	}, {
		name : 'confirm',
		type : 'boolean'
	}, {
		name : 'engine_temp',
		type : 'float'
	}, {
		name : 'engine_temp_threshold',
		type : 'float'
	}, {
		name : 'video_clip',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	sorters : [ {
		property : 'datetime',
		direction : 'DESC'
	} ],

	proxy : {
		type : 'ajax',
		url : 'incident',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.IncidentByVehicleStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

//	remoteFilter : true,
	
//	remoteSort : true,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'velocity',
		type : 'float'
	}, {
		name : 'impulse_abs',
		type : 'float'
	}, {
		name : 'impulse_x',
		type : 'float'
	}, {
		name : 'impulse_y',
		type : 'float'
	}, {
		name : 'impulse_z',
		type : 'float'
	}, {
		name : 'impulse_threshold',
		type : 'float'
	}, {
		name : 'obd_connected',
		type : 'boolean'
	}, {
		name : 'confirm',
		type : 'boolean'
	}, {
		name : 'engine_temp',
		type : 'float'
	}, {
		name : 'engine_temp_threshold',
		type : 'float'
	}, {
		name : 'video_clip',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	sorters : [ {
		property : 'datetime',
		direction : 'DESC'
	} ],

	proxy : {
		type : 'ajax',
		url : 'incident',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.IncidentLogStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

//	remoteFilter : true,
	
//	remoteSort : true,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'incident',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'velocity',
		type : 'float'
	}, {
		name : 'accelate_x',
		type : 'float'
	}, {
		name : 'accelate_y',
		type : 'float'
	}, {
		name : 'accelate_z',
		type : 'float'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	sorters : [ {
		property : 'datetime',
		direction : 'ASC'
	} ],

	proxy : {
		type : 'ajax',
		url : 'incident_log',
		reader : {
			type : 'json'
		}
	}
});
Ext.define('GreenFleet.store.TrackStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
//	remoteFilter : false,
	
//	remoteSort : true,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat : 'time'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'velocity',
		type : 'float'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	sorters : [ {
		property : 'datetime',
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
Ext.define('GreenFleet.store.CheckinDataStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'distance',
		type : 'float'
	}, {
		name : 'running_time',
		type : 'integer'
	}, {
		name : 'less_than_10km',
		type : 'int'
	}, {
		name : 'less_than_20km',
		type : 'int'
	}, {
		name : 'less_than_30km',
		type : 'int'
	}, {
		name : 'less_than_40km',
		type : 'int'
	}, {
		name : 'less_than_50km',
		type : 'int'
	}, {
		name : 'less_than_60km',
		type : 'int'
	}, {
		name : 'less_than_70km',
		type : 'int'
	}, {
		name : 'less_than_80km',
		type : 'int'
	}, {
		name : 'less_than_90km',
		type : 'int'
	}, {
		name : 'less_than_100km',
		type : 'int'
	}, {
		name : 'less_than_110km',
		type : 'int'
	}, {
		name : 'less_than_120km',
		type : 'int'
	}, {
		name : 'less_than_130km',
		type : 'int'
	}, {
		name : 'less_than_140km',
		type : 'int'
	}, {
		name : 'less_than_150km',
		type : 'int'
	}, {
		name : 'less_than_160km',
		type : 'int'
	}, {
		name : 'engine_start_time',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'engine_end_time',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'average_speed',
		type : 'float'
	}, {
		name : 'max_speed',
		type : 'int'
	}, {
		name : 'fuel_consumption',
		type : 'float'
	}, {
		name : 'fuel_efficiency',
		type : 'float'
	}, {
		name : 'sudden_accel_count',
		type : 'int'
	}, {
		name : 'sudden_brake_count',
		type : 'int'
	}, {
		name : 'idle_time',
		type : 'int'
	}, {
		name : 'eco_driving_time',
		type : 'int'
	}, {
		name : 'over_speed_time',
		type : 'int'
	}, {
		name : 'co2_emissions',
		type : 'float'
	}, {
		name : 'max_cooling_water_temp',
		type : 'float'
	}, {
		name : 'avg_battery_volt',
		type : 'float'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'checkin_data',
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
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'number'
	}, {
		name : 'longitude',
		type : 'number'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat : 'time'
	} ],

	sorters : [ {
		property : 'datetime',
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

	// remoteSort : true,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat : 'time'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'impulse_abs',
		type : 'float'
	}, {
		name : 'engine_temp',
		type : 'float'
	}, {
		name : 'video_clip',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat : 'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat : 'time'
	} ],

	filters : [ {
		property : 'confirm',
		value : false
	} ],

	sorters : [ {
		property : 'datetime',
		direction : 'DESC'
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
		name : 'serial_no',
		type : 'string'
	}, {
		name : 'buying_date',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'comment',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	}, {
		name : 'created_at',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updated_at',
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
Ext.define('GreenFleet.store.TimeZoneStore', {
	extend : 'Ext.data.Store',

	fields : [ 'value', 'display' ],

	data : [ {
		value : -12.0,
		display : "(GMT -12:00) Eniwetok, Kwajalein"
	}, {
		value : -11.0,
		display : "(GMT -11:00) Midway Island, Samoa"
	}, {
		value : -10.0,
		display : "(GMT -10:00) Hawaii"
	}, {
		value : -9.0,
		display : "(GMT -9:00) Alaska"
	}, {
		value : -8.0,
		display : "(GMT -8:00) Pacific Time (US &amp; Canada)"
	}, {
		value : -7.0,
		display : "(GMT -7:00) Mountain Time (US &amp; Canada)"
	}, {
		value : -6.0,
		display : "(GMT -6:00) Central Time (US &amp; Canada), Mexico City"
	}, {
		value : -5.0,
		display : "(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima"
	}, {
		value : -4.0,
		display : "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz"
	}, {
		value : -3.5,
		display : "(GMT -3:30) Newfoundland"
	}, {
		value : -3.0,
		display : "(GMT -3:00) Brazil, Buenos Aires, Georgetown"
	}, {
		value : -2.0,
		display : "(GMT -2:00) Mid-Atlantic"
	}, {
		value : -1.0,
		display : "(GMT -1:00 hour) Azores, Cape Verde Islands"
	}, {
		value : 0.0,
		display : "(GMT) Western Europe Time, London, Lisbon, Casablanca"
	}, {
		value : 1.0,
		display : "(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris"
	}, {
		value : 2.0,
		display : "(GMT +2:00) Kaliningrad, South Africa"
	}, {
		value : 3.0,
		display : "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg"
	}, {
		value : 3.5,
		display : "(GMT +3:30) Tehran"
	}, {
		value : 4.0,
		display : "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi"
	}, {
		value : 4.5,
		display : "(GMT +4:30) Kabul"
	}, {
		value : 5.0,
		display : "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent"
	}, {
		value : 5.5,
		display : "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi"
	}, {
		value : 5.75,
		display : "(GMT +5:45) Kathmandu"
	}, {
		value : 6.0,
		display : "(GMT +6:00) Almaty, Dhaka, Colombo"
	}, {
		value : 7.0,
		display : "(GMT +7:00) Bangkok, Hanoi, Jakarta"
	}, {
		value : 8.0,
		display : "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong"
	}, {
		value : 9.0,
		display : "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk"
	}, {
		value : 9.5,
		display : "(GMT +9:30) Adelaide, Darwin"
	}, {
		value : 10.0,
		display : "(GMT +10:00) Eastern Australia, Guam, Vladivostok"
	}, {
		value : 11.0,
		display : "(GMT +11:00) Magadan, Solomon Islands, New Caledonia"
	}, {
		value : 12.0,
		display : "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"
	} ]
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
Ext.define('GreenFleet.model.ConsumableHealth', {
	extend : 'Ext.data.Model',
	
	fields : [ {
		name : 'item'
	}, {
		name : 'recent_date'
	}, {
		name : 'running_qty',
	}, {
		name : 'threshold'
	}, {
		name : 'healthy',
		type : 'float'
	}, {
		name : 'status'
	}, {
		name : 'desc'
	} ]
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
Ext.define('GreenFleet.store.ConsumableStore', {
	extend : 'Ext.data.Store',

	model : 'GreenFleet.model.ConsumableHealth',

	data : [ {
		item : 'Engine Oil',
		recent_date : '2011-11-16',
		running_qty : '4200 Km',
		threshold : '5000 Km',
		healthy : 0.95,
		status : 'impending',
		desc : ''
	}, {
		item : 'Timing Belt',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '50000 Km',
		healthy : 0.046,
		status : 'healthy',
		desc : ''
	}, {
		item : 'Spark Plug',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '50000 Km',
		healthy : 0.56,
		status : 'healthy',
		desc : ''
	}, {
		item : 'Cooling Water',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '50000 Km',
		healthy : 0.046,
		status : 'healthy',
		desc : ''
	}, {
		item : 'Brake Oil',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '50000 Km',
		healthy : 0.28,
		status : 'healthy',
		desc : ''
	}, {
		item : 'Fuel Filter',
		recent_date : '2011-12-28',
		running_qty : '2300 Km',
		threshold : '5000 Km',
		healthy : 0.84,
		status : 'impending',
		desc : ''
	} ]
});

Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller',

	stores : [ 'CompanyStore', 'UserStore', 'CodeGroupStore', 'CodeStore', 'VehicleStore', 'VehicleMapStore', 'VehicleFilteredStore',
			'DriverStore', 'ReservationStore', 'IncidentStore', 'IncidentByVehicleStore', 'IncidentLogStore', 'TrackStore', 'VehicleTypeStore', 'OwnershipStore',
			'VehicleStatusStore', 'CheckinDataStore', 'TrackByVehicleStore', 'RecentIncidentStore', 'TerminalStore', 'TimeZoneStore', 'ConsumableStore' ],
	models : [ 'Code' ],
	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 'SideMenu', 'management.Company',
			'management.User', 'management.Code', 'management.Vehicle', 'management.Terminal', 'management.Reservation',
			'management.Incident', 'management.Driver', 'management.Track', 'management.CheckinData', 'monitor.Map',
			'monitor.CheckinByVehicle', 'monitor.InfoByVehicle', 'monitor.Information', 'monitor.IncidentView', 'common.CodeCombo',
			'form.TimeZoneCombo', 'form.DateTimeField', 'form.SearchField', 'common.EntityFormButtons', 'dashboard.VehicleHealth',
			'pm.Consumable', 'common.ProgressColumn' ],

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



