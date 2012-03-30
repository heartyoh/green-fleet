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
			delay : 3000,
			remove : true
		});
	}

	return {
		msg : showMessage
	};
}());

Ext.define('GreenFleet.mixin.User', function() {
	return {
		login : {
			key : login.key,
			email : login.email,
			id : login.username,
			name : login.username,
			language : login.language
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
				title : T('menu.import_data')
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

Ext.define('GreenFleet.store.IncidentLogChartStore', {
	extend : 'Ext.data.Store',

	fields : [ {
		name : 'datetime',
		type : 'date',
		dateFormat:'time'
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
	} ],
	
	sorters : [ {
		property : 'datetime',
		direction : 'ASC'
	} ],
	
	data : []
});
Ext.define('GreenFleet.view.management.Profile', {
	extend : 'Ext.window.Window',

	title : T('menu.profile'),
	
	modal : true,

	width : 560,
	height : 360,


	initComponent : function() {

		this.callParent(arguments);

		var self = this;

		this.down('[itemId=close]').on('click', function(button) {
			self.close();
		});

		this.down('[itemId=save]').on('click', function(button) {
			var form = self.down('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : '/user/save',
					success : function(form, action) {
						self.reload();
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result);
					}
				});
			}
		});
		
		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgDriver.png');
		});	

		this.reload();
	},
	
	reload : function() {
		this.down('form').load({
			url : '/user/find',
			method : 'GET',
			params : {
				key : GreenFleet.login.key
			}
		});
	},

	items : [ {
		xtype : 'form',
		itemId : 'form',
		bodyPadding : 10,
		flex : 1,
		autoScroll : true,
		layout : {
			type : 'table',
			columns : 2
		},
		defaults : {
			xtype : 'textfield',
			anchor : '100%'
		},
		items : [ {
			xtype : 'container',
			rowspan : 11,
			width : 260,
			height : 260,
			layout : {
				type : 'vbox',
				align : 'stretch'	
			},
			cls : 'noImage',
			items : [ {
				xtype : 'image',
				height : '100%',
				itemId : 'image'
			} ]			    	
		}, {
			name : 'key',
			fieldLabel : 'Key',
			hidden : true
		}, {
			name : 'name',
			fieldLabel : T('label.name')
		}, {
			name : 'email',
			fieldLabel : T('label.email')
		}, {
			xtype : 'checkbox',
			name : 'enabled',
			fieldLabel : T('label.enabled'),
			uncheckedValue : 'off'
		}, {
			xtype : 'checkbox',
			name : 'admin',
			fieldLabel : T('label.admin'),
			uncheckedValue : 'off'
		}, {
			name : 'company',
			fieldLabel : T('label.company'),
			disabled : true
		}, {
			xtype : 'combo',
			name : 'language',
			store : 'LanguageCodeStore',
			queryMode : 'local',
			displayField : 'display',
			valueField : 'value',
			fieldLabel : T('label.language')
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
			fieldLabel : T('label.created_at'),
			format : F('datetime')
		}, {
			xtype : 'displayfield',
			name : 'image_clip',
			itemId : 'image_clip',
			hidden : true
		}, {
			xtype : 'filefield',
			name : 'image_file',
			fieldLabel : T('label.image_upload'),
			msgTarget : 'side',
			allowBlank : true,
			buttonText : T('button.file')
		} ]
	} ],

	buttons : [ {
		text : T('button.save'),
		itemId : 'save'
	}, {
		text : T('button.close'),
		itemId : 'close'
	} ]

});
Ext.define('GreenFleet.view.common.ImportPopup', {
	extend : 'Ext.window.Window',
	
	modal : true,
	
	width : 350,
	height : 150,
	
	items : [{
		xtype : 'form',
		cls : 'paddingAll10',
		items : [ {
			xtype : 'filefield',
			name : 'file',
			fieldLabel : 'Import(CSV)',
			msgTarget : 'side',
			buttonText : 'file...'
		} ]
	}],
	
	buttons : [{
		text : 'Import',
		itemId : 'import'
	}, {
		text : 'Close',
		itemId : 'close'
	}],

	initComponent : function() {

		this.callParent(arguments);
		
		var self = this;
		
		this.down('[itemId=close]').on('click', function(button) {
			self.close();
		});
		
		this.down('[itemId=import]').on('click', function(button) {
			var form = self.down('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : self.importUrl,
					success : function(form, action) {
						if (self.client && self.client.afterImport instanceof Function)
							self.client.afterImport();
						self.close();
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result);
					}
				});
			}
		});
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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
        }
    },
    
    autoLoad: false
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

	initComponent : function() {
		this.callParent();

		var self = this;

		Ext.getCmp('menutab').getComponent('monitor_map').hide();
		Ext.getCmp('menutab').getComponent('information').hide();
		Ext.getCmp('menutab').getComponent('monitor_incident').hide();
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
		xtype : 'monitor_map',
		itemId : 'monitor_map',
		listeners : {
			activate : function(item) {
				var west = Ext.getCmp('west');
				var tab = west.getComponent(item.itemId);
				tab.addClass('active');

				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
				menutab.setActiveTab(tab);
			},
			deactivate : function(item) {
				var menutab = Ext.getCmp('west');
				var tab = menutab.getComponent(item.itemId);
				tab.removeCls('active');
			}
		}
	}, {
		xtype : 'monitor_information',
		itemId : 'information',
		listeners : {
			activate : function(item) {
				var west = Ext.getCmp('west');
				var tab = west.getComponent(item.itemId);
				tab.addClass('active');
			
				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
				menutab.setActiveTab(tab);
			},
			deactivate : function(item) {
				var menutab = Ext.getCmp('west');
				var tab = menutab.getComponent(item.itemId);
				tab.removeCls('active');
			}
		}
	}, {
		xtype : 'monitor_incident',
		itemId : 'monitor_incident',
		listeners : {
			activate : function(item) {
				var west = Ext.getCmp('west');
				var tab = west.getComponent(item.itemId);
				tab.addClass('active');
			
				var menutab = Ext.getCmp('menutab');
				var tab = menutab.getComponent(item.itemId);
				menutab.setActiveTab(tab);
			},
			deactivate : function(item) {
				var menutab = Ext.getCmp('west');
				var tab = menutab.getComponent(item.itemId);
				tab.removeCls('active');
			}
		}
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
				flex : 2
			}, {
				xtype : 'side_menu',
				flex : 1
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
	
	id : 'west',
		
	cls : 'tool',

	layout : {
		type : 'vbox'
	},
	items : [ {
		xtype : 'button',
		itemId : 'monitor_map',
		cls : 'btnDashboard',
		html : T('menu.map'),
		handler : function() {
			GreenFleet.doMenu('monitor_map');
		}
	}, {
		xtype : 'button',
		itemId : 'information',
		cls : 'btnInfo',
		html : T('menu.info'),
		handler : function() {
			GreenFleet.doMenu('information');
		}		
	}, {
		xtype : 'button',
		itemId : 'monitor_incident',
		cls : 'btnIncidentInfo',
		html : T('menu.incident'),
		handler : function() {
			GreenFleet.doMenu('monitor_incident');
		}		
	}, {
		xtype : 'button',
		cls : 'btnImport',
		html : T('menu.import_data'),
		handler : function() {
			GreenFleet.importData();
		}
	}, {
//		xtype : 'button',
//		cls : 'btnEvent',
//		html : 'incident log',
//		handler : function() {
//			GreenFleet.uploadIncidentLog();
//		}
//	}, {
//		xtype : 'button',
//		cls : 'btnEvent',
//		html : 'incident video',
//		handler : function() {
//			GreenFleet.uploadIncidentVideo();
//		}
//	}, {
		xtype : 'button',
		cls : 'btnExport',
		html : T('menu.export_data')
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
			GreenFleet.doMenu('monitor_map');

			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');

			GreenFleet.show_running_vehicle = true;
			if (GreenFleet.show_idle_vehicle) {
				GreenFleet.show_idle_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				GreenFleet.show_maint_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Running'
				} ])
			} else {
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
				GreenFleet.show_maint_vehicle = true;
			}
		});

		this.sub('state_idle').on('click', function() {
			GreenFleet.doMenu('monitor_map');

			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');

			GreenFleet.show_idle_vehicle = true;
			if (GreenFleet.show_incident_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				GreenFleet.show_maint_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Idle'
				} ])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
				GreenFleet.show_maint_vehicle = true;
			}
		});

		this.sub('state_incident').on('click', function() {
			GreenFleet.doMenu('monitor_map');

			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');

			GreenFleet.show_incident_vehicle = true;
			if (GreenFleet.show_running_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_idle_vehicle = false;
				GreenFleet.show_maint_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Incident'
				} ])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_maint_vehicle = true;
			}
		});

		this.sub('state_maint').on('click', function() {
			GreenFleet.doMenu('monitor_map');

			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');

			GreenFleet.show_maint_vehicle = true;
			if (GreenFleet.show_running_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_idle_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Maint'
				} ])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
			}
		});

		setInterval(function() {
			if (self.isHidden())
				return;

			self.sub('time').update(Ext.Date.format(new Date(), 'D Y-m-d H:i:s'));
		}, 1000);

		this.on('afterrender', function() {
			Ext.getStore('VehicleMapStore').on('load',self.refreshVehicleCounts, self);
			Ext.getStore('RecentIncidentStore').on('load', self.refreshIncidents, self);			
			Ext.getStore('VehicleGroupStore').on('load', self.refreshVehicleGroups, self);
		});
		
		Ext.getStore('RecentIncidentStore').load();
		// GAE Channel 연결 
		//this.initChannel();
	},

	// Channel 연결 시도
	initChannel : function() {
		var self = this;
		
		// 서버에 채널 생성 요청 
		Ext.Ajax.request({
			url : '/channel/init',
			method : 'POST',
			success : function(response) {
				self.openChannel(response.responseText);
			},
			failure : function(response) {
				Ext.Msg.alert(T('label.failure'), response.responseText);
			}
		});
	},
	
	// 서버로 부터 넘겨받은 토큰으로 채널 오픈 
	openChannel : function(token) {
		var self = this;
		var channel = new goog.appengine.Channel(token);
		var socket = channel.open();
		
		socket.onopen = function() {
			GreenFleet.msg('Channel', 'Channel opened!');
		};
		
		socket.onmessage = function(message) {			
			var data = Ext.String.trim(message.data);
			
			// 사고 상황
			if(data == 'Incident') {
				Ext.Msg.alert("Incident", "There seems to be an accident. Please check!");
				Ext.getStore('RecentIncidentStore').load();				
			} else {
				GreenFleet.msg("Message arrived", data);
			}
		};
		
		socket.onerror = function(error) {
			Ext.Msg.alert('Channel', "There was a problem with the channel connection!");
		};
		
		socket.onclose = function() {
			Ext.Msg.alert('Channel', "Channel closed!");
		};
	},
	
	toggleHide : function() {
		if (this.isVisible())
			this.hide();
		else
			this.show();
	},

	refreshVehicleCounts : function() {
		if (this.isHidden())
			return;

		var store = Ext.getStore('VehicleMapStore');

		var total = store.count();

		var running = 0;
		var idle = 0;
		var incident = 0;
		var maint = 0;

		store.each(function(record) {
			switch (record.get('status')) {
			case 'Running':
				running++;
				break;
			case 'Idle':
				idle++;
				break;
			case 'Incident':
				incident++;
				break;
			case 'Maint':
				maint++;
				break;
			}
		});

		this.sub('state_running').update(T('label.state_driving') + '</br><span>' + running + '</span>');
		this.sub('state_idle').update(T('label.state_idle') + '</br><span>' + idle + '</span>');
		this.sub('state_incident').update(T('label.state_incident') + '</br><span>' + incident + '</span>');
		this.sub('state_maint').update(T('label.state_maint') + '</br><span>' + maint + '</span>');
		this.sub('vehicle_count').update(T('title.total_running_vehicles') + ' : ' + total);
	},

	refreshIncidents : function(store) {
				
		if (!store)
			store = Ext.getStore('RecentIncidentStore');
		
		var incidents = this.sub('incidents');
		if(!incidents)
			incidents = this.up('viewport.east').sub('incidents');

		incidents.removeAll();
		var count = store.count() > 5 ? 5 : store.count();

		for (var i = 0; i < count; i++) {			
			var incident = store.getAt(i);
			incidents.add(
					{
						xtype : 'button',
						listeners : {
							click : function(button) {
								GreenFleet.doMenu('monitor_incident');
								GreenFleet.getMenu('monitor_incident').setIncident(button.incident, true);
							}
						},
						incident : incident,
						html : '<a href="#">'
								+ incident.get('vehicle_id')
								+ ', '
								+ incident.get('driver_id')
								+ '<span>'
								+ Ext.Date.format(incident.get('datetime'),
										'D Y-m-d H:i:s') + '</span></a>'
					});
		}
	},
	
	refreshVehicleGroups : function() {
		if (this.isHidden())
			return;

		var self = this;
		self.sub('vehicle_groups').removeAll();
		
		Ext.getStore('VehicleGroupStore').each(function(record) {
			self.sub('vehicle_groups').add(
					{
						xtype : 'button',
						listeners : {
							click : self.filterByVehicleGroup,
							scope : self
						},
						vehicleGroup : record,
						html : '<a href="#">'
								+ record.data.desc
								+ '<span>('
								+ record.data.vehicles.length
								+ ')</span></a>'
					});			
		});
	},

	filterByVehicleGroup : function(button) {
		GreenFleet.doMenu('monitor_map');
		this.sub('search').setValue('');

		var vehicleGroupId = button.vehicleGroup.get('id');
		var vehicleGroups = Ext.getStore('VehicleGroupStore').findRecord('id', vehicleGroupId);
		var vehicles = vehicleGroups? vehicleGroups.get('vehicles') : [];
		
		var vehicleStore = Ext.getStore('VehicleFilteredStore');
		vehicleStore.clearFilter();
		vehicleStore.filter([ {
			filterFn : function(record) {
				var myVehicleId = record.get('id');
				if (Ext.Array.indexOf(vehicles, myVehicleId) >= 0) {
					return true;
				}
			}
		} ]);
	},

	items : [ {
		xtype : 'searchfield',
		cls : 'searchField',
		fieldLabel : T('button.search'),
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
		html : T('title.total_running_vehicles') + ' : 0'
	}, {
		xtype : 'panel',
		title : T('title.vehicle_status'),
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
		}, {
			xtype : 'button',
			itemId : 'state_maint',
			flex : 1,
			cls : 'btnMaint'
		} ]
	}, {
		xtype : 'panel',
		title : T('title.vehicle_group'),
		cls : 'groupPanel',
		itemId : 'vehicle_groups'
	}, {
		xtype : 'panel',
		title : T('title.incidents_alarm'),
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
//		text : 'Dashboard',
//		submenus : [ {
//			title : 'File',
//			xtype : 'filemanager',
//			itemId : 'filemanager',
//			closable : true
//		} ]
//	}, {
		text : T('menu.company'),
		submenus : [ {
			title : T('menu.company'),
			xtype : 'management_company',
			itemId : 'company',
			closable : true
		}, {
			title : T('menu.user'),
			xtype : 'management_user',
			itemId : 'user',
			closable : true
		}, {
			title : T('menu.code'),
			xtype : 'management_code',
			itemId : 'code',
			closable : true
		}, {
			title : T('menu.vehicle_group'),
			xtype : 'management_vehicle_group',
			itemId : 'vehicle_group',
			closable : true
		}, {
			title : T('menu.consumable_code'),
			xtype : 'management_consumable_code',
			itemId : 'consumable_code',
			closable : true
		} ]
	}, {
		text : T('menu.vehicle'),
		submenus : [ {
			title : T('menu.vehicle'),
			xtype : 'management_vehicle',
			itemId : 'vehicle',
			closable : true
		}, {
			title : T('menu.incident'),
			xtype : 'management_incident',
			itemId : 'incident',
			closable : true
		}, {
			title : T('menu.track'),
			xtype : 'management_track',
			itemId : 'track',
			closable : true
		}, {
			title : T('menu.checkin_data'),
			xtype : 'management_checkin_data',
			itemId : 'checkin_data',
			closable : true
		} ]
	}, {
		text : T('menu.driver'),
		submenus : [ {
			title : T('menu.driver'),
			xtype : 'management_driver',
			itemId : 'driver',
			closable : true
		} ]
	}, {
		text : T('menu.terminal'),
		submenus : [ {
			title : T('menu.terminal'),
			xtype : 'management_terminal',
			itemId : 'terminal',
			closable : true
		} ]
	}, {
		text : T('menu.reservation'),
		submenus : [ {
			title : T('menu.reservation'),
			xtype : 'management_reservation',
			itemId : 'reservation',
			closable : true
		} ]
	}, {
		text : T('menu.maintenance'),
		submenus : [ {
			title : T('menu.consumables'),
			xtype : 'pm_consumable',
			itemId : 'consumable',
			closable : true
		}, {
			title : T('menu.vehicle_health'),
			xtype : 'dashboard_vehicle_health',
			itemId : 'vehicle_health',
			closable : true
		}, {
			title : T('menu.consumable_health'),
			xtype : 'dashboard_consumable_health',
			itemId : 'consumable_health',
			closable : true			
		} ]
	} ]
});
Ext.define('GreenFleet.view.SideMenu', {
	extend : 'Ext.toolbar.Toolbar',

	alias : 'widget.side_menu',
	
	cls : 'sideMenu',
	
	items : [ '->',
	{
		type : 'help',
		text : login.username,
		handler : function() {
			Ext.create('GreenFleet.view.management.Profile').show();
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
		cls : 'btnEastHidden',
		handler : function() {
			Ext.getCmp('east').toggleHide();
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

	title : T('title.company'),

	entityUrl : 'company',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : '<div class="listTitle">' + T('title.company_list') + '</div>'
	},

	initComponent : function() {
		var self = this;

		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
			
			var image = self.sub('image');
			var value = record.raw.image_clip;
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgVehicle.png');			
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
			store : 'CompanyStore',
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'id',
				text : T('label.id')
			}, {
				dataIndex : 'name',
				text : T('label.name')
			}, {
				dataIndex : 'desc',
				text : T('label.desc')
			}, {
				dataIndex : 'timezone',
				text : T('label.timezone')
			}, {
				dataIndex : 'language',
				text : T('label.language')
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
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
			tbar : [ T('label.id'), {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, T('label.name'), {
				xtype : 'textfield',
				name : 'name_filter',
				itemId : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.company_details'),
			height : 290,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},			
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
					fieldLabel : T('label.id')
				}, {
					name : 'name',
					fieldLabel : T('label.name')
				}, {
					name : 'desc',
					fieldLabel : T('label.desc')
				}, {
					xtype : 'tzcombo',
					name : 'timezone',
					fieldLabel : T('label.timezone')
				}, {
					xtype : 'combo',
					name : 'language',
				    store: 'LanguageCodeStore',
				    queryMode: 'local',
				    displayField: 'display',
				    valueField: 'value',
					fieldLabel : T('label.language')
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : T('label.image_upload'),
					msgTarget : 'side',
					allowBlank : true,
					buttonText : T('button.file')
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
					fieldLabel : T('label.created_at'),
					format : F('datetime')
				}, {
					xtype : 'displayfield',
					name : 'image_clip',
					itemId : 'image_clip',
					hidden : true
				}  ]
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

Ext.define('GreenFleet.view.management.User', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_user',

	title : T('title.user'),
	
	entityUrl : 'user',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;
		
		this.items = [ {
			html : "<div class='listTitle'>" + T('title.user_list') + "</div>"
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
		
		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgDriver.png');
		});	
		
	},

	search : function() {
		this.sub('grid').store.clearFilter();

		this.sub('grid').store.filter([ {
			property : 'email',
			value : this.sub('email_filter').getValue()
		}, {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'UserStore',
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'email',
				text : T('label.email')
			}, {
				dataIndex : 'name',
				text : T('label.name')
			}, {
				dataIndex : 'enabled',
				text : T('label.enabled')
			}, {
				dataIndex : 'admin',
				text : T('label.admin')
			}, {
				dataIndex : 'company',
				text : T('label.company')
//			}, {
//				dataIndex : 'locale',
//				text : T('label.locale')				
			}, {
				dataIndex : 'language',
				text : T('label.language')				
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ T('label.email'), {
				xtype : 'textfield',
				itemId : 'email_filter',
				name : 'email_filter',
				hideLabel : true,
				width : 200
			}, T('label.name'), {
				xtype : 'textfield',
				itemId : 'name_filter',
				name : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				xtype : 'button',
				itemId : 'search',
				text : T('button.search'),
				tooltip : 'Find User'
			}, {
				text : T('button.reset'),
				itemId : 'search_reset'
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'UserStore',
	            cls : 'pagingtoolbar',
	            displayInfo: true,
	            displayMsg: 'Displaying users {0} - {1} of {2}',
	            emptyMsg: "No users to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.user_details'),
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			height : 380,
			items : [ 
				{
					xtype : 'container',
					width : 300,
					layout : {
						type : 'vbox',
						align : 'stretch'	
					},
					cls : 'noImage',
					items : [ {
						xtype : 'image',
						height : '100%',
						itemId : 'image'
					} ]			    	
				},
			    {
					xtype : 'form',
					itemId : 'form',
					bodyPadding : 10,
					flex : 1,
					autoScroll : true,
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
							name : 'email',
							fieldLabel : T('label.email')
						}, {
							name : 'name',
							fieldLabel : T('label.name')
						}, {
							xtype : 'checkbox',
							name : 'enabled',
							fieldLabel : T('label.enabled'),
							uncheckedValue : 'off'
						}, {
							xtype : 'checkbox',
							name : 'admin',
							fieldLabel : T('label.admin'),
							uncheckedValue : 'off'
						}, {
							name : 'company',
							fieldLabel : T('label.company'),
							disable : true
//						}, {
//							xtype : 'combo',
//							name : 'locale',
//							store : 'LocaleStore',
//							displayField : 'name',
//							valueField : 'value',
//							fieldLabel : 'Locale'
						}, {
							xtype : 'combo',
							name : 'language',
						    store: 'LanguageCodeStore',
						    queryMode: 'local',
						    displayField: 'display',
						    valueField: 'value',
							fieldLabel : T('label.language')
						}, {
							xtype : 'filefield',
							name : 'image_file',
							fieldLabel : T('label.image_upload'),
							msgTarget : 'side',
							allowBlank : true,
							buttonText : T('button.file')
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
							fieldLabel : T('label.created_at'),
							format : F('datetime')
						}, {
							xtype : 'displayfield',
							name : 'image_clip',
							itemId : 'image_clip',
							hidden : true
						}
					]
			    }
			],
			
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

	title : T('title.code'),

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
			html : "<div class='listTitle'>" + T('title.code_list') + "</div>"
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
			title : T('title.code_group'),
			width : 320,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'group',
				text : T('label.group'),
				width : 100
			}, {
				dataIndex : 'desc',
				text : T('label.desc'),
				width : 220
			} ]
		}
	},

	buildCodeList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'CodeStore',
			title : T('title.code_list'),
			flex : 1,
			cls : 'hIndexbarZero',
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'group',
				text : T('label.group')
			}, {
				dataIndex : 'code',
				text : T('label.code')
			}, {
				dataIndex : 'desc',
				text : T('label.desc')
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
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
			title : T('title.code_details'),
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
				fieldLabel : T('label.group'),
				queryMode : 'local',
				store : 'CodeGroupStore',
				displayField : 'group',
				valueField : 'group'
			}, {
				name : 'code',
				fieldLabel : T('label.code')
			}, {
				name : 'desc',
				fieldLabel : T('label.desc')
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
				fieldLabel : T('label.created_at'),
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
					self.sub('grouped_vehicles_grid').setTitle("Vehicles By Group [" + record.get('id') + "]");
					self.sub('form').setTitle("Group [" + record.get('id') + "] Details");
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
				Ext.MessageBox.alert("None Selected!", "Select vehicle group first!");
				return;				
			}
			
			var selections = self.sub('all_vehicles_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.MessageBox.alert("None Selected!", "Select the vehicles to add vehicle group [" + self.currentVehicleGroup + "]");
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
				        GreenFleet.msg("Success", resultObj.msg);
				        self.changedGroupedVehicleCount();
			        } else {
			        	Ext.MessageBox.alert("Failure", resultObj.msg);
			        }
			    },
			    failure: function(response) {
			    	Ext.MessageBox.alert("Failure", response.responseText);
			    }
			});			
 		});
		
		/**
		 * 선택한 Vehicle들을 그룹에서 삭제 
		 */
		this.down('button[itemId=moveRight]').on('click', function(button) {
			if(!self.currentVehicleGroup) {
				Ext.Msg.alert("None Selected!", "Select vehicle group first!");
				return;				
			}
			
			var selections = self.sub('grouped_vehicles_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.Msg.alert("None Selected!", "Select the vehicles to remove from vehicle group [" + self.currentVehicleGroup + "]");
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
				        GreenFleet.msg("Success", resultObj.msg);
				        self.changedGroupedVehicleCount();
			        } else {
			        	Ext.MessageBox.alert("Failure", resultObj.msg);
			        }
			    },
			    failure: function(response) {
			        Ext.MessageBox.alert("Failure", response.responseText);
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
				fieldLabel : T('label.group')
			}, {
				name : 'desc',
				fieldLabel : T('label.desc')
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
				
				confirmMsgSave : 'Would you like to save the changed?',
				
				confirmMsgDelete : 'Would you like to delete selected vehicle group?',
				
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
Ext.define('GreenFleet.view.management.ConsumableCode', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_consumable_code',

	title : T('titla.consumable_code'),

	entityUrl : 'consumable_code',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'consumable_code/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : "<div class='listTitle'>" + T('title.consumable_code_list') + "</div>"
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

		this.sub('name_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
		});
	},

	search : function() {
		this.sub('grid').store.clearFilter();

		this.sub('grid').store.filter([ {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'ConsumableCodeStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'name',
				text : T('label.code'),
				type : 'string'
			}, {
				dataIndex : 'repl_unit',
				text : T('label.repl_unit'),
				type : 'string'
			}, {
				dataIndex : 'fst_repl_mileage',
				text : T('label.fst_repl_mileage'),
				type : 'int'
			}, {
				dataIndex : 'fst_repl_time',
				text : T('label.fst_repl_time'),
				type : 'int'					
			}, {
				dataIndex : 'repl_mileage',
				text : T('label.repl_mileage'),
				type : 'int'
			}, {
				dataIndex : 'repl_time',
				text : T('label.repl_time'),
				type : 'int'
			}, {
				dataIndex : 'desc',
				text : T('label.desc'),
				type : 'string'					
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ T('label.code'), {
				xtype : 'textfield',
				name : 'name_filter',
				itemId : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
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
			title : T('title.consumable_code_details'),
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
				name : 'name',
				fieldLabel : T('label.code')
			}, {
				name : 'repl_unit',
				xtype : 'codecombo',
				group : 'ReplacementUnit',				
				fieldLabel : T('label.repl_unit')
			}, {
				name : 'fst_repl_mileage',
				xtype : 'numberfield',
				minValue : 0,
				maxValue : 500000,
				fieldLabel : T('label.fst_repl_mileage') + " (km)"
			}, {
				name : 'fst_repl_time',
				xtype : 'numberfield',
				minValue : 0,
				maxValue : 300,
				fieldLabel : T('label.fst_repl_time') + "(month)"				
			}, {
				name : 'repl_mileage',
				xtype : 'numberfield',
				minValue : 0,
				maxValue : 500000,				
				fieldLabel : T('label.repl_mileage') + " (km)"
			}, {
				name : 'repl_time',
				xtype : 'numberfield',
				minValue : 0,
				maxValue : 300,				
				fieldLabel : T('label.repl_time') + "(month)"
			}, {
				name : 'desc',
				fieldLabel : T('label.desc')
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
				fieldLabel : T('label.created_at'),
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

	title : T('title.vehicle'),

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
		html : "<div class='listTitle'>" + T('title.vehicle_list') + "</div>"
	},

	initComponent : function() {
		var self = this;
		
		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
			var store = self.sub('edit_consumables_grid').store; 
			store.getProxy().extraParams.vehicle_id = record.get('id');
			store.load();
		});

		this.sub('grid').on('render', function(grid) {
		});

		this.sub('id_filter').on('change', function(field, value) {
			self.search(false);
		});

		this.sub('registration_number_filter').on('change', function(field, value) {
			self.search(false);
		});
		
		this.down('#search_reset').on('click', function() {
			self.sub('id_filter').setValue('');
			self.sub('registration_number_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search(true);
		});
		
		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgVehicle.png');
		});
		
	},

	search : function(searchRemote) {
		
		var id_filter_value = this.sub('id_filter').getValue();
		var registration_filter_value = this.sub('registration_number_filter').getValue();
		this.sub('grid').store.clearFilter(true);
		
		this.sub('grid').store.filter([ {
			property : 'id',
			value : id_filter_value
		}, {
			property : 'registration_number',
			value : registration_filter_value
		} ]);
		
		if(searchRemote) {
			this.sub('grid').store.load();
		}
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'VehicleStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : T('label.id'),
				type : 'string'
			}, {
				dataIndex : 'registration_number',
				text : T('label.reg_no'),
				type : 'string'
			}, {
				dataIndex : 'manufacturer',
				text : T('label.manufacturer'),
				type : 'string'
			}, {
				dataIndex : 'vehicle_type',
				text : T('label.x_type', {x: T('label.vehicle')}),
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
				dataIndex : 'health_status',
				text : T('label.health'),
				type : 'string'
			}, {
				dataIndex : 'total_distance',
				text : T('label.total_x', {x : T('label.distance')}),
				type : 'string'
			}, {
				dataIndex : 'remaining_fuel',
				text : T('label.remaining_fuel'),
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : T('label.lattitude')
			}, {
				dataIndex : 'longitude',
				text : T('label.longitude')
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ T('label.id'), {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 133
			}, T('label.reg_no'), {
				xtype : 'textfield',
				name : 'registration_number_filter',
				itemId : 'registration_number_filter',
				hideLabel : true,
				width : 133
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',	
			title : T('title.vehicle_details'),
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [
			    {
			    	xtype : 'form',
			    	itemId : 'form',
			    	flex : 3.5,
			    	autoScroll : true,
			    	defaults : {
			    		xtype : 'textfield',
			    		anchor : '100%'
			    	},
			    	items : [ 
			    	    {
			    	    	xtype : 'image',
			    	    	anchor : '25%',
			    	    	height : '150',
			    	    	itemId : 'image',
			    	    	cls : 'paddingBottom10'
			    	    },			    	         
				    	{
				    		name : 'key',
				    		fieldLabel : 'Key',
				    		hidden : true
						}, {
							name : 'id',
							fieldLabel : T('label.id')
						}, {
							name : 'registration_number',
							fieldLabel : T('label.reg_no')
						}, {
							xtype : 'codecombo',
							name : 'manufacturer',
							group : 'V-Maker',
							fieldLabel : T('label.manufacturer')
						}, {
							xtype : 'codecombo',
							name : 'vehicle_type',
							group : 'V-Type1',
							fieldLabel : T('label.x_type', {x : T('label.vehicle')})
						}, {
							xtype : 'filefield',
							name : 'image_file',
							fieldLabel : T('label.image_upload'),
							msgTarget : 'side',
							allowBlank : true,
							buttonText : T('button.file')
						}, {
							xtype : 'codecombo',
							name : 'birth_year',
							group : 'V-BirthYear',
							name : 'birth_year',
							fieldLabel : T('label.birth_year')
						}, {
							xtype : 'combo',
							name : 'ownership_type',
							queryMode : 'local',
							store : 'OwnershipStore',
							displayField : 'desc',
							valueField : 'name',
							fieldLabel : T('label.x_type', {x : T('label.ownership')})
						}, {
							xtype : 'combo',
							name : 'status',
							queryMode : 'local',
							store : 'VehicleStatusStore',
							displayField : 'desc',
							valueField : 'status',
							fieldLabel : T('label.status')
						}, {
							name : 'health_status',
							fieldLabel : T('label.health')							
						}, {
							name : 'total_distance',
							fieldLabel : T('label.total_x', {x : T('label.distance')})
						}, {
							name : 'remaining_fuel',
							fieldLabel : T('label.remaining_fuel')
						}, {
							name : 'driver_id',
							fieldLabel : T('label.driver'),
							disabled : true
						}, {
							name : 'terminal_id',
							fieldLabel : T('label.terminal'),
							disabled : true
						}, {
							name : 'lattitude',
							fieldLabel : T('label.lattitude'),
							disabled : true
						}, {
							name : 'longitude',
							fieldLabel : T('label.longitude'),
							disabled : true
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
							fieldLabel : T('label.created_at'),
							format : F('datetime')
						}, {
							xtype : 'displayfield',
							name : 'image_clip',
							itemId : 'image_clip',
							hidden : true
						} 
					]
				}, {
					xtype : 'management_vehicle_consumable_grid',
					itemId : 'editable_grid',
					flex : 6.5,
					cls : 'paddingLeft10'
				}
			],
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

	title : T('title.terminal'),

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
		html : "<div class='listTitle'>" + T('title.terminal_list') + "</div>"
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
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : T('label.id'),
				type : 'string'
			}, {
				dataIndex : 'serial_no',
				text : T('label.x_no', {x : T('label.serial')}),
				type : 'string'
			}, {
				dataIndex : 'buying_date',
				text : T('label.x_date', {x : T('label.buying')}),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'comment',
				text : T('label.comment'),
				type : 'string',
				width : 160
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ T('label.id'), {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, T('label.x_no', {x : T('label.serial')}), {
				xtype : 'textfield',
				name : 'serial_no_filter',
				itemId : 'serial_no_filter',
				hideLabel : true,
				width : 200
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
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
			title : T('title.terminal_details'),
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
					fieldLabel : T('label.id')
				}, {
					name : 'serial_no',
					fieldLabel : T('label.x_no', {x : T('label.serial')})
				}, {
					xtype : 'datefield',
					name : 'buying_date',
					fieldLabel : T('label.x_date', {x : T('label.buying')}),
					format : F('date')
				}, {
					xtype : 'textarea',
					name : 'comment',
					fieldLabel : T('label.comment')
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : T('label.image_upload'),
					msgTarget : 'side',
					allowBlank : true,
					buttonText : T('button.file')
				}, {
					xtype : 'datefield',
					name : 'updated_at',
					disabled : true,
					fieldLabel : T('label.updated_at'),
					format: F('datetime')
				}, {
					xtype : 'datefield',
					name : 'created_at',
					disabled : true,
					fieldLabel : T('label.created_at'),
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

	title : T('title.reservation'),

	entityUrl : 'reservation',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : "<div class='listTitle'>" + T('title.reservation_list') + "</div>"
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
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : T('label.id'),
				type : 'string'
			}, {
				dataIndex : 'reserved_date',
				text : T('label.reserved_date'),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver'),
				type : 'string'
			}, {
				dataIndex : 'vehicle_id',
				text : T('label.vehicle'),
				type : 'string'
			}, {
				dataIndex : 'vehicle_type',
				text : T('label.x_type', {x : T('label.vehicle')}),
				type : 'string'
			}, {
				dataIndex : 'delivery_place',
				text : T('label.delivery_place'),
				type : 'string'
			}, {
				dataIndex : 'destination',
				text : T('label.destination'),
				type : 'string'
			}, {
				dataIndex : 'purpose',
				text : T('label.purpose'),
				type : 'string'
			}, {
				dataIndex : 'status',
				text : T('label.status'),
				type : 'string'
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ T('label.vehicle'), {
				xtype : 'textfield',
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				hideLabel : true,
				width : 200
			}, T('label.date'), {
				xtype : 'datefield',
				name : 'reserved_date_filter',
				itemId : 'reserved_date_filter',
				hideLabel : true,
				width : 200
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
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
				fieldLabel : T('label.id'),
				disabled : true
			}, {
				xtype : 'datefield',
				name : 'reserved_date',
				fieldLabel : T('label.reserved_date'),
				format : F('date')
			}, {
				name : 'vehicle_type',
				fieldLabel : T('label.x_type', {x : T('label.vehicle')})
			}, {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode : 'local',
				store : 'VehicleBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.vehicle')
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode : 'local',
				store : 'DriverBriefStore',
				displayField : 'name',
				valueField : 'id',
				fieldLabel : T('label.driver')
			}, {
				name : 'status',
				fieldLabel : T('label.status')
			}, {
				name : 'delivery_place',
				fieldLabel : T('label.delivery_place')
			}, {
				name : 'destination',
				fieldLabel : T('label.destination')
			}, {
				name : 'purpose',
				fieldLabel : T('label.purpose')
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
				fieldLabel : T('label.created_at'),
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

	title : T('title.incident'),

	entityUrl : 'incident',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : "<div class='listTitle'>" + T('title.incident_list') + "</div>"
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

		this.down('#grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			operation.params['vehicle_id'] = self.sub('vehicle_filter').getSubmitValue();
			operation.params['driver_id'] = self.sub('driver_filter').getSubmitValue();
			operation.params['date'] = self.sub('date_filter').getSubmitValue();
		});

		this.sub('fullscreen').on('afterrender', function(comp) {
			comp.getEl().on('click', function() {
				if (!Ext.isWebKit)
					return;
				self.sub('video').getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
			});
		});

	},

	search : function() {
		this.sub('pagingtoolbar').moveFirst();
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'IncidentStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'datetime',
				text : T('label.x_time', {x : T('label.incident')}),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver'),
				type : 'string'
			}, {
				dataIndex : 'vehicle_id',
				text : T('label.vehicle'),
				type : 'string'
			}, {
				dataIndex : 'terminal_id',
				text : T('label.terminal'),
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : T('label.lattitude'),
				type : 'number'
			}, {
				dataIndex : 'longitude',
				text : T('label.longitude'),
				type : 'number'
			}, {
				dataIndex : 'velocity',
				text : T('label.velocity'),
				type : 'number'
			}, {
				dataIndex : 'impulse_abs',
				text : T('label.impulse'),
				type : 'number'
			}, {
				dataIndex : 'impulse_x',
				text : T('label.impulse_x', {x : 'X'}),
				type : 'number'
			}, {
				dataIndex : 'impulse_y',
				text :  T('label.impulse_x', {x : 'Y'}),
				type : 'number'
			}, {
				dataIndex : 'impulse_z',
				text :  T('label.impulse_x', {x : 'Z'}),
				type : 'number'
			}, {
				dataIndex : 'impulse_threshold',
				text : T('label.impulse_threshold'),
				type : 'number'
			}, {
				dataIndex : 'engine_temp',
				text : T('label.engine_temp'),
				type : 'number'
			}, {
				dataIndex : 'engine_temp_threshold',
				text : T('label.engine_temp_threshold'),
				type : 'number'
			}, {
				dataIndex : 'obd_connected',
				text : T('label.obd_connected'),
				type : 'boolean'
			}, {
				dataIndex : 'confirm',
				text : T('label.confirm'),
				type : 'boolean'
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype : 'datecolumn',
				format : F('datetime')
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype : 'datecolumn',
				format : F('datetime')
			} ],
			viewConfig : {

			},
			tbar : [ {
				xtype : 'combo',
				name : 'vehicle',
				queryMode : 'local',
				store : 'VehicleBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.vehicle'),
				itemId : 'vehicle_filter',
				name : 'vehicle_filter',
				width : 200
			}, {
				xtype : 'combo',
				name : 'driver',
				queryMode : 'local',
				store : 'DriverBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.driver'),
				itemId : 'driver_filter',
				name : 'driver_filter',
				width : 200
			}, {
		        xtype: 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : T('label.date'),
				format: 'Y-m-d',
				submitFormat : 'U',
		        maxValue: new Date(),  // limited to the current date or prior
		        value : new Date(),
				width : 200
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
				itemId : 'search_reset'
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'IncidentStore',
	            displayInfo: true,
	            cls : 'pagingtoolbar',
	            displayMsg: 'Displaying incidents {0} - {1} of {2}',
	            emptyMsg: "No incidents to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.incident_details'),
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
							fieldLabel : T('label.x_time', {x : T('label.incident')}),
							submitFormat : F('datetime')
						}, {
							xtype : 'combo',
							name : 'vehicle_id',
							queryMode : 'local',
							store : 'VehicleBriefStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : T('label.vehicle')
						}, {
							xtype : 'combo',
							name : 'driver_id',
							queryMode : 'local',
							store : 'DriverBriefStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : T('label.driver')
						}, {
							xtype : 'combo',
							name : 'terminal_id',
							queryMode : 'local',
							store : 'TerminalStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : T('label.terminal')
						}, {
							xtype : 'textfield',
							name : 'lattitude',
							fieldLabel : T('label.lattitude')
						}, {
							xtype : 'textfield',
							name : 'longitude',
							fieldLabel : T('label.longitude')
						}, {
							xtype : 'textfield',
							name : 'velocity',
							fieldLabel : T('label.velocity')
						}, {
							xtype : 'textfield',
							name : 'impulse_abs',
							fieldLabel : T('label.impulse')
						}, {
							xtype : 'textfield',
							name : 'impulse_x',
							fieldLabel : T('label.impulse_x', {x : 'X'})
						}, {
							xtype : 'textfield',
							name : 'impulse_y',
							fieldLabel : T('label.impulse_x', {x : 'Y'})
						}, {
							xtype : 'textfield',
							name : 'impulse_z',
							fieldLabel : T('label.impulse_x', {x : 'Z'})
						}, {
							xtype : 'textfield',
							name : 'impulse_threshold',
							fieldLabel : T('label.impulse_threshold')
						}, {
							xtype : 'textfield',
							name : 'engine_temp',
							fieldLabel : T('label.engine_temp')
						}, {
							xtype : 'textfield',
							name : 'engine_temp_threshold',
							fieldLabel : T('label.engine_temp_threshold')
						}, {
							xtype : 'checkbox',
							name : 'obd_connected',
							uncheckedValue : 'off',
							fieldLabel : T('label.obd_connected')
						}, {
							xtype : 'checkbox',
							name : 'confirm',
							uncheckedValue : 'off',
							fieldLabel : T('label.confirm')
						}, {
							xtype : 'filefield',
							name : 'video_file',
							fieldLabel : T('label.video_upload'),
							msgTarget : 'side',
							allowBlank : true,
							buttonText : T('button.file')
						}, {
							xtype : 'datefield',
							name : 'updated_at',
							disabled : true,
							fieldLabel : T('label.updated_at'),
							format : 'd-m-Y H:i:s'
						}, {
							xtype : 'datefield',
							name : 'created_at',
							disabled : true,
							fieldLabel : T('label.created_at'),
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
									itemId : 'fullscreen',
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

	title : T('title.driver'),
	
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
		html : "<div class='listTitle'>" + T('title.driver_list') + "</div>"
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
			flex : 2.5,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : T('label.id'),
				type : 'string'
			}, {
				dataIndex : 'name',
				text : T('label.name'),
				type : 'string'
			}, {
				dataIndex : 'division',
				text : T('label.division'),
				type : 'string'
			}, {
				dataIndex : 'title',
				text : T('label.title'),
				type : 'string'
			}, {
				dataIndex : 'social_id',
				text : T('label.x_id', {x : T('label.social')}),
				type : 'string'
			}, {
				dataIndex : 'phone_no_1',
				text : T('label.phone_x', {x : 1}),
				type : 'string'
			}, {
				dataIndex : 'phone_no_2',
				text : T('label.phone_x', {x : 2}),
				type : 'string'
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ T('label.id'), {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, T('label.name'), {
				xtype : 'textfield',
				name : 'name_filter',
				itemId : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
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
			title : T('title.driver_details'),
			layout : {
				type : 'hbox',
				align : 'stretch'	
			},
			flex : 1,
			items : [ 
				{
					xtype : 'container',
					flex : 1,
					layout : {
						type : 'vbox',
						align : 'stretch'	
					},
					cls : 'noImage',
					items : [ {
						xtype : 'image',
						height : '100%',
						itemId : 'image'
					} ]
				}, 			         
			    {
					xtype : 'form',
					itemId : 'form',
					autoScroll : true,
					bodyPadding : 10,
					flex : 8,
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
						fieldLabel : T('label.id')
					}, {
						name : 'name',
						fieldLabel : T('label.name')
					}, {
						xtype : 'codecombo',
						name : 'division',
						group : 'Division',
						fieldLabel : T('label.division')
					}, {
						xtype : 'codecombo',
						name : 'title',
						group : 'EmployeeTitle',
						fieldLabel : T('label.title')
					}, {
						name : 'social_id',
						fieldLabel : T('label.x_id', {x : T('label.social')})
					}, {
						name : 'phone_no_1',
						fieldLabel : T('label.phone_x', {x : 1})
					}, {
						name : 'phone_no_2',
						fieldLabel : T('label.phone_x', {x : 2})
					}, {
						xtype : 'filefield',
						name : 'image_file',
						fieldLabel : T('label.image_upload'),
						msgTarget : 'side',
						allowBlank : true,
						buttonText : T('button.file')
					}, {
						xtype : 'datefield',
						name : 'updated_at',
						disabled : true,
						fieldLabel : T('label.updated_at'),
						format: F('datetime')
					}, {
						xtype : 'datefield',
						name : 'created_at',
						disabled : true,
						fieldLabel : T('label.created_at'),
						format: F('datetime')
					}, {
						xtype : 'displayfield',
						name : 'image_clip',
						itemId : 'image_clip',
						hidden : true
					} ]
				}
			],
			
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

	title : T('title.track'),

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
		html : "<div class='listTitle'>" + T('title.tracking_list') + "</div>"
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
		
		this.down('#grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			operation.params['vehicle_id'] = self.sub('vehicle_filter').getSubmitValue();
			operation.params['date'] = self.sub('date_filter').getSubmitValue();
		});

	},

	search : function() {
		this.sub('pagingtoolbar').moveFirst();
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'TrackStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'terminal_id',
				text : T('label.terminal'),
				type : 'string'
			}, {
				dataIndex : 'vehicle_id',
				text : T('label.vehicle'),
				type : 'string'
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver'),
				type : 'string'
			}, {
				dataIndex : 'datetime',
				text : T('label.datetime'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'lattitude',
				text : T('label.lattitude'),
				type : 'number'
			}, {
				dataIndex : 'longitude',
				text : T('label.longitude'),
				type : 'number'
			}, {
				dataIndex : 'velocity',
				text : T('label.velocity'),
				type : 'number'
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
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
				store : 'VehicleBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.vehicle'),
				width : 200
			}, {
				xtype : 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : T('label.date'),
				format : 'Y-m-d',
				submitFormat : 'U',
				maxValue : new Date(), // limited to the current date or prior
				value : new Date(),
				width : 200
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
				itemId : 'search_reset'
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'TrackStore',
	            displayInfo: true,
	            cls : 'pagingtoolbar',
	            displayMsg: 'Displaying tracks {0} - {1} of {2}',
	            emptyMsg: "No tracks to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.tracking_details'),
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
				displayField : T('label.id'),
				valueField : 'id',
				fieldLabel : T('label.terminal')
			}, {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode : 'local',
				store : 'VehicleBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.vehicle')
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode : 'local',
				store : 'DriverBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.driver')
			}, {
				xtype : 'datefield',
				name : 'datetime',
				fieldLabel : T('label.datetime'),
				format : F('datetime')
			}, {
				name : 'lattitude',
				fieldLabel : T('label.lattitude')
			}, {
				name : 'longitude',
				fieldLabel : T('label.longitude')
			}, {
				name : 'velocity',
				fieldLabel : T('label.velocity')
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
				fieldLabel : T('label.created_at'),
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
	
	title : T('menu.checkin_data'),
	
	importUrl : 'checkin_data/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},	

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	items: {
		html : "<div class='listTitle'>" + T('title.checkin_data_list') + "</div>"
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
			self.search();
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
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'terminal_id',
				text : T('label.terminal')
			}, {
				dataIndex : 'vehicle_id',
				text : T('label.vehicle')
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver')
			}, {
				dataIndex : 'datetime',
				text : T('label.datetime'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'distance',
				text : T('label.x_distance', {x : T('label.running')})
			}, {
				dataIndex : 'running_time',
				text : T('label.x_time', {x : T('label.running')})
			}, {
				dataIndex : 'less_than_10km',
				text : T('label.lessthan_km', {km : 10})
			}, {
				dataIndex : 'less_than_20km',
				text : T('label.lessthan_km', {km : 20})
			}, {
				dataIndex : 'less_than_30km',
				text : T('label.lessthan_km', {km : 30})
			}, {
				dataIndex : 'less_than_40km',
				text : T('label.lessthan_km', {km : 40})
			}, {
				dataIndex : 'less_than_50km',
				text : T('label.lessthan_km', {km : 50})
			}, {
				dataIndex : 'less_than_60km',
				text : T('label.lessthan_km', {km : 60})
			}, {
				dataIndex : 'less_than_70km',
				text : T('label.lessthan_km', {km : 70})
			}, {
				dataIndex : 'less_than_80km',
				text : T('label.lessthan_km', {km : 80})
			}, {
				dataIndex : 'less_than_90km',
				text : T('label.lessthan_km', {km : 90})
			}, {
				dataIndex : 'less_than_100km',
				text : T('label.lessthan_km', {km : 100})
			}, {
				dataIndex : 'less_than_110km',
				text : T('label.lessthan_km', {km : 110})
			}, {
				dataIndex : 'less_than_120km',
				text : T('label.lessthan_km', {km : 120})
			}, {
				dataIndex : 'less_than_130km',
				text : T('label.lessthan_km', {km : 130})
			}, {
				dataIndex : 'less_than_140km',
				text : T('label.lessthan_km', {km : 140})
			}, {
				dataIndex : 'less_than_150km',
				text : T('label.lessthan_km', {km : 150})
			}, {
				dataIndex : 'less_than_160km',
				text : T('label.lessthan_km', {km : 160})
			}, {
				dataIndex : 'engine_start_time',
				text : T('label.x_time', {x : T('label.start')}),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'engine_end_time',
				text : T('label.x_time', {x : T('label.end')}),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'average_speed',
				text : T('label.average_speed')
			}, {
				dataIndex : 'max_speed',
				text : T('label.highest_speed')
			}, {
				dataIndex : 'fuel_consumption',
				text : T('label.fuel_consumption')
			}, {
				dataIndex : 'fuel_efficiency',
				text : T('label.fuel_efficiency')
			}, {
				dataIndex : 'sudden_accel_count',
				text : T('label.x_count', {x : T('label.sudden_accel')})
			}, {
				dataIndex : 'sudden_brake_count',
				text : T('label.x_count', {x : T('label.sudden_brake')})
			}, {
				dataIndex : 'idle_time',
				text : T('label.x_time', {x : T('label.idling')})
			}, {
				dataIndex : 'eco_driving_time',
				text : T('label.x_time', {x : T('label.eco_driving')})
			}, {
				dataIndex : 'over_speed_time',
				text : T('label.x_time', {x : T('label.over_speeding')})
			}, {
				dataIndex : 'co2_emissions',
				text : T('label.co2_emissions')
			}, {
				dataIndex : 'max_cooling_water_temp',
				text : T('label.max_cooling_water_temp')
			}, {
				dataIndex : 'avg_battery_volt',
				text :  T('label.average_battery_voltage')
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
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
				store : 'VehicleBriefStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.vehicle'),
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				width : 200
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode: 'local',
				store : 'DriverBriefStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.driver'),
				name : 'driver_filter',
				itemId : 'driver_filter',
				width : 200
			}, {
		        xtype: 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : T('label.date'),
				format: 'Y-m-d',
				submitFormat : 'U',
		        maxValue: new Date(),  // limited to the current date or prior
		        value : new Date(),
				width : 200
			}, {
				itemId : 'search',
				text : T('button.search')
			}, {
				text : T('button.reset'),
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
			title : T('title.checkin_data_details'),
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
				store : 'VehicleBriefStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.vehicle')
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode: 'local',
				store : 'DriverBriefStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.driver')
			}, {
				xtype : 'combo',
				name : 'terminal_id',
				queryMode: 'local',
				store : 'TerminalStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.terminal')
			}, {
				xtype : 'datefield',
				name : 'datetime',
				fieldLabel : T('label.datetime'),
				format: F('datetime')
			}, {
				name : 'distance',
				fieldLabel : T('label.x_distance', {x : T('label.running')})
			}, {
				name : 'running_time',
				fieldLabel : T('label.x_time', {x : T('label.running')})
			}, {
				name : 'less_than_10km',
				fieldLabel : T('label.lessthan_km', {km : 10})
			}, {
				name : 'less_than_20km',
				fieldLabel : T('label.lessthan_km', {km : 20})
			}, {
				name : 'less_than_30km',
				fieldLabel : T('label.lessthan_km', {km : 30})
			}, {
				name : 'less_than_40km',
				fieldLabel : T('label.lessthan_km', {km : 40})
			}, {
				name : 'less_than_50km',
				fieldLabel : T('label.lessthan_km', {km : 50})
			}, {
				name : 'less_than_60km',
				fieldLabel : T('label.lessthan_km', {km : 60})
			}, {
				name : 'less_than_70km',
				fieldLabel : T('label.lessthan_km', {km : 70})
			}, {
				name : 'less_than_80km',
				fieldLabel : T('label.lessthan_km', {km : 80})
			}, {
				name : 'less_than_90km',
				fieldLabel : T('label.lessthan_km', {km : 90})
			}, {
				name : 'less_than_100km',
				fieldLabel : T('label.lessthan_km', {km : 100})
			}, {
				name : 'less_than_110km',
				fieldLabel : T('label.lessthan_km', {km : 110})
			}, {
				name : 'less_than_120km',
				fieldLabel : T('label.lessthan_km', {km : 120})
			}, {
				name : 'less_than_130km',
				fieldLabel : T('label.lessthan_km', {km : 130})
			}, {
				name : 'less_than_140km',
				fieldLabel : T('label.lessthan_km', {km : 140})
			}, {
				name : 'less_than_150km',
				fieldLabel : T('label.lessthan_km', {km : 150})
			}, {
				name : 'less_than_160km',
				fieldLabel : T('label.lessthan_km', {km : 160})
			}, {
				xtype : 'datefield',
				name : 'engine_start_time',
				fieldLabel : T('label.x_time', {x : T('label.start')}),
				format: F('datetime')
			}, {
				xtype : 'datefield',
				name : 'engine_end_time',
				fieldLabel : T('label.x_time', {x : T('label.end')}),
				format: F('datetime')
			}, {
				name : 'average_speed',
				fieldLabel : T('label.average_speed')
			}, {
				name : 'max_speed',
				fieldLabel : T('label.highest_speed')
			}, {
				name : 'fuel_consumption',
				fieldLabel : T('label.fuel_consumption')
			}, {
				name : 'fuel_efficiency',
				fieldLabel : T('label.fuel_efficiency')
			}, {
				name : 'sudden_accel_count',
				fieldLabel : T('label.x_count', {x : T('label.sudden_accel')})
			}, {
				name : 'sudden_brake_count',
				fieldLabel : T('label.x_count', {x : T('label.sudden_brake')})
			}, {
				name : 'idle_time',
				fieldLabel : T('label.x_time', {x : T('label.idling')})
			}, {
				name : 'eco_driving_time',
				fieldLabel : T('label.x_time', {x : T('label.eco_driving')})
			}, {
				name : 'over_speed_time',
				fieldLabel : T('label.x_time', {x : T('label.over_speeding')})
			}, {
				name : 'co2_emissions',
				fieldLabel : T('label.co2_emissions')
			}, {
				name : 'max_cooling_water_temp',
				fieldLabel : T('label.max_cooling_water_temp')
			}, {
				name : 'avg_battery_volt',
				fieldLabel : T('label.average_battery_voltage')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : T('label.created_at'),
				format: F('datetime')
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : T('label.updated_at'),
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
	
	id : 'monitor_map',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [ this.ztitle, this.zmap ];
		
		this.callParent();
		
		var self = this;
		
		var interval = null;
		var vehicleMapStore = null;
		var incidentStore = null;
		
		this.on('afterrender', function() {
			vehicleMapStore = Ext.getStore('VehicleMapStore');
			incidentStore = Ext.getStore('RecentIncidentStore');
			var vehicleFilteredStore = Ext.getStore('VehicleFilteredStore');
			
			vehicleFilteredStore.on('datachanged', function() {
				self.refreshMap(vehicleFilteredStore, self.sub('autofit').getValue());
			});
			
			vehicleMapStore.load();
			
			/*
			 * TODO 디폴트로 1분에 한번씩 리프레쉬하도록 함.
			 */
			interval = setInterval(function() {
				vehicleMapStore.load();
				incidentStore.load();
			}, 10000);
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
			if(self.sub('autofit').getValue())
				self.refreshMap(Ext.getStore('VehicleFilteredStore'), true);
		});
		
		this.sub('autofit').on('change', function(check, newValue) {
			if(newValue)
				self.refreshMap(Ext.getStore('VehicleFilteredStore'), newValue);
		});

		this.sub('refreshterm').on('change', function(combo, newValue) {
			if(newValue) {
				clearInterval(interval);
				interval = setInterval(function() {
					vehicleMapStore.load();
					incidentStore.load();
				}, newValue * 1000);
			}
		});
	},
	
	getMap : function() {
		if(!this.map) {
			this.map = new google.maps.Map(this.sub('mapbox').getEl().down('.map').dom, {
				zoom : 10,
				maxZoom : 19,
				minZoom : 3,
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
	refreshMap : function(store, autofit) {
		this.resetMarkers();
		this.resetLabels();
		
		var images = {
			'Running' : 'resources/image/statusDriving.png',
			'Idle' : 'resources/image/statusStop.png',
			'Incident' : 'resources/image/statusIncident.png',
			'Maint' : 'resources/image/statusMaint.png'
		};

		var bounds;
		
		store.each(function(record) {
			var vehicle = record.get('id');
			var driver = record.get('driver_id');
			var driverRecord = Ext.getStore('DriverBriefStore').findRecord('id', driver);
			
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
		} else if(autofit){ // 자동 스케일 조정 경우 
			this.getMap().fitBounds(bounds);
//		} else { // 자동 스케일 조정이 아니어도, 센터에 맞추기를 한다면, 이렇게.
//			this.getMap().setCenter(bounds.getCenter());
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
			html : '<h1>' + T('title.map') + '</h1>'
		}, {
			xtype : 'combo',
			valueField : 'value',
			displayField : 'display',
			value : 10,
			width : 180,
			labelWidth : 110,
			labelAlign : 'right',
			labelSeparator : '',
			store : Ext.create('Ext.data.Store', {
				data : [{
					value : 3,
					display : '3' + T('label.second_s')
				}, {
					value : 5,
					display : '5' + T('label.second_s')
				}, {
					value : 10,
					display : '10' + T('label.second_s')
				}, {
					value : 30,
					display : '30' + T('label.second_s')
				}, {
					value : 60,
					display : '1' + T('label.minute_s')
				}, {
					value : 300,
					display : '5' + T('label.minute_s')
				}],
				fields : [
					'value', 'display'
				]
			}),
			queryMode : 'local',
			fieldLabel : T('label.refreshterm'),
			itemId : 'refreshterm'
		}, {
			xtype : 'checkboxgroup',
			width : 80,
			defaults : {
				boxLabelAlign : 'before',
				width : 80,
				checked : true,
				labelWidth : 60,
				labelAlign : 'right',
				labelSeparator : ''
			},
			items : [{
				fieldLabel : T('label.autofit'),
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

	title : T('tab.ctrl_by_vehicle'),

	store : 'CheckinDataStore',
	autoScroll : true,

	listeners : {},

	initComponent : function() {
		this.columns = this.buildColumns();

		this.callParent();
	},

	onSearch : function(grid) {
		var vehicle_filter = grid.down('textfield[name=vehicle_filter]');
		var driver_filter = grid.down('textfield[name=driver_filter]');
		grid.store.load({
			filters : [ {
				property : 'vehicle_id',
				value : vehicle_filter.getValue()
			}, {
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
		queryMode : 'local',
		store : 'VehicleBriefStore',
		displayField : 'id',
		valueField : 'id',
		fieldLabel : T('label.vehicle'),
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
		queryMode : 'local',
		store : 'DriverBriefStore',
		displayField : 'id',
		valueField : 'id',
		fieldLabel : T('label.driver'),
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
		text : T('button.search'),
		tooltip : 'Find Checkin Data',
		handler : function() {
			var grid = this.up('gridpanel');
			grid.onSearch(grid);
		}
	}, {
		text : T('button.reset'),
		handler : function() {
			var grid = this.up('gridpanel');
			grid.onReset(grid);
		}
	} ],

	buildColumns : function() {
		return [ new Ext.grid.RowNumberer(), {
			dataIndex : 'key',
			text : 'Key',
			hidden : true
		}, {
			dataIndex : 'terminal_id',
			text : T('label.terminal')
		}, {
			dataIndex : 'vehicle_id',
			text : T('label.vehicle')
		}, {
			dataIndex : 'driver_id',
			text : T('label.driver')
		}, {
			dataIndex : 'datetime',
			text : T('label.date'),
			xtype : 'datecolumn',
			format : F('date')
		}, {
			dataIndex : 'distance',
			text : T('label.x_distance', {x : T('label.running')})
		}, {
			dataIndex : 'running_time',
			text : T('label.x_time', {x : T('label.running')})
		}, {
			dataIndex : 'less_than_10km',
			text : T('label.lessthan_km', {km : 10})
		}, {
			dataIndex : 'less_than_20km',
			text : T('label.lessthan_km', {km : 20})
		}, {
			dataIndex : 'less_than_30km',
			text : T('label.lessthan_km', {km : 30})
		}, {
			dataIndex : 'less_than_40km',
			text : T('label.lessthan_km', {km : 40})
		}, {
			dataIndex : 'less_than_50km',
			text : T('label.lessthan_km', {km : 50})
		}, {
			dataIndex : 'less_than_60km',
			text : T('label.lessthan_km', {km : 60})
		}, {
			dataIndex : 'less_than_70km',
			text : T('label.lessthan_km', {km : 70})
		}, {
			dataIndex : 'less_than_80km',
			text : T('label.lessthan_km', {km : 80})
		}, {
			dataIndex : 'less_than_90km',
			text : T('label.lessthan_km', {km : 90})
		}, {
			dataIndex : 'less_than_100km',
			text : T('label.lessthan_km', {km : 100})
		}, {
			dataIndex : 'less_than_110km',
			text : T('label.lessthan_km', {km : 110})
		}, {
			dataIndex : 'less_than_120km',
			text : T('label.lessthan_km', {km : 120})
		}, {
			dataIndex : 'less_than_130km',
			text : T('label.lessthan_km', {km : 130})
		}, {
			dataIndex : 'less_than_140km',
			text : T('label.lessthan_km', {km : 140})
		}, {
			dataIndex : 'less_than_150km',
			text : T('label.lessthan_km', {km : 150})
		}, {
			dataIndex : 'less_than_160km',
			text : T('label.lessthan_km', {km : 160})
		}, {
			dataIndex : 'engine_start_time',
			text : T('label.x_time', {x : T('label.start')}),
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'engine_end_time',
			text : T('label.x_time', {x : T('label.end')}),
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'average_speed',
			text : T('label.average_speed')
		}, {
			dataIndex : 'max_speed',
			text : T('label.highest_speed')
		}, {
			dataIndex : 'fuel_consumption',
			text : T('label.fuel_consumption')
		}, {
			dataIndex : 'fuel_efficiency',
			text : T('label.fuel_efficiency')
		}, {
			dataIndex : 'sudden_accel_count',
			text : T('label.x_count', {x : T('label.sudden_accel')})
		}, {
			dataIndex : 'sudden_brake_count',
			text : T('label.x_count', {x : T('label.sudden_brake')})
		}, {
			dataIndex : 'idle_time',
			text : T('label.x_time', {x : T('label.idling')})
		}, {
			dataIndex : 'eco_driving_time',
			text : T('label.x_time', {x : T('label.eco_driving')})
		}, {
			dataIndex : 'over_speed_time',
			text : T('label.x_time', {x : T('label.over_speeding')})
		}, {
			dataIndex : 'co2_emissions',
			text : T('label.co2_emissions')
		}, {
			dataIndex : 'max_cooling_water_temp',
			text : T('label.max_cooling_water_temp')
		}, {
			dataIndex : 'avg_battery_volt',
			text : T('label.average_battery_voltage')
		}, {
			dataIndex : 'created_at',
			text : T('label.created_at'),
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'updated_at',
			text : T('label.updated_at'),
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		} ]
	}

});

Ext.define('GreenFleet.view.monitor.InfoByVehicle', {
	extend : 'Ext.grid.Panel',
	
	alias : 'widget.monitor_info_by_vehicle',
	
	title : T('tab.info_by_vehicle'),

	store : 'VehicleInfoStore',

	autoScroll : true,

	columns : [ new Ext.grid.RowNumberer(), {
		dataIndex : 'key',
		text : 'Key',
		type : 'string',
		hidden : true
	}, {
		dataIndex : 'id',
		text : T('label.id'),
		type : 'string'
	}, {
		dataIndex : 'registration_number',
		text : T('label.reg_no'),
		type : 'string'
	}, {
		dataIndex : 'manufacturer',
		text : T('label.manufacturer'),
		type : 'string'
	}, {
		dataIndex : 'vehicle_type',
		text : T('label.x_type', { x : T('label.vehicle') }),
		type : 'string'
	}, {
		dataIndex : 'birth_year',
		text : T('label.birth_year'),
		type : 'string'
	}, {
		dataIndex : 'ownership_type',
		text : T('label.x_type', { x : T('label.ownership') }),
		type : 'string'
	}, {
		dataIndex : 'status',
		text : T('label.status'),
		type : 'string'
	}, {
		dataIndex : 'health_status',
		text : T('label.health'),
		type : 'string'
	}, {
		dataIndex : 'total_distance',
		text : T('label.total_x', { x : T('label.distance')}),
		type : 'string'
	}, {
		dataIndex : 'remaining_fuel',
		text : T('label.remaining_fuel'),
		type : 'string'
	}, {
		dataIndex : 'lattitude',
		text : T('label.lattitude')
	}, {
		dataIndex : 'longitude',
		text : T('label.longitude')
	}, {
		dataIndex : 'created_at',
		text : T('label.created_at'),
		xtype : 'datecolumn',
		format : F('datetime'),
		width : 120
	}, {
		dataIndex : 'updated_at',
		text : T('label.updated_at'),
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
		text : T('button.search'),
		tooltip : 'Find Vehicle',
		handler : function() {
			var grid = this.up('gridpanel');
			grid.onSearch(grid);
		}
	}, {
		text : T('button.reset'),
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
				minZoom : 3,
				maxZoom : 19,
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
			var vehicleStore = Ext.getStore('VehicleBriefStore');
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
			var driverStore = Ext.getStore('DriverBriefStore');
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
				params : {
					vehicle_id : vehicle,
					/* for Unix timestamp (in seconds) */
					date : Math.round((new Date().getTime() - (60 * 60 * 24 * 1000)) / 1000),
					start : 0,
					limit : 1000
				}
//				filters : [ {
//					property : 'vehicle_id',
//					value : vehicle
//				}, {
//					property : 'date',
//					/* for Unix timestamp (in seconds) */
//					value : Math.round((new Date().getTime() - (60 * 60 * 24 * 1000)) / 1000)
//				} ]
			});

			/*
			 * IncidentStore를 다시 로드함.
			 */
			self.getIncidentStore().load({
				params : {
					vehicle_id : vehicle,
					confirm : false,
					start : 0,
					limit : 4
				}
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
			var lat = record.get('lattitude');
			var lng = record.get('longitude');

			if(lat !== 0 || lng !== 0) {
				latlng = new google.maps.LatLng(lat, lng);
				path.push(latlng);
				if (!bounds)
					bounds = new google.maps.LatLngBounds(latlng, latlng);
				else
					bounds.extend(latlng);
			}
		});

		if (path.getLength() === 0) {
			var record = this.getForm().getRecord();
			var lat = record.get('lattitude');
			var lng = record.get('longitude');
			var defaultLatlng = null;
			
			if(lat === 0 && lng === 0) {
				defaultLatlng = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
			} else {
				defaultLatlng = new google.maps.LatLng(lat, lng);
			}
			path.push(defaultLatlng);
			bounds = new google.maps.LatLngBounds(defaultLatlng, defaultLatlng);
		}

		if (bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else {
			this.getMap().fitBounds(bounds);
		}

		var first = path.getAt(0);

		if (first) {
			var start = new google.maps.Marker({
				position : new google.maps.LatLng(first.lat(), first.lng()),
				map : this.getMap()
			});

			var last = path.getAt(path.getLength() - 1);

			var end = new google.maps.Marker({
				position : new google.maps.LatLng(last.lat(), last.lng()),
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
		tpl : '<h1>' + T('label.vehicle') + ' : <span class="vehicle">{vehicle}</span>, ' + T('label.driver') + ' : <span class="driver">{driver}</span></h1>',
		height : 35
	},

	ztabpanel : {
		xtype : 'tabpanel',
		flex : 1,
		items : [ {
			xtype : 'monitor_info_by_vehicle'
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : T('tab.ctrl_by_vehicle')
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : T('tab.ctrl_by_driver')
		}, {
			xtype : 'monitor_control_by_vehicle',
			title : T('tab.maintenance')
		} ]
	},

	zvehicleinfo : {
		xtype : 'panel',
		title : T('title.vehicle_information'),
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
				fieldLabel : T('label.vehicle'),
				cls : 'dotUnderline',
				itemId : 'id'
			}, {
				xtype : 'displayfield',
				name : 'driver_id',
				fieldLabel : T('label.driver'),
				cls : 'dotUnderline',
				itemId : 'driver'
			}, {
				xtype : 'displayfield',
				name : 'terminal_id',
				fieldLabel : T('label.terminal'),
				cls : 'dotUnderline',
				itemId : 'terminal'
			}, {
				xtype : 'displayfield',
				name : 'location',
				fieldLabel : T('label.location'),
				cls : 'dotUnderline',
				itemId : 'location'
			}, {
				xtype : 'displayfield',
				name : 'distance',
				cls : 'dotUnderline',
				fieldLabel : T('label.run_dist')
			}, {
				xtype : 'displayfield',
				name : 'running_time',
				fieldLabel : T('label.run_time'),
				cls : 'dotUnderline'
			} ]
		} ]
	},

	zincidents : {
		xtype : 'panel',
		title : T('title.incidents'),
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
		title : T('title.tracking_recent_driving'),
		cls : 'paddingPanel backgroundGray borderLeftGray',
		itemId : 'map',
		flex : 1,
		html : '<div class="map"></div>'
	}
});

Ext.define('GreenFleet.view.monitor.IncidentView', {
	extend : 'Ext.container.Container',

	alias : 'widget.monitor_incident',

	title : T('title.incident_view'),

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
			height : 460,
			items : [ this.zInfo, this.zVideoAndMap ]
		}, {
			xtype : 'container',
			autoScroll : true,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [ this.zList]
		} ];

		this.callParent(arguments);

		/*
		 * Content
		 */

		var self = this;

		this.sub('map').on('afterrender', function() {
			var options = {
				zoom : 12,
				minZoom : 3,
				maxZoom : 19,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.map = new google.maps.Map(self.sub('map').getEl().down('.map').dom, options);

			self.getLogStore().on('load', function(store, records, success) {

				self.refreshTrack();

				if(success) {
//					var store = Ext.create('GreenFleet.store.IncidentLogChartStore');
					self.sub('chart').store.loadData(records);
//					self.sub('chart').bindStore(store);
				} else {
					self.sub('chart').store.loadData([]);
				}
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
			if (value != null && value.length > 1) {
				if(value.indexOf('http') == 0)
					url = 'src=' + value;
				else
					url = 'src="download?blob-key=' + value + '"';
			}

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
			var driverStore = Ext.getStore('DriverBriefStore');
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

		this.sub('incident_form').on(
				'afterrender',
				function() {
					this.down('[itemId=confirm]').getEl().on(
							'click',
							function(e, t) {
								var form = self.sub('incident_form').getForm();

								if (form.getRecord() != null) {
									form.submit({
										url : 'incident/save',
										success : function(form, action) {
											self.sub('grid').store.findRecord('key', action.result.key).set('confirm',
													form.findField('confirm').getValue());
										},
										failure : function(form, action) {
											GreenFleet.msg('Failed', action.result.msg);
											form.reset();
										}
									});
								}
							});
				});

		this.down('#grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			operation.params['vehicle_id'] = self.sub('vehicle_filter').getSubmitValue();
			operation.params['driver_id'] = self.sub('driver_filter').getSubmitValue();
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

	refreshIncidentList : function() {
		this.sub('pagingtoolbar').moveFirst();
		//
		// this.sub('grid').store.load({
		// filters : [ {
		// property : 'vehicle_id',
		// value : this.sub('vehicle_filter').getValue()
		// }, {
		// property : 'driver_id',
		// value : this.sub('driver_filter').getValue()
		// }, {
		// property : 'confirm',
		// value : false
		// } ],
		// callback : callback
		// });
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
			fieldLabel : T('label.x_time', {x : T('label.incident')})
		}, {
			xtype : 'displayfield',
			name : 'vehicle_id',
			width : 100,
			fieldLabel : T('label.vehicle')
		}, {
			xtype : 'displayfield',
			name : 'driver_id',
			width : 100,
			fieldLabel : T('label.driver')
		}, {
			xtype : 'displayfield',
			name : 'impulse_abs',
			width : 100,
			fieldLabel : T('label.impulse')
		}, {
			xtype : 'displayfield',
			name : 'engine_temp',
			width : 100,
			fieldLabel : T('label.engine_temp')
		}, {
			xtype : 'checkbox',
			name : 'confirm',
			itemId : 'confirm',
			fieldLabel : T('label.confirm'),
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
				 // title : T('title.incident_details'),
					cls : 'paddingAll10 incidentVOD',
					width : 690,
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
								tpl : [ '<video width="100%" height="100%" controls="controls">', '<source {value} type="video/mp4" />',
										'Your browser does not support the video tag.', '</video>' ]
							} ]
				}, {
					xtype : 'panel',
					//title : T('title.position_of_incident'),
					cls : 'backgroundGray borderLeftGray',
					flex : 1,
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					items : [
								{
									xtype : 'box',
									itemId : 'map',
									html : '<div class="map"></div>',
									flex : 3
								},
								{
									xtype : 'chart',
									itemId : 'chart',
									flex : 1,
									legend : {
										position: 'bottom',
										itemSpacing:5,
										padding:0,
										labelFont : "10px Helvetica, sans-serif",
										boxStroke:"transparent",
										boxFill : "transparent"
									},
									store : 'IncidentLogStore',
									axes : [ {
//										title : T('title.acceleration'),
										type : 'Numeric',
										position : 'left',
										fields : [ 'accelate_x', 'accelate_y', 'accelate_z' ]
//										minimum : -2,
//										maximum : 2
									}, {
										title : T('label.time'),
										type : 'Category',
										position : 'bottom',
										fields : [ 'datetime' ]
//										dateFormat : 'M d g:i:s',
//										step : [Ext.Date.SECOND, 1]
									} ],
									series : [ {
										type : 'line',
										xField : 'datetime',
										yField : 'accelate_x'
									}, {
										type : 'line',
										xField : 'datetime',
										yField : 'accelate_y'
									}, {
										type : 'line',
										xField : 'datetime',
										yField : 'accelate_z'
									} ],
									flex : 2
								}]
				} ]
	},

	zChart : {
		
	},

	buildChart : function() {
		return {
			xtype : 'chart',
			itemId : 'chart',
			cls : 'paddingPanel backgroundGray borderLeftGray',
			flex : 1,
			legend : {
				position: 'float',
				x : 100,
				y : 50
			},
			store : Ext.create('GreenFleet.store.IncidentLogChartStore'),
			axes : [ {
				title : T('label.acceleration'),
				type : 'Numeric',
				position : 'left',
				fields : [ 'accelate_x', 'accelate_y', 'accelate_z' ]
			// minimum : -2,
			// maximum : 2
			}, {
				title : T('label.time'),
				type : 'Category',
				position : 'bottom',
				fields : [ 'datetime' ]
			// dateFormat : 'M d g:i:s',
			// step : [Ext.Date.SECOND, 1]
			} ],
			series : [ {
				type : 'line',
				smooth : true,
				xField : 'datetime',
				yField : 'accelate_x'
			}, {
				type : 'line',
				smooth : true,
				xField : 'datetime',
				yField : 'accelate_y'
			}, {
				type : 'line',
				smooth : true,
				xField : 'datetime',
				yField : 'accelate_z'
			} ]
		}
	},

	zList : {
		xtype : 'gridpanel',
		itemId : 'grid',
		cls : 'hIndexbar',
		title : T('title.incident_list'),
		store : 'IncidentViewStore',
		autoScroll : true,
		flex : 1,
		columns : [ new Ext.grid.RowNumberer(), {
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
			text : T('label.confirm'),
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			align : 'center',
			width : 50
		}, {
			dataIndex : 'datetime',
			text : T('label.x_time', {x : T('label.incident')}),
			xtype : 'datecolumn',
			width : 120,
			format : F('datetime')
		}, {
			dataIndex : 'driver_id',
			text : T('label.driver'),
			type : 'string',
			width : 80
		}, {
			dataIndex : 'vehicle_id',
			text : T('label.vehicle'),
			type : 'string',
			width : 80
		}, {
			dataIndex : 'terminal_id',
			text : T('label.terminal'),
			type : 'string',
			width : 80
		}, {
			dataIndex : 'lattitude',
			text : T('label.lattitude'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'longitude',
			text : T('label.longitude'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'velocity',
			text : T('label.velocity'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_abs',
			text : T('label.impulse'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_x',
			text : T('label.impulse_x', {x : 'X'}),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_y',
			text : T('label.impulse_x', {x : 'Y'}),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_z',
			text : T('label.impulse_x', {x : 'Z'}),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_threshold',
			text : T('label.impulse_threshold'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'obd_connected',
			text : T('label.obd'),
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			align : 'center',
			width : 40
		}, {
			dataIndex : 'engine_temp',
			text : T('label.engine_temp'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'engine_temp_threshold',
			text : T('label.engine_temp_threshold'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'created_at',
			text : T('label.created_at'),
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'updated_at',
			text : T('label.updated_at'),
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		} ],
		viewConfig : {},
		tbar : [ {
			xtype : 'combo',
			queryMode : 'local',
			store : 'VehicleBriefStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : T('label.vehicle'),
			itemId : 'vehicle_filter',
			width : 200
		}, {
			xtype : 'combo',
			queryMode : 'local',
			store : 'DriverBriefStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : T('label.driver'),
			itemId : 'driver_filter',
			width : 200
		}, {
			itemId : 'search',
			text : T('button.search')
		}, {
			itemId : 'reset',
			text : T('button.reset')
		} ],
		bbar : {
			xtype : 'pagingtoolbar',
			itemId : 'pagingtoolbar',
			cls : 'pagingtoolbar', // 하단 page tool bar에 대한 아이콘 버튼 class
			store : 'IncidentViewStore',
			displayInfo : true,
			displayMsg : 'Displaying incidents {0} - {1} of {2}',
			emptyMsg : "No incidents to display"
		}
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
	
	store : 'VehicleBriefStore',
	
	initComponent : function() {
		
		this.callParent();
		
		var self = this;
		
		new Ext.util.KeyMap(document, {
			key : 'q',
			alt : true,
			fn : this.focus,
			scope : this
		});
		
		this.store.load();
	},
	
	listConfig : {
		loadingText : T('msg.searching'),
		emptyText : T('msg.no_matching_data_found'),
		getInnerTpl : function() {
			return '<div class="appSearchItem"><span class="id">{id}</span> <span class="registration_number">{registration_number}</span></div>';
		},
		minWidth : 190
	},
	
	listeners : {
		'select' : function(combo, records, eOpts) {
			GreenFleet.doMenu('monitor_map');

			var store = Ext.getStore('VehicleFilteredStore');
			
			store.clearFilter(true);
			
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
		text : T('button.save'),
		itemId : 'save'
	}, {
		text : T('button.del'),
		itemId : 'delete'
	}, {
		text : T('button.reset'),
		itemId : 'reset'
	} ],
	
	confirmMsgSave : T('msg.confirm_save'),
	
	confirmMsgDelete : T('msg.confirm_delete'),
	
	initComponent : function() {
		this.callParent();
		
		var self = this;
		
		this.down('#save').on('click', function() {
			
			Ext.MessageBox.show({
				title : T('title.confirmation'),
				buttons : Ext.MessageBox.YESNO,
				msg : self.confirmMsgSave,
				modal : true,
				fn : function(btn) {
					
					if(btn != 'yes') 
						return;
					
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
								
								if(action.result.success)
									GreenFleet.msg(T('label.success'), T('msg.processed_successfully'));
								else
									Ext.Msg.alert(T('msg.failed_to_save'), action.result.msg);
							},
							failure : function(form, action) {
								Ext.Msg.alert(T('msg.failed_to_save'), action.result.msg);
							}
						});
					}					
				}
			});
		});

		this.down('#delete').on('click', function() {
			
			Ext.MessageBox.show({
				title : T('title.confirmation'),
				buttons : Ext.MessageBox.YESNO,
				msg : self.confirmMsgDelete,
				modal : true,
				fn : function(btn) {
					
					if(btn != 'yes') 
						return;
					
					var client = self.up('[entityUrl]');
					var url = client.entityUrl;				
					var form = client.sub('form').getForm();

					if (form.isValid()) {
						form.submit({
							url : url + '/delete',
							success : function(form, action) {
								//client.sub('grid').store.load();
								if(self.loader && typeof(self.loader.fn) === 'function') {
									self.loader.fn.call(self.loader.scope || client, null);
								}
								form.reset();
							},
							failure : function(form, action) {
								Ext.Msg.alert(T('msg.failed_to_delete'), action.result.msg);
							}
						});
					}					
				}
			});			
		});

		this.down('#reset').on('click', function() {
			var client = self.up('[entityUrl]');
			client.sub('form').getForm().reset();
		});

	}
});
Ext.define('GreenFleet.view.dashboard.VehicleHealth', {
	extend : 'Ext.Container',
	
	alias : 'widget.dashboard_vehicle_health',
	
	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	
	items : [{
		xtype : 'container',
		cls :'pageTitle',
		height: 35,
		html : '<h1>' + T('title.vehicle_health') + '</h1>'
	}],
	
	initComponent : function() {
		this.callParent();

		var content = this.add({
			xtype : 'panel',
			flex : 1,
			cls : 'paddingAll10',
			layout : {
				type : 'vbox',
				align : 'stretch'
			}
		})
		
		var row1 = this.createRow(content);
		var row2 = this.createRow(content);		
		var dashboardStore = Ext.getStore('DashboardVehicleStore');
		
		dashboardStore.load({
			scope : this,
			callback: function(records, operation, success) {				
				var healthRecord = this.findRecord(records, "health");
				var ageRecord = this.findRecord(records, "age");
				var mileageRecord = this.findRecord(records, "mileage");
				
				this.addHealthChartToRow(row1, T('title.vehicle_health'), healthRecord);
				this.addChartToRow(row1, T('title.running_distance'), mileageRecord);
				this.addChartToRow(row2, T('title.vehicle_age'), ageRecord);
				row2.add(this.buildEmptyChart());
			}
		});		
	},
	
	addHealthChartToRow : function(row, title, record) {
		var store = Ext.create('Ext.data.JsonStore', {
		    fields: [
		        {
		        	name : 'name',
		        	type : 'string',
		        	convert : function(value, record) {
		        		return T('label.' + value);
		        	}
				},  'value'],
		    data: record.data.summary
		});
		
		row.add(this.buildHealthChart(title, store, 'value'));		
	},
	
	addChartToRow : function(row, title, record) {
		var store = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'value'],
		    data: record.data.summary
		});
		
		row.add(this.buildHealthChart(title, store, 'value'));		
	},
	
	findRecord : function(records, healthName) {
		for(var i = 0 ; i < records.length ; i++) {
			if(records[i].data.name == healthName) {
				return records[i];
			}
		}
		
		return null;
	},
	
	createRow : function(content) {
		return content.add({
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			}
		});		
	},
	
	buildEmptyChart : function() {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard',
			flex:1,
			height : 280
		}
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
		            	  var name = storeItem.get('name');
		            	  var count = storeItem.get('value');
		            	  var percent = Math.round(count / total * 100);
		            	  this.setTitle(name + ' : ' + count + '(' + percent + '%)');
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
Ext.define('GreenFleet.view.dashboard.ConsumableHealth', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_consumable_health',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	items : [ {
		xtype : 'container',
		cls : 'pageTitle',
		height : 35,
		html : '<h1>' + T('title.consumable_health') + '</h1>'
	} ],

	initComponent : function() {
		this.callParent();

		var content = this.add({
			xtype : 'panel',
			flex : 1,
			cls : 'paddingAll10',
			layout : {
				type : 'vbox',
				align : 'stretch'
			}
		});

		var dashboardStore = Ext.getStore('DashboardConsumableStore');

		dashboardStore.load({
			scope : this,
			callback : function(records, operation, success) {

				var columnCount = 0;
				var row = null;

				for ( var i = 0; i < records.length; i++) {
					var record = records[i];
					var consumableItem = record.data.consumable;				
					
					if (columnCount == 0) {
						row = this.createRow(content);
						columnCount++;
					} else if (columnCount == 1) {
						columnCount++;
					} else if (columnCount == 2) {
						columnCount = 0;
					}
					
					this.addToRow(row, consumableItem, record);
				}

				var addCount = 3 - columnCount;
				if (addCount < 3) {
					for ( var j = 0; j < addCount; j++)
						row.add(this.buildEmptyChart());
				}
			}
		});
	},
	
	addToRow : function(row, consumableItem, record) {
		
		var summaryRecords = record.data.summary;		
		Ext.Array.each(summaryRecords, function(summaryRecord) {
	        summaryRecord.consumable = consumableItem;
	        summaryRecord.desc = T('label.' + summaryRecord.name);
	    });
		
		var store = Ext.create('Ext.data.JsonStore', {
			fields : ['consumable', 'name', 'desc', 'value' ],
			autoDestroy : true,
			data : summaryRecords
		});
		
		row.add(this.buildHealthChart(consumableItem + ' ' + T('menu.health'), store, 'value'));		
	},	

	createRow : function(content) {
		return content.add({
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			}
		});
	},

	buildEmptyChart : function() {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard',
			flex : 1,
			height : 280
		}
	},

	buildHealthChart : function(title, store, idx) {
		return {
			xtype : 'panel',
			title : title,
			cls : 'paddingPanel healthDashboard',
			flex : 1,
			height : 280,
			items : [ {
				xtype : 'chart',
				animate : true,
				store : store,
				width : 290,
				height : 150,
				shadow : true,
				legend : {
					position : 'right',
					labelFont : '10px',
					boxStroke : '#cfcfcf'
				},
				insetPadding : 15,
				theme : 'Base:gradients',
				series : [ {
					type : 'pie',
					field : idx,
					showInLegend : true,
					donut : false,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							// calculate percentage.
							var total = 0;
							store.each(function(rec) {
								total += rec.get(idx);
							});
							var name = storeItem.get('desc');
							var count = storeItem.get('value');
							var percent = Math.round(count / total * 100);
							this.setTitle(name + ' : ' + count + '(' + percent + '%)');
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : 'desc',
						display : 'rotate',
						contrast : true,
						font : '14px Arial'
					},
					listeners : {
						itemmousedown : function(target, event) {
							GreenFleet.doMenu("consumable");
							var menu = GreenFleet.getMenu('consumable');
							menu.setConsumable(target.storeItem.data.consumable, target.storeItem.data.name);
						}
					}
				} ]
			} ]
		}
	}

});
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
					checked : true,
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
					checked : true,
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
					checked : true,
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
Ext.define('GreenFleet.view.management.VehicleConsumableGrid', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle_consumable_grid',

	title : T('title.vehicle_consumable'),
	
	initComponent : function() {
		var self = this;		
		this.callParent(arguments);
		this.add(this.buildGrid(this));
		
		this.sub('edit_consumables_grid').on('edit', function(editor, e) {
			var record = editor.record.data;
			
			Ext.Ajax.request({
			    url: '/vehicle_consumable/save',
			    method : 'POST',
			    params: {
			    	key : record.key,
			        vehicle_id : record.vehicle_id,
			        consumable_item : record.consumable_item,
			        repl_unit : record.repl_unit,
			        repl_mileage : record.repl_mileage,
			        repl_time : record.repl_time,
			        last_repl_date : record.last_repl_date,
			        miles_last_repl : record.miles_last_repl,
			        next_repl_mileage : record.next_repl_mileage,
			        next_repl_date : record.next_repl_date,			        	
			        mode : 'updateMaster'
			    },
			    success: function(response) {
			        var resultObj = Ext.JSON.decode(response.responseText);
			        if(resultObj.success) {
				        GreenFleet.msg(T('label.success'), resultObj.key);
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
		
	buildGrid : function(main) {

	    var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
	        clicksToMoveEditor: 1,
	        autoCancel: false
	    });

	    var grid = Ext.create('Ext.grid.Panel', {
	    	
	    	itemId : 'edit_consumables_grid',
	        title: T('title.vehicle_consumables'),	        
	        frame: true,	     
	        store: 'VehicleConsumableStore',
	        plugins: [rowEditing],
	        vehicleId : '',
	        
	        columns: [
		        {
		        	header : 'Key',
		        	dataIndex : 'key',
		        	hidden : true
		        },
		        {
		        	header : 'Vehicle',
		        	dataIndex : 'vehicle_id',
		        	hidden : true
		        },		        
		        {
		            header: T('label.consumable_item'),
		            dataIndex: 'consumable_item'	
		        }, {
		            header: T('label.repl_unit'),
		            dataIndex: 'repl_unit',
		            width: 100,
		            editor: {
		            	xtype : 'codecombo',
		                allowBlank: false,
						name : 'repl_unit',
						group : 'ReplacementUnit'
					}
		        }, {
		            xtype: 'numbercolumn',
		            header: T('label.repl_mileage') + " (km)",
		            dataIndex: 'repl_mileage',
		            width: 105,
		            editor: {
		                xtype: 'numberfield',
		                allowBlank: false,
		                minValue: 0,
		                maxValue: 500000
		            }	        	
		        }, {
		            xtype: 'numbercolumn',
		            header: T('label.repl_time') + " (month)",
		            dataIndex: 'repl_time',
		            width: 105,
		            editor: {
		                xtype: 'numberfield',
		                allowBlank: false,
		                minValue: 0,
		                maxValue: 120
		            }
		        }, {
		            header: T('label.last_repl_date'),
		            dataIndex: 'last_repl_date',
		            width: 100,
					xtype : 'datecolumn',
					format : F('date')
		        }, {
		            xtype: 'numbercolumn',
		            header: T('label.miles_last_repl') + " (km)",
		            dataIndex: 'miles_last_repl',
		            width: 125
		        }, {
		        	header : T('label.next_repl_mileage') + " (km)",
		        	dataIndex : 'next_repl_mileage',
		        	width : 130		        	
		        }, {
		        	header : T('label.next_repl_date'),
		        	dataIndex : 'next_repl_date',
		        	width : 90,
					xtype : 'datecolumn',
					format : F('date')		        	
		        }, {
		        	header : T('label.accrued_cost'),
		        	dataIndex : 'accrued_cost',
		        	width : 90		        	
		        }, {
		        	header : T('label.health_rate'),
		        	dataIndex : 'health_rate',
		        	xtype : 'progresscolumn',
		        	width : 120	
		        }, {
		        	header : T('label.status'),
		        	dataIndex : 'status',
		        	width : 80
		        }
	        ]
	        
	        /*tbar: [{
	            text: T('button.sync'),
	            handler : function() {
	            }
	        }],
	        
	        listeners: {
	            selectionchange: function(view, records) {	                
	            }
	        }*/
	    });
	    
	    return grid;
	}
});
Ext.define('GreenFleet.view.form.RepairForm', {
	extend : 'Ext.form.Panel',

	alias : 'widget.repair_form',
	
	autoScroll : true,

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;		
		this.callParent();
	},
	
	setVehicleId : function(vehicleId) {
		this.sub('vehicle_id').setValue(vehicleId);
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
					fieldLabel : T('label.vehicle_id')
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
	],
	
	buttons: [
	    {
	    	text: T('button.save'),
	    	handler : function() {
        		var thisForm = this.up('form');
        		
	    		thisForm.getForm().submit({
                    url: '/repair/save',
                    submitEmptyText: false,
                    waitMsg: T('msg.saving'),
                    success: function(form, action) {
                    	if(action.result.success) {		                    		
                    		GreenFleet.msg(T('label.success'), T('msg.processed_successfully'));		                    				                    		
                    	} else {
                    		Ext.Msg.alert(T('label.failure'), action.result.msg);
                    	}
                     },
                     failure: function(form, action) {
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
        	text: T('button.cancel'),
        	handler : function() {
        	}
        }
    ]
	
});

Ext.define('GreenFleet.store.CompanyStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

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
		name : 'language',
		type : 'string'
	}, {
		name : 'image_clip',
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
	
	proxy : {
		type : 'ajax',
		url : 'company',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.UserStore', {
	extend : 'Ext.data.Store',
	
	autoLoad : false,
	
	pageSize : 250,

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
		name : 'name',
		type : 'string'
	}, {
//		name : 'forename',
//		type : 'string'
//	}, {
//		name : 'nickname',
//		type : 'string'
//	}, {
//		name : 'surname',
//		type : 'string'
//	}, {
		name : 'admin',
		type : 'boolean'
	}, {
		name : 'enabled',
		type : 'boolean'
//	}, {
//		name : 'locale',
//		type : 'string'			
	}, {
		name : 'language',
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
		url : 'user',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.CodeGroupStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

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
	}, {
		group : 'ReplacementUnit',
		desc : 'Unit of Consumables Replacement Cycle'
	} ]
});
Ext.define('GreenFleet.store.CodeStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	pageSize : 10000,

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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
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
	
	pageSize : 1000,
	
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
		name : 'health_status',
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
			type : 'json',
			root : 'items',
			totalProperty : 'total',
			successProperty : 'success'
		}
	}
});
Ext.define('GreenFleet.store.VehicleMapStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	pageSize : 1000,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'registration_number',
		type : 'string'
	}, {
		name : 'status',
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
		name : 'location',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'vehicle',
		extraParams : {
			select : [ 'id', 'registration_number', 'status', 'driver_id', 'lattitude', 'longitude' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	},

	listeners : {
		load : function(store, data, success) {
			if(success)
				Ext.getStore('VehicleFilteredStore').loadData(data);
		}
	}
});
/*
 * This store only for local filtering. VehicleMapStore will load data on this
 * store. So, never Load this Store.
 */
Ext.define('GreenFleet.store.VehicleFilteredStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	pageSize : 1000,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'registration_number',
		type : 'string'
	}, {
		name : 'status',
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
		name : 'location',
		type : 'string'
	} ]
});
Ext.define('GreenFleet.store.VehicleInfoStore', {
	extend : 'GreenFleet.store.VehicleStore'
});
Ext.define('GreenFleet.store.VehicleBriefStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	pageSize : 1000,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'registration_number',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'vehicle',
		extraParams : {
			select : [ 'id', 'registration_number', 'image_clip' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.DriverStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 1000,
	
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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.DriverBriefStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	pageSize : 1000,

	fields : [ {
		name : 'name',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'driver',
		extraParams : {
			select : [ 'id', 'name', 'image_clip' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.IncidentStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	pageSize : 25,
	
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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.IncidentByVehicleStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 25,

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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.IncidentViewStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 25,

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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.IncidentLogStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 1000,
	
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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.TrackStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
//	remoteFilter : true,
	
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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
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
	}, {
		"status" : "Maint",
		"desc" : "Maintenance"
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
	
	sorters : [ {
		property : 'datetime',
		direction : 'DESC'
	} ],	
	
	proxy : {
		type : 'ajax',
		url : 'checkin_data',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.RecentIncidentStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	pageSize : 5,
	
//	remoteFilter : true,

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

//	filters : [ {
//		property : 'confirm',
//		value : false
//	} ],

	sorters : [ {
		property : 'datetime',
		direction : 'DESC'
	} ],

	proxy : {
		type : 'ajax',
		url : 'incident',
		extraParams : {
			confirm : false
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.TerminalStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 1000,
	
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
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.TerminalBriefStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'serial_no',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'terminal',
		extraParams : {
			select : [ 'id', 'serial_no' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
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
Ext.define('GreenFleet.store.LanguageCodeStore', {
	extend : 'Ext.data.Store',
	
	fields : [{
		name : 'value',
		type : 'string'
	}, {
		name : 'display',
		type : 'string'
	}],
	
	data : [{
		value : 'en',
		display : T('language.en')
	}, {
		value : 'ko',
		display : T('language.ko')
	}, {
		value : 'cn',
		display : T('language.cn')
	}]
});
Ext.define('GreenFleet.store.VehicleGroupStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	pageSize : 1000,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'desc',
		type : 'string'
	}, {
		name : 'vehicles',
		type : 'auto'
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
		url : 'vehicle_group',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.VehicleRelationStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	pageSize : 1000,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'vehicle_group_id',
		type : 'string'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_relation',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total',
			successProperty : 'success'
		}
	}
});
Ext.define('GreenFleet.store.VehicleByGroupStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 1000,
	
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
		name : 'total_distance',
		type : 'float'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_group/vehicles',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total',
			successProperty : 'success'
		}
	}
});
Ext.define('GreenFleet.store.VehicleImageBriefStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	pageSize : 1000,

	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'registration_number',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'vehicle',
		extraParams : {
			select : [ 'id', 'registration_number', 'image_clip' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.ConsumableCodeStore', {
	extend : 'Ext.data.Store',

	storeId : 'consumable_code_store',

	fields : [ 
		{
			name : 'key',
			type : 'string'
		}, {
			name : 'name',
			type : 'string'
		}, {
			name : 'repl_unit',
			type : 'string'
		}, {
			name : 'fst_repl_mileage',
			type : 'int'
		}, {
			name : 'fst_repl_time',
			type : 'int'
		}, {			
			name : 'repl_mileage',
			type : 'int'
		}, {
			name : 'repl_time',
			type : 'int'
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
		}	
	],

	pageSize : 1000,

	proxy : {
		type : 'ajax',
		url : 'consumable_code',
		extraParams : {
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.VehicleConsumableStore', {
	extend : 'Ext.data.Store',

	storeId : 'vehicle_consumable_store',

	fields : [ 
		{
			name : 'key',
			type : 'string'
		}, {
			name : 'vehicle_id',
			type : 'string'				
		}, {			
			name : 'consumable_item',
			type : 'string'
		}, {
			name : 'repl_unit',
			type : 'string'
		}, {			
			name : 'repl_mileage',
			type : 'int'
		}, {
			name : 'repl_time',
			type : 'int'
		}, {
			name : 'last_repl_date',
			type : 'date',
			dateFormat : 'time'
		}, {
			name : 'miles_last_repl',
			type : 'int'
		}, {
			name : 'miles_since_last_repl',
			type : 'int'				
		}, {
			name : 'next_repl_mileage',
			type : 'int'
		}, {
			name : 'next_repl_date',
			type : 'date',
			dateFormat : 'time'
		}, {
			name : 'accrued_cost',
			type : 'float'
		}, {
			name : 'health_rate',
			type : 'float'
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
		}	
	],

	pageSize : 1000,

	proxy : {
		type : 'ajax',
		url : 'vehicle_consumable',		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}	
	}
});
Ext.define('GreenFleet.store.ConsumableHistoryStore', {
	extend : 'Ext.data.Store',

	storeId : 'consumable_history_store',
	
	fields : [ 
		{
			name : 'key',
			type : 'string'
		}, {
			name : 'vehicle_id',
			type : 'string'
		}, {			
			name : 'consumable_item',
			type : 'string'
		}, {
			name : 'last_repl_date',
			type : 'date',
			dateFormat:'time'
		}, {			
			name : 'miles_last_repl',
			type : 'int'
		}, {
			name : 'worker',
			type : 'string'
		}, {
			name : 'component',
			type : 'string'
		}, {
			name : 'cost',
			type : 'int'				
		}, {
			name : 'comment',
			type : 'string'				
		}, {
			name : 'created_at',
			type : 'date',
			dateFormat:'time'
		}	
	],

	pageSize : 1000,

	proxy : {
		type : 'ajax',
		url : 'vehicle_consumable/history',		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}	
	}
});
Ext.define('GreenFleet.store.RepairStore', {
	extend : 'Ext.data.Store',

	storeId : 'repair_store',
		
	fields : [ 
		{
			name : 'key',
			type : 'string'
		}, {
			name : 'vehicle_id',
			type : 'string'
		}, {
			name : 'repair_date',
			type : 'date',
			dateFormat:'time'
		}, {
			name : 'next_repair_date',
			type : 'date',
			dateFormat:'time'
		}, {
			name : 'repair_mileage',
			type : 'int'
		}, {
			name : 'repair_man',
			type : 'string'
		}, {
			name : 'repair_shop',
			type : 'string'
		}, {
			name : 'content',
			type : 'string'				
		}, {
			name : 'cost',
			type : 'int'
		}, {
			name : 'comment',
			type : 'string'
		}, {
			name : 'created_at',
			type : 'date',
			dateFormat:'time'
		}, {
			name : 'updated_at',
			type : 'date',
			dateFormat:'time'
		}	
	],

	pageSize : 1000,
	
	sorters : [ {
		property : 'repair_date',
		direction : 'DESC'
	} ],	

	proxy : {
		type : 'ajax',
		url : 'repair',		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}	
	}
});
Ext.define('GreenFleet.store.VehicleByHealthStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,

	pageSize : 1000,

	fields : [ 
	   {
		   name : 'id',
		   type : 'string'
	   }, {
		   name : 'registration_number',
		   type : 'string'
	   }, {
		   name : 'vehicle_type',
		   type : 'string'
	   }, {
		   name : 'birth_year',
		   type : 'int'
	   }, {
		   name : 'total_distance',
		   type : 'float'
	   }, {
		   name : 'health_status',
		   type : 'string'
	   }
	],
	
	sorters : [ {
		property : 'id',
		direction : 'ASC'
	} ],	

	proxy : {
		type : 'ajax',
		url : 'vehicle/byhealth',
		extraParams : {
			select : [ 'id', 'registration_number', 'vehicle_type', 'birth_year', 'total_distance', 'health_status' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.DashboardConsumableStore', {
	extend : 'Ext.data.Store',

	storeId : 'dashboard_consumable_store',

	fields : [ 
		{
			name : 'consumable',
			type : 'string'
		}, {
			name : 'summary',
			type : 'auto'
		}	
	],

	pageSize : 1000,

	proxy : {
		type : 'ajax',
		url : 'dashboard/health/consumable',
		extraParams : {
		},
		reader : {
			type : 'json',
			root : 'items'
		}
	}
});
Ext.define('GreenFleet.store.DashboardVehicleStore', {
	extend : 'Ext.data.Store',

	storeId : 'dashboard_vehicle_store',

	fields : [
		{
			name : 'name',
			type : 'string'
		}, {
			name : 'summary',
			type : 'auto'
		}	
	],

	pageSize : 1000,

	proxy : {
		type : 'ajax',
		url : 'dashboard/health/vehicle',
		extraParams : {
		},
		reader : {
			type : 'json',
			root : 'items'
		}
	}
});
Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller',

	requires : [ 'GreenFleet.store.IncidentLogChartStore', 'GreenFleet.view.management.Profile', 'GreenFleet.view.common.ImportPopup' ],

	stores : [ 'CompanyStore', 'UserStore', 'CodeGroupStore', 'CodeStore', 'VehicleStore', 'VehicleMapStore', 'VehicleFilteredStore',
			'VehicleInfoStore', 'VehicleBriefStore', 'DriverStore', 'DriverBriefStore', 'ReservationStore', 'IncidentStore',
			'IncidentByVehicleStore', 'IncidentViewStore', 'IncidentLogStore', 'TrackStore', 'VehicleTypeStore', 'OwnershipStore',
			'VehicleStatusStore', 'CheckinDataStore', 'TrackByVehicleStore', 'RecentIncidentStore', 'TerminalStore', 'TerminalBriefStore',
			'TimeZoneStore', 'LanguageCodeStore', 'VehicleGroupStore', 'VehicleRelationStore', 'VehicleByGroupStore',
			'VehicleImageBriefStore', 'ConsumableCodeStore', 'VehicleConsumableStore', 'ConsumableHistoryStore',
			'RepairStore', 'VehicleByHealthStore', 'DashboardConsumableStore', 'DashboardVehicleStore' ],

	models : [ 'Code' ],

	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 'SideMenu', 'management.Company',
			'management.User', 'management.Code', 'management.VehicleGroup', 'management.ConsumableCode', 'management.Vehicle',
			'management.Terminal', 'management.Reservation', 'management.Incident', 'management.Driver', 'management.Track',
			'management.CheckinData', 'monitor.Map', 'monitor.CheckinByVehicle', 'monitor.InfoByVehicle', 'monitor.Information',
			'monitor.IncidentView', 'common.CodeCombo', 'form.TimeZoneCombo', 'form.DateTimeField', 'form.SearchField',
			'common.EntityFormButtons', 'dashboard.VehicleHealth', 'dashboard.ConsumableHealth', 'pm.Consumable', 'common.ProgressColumn',
			'management.VehicleConsumableGrid', 'form.RepairForm' ],

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



