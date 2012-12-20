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
			company : login.company,
			email : login.email,
			id : login.username,
			name : login.username,
			language : login.language,
			grade : login.grade
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
Ext.define('GreenFleet.mixin.Setting', function() {
	var defaultSettings = [{
		id : 'autofit',
		value : false
	}, {
		id : 'refreshTerm',
		value : 10
	}, {
		id : 'navBarHide',
		value : false
	}, {
		id : 'auto_max_zoom',
		value : 16
	}];
	
	Ext.define('GreenFleet.mixin.Setting.Model', {
	    extend: 'Ext.data.Model',
        fields: [{
			name : 'id',
			type : 'string'
		}, {
			name : 'value',
			type : 'auto'
		}],
        proxy: {
            type: 'localstorage',
            id  : 'greenfleet-settings'
        }
	});

	var store = Ext.create('Ext.data.Store', {
		model : 'GreenFleet.mixin.Setting.Model',
		autoSync : true
	});
	
	function getLocalSetting(name) {
		var record = store.getById(name);
		if(record)
			return record.get('value');
		else
			return null;
	};
	
	function setLocalSetting(name, value) {
		var record = store.getById(name);
		var old;
		if(!record) {
			var set = Ext.create('GreenFleet.mixin.Setting.Model', {
				id : name,
				value : undefined
			});
			store.add(set);
			record = store.getById(name);
		}

		record.set('value', value);
		record.commit();
		
		return old;
	};
	
	Ext.define('GreenFleet.mixin.Setting.Inner', {
		mixins: ['Ext.util.Observable'],
		
		set : function(id, val) {
			var old = setLocalSetting(id, val);
			this.fireEvent(id, val, old);
		},
		
		get : function(id) {
			return getLocalSetting(id);
		}
	});
	
	store.on('load', function(store, records) {
		for(var i = 0;i < defaultSettings.length;i++) {
			if(!store.getById(defaultSettings[i].id)) {
				setLocalSetting(defaultSettings[i].id, defaultSettings[i].value);
			}
		}
	});
	
	try {
		store.load();
	} catch(e) {
		/* 잘못된 형식의 local cache인 경우 로컬스토리지를 클리어시킴 */
		store.getProxy().clear();
		store.load();
	}

	return {
		setting : Ext.create('GreenFleet.mixin.Setting.Inner')
	}
}());
Ext.define('GreenFleet.mixin.Label', function() {
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
		
		this.show = true;

		// Ensures the label is redrawn if the text or position is changed.
		var me = this;
		this.listeners_ = [ google.maps.event.addListener(this, 'position_changed', function() {
			me.draw();
		}), google.maps.event.addListener(this, 'text_changed', function() {
			me.draw();
		}) ];
	};

	Label.prototype.setVisible= function(showOrNot) {
		this.show = showOrNot;
		this.draw();
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
		if(!projection)
			return;
		var position = projection.fromLatLngToDivPixel(this.get('position'));

		var div = this.div_;
		div.style.left = position.x + 'px';
		div.style.top = position.y + 'px';
		div.style.display = this.show ? 'block' : 'none';

		this.span_.innerHTML = this.get('text').toString();
	};
	
	return {
		label : {
			create : function(config) {
				return new Label(config);
			}
		}
	};
}());
Ext.define('GreenFleet.mixin.Authority', function() {
	
	// 일반형 ==> tracking, 동영상
	var prohibitedViewsA = [
	  'management_vehicle_checkin', 
	  'management_vehicle_runstatus', 
	  'management_vehicle_speed', 
	  'management_driver_runstatus', 
	  'management_driver_speed', 
	  'dashboard_report', 
	  'reverseControl'
	];  
	
	// 표준형 ==> OBD 및 차트 
	var prohibitedViewsB = ['reverseControl']; 
	
	// 고급형 ==> 역관제
	var prohibitedViewsC = [];  
		
	function checkDisabled(xtype) {
		var views = null;
		var grade = GreenFleet.login.grade;
		
		if('A' == grade) {
			views = prohibitedViewsA;
		} else if('B' == grade) {
			views = prohibitedViewsB;
		} else if('C' == grade) {
			views = prohibitedViewsC;
		} else {
			views = null;
		}
		
		if(views == null)
			return true;
		else if(views.length == 0)
			return false;
		else
			return Ext.Array.contains(views, xtype);
	}

	return {
		checkDisabled : checkDisabled
	};
}());
Ext.define('GreenFleet.view.Viewport', {
	extend : 'Ext.container.Viewport',

	layout : 'border',
	cls :'wrap',

	initComponent : function() {
		this.callParent();
	},
	
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

Ext.define('GreenFleet.controller.MainController', {
	extend : 'Ext.app.Controller',

	requires : [],

	refs : [ {
		ref : 'content',
		selector : '#content'
	}, {
		ref : 'nav',
		selector : '#nav'
	} ],
	control : {}
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
        {name: 'desc', type: 'string'}
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

		Ext.getCmp('menutab').getComponent('overview').hide();
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
		xtype : 'overview',
		itemId : 'overview',
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
	},{
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
			height : 23,
			dock : 'top'
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
		itemId : 'overview',
		cls : 'btnSummary',
		text : T('menu.overview'),
		handler : function() {
			GreenFleet.doMenu('overview');
		}
	}, {
		xtype : 'button',
		itemId : 'monitor_map',
		cls : 'btnDashboard',
		text : T('menu.map'),
		handler : function() {
			GreenFleet.doMenu('monitor_map');
		}
	}, {
		xtype : 'button',
		itemId : 'information',
		cls : 'btnInfo',
		text : T('menu.info'),
		handler : function() {
			GreenFleet.doMenu('information');
		}		
	}, {
		xtype : 'button',
		itemId : 'monitor_incident',
		cls : 'btnIncidentInfo',
		text : T('menu.incident'),
		handler : function() {
			GreenFleet.doMenu('monitor_incident');
		}		
	}, {
		xtype : 'button',
		cls : 'btnImport',
		text : T('menu.import_data'),
		handler : function() {
			GreenFleet.importData();
		}
	}, {
//		xtype : 'button',
//		cls : 'btnEvent',
//		text : 'incident log',
//		handler : function() {
//			GreenFleet.uploadIncidentLog();
//		}
//	}, {
//		xtype : 'button',
//		cls : 'btnEvent',
//		text : 'incident video',
//		handler : function() {
//			GreenFleet.uploadIncidentVideo();
//		}
//	}, {
		xtype : 'button',
		cls : 'btnExport',
		text : T('menu.export_data')
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
			Ext.getStore('VehicleGroupCountStore').on('load', self.refreshVehicleGroups, self);
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

		this.sub('state_running').update(T('label.state_running') + '</br><span>' + running + '</span>');
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
						text : '<a href="#">'
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
		
		Ext.getStore('VehicleGroupCountStore').each(function(record) {
			self.sub('vehicle_groups').add(
					{
						xtype : 'button',
						listeners : {
							click : self.findVehiclesOnMap,
							scope : self
						},
						vehicleGroup : record,
						text : '<a href="#">'
								+ record.data.expl
								+ '<span>('
								+ record.data.count
								+ ')</span></a>'
					});			
		});
	},
	
	findVehiclesOnMap : function(button) {
		
		var self = this;
		GreenFleet.doMenu('monitor_map');
		this.sub('search').setValue('');
		var groupId = button.vehicleGroup.get('id');		
		
		Ext.Ajax.request({
			url : '/vehicle_group/vehicle_ids',
			method : 'GET',
			params : {
				group_id : groupId
			},
			success : function(response) {
				var resultObj = Ext.JSON.decode(response.responseText);
				if (resultObj.success) {
					var vehicles = resultObj.items;
					self.filterByVehicleGroup(vehicles);
				} else {
					Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
				}
			},
			failure : function(response) {
				Ext.MessageBox.alert(T('label.failure'), response.responseText);
			}
		});		
	},

	filterByVehicleGroup : function(vehicles) {
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
	
	//html : '<a></a>' ==> 기본으로 resources/image/logoGreenfleet.gif를 가리킨다. 
	
	initComponent : function() {
		this.callParent(arguments);		
		this.setCompanyLogo();		
	},
	
	setCompanyLogo : function() {
		var image = this.sub('image');
		
    	Ext.Ajax.request({
		    url: 'company/find',
		    method : 'GET',
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {		        	
		    		var companyLogo = resultObj.image_clip;
		    		var imgSrc = (companyLogo && companyLogo != '') ? ('download?blob-key=' + companyLogo) : 'resources/image/logoGreenfleet.gif';
		    		image.setSrc(imgSrc);		        	
		        } else {
		        	image.setSrc('resources/image/logoGreenfleet.gif');
		        }
		    },
		    failure: function(response) {
		    	image.setSrc('resources/image/logoGreenfleet.gif');
		    }
		});
	},

	items : [ {
		xtype : 'container',
		flex : 1,
		layout : 'fit',
		items : [ {
			xtype : 'image',
			itemId : 'image'
		} ]
	} ]

});
Ext.define('GreenFleet.view.MainMenu', {
	extend : 'Ext.toolbar.Toolbar',
	cls : 'appMenu',
	alias : 'widget.main_menu',

	initComponent : function() {
		var self = this;
		var active_menu_button;
		
		function menu_activate_handler(item) {
			var menutab = Ext.getCmp('menutab');
			var tab = menutab.getComponent(item.itemId);

			menutab.setActiveTab(tab);
		}
		
		function menu_button_handler(button) {
			if(button === active_menu_button)
				return;
			
			var content = Ext.getCmp('content');
			
			/*
			 * 이전 탭들을 삭제함.
			 * closable한 item들을 모두 찾아서, 제거함.
			 * Ext.Array.each 내부적으로 index를 이용하기 때문에, each 함수 내에서 제거하지 않도록 주의함.
			 */
			var tobe_removed = []; 
			content.items.each(function(item) {
				if(item.closable)
					tobe_removed.push(item);
			});
			
			for ( var i = 0; i < tobe_removed.length; i++) {
				content.remove(tobe_removed[i]);
			}

			var first = null;
			for (i = 0; i < button.submenus.length; i++) {
				var item = content.add(button.submenus[i]);
				first = first || item;
			}

			/*
			 * Active Top Level Menu의 Active 상태 클래스를 새 메뉴로 교체함.
			 */
			if(active_menu_button)
				active_menu_button.removeCls('menuActive');
			button.addCls('menuActive');
			active_menu_button = button;

			/*
			 * 첫번째 아이템을 실행하도록 함.
			 */
			if (first)
				GreenFleet.doMenu(first.itemId);
		}
		
		Ext.Array.each(this.items, function(button) {
			button.handler = menu_button_handler;
			Ext.Array.each(button.submenus, function(menu) {
				menu.listeners = {
					activate : menu_activate_handler
				}
			});
		})
		
		this.callParent();
	},

	items : [ {
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
			title : T('menu.driver_group'),
			xtype : 'management_driver_group',
			itemId : 'driver_group',
			closable : true			
		}, {
			title : T('menu.consumable_code'),
			xtype : 'management_consumable_code',
			itemId : 'consumable_code',
			closable : true
		}, {
			title : T('menu.location'),
			xtype : 'management_location',
			itemId : 'location',
			closable : true			
		}, {
			title : T('menu.alarm'),
			xtype : 'management_alarm',
			itemId : 'alarm',
			closable : true
		}, {
			title : T('menu.report'),
			xtype : 'management_report',
			itemId : 'management_report',
			closable : true
		} ]
	}, {
		text : T('menu.vehicle'),
		submenus : [ {
			title : T('menu.vehicle'),
			xtype : 'management_vehicle',
			itemId : 'vehicle',
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
			title : T('menu.maintenance'),
			xtype : 'pm_maintenance',
			itemId : 'maintenance',
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
	}, {
		text : T('menu.dashboard'),
		submenus : [ {
			title : T('menu.dashboard'),
			xtype : 'dashboard_report',
			itemId : 'dashboard_report',
			closable : true
		} ]
	}, {
		text : T('menu.schedule'),
		submenus : [ {
			title : T('menu.schedule'),
			xtype : 'management_schedule',
			itemId : 'management_schedule',
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
		hidden : login.grade != "C",
		handler : function() {
			new Ext.Window({
			    title : "Live Video",
			    width : 690,
			    height: 560,
			    layout : 'fit',
			    items : [{
			        xtype : "component",
			        autoEl : {
			            tag : "iframe",
//			            src : "http://www.ustream.tv/embed/10627186"
			            src : "http://61.33.6.173/smart"
			        }
			    }]
			}).show();
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
										var listGrid = client.sub('grid');
										if(listGrid && action.result.key) {
											var store = listGrid.store;
											form.loadRecord(store.findRecord('key', action.result.key));											
										}
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
			if(self.loader && typeof(self.loader.resetFn) === 'function') {
				self.loader.resetFn.call(self.loader.scope || client, null);
			}
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
            
            if(newWidth > 120)
            	newWidth = 120;
            
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
Ext.define('GreenFleet.view.common.MultiSelect', {
    
    extend: 'Ext.form.FieldContainer',
    
    mixins: {
        bindable: 'Ext.util.Bindable',
        field: 'Ext.form.field.Field'    
    },
    
    alias: ['widget.multiselectfield', 'widget.multiselect'],
    
    requires: ['Ext.panel.Panel', 'Ext.view.BoundList'],
    
    uses: ['Ext.view.DragZone', 'Ext.view.DropZone'],
    
    /**
     * @cfg {String} [dragGroup=""] The ddgroup name for the MultiSelect DragZone.
     */

    /**
     * @cfg {String} [dropGroup=""] The ddgroup name for the MultiSelect DropZone.
     */
    
    /**
     * @cfg {String} [title=""] A title for the underlying panel.
     */
    
    /**
     * @cfg {Boolean} [ddReorder=false] Whether the items in the MultiSelect list are drag/drop reorderable.
     */
    ddReorder: false,

    /**
     * @cfg {Object/Array} tbar An optional toolbar to be inserted at the top of the control's selection list.
     * This can be a {@link Ext.toolbar.Toolbar} object, a toolbar config, or an array of buttons/button configs
     * to be added to the toolbar. See {@link Ext.panel.Panel#tbar}.
     */

    /**
     * @cfg {String} [appendOnly=false] True if the list should only allow append drops when drag/drop is enabled.
     * This is useful for lists which are sorted.
     */
    appendOnly: false,

    /**
     * @cfg {String} [displayField="text"] Name of the desired display field in the dataset.
     */
    displayField: 'text',

    /**
     * @cfg {String} [valueField="text"] Name of the desired value field in the dataset.
     */

    /**
     * @cfg {Boolean} [allowBlank=true] False to require at least one item in the list to be selected, true to allow no
     * selection.
     */
    allowBlank: true,

    /**
     * @cfg {Number} [minSelections=0] Minimum number of selections allowed.
     */
    minSelections: 0,

    /**
     * @cfg {Number} [maxSelections=Number.MAX_VALUE] Maximum number of selections allowed.
     */
    maxSelections: Number.MAX_VALUE,

    /**
     * @cfg {String} [blankText="This field is required"] Default text displayed when the control contains no items.
     */
    blankText: 'This field is required',

    /**
     * @cfg {String} [minSelectionsText="Minimum {0}item(s) required"] 
     * Validation message displayed when {@link #minSelections} is not met. 
     * The {0} token will be replaced by the value of {@link #minSelections}.
     */
    minSelectionsText: 'Minimum {0} item(s) required',
    
    /**
     * @cfg {String} [maxSelectionsText="Maximum {0}item(s) allowed"] 
     * Validation message displayed when {@link #maxSelections} is not met
     * The {0} token will be replaced by the value of {@link #maxSelections}.
     */
    maxSelectionsText: 'Minimum {0} item(s) required',

    /**
     * @cfg {String} [delimiter=","] The string used to delimit the selected values when {@link #getSubmitValue submitting}
     * the field as part of a form. If you wish to have the selected values submitted as separate
     * parameters rather than a single delimited parameter, set this to <tt>null</tt>.
     */
    delimiter: ',',

    /**
     * @cfg {Ext.data.Store/Array} store The data source to which this MultiSelect is bound (defaults to <tt>undefined</tt>).
     * Acceptable values for this property are:
     * <div class="mdetail-params"><ul>
     * <li><b>any {@link Ext.data.Store Store} subclass</b></li>
     * <li><b>an Array</b> : Arrays will be converted to a {@link Ext.data.ArrayStore} internally.
     * <div class="mdetail-params"><ul>
     * <li><b>1-dimensional array</b> : (e.g., <tt>['Foo','Bar']</tt>)<div class="sub-desc">
     * A 1-dimensional array will automatically be expanded (each array item will be the combo
     * {@link #valueField value} and {@link #displayField text})</div></li>
     * <li><b>2-dimensional array</b> : (e.g., <tt>[['f','Foo'],['b','Bar']]</tt>)<div class="sub-desc">
     * For a multi-dimensional array, the value in index 0 of each item will be assumed to be the combo
     * {@link #valueField value}, while the value at index 1 is assumed to be the combo {@link #displayField text}.
     * </div></li></ul></div></li></ul></div>
     */
    
    ignoreSelectChange: 0,
    
    initComponent: function(){
        var me = this;

        me.bindStore(me.store, true);
        if (me.store.autoCreated) {
            me.valueField = me.displayField = 'field1';
            if (!me.store.expanded) {
                me.displayField = 'field2';
            }
        }

        if (!Ext.isDefined(me.valueField)) {
            me.valueField = me.displayField;
        }
        Ext.apply(me, me.setupItems());
        
        
        me.callParent();
        me.initField();
        me.addEvents('drop');    
    },
    
    setupItems: function() {
        var me = this;
        
        me.boundList = Ext.create('Ext.view.BoundList', {
            deferInitialRefresh: false,
            multiSelect: true,
            store: me.store,
            displayField: me.displayField,
            disabled: me.disabled
        });
        
        me.boundList.getSelectionModel().on('selectionchange', me.onSelectChange, me);
        return {
            layout: 'fit',
            title: me.title,
            tbar: me.tbar,
            items: me.boundList
        };
    },
    
    onSelectChange: function(selModel, selections){
        if (!this.ignoreSelectChange) {
            this.setValue(selections);
        }    
    },
    
    getSelected: function(){
        return this.boundList.getSelectionModel().getSelection();
    },
    
    // compare array values
    isEqual: function(v1, v2) {
        var fromArray = Ext.Array.from,
            i = 0, 
            len;

        v1 = fromArray(v1);
        v2 = fromArray(v2);
        len = v1.length;

        if (len !== v2.length) {
            return false;
        }

        for(; i < len; i++) {
            if (v2[i] !== v1[i]) {
                return false;
            }
        }

        return true;
    },
    
    afterRender: function(){
        var me = this;
        
        me.callParent();
        if (me.selectOnRender) {
            ++me.ignoreSelectChange;
            me.boundList.getSelectionModel().select(me.getRecordsForValue(me.value));
            --me.ignoreSelectChange;
            delete me.toSelect;
        }    
        
        if (me.ddReorder && !me.dragGroup && !me.dropGroup){
            me.dragGroup = me.dropGroup = 'MultiselectDD-' + Ext.id();
        }

        if (me.draggable || me.dragGroup){
            me.dragZone = Ext.create('Ext.view.DragZone', {
                view: me.boundList,
                ddGroup: me.dragGroup,
                dragText: '{0} Item{1}'
            });
        }
        if (me.droppable || me.dropGroup){
            me.dropZone = Ext.create('Ext.view.DropZone', {
                view: me.boundList,
                ddGroup: me.dropGroup,
                handleNodeDrop: function(data, dropRecord, position) {
                    var view = this.view,
                        store = view.getStore(),
                        records = data.records,
                        index;

                    // remove the Models from the source Store
                    data.view.store.remove(records);

                    index = store.indexOf(dropRecord);
                    if (position === 'after') {
                        index++;
                    }
                    store.insert(index, records);
                    view.getSelectionModel().select(records);
                    me.fireEvent('drop', me, records);
                }
            });
        }
    },
    
    isValid : function() {
        var me = this,
            disabled = me.disabled,
            validate = me.forceValidation || !disabled;
            
        
        return validate ? me.validateValue(me.value) : disabled;
    },
    
    validateValue: function(value) {
        var me = this,
            errors = me.getErrors(value),
            isValid = Ext.isEmpty(errors);
            
        if (!me.preventMark) {
            if (isValid) {
                me.clearInvalid();
            } else {
                me.markInvalid(errors);
            }
        }

        return isValid;
    },
    
    markInvalid : function(errors) {
        // Save the message and fire the 'invalid' event
        var me = this,
            oldMsg = me.getActiveError();
        me.setActiveErrors(Ext.Array.from(errors));
        if (oldMsg !== me.getActiveError()) {
            me.updateLayout();
        }
    },

    /**
     * Clear any invalid styles/messages for this field.
     *
     * **Note**: this method does not cause the Field's {@link #validate} or {@link #isValid} methods to return `true`
     * if the value does not _pass_ validation. So simply clearing a field's errors will not necessarily allow
     * submission of forms submitted with the {@link Ext.form.action.Submit#clientValidation} option set.
     */
    clearInvalid : function() {
        // Clear the message and fire the 'valid' event
        var me = this,
            hadError = me.hasActiveError();
        me.unsetActiveError();
        if (hadError) {
            me.updateLayout();
        }
    },
    
    getSubmitData: function() {
        var me = this,
            data = null,
            val;
        if (!me.disabled && me.submitValue && !me.isFileUpload()) {
            val = me.getSubmitValue();
            if (val !== null) {
                data = {};
                data[me.getName()] = val;
            }
        }
        return data;
    },

    /**
     * Returns the value that would be included in a standard form submit for this field.
     *
     * @return {String} The value to be submitted, or null.
     */
    getSubmitValue: function() {
        var me = this,
            delimiter = me.delimiter,
            val = me.getValue();
            
        return Ext.isString(delimiter) ? val.join(delimiter) : val;
    },
    
    getValue: function(){
        return this.value;
    },
    
    getRecordsForValue: function(value){
        var me = this,
            records = [],
            all = me.store.getRange(),
            valueField = me.valueField,
            i = 0,
            allLen = all.length,
            rec,
            j,
            valueLen;
            
        for (valueLen = value.length; i < valueLen; ++i) {
            for (j = 0; j < allLen; ++j) {
                rec = all[j];   
                if (rec.get(valueField) == value[i]) {
                    records.push(rec);
                }
            }    
        }
            
        return records;
    },
    
    setupValue: function(value){
        var delimiter = this.delimiter,
            valueField = this.valueField,
            i = 0,
            out,
            len,
            item;
            
        if (Ext.isDefined(value)) {
            if (delimiter && Ext.isString(value)) {
                value = value.split(delimiter);
            } else if (!Ext.isArray(value)) {
                value = [value];
            }
        
            for (len = value.length; i < len; ++i) {
                item = value[i];
                if (item && item.isModel) {
                    value[i] = item.get(valueField);
                }
            }
            out = Ext.Array.unique(value);
        } else {
            out = [];
        }
        return out;
    },
    
    setValue: function(value){
        var me = this,
            selModel = me.boundList.getSelectionModel();

        // Store not loaded yet - we cannot set the value
        if (!me.store.getCount()) {
            me.store.on({
                load: Ext.Function.bind(me.setValue, me, [value]),
                single: true
            });
            return;
        }

        value = me.setupValue(value);
        me.mixins.field.setValue.call(me, value);
        
        if (me.rendered) {
            ++me.ignoreSelectChange;
            selModel.deselectAll();
            selModel.select(me.getRecordsForValue(value));
            --me.ignoreSelectChange;
        } else {
            me.selectOnRender = true;
        }
    },
    
    clearValue: function(){
        this.setValue([]);    
    },
    
    onEnable: function(){
        var list = this.boundList;
        this.callParent();
        if (list) {
            list.enable();
        }
    },
    
    onDisable: function(){
        var list = this.boundList;
        this.callParent();
        if (list) {
            list.disable();
        }
    },
    
    getErrors : function(value) {
        var me = this,
            format = Ext.String.format,
            errors = [],
            numSelected;

        value = Ext.Array.from(value || me.getValue());
        numSelected = value.length;

        if (!me.allowBlank && numSelected < 1) {
            errors.push(me.blankText);
        }
        if (numSelected < me.minSelections) {
            errors.push(format(me.minSelectionsText, me.minSelections));
        }
        if (numSelected > me.maxSelections) {
            errors.push(format(me.maxSelectionsText, me.maxSelections));
        }
        return errors;
    },
    
    onDestroy: function(){
        var me = this;
        
        me.bindStore(null);
        Ext.destroy(me.dragZone, me.dropZone);
        me.callParent();
    },
    
    onBindStore: function(store){
        var boundList = this.boundList;
        
        if (boundList) {
            boundList.bindStore(store);
        }
    }
    
});

/*
 * Note that this control will most likely remain as an example, and not as a core Ext form
 * control.  However, the API will be changing in a future release and so should not yet be
 * treated as a final, stable API at this time.
 */

/**
 * A control that allows selection of between two Ext.ux.form.MultiSelect controls.
 */
Ext.define('GreenFleet.view.common.ItemSelector', {
    
	extend: 'GreenFleet.view.common.MultiSelect',
    
    alias: ['widget.itemselectorfield', 'widget.itemselector'],
    
    /**
     * @cfg {Boolean} [hideNavIcons=false] True to hide the navigation icons
     */
    hideNavIcons:false,

    /**
     * @cfg {Array} buttons Defines the set of buttons that should be displayed in between the ItemSelector
     * fields. Defaults to <tt>['top', 'up', 'add', 'remove', 'down', 'bottom']</tt>. These names are used
     * to build the button CSS class names, and to look up the button text labels in {@link #buttonsText}.
     * This can be overridden with a custom Array to change which buttons are displayed or their order.
     */
    buttons: ['top', 'up', 'add', 'remove', 'down', 'bottom'],

    /**
     * @cfg {Object} buttonsText The tooltips for the {@link #buttons}.
     * Labels for buttons.
     */
    buttonsText: {
        top: "Move to Top",
        up: "Move Up",
        add: "Add to Selected",
        remove: "Remove from Selected",
        down: "Move Down",
        bottom: "Move to Bottom"
    },

    initComponent: function() {
        var me = this;

        me.ddGroup = me.id + '-dd';
        me.callParent();

        // bindStore must be called after the fromField has been created because
        // it copies records from our configured Store into the fromField's Store
        me.bindStore(me.store);
    },

    createList: function(){
        var me = this;

        return Ext.create('GreenFleet.view.common.MultiSelect', {
            submitValue: false,
            flex: 1,
            dragGroup: me.ddGroup,
            dropGroup: me.ddGroup,
            store: {
                model: me.store.model,
                data: []
            },
            displayField: me.displayField,
            disabled: me.disabled,
            listeners: {
                boundList: {
                    scope: me,
                    itemdblclick: me.onItemDblClick,
                    drop: me.syncValue
                }
            }
        });
    },

    setupItems: function() {
        var me = this;

        me.fromField = me.createList();
        me.toField = me.createList();

        return {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                me.fromField,
                {
                    xtype: 'container',
                    margins: '0 4',
                    width: 22,
                    layout: {
                        type: 'vbox',
                        pack: 'center'
                    },
                    items: me.createButtons()
                },
                me.toField
            ]
        };
    },

    createButtons: function(){
        var me = this,
            buttons = [];

        if (!me.hideNavIcons) {
            Ext.Array.forEach(me.buttons, function(name) {
                buttons.push({
                    xtype: 'button',
                    tooltip: me.buttonsText[name],
                    handler: me['on' + Ext.String.capitalize(name) + 'BtnClick'],
                    cls: Ext.baseCSSPrefix + 'form-itemselector-btn',
                    iconCls: Ext.baseCSSPrefix + 'form-itemselector-' + name,
                    navBtn: true,
                    scope: me,
                    margin: '4 0 0 0'
                });
            });
        }
        return buttons;
    },

    getSelections: function(list){
        var store = list.getStore(),
            selections = list.getSelectionModel().getSelection();

        return Ext.Array.sort(selections, function(a, b){
            a = store.indexOf(a);
            b = store.indexOf(b);

            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            }
            return 0;
        });
    },

    onTopBtnClick : function() {
        var list = this.toField.boundList,
            store = list.getStore(),
            selected = this.getSelections(list);

        store.suspendEvents();
        store.remove(selected, true);
        store.insert(0, selected);
        store.resumeEvents();
        list.refresh();
        this.syncValue(); 
        list.getSelectionModel().select(selected);
    },

    onBottomBtnClick : function() {
        var list = this.toField.boundList,
            store = list.getStore(),
            selected = this.getSelections(list);

        store.suspendEvents();
        store.remove(selected, true);
        store.add(selected);
        store.resumeEvents();
        list.refresh();
        this.syncValue();
        list.getSelectionModel().select(selected);
    },

    onUpBtnClick : function() {
        var list = this.toField.boundList,
            store = list.getStore(),
            selected = this.getSelections(list),
            i = 0,
            len = selected.length,
            index = store.getCount();

        // Find index of first selection
        for (; i < len; ++i) {
            index = Math.min(index, store.indexOf(selected[i]));
        }
        // If first selection is not at the top, move the whole lot up
        if (index > 0) {
            store.suspendEvents();
            store.remove(selected, true);
            store.insert(index - 1, selected);
            store.resumeEvents();
            list.refresh();
            this.syncValue();
            list.getSelectionModel().select(selected);
        }
    },

    onDownBtnClick : function() {
        var list = this.toField.boundList,
            store = list.getStore(),
            selected = this.getSelections(list),
            i = 0,
            len = selected.length,
            index = 0;

        // Find index of last selection
        for (; i < len; ++i) {
            index = Math.max(index, store.indexOf(selected[i]));
        }
        // If last selection is not at the bottom, move the whole lot down
        if (index < store.getCount() - 1) {
            store.suspendEvents();
            store.remove(selected, true);
            store.insert(index + 2 - len, selected);
            store.resumeEvents();
            list.refresh();
            this.syncValue();
            list.getSelectionModel().select(selected);
        }
    },

    onAddBtnClick : function() {
        var me = this,
            fromList = me.fromField.boundList,
            selected = this.getSelections(fromList);

        fromList.getStore().remove(selected);
        this.toField.boundList.getStore().add(selected);
        this.syncValue();
    },

    onRemoveBtnClick : function() {
        var me = this,
            toList = me.toField.boundList,
            selected = this.getSelections(toList);

        toList.getStore().remove(selected);
        this.fromField.boundList.getStore().add(selected);
        this.syncValue();
    },

    syncValue: function() {
        this.setValue(this.toField.store.getRange()); 
    },

    onItemDblClick: function(view, rec){
        var me = this,
            from = me.fromField.store,
            to = me.toField.store,
            current,
            destination;

        if (view === me.fromField.boundList) {
            current = from;
            destination = to;
        } else {
            current = to;
            destination = from;
        }
        current.remove(rec);
        destination.add(rec);
        me.syncValue();
    },

    setValue: function(value){
        var me = this,
            fromStore = me.fromField.store,
            toStore = me.toField.store,
            selected;

        // Wait for from store to be loaded
        if (!me.fromField.store.getCount()) {
            me.fromField.store.on({
                load: Ext.Function.bind(me.setValue, me, [value]),
                single: true
            });
            return;
        }

        value = me.setupValue(value);
        me.mixins.field.setValue.call(me, value);

        selected = me.getRecordsForValue(value);

        Ext.Array.forEach(toStore.getRange(), function(rec){
            if (!Ext.Array.contains(selected, rec)) {
                // not in the selected group, remove it from the toStore
                toStore.remove(rec);
                fromStore.add(rec);
            }
        });
        toStore.removeAll();

        Ext.Array.forEach(selected, function(rec){
            // In the from store, move it over
            if (fromStore.indexOf(rec) > -1) {
                fromStore.remove(rec);     
            }
            toStore.add(rec);
        });
    },

    onBindStore: function(store, initial) {
        var me = this;

        if (me.fromField) {
            me.fromField.store.removeAll()
            me.toField.store.removeAll();

            // Add everything to the from field as soon as the Store is loaded
            if (store.getCount()) {
                me.populateFromStore(store);
            } else {
                me.store.on('load', me.populateFromStore, me);
            }
        }
    },

    populateFromStore: function(store) {
        this.fromField.store.add(store.getRange());
        
        // setValue wait for the from Store to be loaded
        this.fromField.store.fireEvent('load', this.fromField.store);
    },

    onEnable: function(){
        var me = this;

        me.callParent();
        me.fromField.enable();
        me.toField.enable();

        Ext.Array.forEach(me.query('[navBtn]'), function(btn){
            btn.enable();
        });
    },

    onDisable: function(){
        var me = this;

        me.callParent();
        me.fromField.disable();
        me.toField.disable();

        Ext.Array.forEach(me.query('[navBtn]'), function(btn){
            btn.disable();
        });
    },

    onDestroy: function(){
        this.bindStore(null);
        this.callParent();
    }
});

Ext.define('GreenFleet.view.common.UserSelector', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.user_selector',
	
	selector_label : 'Select User',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		var store = Ext.getStore('UserStore');
		this.add({
            xtype: 'itemselector',
            name: 'itemselector',
            id: 'itemselector-field',
            anchor: '100%',
            fieldLabel: this.selector_label,
            store: store,
            displayField: 'name',
            valueField: 'email',
            allowBlank: false,
            msgTarget: 'side'
        });
		store.load();
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

Ext.define('GreenFleet.view.overview.Overview', {
	
	extend : 'Ext.Container',
	
	alias : 'widget.overview',
	
	id : 'overview',
    
	layout: {
        type: 'border',
        padding: '0 5 5 5'
    },
    
	initComponent : function() {
		this.items = [{		    
		    id: 'overview-header',
		    region: 'north',
		    xtype : 'box',
			cls : 'pageTitle',
			html : '<h1>' + T('menu.overview') + '</h1>',
			height : 35		    
		}, {
            xtype: 'container',
            region: 'center',
            layout: 'border',
            //items: [ this.zwest, this.zportal(), this.zeast ]
            items : [ this.zportal() ]
		}];
		this.callParent(arguments);
		var self = this;
	},
	
	/*zwest : {
        id: 'overview-vehicle-group',
        xtype : 'grid_vg1_portlet',
        region: 'west',
        animCollapse: true,
        width: 280,
        minWidth: 150,
        maxWidth: 310,
        split: true,
        collapsible: true
	},
	
	zeast :  {
        id: 'overview-driver-group',
        xtype : 'grid_dg1_portlet',
        region: 'east',
        animCollapse: true,
        width: 280,
        minWidth: 150,
        maxWidth: 310,
        split: true,
        collapsible: true
	},*/
	
	zportal : function() {
		
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth() + 1;
		
		return {
	        id: 'overview-portal',
	        xtype: 'portalpanel',
	        region: 'center',
	        items: [{
	            id: 'col-1',
	            items: [{
	                id: 'portlet-1-1',
	                title: T('title.running_distance'),
	                tools: this.getTools(),
	                height : 220,
	                items : {
	                	xtype : 'chart_v1_portlet',
	                	height : 220,
	                	chartType : 'mileage'
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-1-2',
	                title: T('portlet.today_maint_list'),
	                tools: this.getTools(),
	                height : 220,
	                items : {
	                	xtype : 'grid_m1_portlet',
	                	height : 220
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-1-3',
	                title: T('title.schedule'),
	                tools: this.getTools(),
	                height : 220,
	                items : {
	                	xtype : 'calendar_portlet',
	                	height : 220
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }]
	        },{
	            id: 'col-2',
	            items: [{
	                id: 'portlet-2-1',
	                title: T('title.vehicle_health'),
	                tools: this.getTools(),
	                height : 220,
	                items : {
	                	xtype : 'chart_v1_portlet',
	                	height : 220,
	                	chartType : 'health'
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            },{
	                id: 'portlet-2-2',
	                title : T('portlet.latest_incident_x', {x : '5'}),
	                tools: this.getTools(),
	                height : 220,
	                items: {
	                	xtype : 'grid_i1_portlet',
	                	height : 220
	                },	                
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-2-3',
	                title : T('portlet.vehicle_group_driving_summary') + ' ('+ year + '/' + month + ')', 
	                tools: this.getTools(),
	                height : 220,
	                items: {
	                    id: 'overview-vehicle-group',
	                    xtype : 'grid_vg1_portlet',
	                    width: 220
	                },	                
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	        	}]
	        },{
	            id: 'col-3',
	            items: [{
	                id: 'portlet-3-1',
	                title: T('title.vehicle_age'),
	                tools: this.getTools(),
	                height : 220,
	                items : {
	                	xtype : 'chart_v1_portlet',
	                	height : 220,
	                	chartType : 'age'
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-3-2',
	                title: T('portlet.upcomming_x_replacement', {x : T('label.consumable_item')}),
	                tools: this.getTools(),
	                height : 220,
	                items : {
	                	xtype : 'grid_c1_portlet',
	                	height : 220	                	
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-3-3',
	                title: T('portlet.avg_fuel_effcc'),
	                tools: this.getTools(),
	                height : 220,
	                items : {
	                	xtype : 'chart_f1_portlet',
	                	height : 220
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }]
	        }]
		};
	},
	
	getTools: function() {
        return [{
            xtype: 'tool',
            type: 'gear',
            handler: function(e, target, panelHeader, tool) {
                var portlet = panelHeader.ownerCt;
                portlet.items.items[0].reload();
            }
        }];
    },
        
    onPortletClose: function(portlet) {
    	GreenFleet.msg('Close', "'" + portlet.title + "' was removed");
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
				items : [ this.zvehicleinfo, {
					xtype : 'container',
					flex : 1.8,
					layout : {
						type : 'hbox',
						align : 'stretch'
					},
					items : [ this.zconsumables, this.zcenter_separator, this.zconsumable_form ]
				}, this.zconsumable_history ]
			} ]
		} ],

		this.callParent();

		this.sub('vehicle_info').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
			self.sub('consumable_history_grid').store.loadRecords([]);
			var consumChangeStore = self.sub('consumable_grid').store;
			consumChangeStore.getProxy().extraParams.vehicle_id = record.data.id;
			consumChangeStore.load();
		});

		this.sub('consumable_grid').on('itemclick', function(grid, record) {
			self.sub('consumable_form').loadRecord(record);
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
			width : 270,
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
			}, '   ', {
				xtype : 'fieldcontainer',
				defaultType : 'checkboxfield',
				cls : 'paddingLeft5',
				items : [ {
					cls : 'iconHealthHealthy floatLeft',
					name : 'healthy',
					inputValue : '1',
					itemId : 'check_healthy',
					width : 40,
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
					width : 40,
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
					width : 40,
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
		height : 90,
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
				fieldLabel : T('label.health'),
				name : 'health_status'
			} ]
		}, {
			xtype : 'panel',
			flex : 1,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : T('label.reg_no'),
				name : 'registration_number'
			}, {
				fieldLabel : T('label.total_x', {
					x : T('label.dist')
				}),
				name : 'total_distance',
				itemId : 'vehicle_mileage'
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
			header : T('label.health_rate'),
			dataIndex : 'health_rate',
			xtype : 'progresscolumn'
		}, {
			header : T('label.status'),
			dataIndex : 'status',
			align : 'right',
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
				tooltip : T('label.consumable_repl'),	//'Consumables replacement',
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
				tooltip : T('button.reset'),	//'Reset',
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
		} ],
		listeners : {
			itemdblclick : function(grid, record, htmlElement, indexOfItem, extEvent, eOpts) {
				grid.up('pm_consumable').showConsumableChange(record);
			}
		}
	},
	
	zcenter_separator : {
		xtype : 'panel',
		width : 5
	},
	
	zconsumable_form : {
		xtype : 'form',
		itemId : 'consumable_form',
		cls : 'hIndexbarZero',
		bodyPadding : 10,
		title : T('title.consumable_details'),
		flex : 1,
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		defaults : {
			xtype : 'textfield',
			anchor : '100%'
		},
		items : [{ name : 'consumable_item',
			fieldLabel : T('label.item')
		}, {
			name : 'repl_unit',
			fieldLabel : T('label.repl_unit')
		}, {
			name : 'repl_mileage',
			fieldLabel : T('label.repl_mileage') + " (km)"
		}, {
			name : 'repl_time',
			fieldLabel : T('label.repl_time') + T('label.parentheses_month')
		}, {
			fieldLabel : T('label.last_repl_date'),
			name : 'last_repl_date',
			xtype : 'datefield',
			format : F('date')
		}, {
			fieldLabel : T('label.miles_last_repl') + ' (km)',
			name : 'miles_last_repl'
		}, {
			fieldLabel : T('label.miles_since_last_repl') + ' (km)',
			name : 'miles_since_last_repl'
		}, {
			fieldLabel : T('label.next_repl_date'),
			name : 'next_repl_date',
			xtype : 'datefield',
			format : F('date')			
		}, {
			fieldLabel : T('label.next_repl_mileage') + ' (km)',
			name : 'next_repl_mileage'	
		}, {
			fieldLabel : T('label.accrued_cost'),
			name : 'accrued_cost'
		}, {
			fieldLabel : T('label.status'),
			name : 'status'
		}]		
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
						fieldLabel : T('label.repl_time') + T('parentheses_month'),
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
Ext.define('GreenFleet.view.monitor.Map', {
	extend : 'Ext.Container',

	alias : 'widget.monitor_map',
	
	id : 'monitor_map',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [ this.ztitle(), this.zmap ];
		
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
				if(self.isVisible()) {
					self.refreshMap(vehicleFilteredStore, GreenFleet.setting.get('autofit'));
				}
			});
			
			vehicleMapStore.load();
			
			/*
			 * TODO 디폴트로 1분에 한번씩 리프레쉬하도록 함.
			 */
			interval = setInterval(function() {
				vehicleMapStore.load();
				incidentStore.load();
			}, GreenFleet.setting.get('refreshTerm') * 1000);
		});
		
		this.on('resize', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
			if(GreenFleet.setting.get('autofit'))
				self.refreshMap(Ext.getStore('VehicleFilteredStore'), true);
		});
		
		this.down('[itemId=autofit]').on('change', function(check, newValue) {
//			if(newValue) {
				GreenFleet.setting.set('autofit', newValue);
				
				self.refreshMap(Ext.getStore('VehicleFilteredStore'), newValue);
//			}
		});

		this.down('[itemId=refreshterm]').on('change', function(combo, newValue) {
			if(newValue) {
				GreenFleet.setting.set('refreshTerm', newValue);

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
				center : new google.maps.LatLng(System.props.lat, System.props.lng),
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
			
			var latlng = new google.maps.LatLng(record.get('lat'), record.get('lng'));
			
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
			
			var label = GreenFleet.label.create({
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
			this.getMap().setCenter(new google.maps.LatLng(System.props.lat, System.props.lng));
		} else if(bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else if(autofit){ // 자동 스케일 조정 경우 
			this.getMap().fitBounds(bounds);
//		} else { // 자동 스케일 조정이 아니어도, 센터에 맞추기를 한다면, 이렇게.
//			this.getMap().setCenter(bounds.getCenter());
		}
	},
	
	ztitle : function() {
		return {
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
				value : GreenFleet.setting.get('refreshTerm'),
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
					checked : GreenFleet.setting.get('autofit'),
					labelWidth : 60,
					labelAlign : 'right',
					labelSeparator : ''
				},
				items : [{
					fieldLabel : T('label.autofit'),
					itemId : 'autofit'
				}]
			}]
		};
	},
	
	zmap : {
		xtype : 'panel',
		flex : 1,
		itemId : 'mapbox',
		html : '<div class="map" style="height:100%"></div>'
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
		dataIndex : 'vehicle_model',
		text : T('label.vehicle_model'),
		type : 'string'
	}, /*{
		dataIndex : 'vehicle_type',
		text : T('label.vehicle_type'),
		type : 'string'
	}, {
		dataIndex : 'ownership_type',
		text : T('label.ownership_type'),
		type : 'string'
	},*/ {
		dataIndex : 'birth_year',
		text : T('label.birth_year'),
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
		text : T('label.total_distance'),
		type : 'float'
	}, {
		dataIndex : 'total_run_time',
		text : T('label.total_run_time'),
		type : 'float'
	}, {
		dataIndex : 'official_effcc',
		text : T('label.official_effcc'),
		type : 'float'
	}, {
		dataIndex : 'avg_effcc',
		text : T('label.avg_effcc'),
		type : 'float'
	}, {
		dataIndex : 'eco_index',
		text : T('label.eco_index') + '(%)',
		type : 'int'			
	}, {
		dataIndex : 'remaining_fuel',
		text : T('label.remaining_fuel'),
		type : 'string'
	}, {
		dataIndex : 'lat',
		text : T('label.latitude')
	}, {
		dataIndex : 'lng',
		text : T('label.longitude')
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
	tbar : [ T('label.id'), {
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
	}, T('label.reg_no'), {
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
				center : new google.maps.LatLng(System.props.lat, System.props.lng),
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
//						lat : e.latLng.lat(),
//						lng : e.latLng.lng()
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
			
			self.sub('distance').setValue(record.get('total_distance'));
			self.sub('running_time').setValue(record.get('total_run_time'));
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
			
			if (driverRecord != null) {
				var driver = driverRecord.get('id');
				
				var driverImageClip = driverRecord.get('image_clip');
				if (driverImageClip) {
					self.sub('driverImage').setSrc('download?blob-key=' + driverImageClip);
				} else {
					self.sub('driverImage').setSrc('resources/image/bgDriver.png');
				}
			}

			self.sub('title').update({
				vehicle : vehicle + ' (' + vehicleRecord.get('registration_number') + ')',
				driver : (driverRecord != null) ? driver + ' (' + driverRecord.get('name') + ')' : driver + ' ()'
			});

			/*
			 * Get Address of the location by ReverseGeoCode.
			 */
			var location = record.get('location');
			if (location == null || location.length == 0) {
				var lat = record.get('lat');
				var lng = record.get('lng');

				if (lat !== undefined && lng !== undefined) {
					var latlng = new google.maps.LatLng(lat, lng);

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
					start : 0,
					limit : 1000
				},
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
				filters : [
				    {
				    	property : 'vehicle_id',
				    	value : vehicle 
				    }, {
				    	property : 'confirm',
				    	value : false
				    }
				]
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
			var lat = record.get('lat');
			var lng = record.get('lng');

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
			var lat = record.get('lat');
			var lng = record.get('lng');
			var defaultLatlng = null;
			
			if(lat === 0 && lng === 0) {
				defaultLatlng = new google.maps.LatLng(System.props.lat, System.props.lng);
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
				itemId : 'distance',
				fieldLabel : T('label.run_dist')
			}, {
				xtype : 'displayfield',
				name : 'running_time',
				fieldLabel : T('label.run_time'),
				itemId : 'running_time',
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
			items : [ this.zList ]
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
				center : new google.maps.LatLng(System.props.lat, System.props.lng),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.map = new google.maps.Map(self.sub('map').getEl().down('.map').dom, options);

			self.getLogStore().on('load', function(store, records, success) {
				if(success)
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
			if (value != null && value.length > 1) {
				if (value.indexOf('http') == 0)
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
			if(value && value != '') {
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
		var self = this;
		this.incident = incident;
		if (refresh) {
			this.sub('vehicle_filter').setValue(incident.get('vehicle_id'));
			this.sub('driver_filter').reset();
			this.refreshIncidentList();
		}

		if((incident.data.lat !== undefined && incident.data.lng !== undefined) && (incident.data.lat > 0 && incident.data.lng > 0)) {
			var latlng = new google.maps.LatLng(incident.data.lat, incident.data.lng);
			geocoder = new google.maps.Geocoder();
			geocoder.geocode({
				'latLng' : latlng
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						var address = results[0].formatted_address;
						incident.data.location = address;
						self.sub('incident_form').loadRecord(incident);
					}
				} else {
					console.log("Geocoder failed due to: " + status);
				}
			});			
		} else {
			self.sub('incident_form').loadRecord(incident);
		}
				
		this.refreshMap();
	},

	getIncident : function() {
		return this.incident;
	},

	refreshIncidentList : function() {
		this.sub('pagingtoolbar').moveFirst();
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
		
		if (!incident)
			return;
		
		var location = null;
		if (!incident) {
			location = new google.maps.LatLng(System.props.lat, System.props.lng);
		} else {
			if(incident.get('lat') && incident.get('lng') && incident.get('lat') > 0 && incident.get('lng') > 0) {
				location = new google.maps.LatLng(incident.get('lat'), incident.get('lng'));
			}
		}
		
		if (!location)
			return;
		
		this.getMap().setCenter(location);		

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
			
			if(!record.get('lat') || record.get('lat') == 0 || !record.get('lng') || record.get('lng') == 0)
				return false;
			
			latlng = new google.maps.LatLng(record.get('lat'), record.get('lng'));
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
			fieldLabel : T('label.x_time', {
				x : T('label.incident')
			})
		}, {
			xtype : 'displayfield',
			name : 'location',
			width : 300,
			fieldLabel : T('label.location')
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
								flex : 1,
								itemId : 'video',
								tpl : [ '<video width="100%" height="100%" controls="controls">', 
								        '<source {value} type="video/mp4" />',
										'Your browser does not support the video tag.', '</video>' ]
							} ]
				}, {
					xtype : 'panel',
					// title : T('title.position_of_incident'),
					cls : 'backgroundGray borderLeftGray',
					flex : 1,
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					items : [ {
						xtype : 'box',
						itemId : 'map',
						html : '<div class="map"></div>',
						flex : 3
					}, {
						xtype : 'chart',
						itemId : 'chart',
						flex : 1,
						legend : {
							position : 'bottom',
							itemSpacing : 5,
							padding : 0,
							labelFont : "10px Helvetica, sans-serif",
							boxStroke : "transparent",
							boxFill : "transparent"
						},
						store : 'IncidentLogStore',
						axes : [ {
							// title : T('label.acceleration'),
							type : 'Numeric',
							position : 'left',
							fields : [ 'accelate_x', 'accelate_y', 'accelate_z' ]
						}, {
							// title : T('label.acceleration'),
							type : 'Numeric',
							position : 'right',
							fields : [ 'velocity' ]
						}, {
							// title : T('label.time'),
							type : 'Time',
							position : 'bottom',
							fields : [ 'datetime' ],
							dateFormat : 'H:i:s',
							step : [ Ext.Date.SECOND, 1 ],
							label : {
								rotate : {
									degrees : 45
								}
							}
						} ],
						series : [ {
							type : 'line',
							xField : 'datetime',
							yField : 'accelate_x',
							axis : 'left',
							smooth : true
						}, {
							type : 'line',
							xField : 'datetime',
							yField : 'accelate_y',
							axis : 'left',
							smooth : true
						}, {
							type : 'line',
							xField : 'datetime',
							yField : 'accelate_z',
							axis : 'left',
							smooth : true
						}, {
							type : 'line',
							xField : 'datetime',
							yField : 'velocity',
							axis : 'right',
							smooth : true
						} ],
						flex : 2
					} ]
				} ]
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
			text : T('label.x_time', {
				x : T('label.incident')
			}),
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
			dataIndex : 'lat',
			text : T('label.latitude'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'lng',
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
			text : T('label.impulse_x', {
				x : 'X'
			}),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_y',
			text : T('label.impulse_x', {
				x : 'Y'
			}),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_z',
			text : T('label.impulse_x', {
				x : 'Z'
			}),
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
				dataIndex : 'lat',
				text : T('label.latitude'),
				type : 'number'
			}, {
				dataIndex : 'lng',
				text : T('label.longitude'),
				type : 'number'
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
					name : 'lat',
					fieldLabel : T('label.latitude')
				}, {
					name : 'lng',
					fieldLabel : T('label.longitude')					
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
				layout : 'fit',
				cls : 'noImage paddingLeft10',
				items : [ {
					xtype : 'image',
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
			}, {
				dataIndex : 'grade',
				text : T('label.grade')				
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
					layout : 'fit',
					cls : 'noImage',
					items : [ {
						xtype : 'image',
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
						}, {
							xtype : 'codecombo',
							name : 'grade',
							group : 'UserGradeType',
				            fieldLabel: T('label.grade'),
				            allowBank : false
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
				xtype: 'numbercolumn',
				dataIndex : 'fst_repl_mileage',
				text : T('label.fst_repl_mileage'),
				type : 'int'
			}, {
				dataIndex : 'fst_repl_time',
				text : T('label.fst_repl_time'),
				type : 'int'					
			}, {
				xtype: 'numbercolumn',
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
					self.sub('grouped_vehicles_grid').setTitle(T('title.drivers_by_group') + ' [' + record.get('id') + ']');
					self.sub('form').setTitle(T('title.group_details') + ' [' + record.get('id') + ']');
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
				Ext.MessageBox.alert(T('msg.none_selected'), T('msg.select_x_first', {x : T('label.vehicle_group')}));
				return;				
			}
			
			var selections = self.sub('all_vehicles_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.MessageBox.alert(T('msg.none_selected'), "Select the vehicles to add vehicle group [" + self.currentVehicleGroup + "]");
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
				        GreenFleet.msg(T('label.success'), resultObj.msg);
				        self.changedGroupedVehicleCount();
			        } else {
			        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
			        }
			    },
			    failure: function(response) {
			    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
			    }
			});			
 		});
		
		/**
		 * 선택한 Vehicle들을 그룹에서 삭제 
		 */
		this.down('button[itemId=moveRight]').on('click', function(button) {
			if(!self.currentVehicleGroup) {
				Ext.Msg.alert(T('msg.none_selected'), T('msg.select_x_first', {x : T('label.vehicle_group')}));
				return;				
			}
			
			var selections = self.sub('grouped_vehicles_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.Msg.alert(T('msg.none_selected'), "Select the vehicles to remove from vehicle group [" + self.currentVehicleGroup + "]");
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
				        GreenFleet.msg(T('label.success'), resultObj.msg);
				        self.changedGroupedVehicleCount();
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
				confirmMsgSave : T('msg.confirm_save'),				
				confirmMsgDelete : T('msg.confirm_delete'),				
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
Ext.define('GreenFleet.view.management.DriverGroup', {
	extend : 'Ext.container.Container',
	
	alias : 'widget.management_driver_group',

	title : T('title.driver_group'),

	entityUrl : 'driver_group',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'driver_group/import',

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
	currentDriverGroup : '',
		
	initComponent : function() {
		var self = this;

		this.items = [ {
			html : "<div class='listTitle'>" + T('title.driver_group_list') + "</div>"
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.buildDriverGroupList(this), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : { align : 'stretch', type : 'vbox' },
				items : [ this.buildDriverGroupForm(this), this.buildGroupedDriverList(this) ]
			} ]
		} ],

		this.callParent(arguments);
		
		/**
		 * Vehicle Group 그리드 선택시 선택한 데이터로 우측 폼 로드
		 */  
		this.sub('grid').on('itemclick', function(grid, record) {
			self.currentDriverGroup = record.get('id');
			self.sub('form').getForm().reset();
			self.sub('form').loadRecord(record);
		});
		
		/**
		 * 우측 폼의 키가 변경될 때마다 빈 값으로 변경된 것이 아니라면 
		 * 0. 선택한 Driver 전역변수를 설정 
		 * 1. 두 개의 Grid에 어떤 Driver Group이 선택되었는지 표시하기 위해 타이틀을 Refresh 
		 * 2. Driver List By Group가 그룹별로 Refresh
		 * 3. TODO : 맨 우측의 Vehicle List가 그룹별로 필터링  
		 */ 
		this.sub('form_driver_group_key').on('change', function(field, value) {
			if(value) {
				var record = self.sub('grid').store.findRecord('key', value);
				if(record) {
					self.currentDriverGroup = record.get('id');
					self.sub('grouped_drivers_grid').setTitle(T('title.drivers_by_group') + ' [' + record.get('id') + ']');
					self.sub('form').setTitle(T('title.group_details') + ' [' + record.get('id') + ']');
					self.searchGroupedDrivers();
				}
			}
		});
		
		/**
		 * Driver List By Group이 호출되기 전에 driver group id 파라미터 설정 
		 */
		this.sub('grouped_drivers_grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			operation.params['driver_group_id'] = self.currentDriverGroup;
		});
		
		/**
		 * Driver 검색 
		 */
		this.down('#search_all_drivers').on('click', function() {
			self.searchAllDrivers(true);
		});	
		
		/**
		 * Reset 버튼 선택시 Driver 검색 조건 클리어 
		 */
		this.down('#search_reset_all_drivers').on('click', function() {
			self.sub('all_drivers_id_filter').setValue('');
			self.sub('all_drivers_name_filter').setValue('');
		});
		
		/**
		 * Driver Id 검색 조건 변경시 Vehicle 데이터 Local filtering
		 */
		this.sub('all_drivers_id_filter').on('change', function(field, value) {
			self.searchAllDrivers(false);
		});

		/**
		 * Driver name 검색 조건 변경시 Vehicle 데이터 Local filtering 
		 */
		this.sub('all_drivers_name_filter').on('change', function(field, value) {
			self.searchAllDrivers(false);
		});		
		
		/**
		 * Driver List가 호출되기 전에 검색 조건이 파라미터에 설정 
		 */
		this.sub('all_drivers_grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			var driver_id_filter = self.sub('all_drivers_id_filter');
			var name_filter = self.sub('all_drivers_name_filter');			
			operation.params['driver_id'] = driver_id_filter.getSubmitValue();
			operation.params['name'] = name_filter.getSubmitValue();
		});
		
		/**
		 * 선택한 Driver들을 그룹에 추가 
		 */
		this.down('button[itemId=moveLeft]').on('click', function(button) {
			
			if(!self.currentDriverGroup) {
				Ext.MessageBox.alert(T('msg.none_selected'), T('msg.select_x_first', {x : T('label.driver_group')}));
				return;				
			}
			
			var selections = self.sub('all_drivers_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.MessageBox.alert(T('msg.none_selected'), "Select the drivers to add driver group [" + self.currentDriverGroup + "]");
				return;
			}

			var driver_id_to_delete = [];
			for(var i = 0 ; i < selections.length ; i++) {
				driver_id_to_delete.push(selections[i].data.id);
			}	

			Ext.Ajax.request({
			    url: '/driver_relation/save',
			    method : 'POST',
			    params: {
			        driver_group_id: self.currentDriverGroup,			        
			        driver_id : driver_id_to_delete
			    },
			    success: function(response) {
			        var resultObj = Ext.JSON.decode(response.responseText);
			        
			        if(resultObj.success) {			        	
				        self.sub('all_drivers_grid').getSelectionModel().deselectAll(true);
				        self.searchGroupedDrivers();
				        GreenFleet.msg(T('label.success'), resultObj.msg);
			        } else {
			        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
			        }
			    },
			    failure: function(response) {
			    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
			    }
			});			
 		});
		
		/**
		 * 선택한 Driver들을 그룹에서 삭제 
		 */
		this.down('button[itemId=moveRight]').on('click', function(button) {
			if(!self.currentDriverGroup) {
				Ext.Msg.alert(T('msg.none_selected'), T('msg.select_x_first', {x : T('label.driver_group')}));
				return;				
			}
			
			var selections = self.sub('grouped_drivers_grid').getSelectionModel().getSelection();
			if(!selections || selections.length == 0) {
				Ext.Msg.alert(T('msg.none_selected'), "Select the drivers to remove from driver group [" + self.currentDriverGroup + "]");
				return;
			}

			var driver_id_to_delete = [];
			for(var i = 0 ; i < selections.length ; i++) {
				driver_id_to_delete.push(selections[i].data.id);
			}	

			Ext.Ajax.request({
			    url: '/driver_relation/delete',
			    method : 'POST',
			    params: {
			        driver_group_id: self.currentDriverGroup,			        
			        driver_id : driver_id_to_delete
			    },
			    success: function(response) {
			        var resultObj = Ext.JSON.decode(response.responseText);
			        
			        if(resultObj.success) {
				        self.searchGroupedDrivers();
				        GreenFleet.msg(T('label.success'), resultObj.msg);				        
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
	
	searchAllDrivers : function(searchRemote) {
				
		if(searchRemote) {
			this.sub('all_drivers_grid').store.load();			
			
		} else {
			this.sub('all_drivers_grid').store.clearFilter(true);			
			var idValue = this.sub('all_drivers_id_filter').getValue();
			var nameValue = this.sub('all_drivers_name_filter').getValue();
			
			if(idValue || nameValue) {
				this.sub('all_drivers_grid').store.filter([ {
					property : 'id',
					value : idValue
				}, {
					property : 'name',
					value : nameValue
				} ]);
			}			
		}		
	},	
	
	searchGroupedDrivers : function() {
		this.sub('grouped_drivers_pagingtoolbar').moveFirst();
	},
	
	buildDriverGroupList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'DriverGroupStore',
			title : T('title.driver_group'),
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

	buildGroupedDriverList : function(main) {
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
			 		itemId : 'grouped_drivers_grid',
			 		store : 'DriverByGroupStore',
			 		title : T('title.drivers_by_group'),
			 		flex : 18.5,
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
			 		    	dataIndex : 'name',
			 		    	text : T('label.name')			 		    	
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
			 		    	text : T('label.social'),
			 		    	type : 'string'
			 		    }, {
							dataIndex : 'phone_no_1',
							text : T('label.phone_x', {x : 1}),
							type : 'string'
						}, {
							dataIndex : 'phone_no_2',
							text : T('label.phone_x', {x : 2}),
							type : 'string'
						}
			 		],
					bbar: {
						xtype : 'pagingtoolbar',
						itemId : 'grouped_drivers_pagingtoolbar',
			            store: 'DriverByGroupStore',
			            cls : 'pagingtoolbar',
			            displayInfo: true,
			            displayMsg: 'Displaying drivers {0} - {1} of {2}',
			            emptyMsg: "No drivers to display"
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
			 		itemId : 'all_drivers_grid',
			 		store : 'DriverBriefStore',
			 		title : T('title.driver_list'),
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
			 		    	dataIndex : 'name',
			 		    	text : T('label.name')
			 		    } 
			 		],
					tbar : [ T('label.id'), {
						xtype : 'textfield',
						name : 'all_drivers_id_filter',
						itemId : 'all_drivers_id_filter',
						hideLabel : true,
						width : 70
					}, T('label.name'), {
						xtype : 'textfield',
						name : 'all_drivers_name_filter',
						itemId : 'all_drivers_name_filter',
						hideLabel : true,
						width : 70
					}, ' ', {
						text : T('button.search'),
						itemId : 'search_all_drivers'
					}, ' ', {
						text : T('button.reset'),
						itemId : 'search_reset_all_drivers'
					} ],
					bbar: {
						xtype : 'pagingtoolbar',
						itemId : 'all_drivers_pagingtoolbar',
			            store: 'DriverBriefStore',
			            cls : 'pagingtoolbar',
			            displayInfo: true,
			            displayMsg: 'Displaying drivers {0} - {1} of {2}',
			            emptyMsg: "No drivers to display"
			        }
			 	}
			 ]
		}
	},

	buildDriverGroupForm : function(main) {
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
				itemId : 'form_driver_group_key'
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
				confirmMsgSave : T('msg.confirm_save'),				
				confirmMsgDelete : T('msg.confirm_delete'),				
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
	Ext.define('GreenFleet.view.management.Location', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_location',

	title : T('titla.location'),

	entityUrl : 'location',

	importUrl : 'location/import',

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

		this.items = [
		    { html : "<div class='listTitle'>" + T('title.location_list') + "</div>" },
		    {
		    	xtype : 'container',
		    	flex : 1,
		    	layout : {
			    	type : 'hbox',
			    	align : 'stretch'
			    },
			    items : [			        
			        this.buildList(this),
				    {
				    	xtype : 'container',
				    	flex : 1,
				    	layout : {
					    	type : 'vbox',
					    	align : 'stretch'
					    },
					    items : [ this.buildForm(this), this.zmap ]
				    }			        
			    ]		    	
		    }
		];
		
		this.callParent(arguments);
		
		this.sub('map').on('afterrender', function(mapbox) {
			self.setGeocoder(new google.maps.Geocoder());
			var center = new google.maps.LatLng(System.props.lat, System.props.lng);
			var options = {
				zoom : 10,
				minZoom : 3,
				maxZoom : 19,
				center : center,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.setMap(new google.maps.Map(mapbox.getEl().down('.map').dom, options));
		});
		
		this.on('activate', function() {			
			google.maps.event.trigger(self.getMap(), 'resize');
			self.markCenter();
		});		

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);			
			self.refreshMap(new google.maps.LatLng(record.data.lat, record.data.lng), record.data.rad);
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
	
	getGeocoder : function() {
		return this.geocoder;
	},
	
	setGeocoder : function(geocoder) {
		this.geocoder = geocoder;
	},
	
	getMap : function() {
		return this.map;
	},

	setMap : function(map) {
		this.map = map;
	},
	
	getMarker : function() {
		return this.marker;
	},

	setMarker : function(marker) {
		if (this.marker)
			this.marker.setMap(null);
		
		this.marker = marker;
	},
	
	getCircle : function() {
		return this.circle;
	},
	
	setCircle : function(circle) {	
		if (this.circle)
			this.circle.setMap(null);
					
		this.circle = circle;
	},
	
	markCenter : function() {
		this.setMarker(this.createMarker(this.map.getCenter()));
	},
	
	refreshMap : function(center, radius) {

		if (!center)
			return;
		
		// 지도 중심 이동
		this.map.setCenter(center);
		
		// 마커 표시 
		this.setMarker(null);
		this.setMarker(this.createMarker(center));
		
		if(!radius)
			radius = this.sub('form_radius').getValue();
		
		// Circle Refresh
		this.refreshCircle(radius);		
	},
	
	refreshLocation : function(center, radius) {		
		this.refreshMap(center, radius);
		// 폼 위도, 경도에 추가	
		this.sub('form_latitude').setValue(center.lat());
		this.sub('form_longitude').setValue(center.lng());		
	},	
	
	refreshLocByAddr : function(address) {
		if(!address){
			Ext.Msg.alert(T('msg.address_notfound_title'), T('msg.address_empty'));
			return;
		}
		var self = this;
		// 주소로 위치 검색
	    this.geocoder.geocode({'address': address}, function(results, status) {
	    	
	    	if (status == google.maps.GeocoderStatus.OK) {	    		
	    		var center = results[0].geometry.location;
	    		self.refreshLocation(center);
	      } else {
	    	  	self.setMarker(null);
	    	  	//Ext.Msg.alert("Failed to search!", "Address (" + address + ") Not Found!");
	    	  	Ext.Msg.alert(T('msg.address_notfound_title'), T('msg.address_notfound', {x:address}));
	      }
	    });
	},
	
	moveMarker : function(marker) {		
		var self = this;
		var position = marker.getPosition();
		
		// 위치로 주소 검색
		this.geocoder.geocode({'latLng': position}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				self.refreshLocation(position);
				// 폼의 주소 필드에 주소값 업데이트
				self.sub('form_address').setValue(results[0].formatted_address);				
			} else {
				self.map.setCenter(position);
				Ext.Msg.alert("Failed to search!", "Couldn't find address by position [" + position.lat() + ", " + position.lng() + "]!");
			}
		});
	},
	
	refreshCircle : function(radius) {
		
		if(!this.marker)
			return;
		
		if(!radius)
			radius = this.sub('form_radius').getValue();
		
		this.setCircle(null);
		if(radius) {
			var map = this.map;
			var marker = this.marker;
			this.setCircle(this.createCircle(marker.getPosition(), radius));
			
			// North, West, South, East lat, lng를 구함
			var bounds = this.circle.getBounds();
			var northWest = bounds.getNorthEast();
			var southEast = bounds.getSouthWest();
			
			this.sub('form_radius').setValue(radius);
			this.sub('form_lat_hi').setValue(northWest.lat());
			this.sub('form_lng_hi').setValue(northWest.lng());
			this.sub('form_lat_lo').setValue(southEast.lat());
			this.sub('form_lng_lo').setValue(southEast.lng());
		}
	},
	
	createMarker : function(center) {
		var self = this;
		var marker = new google.maps.Marker({
			position : center,
			map : self.map,
			draggable : true
		});
		
		if(this.marker && this.marker.dragend_listener) {
			google.maps.event.removeListener(this.marker.dragend_listener);
		}
		
		marker.dragend_listener = google.maps.event.addListener(marker, 'dragend', function() {
			self.moveMarker(marker);
		});
				
		return marker;
	},
	
	createCircle : function(center, radius) {
		
		if(!center)
			return;
		
		if(!radius)
			radius = this.sub('form_radius').getValue();
		
		var self = this;
		var circle = new google.maps.Circle({
			map: this.map,
			center : center,
			radius: radius,
			strokeColor : 'red',
			editable : true
  	  	});
		
		if(this.circle && this.circle.radius_change_listener) {
			google.maps.event.removeListener(this.circle.radius_change_listener);
		}
		
		circle.radius_change_listener = google.maps.event.addListener(circle, 'radius_changed', function() {
			self.radiusChanged(circle.getRadius());
		});
		
		return circle;
	},
	
	radiusChanged : function(radius) {		
		if(this.marker) {
			this.refreshCircle(radius);
		}
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
			store : 'LocationStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'name',
				text : T('label.name'),
				type : 'string'
			}, {
				dataIndex : 'addr',
				text : T('label.address'),
				type : 'string'
			}, {
				dataIndex : 'lat',
				text : T('label.latitude'),
				type : 'float'
			}, {
				dataIndex : 'lng',
				text : T('label.longitude'),
				type : 'float'
			}, {
				dataIndex : 'rad',
				text : T('label.radius') + ' (m)',
				type : 'int'
			}, {
				dataIndex : 'lat_lo',
				text : T('label.latitude_min'),
				type : 'float'
			}, {
				dataIndex : 'lng_lo',
				text : T('label.longitude_min'),
				type : 'float'					
			}, {
				dataIndex : 'lat_hi',
				text : T('label.latitude_max'),
				type : 'float'
			}, {
				dataIndex : 'lng_hi',
				text : T('label.longitude_max'),
				type : 'float'					
			}, {
				dataIndex : 'expl',
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
			tbar : [ T('label.location'), {
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
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'LocationStore',
	            cls : 'pagingtoolbar',
	            displayInfo: true,
	            displayMsg: 'Displaying locations {0} - {1} of {2}',
	            emptyMsg: "No locations to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.location_details'),
			autoScroll : true,
			height : 395,
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
				fieldLabel : T('label.name')
			}, {
                xtype: 'fieldcontainer',
                fieldLabel: T('label.address'),
                layout: 'hbox',
                defaults: {
                    hideLabel: true
                },
                items: [
                    {
                    	itemId : 'form_address',
                        xtype : 'textfield',
                        name : 'addr',
                        fieldLabel : T('label.address'),
                        flex : 1
                    },
                    {
                        xtype : 'button',
                        text : T('button.search'),
                        margin : '0 0 0 5',
                        handler : function(btn, event) {
                        	var locationView = btn.up('management_location');
                        	var address = btn.up('fieldcontainer').down('textfield').getValue();
                        	locationView.refreshLocByAddr(address);                        	
                        }
                    }
                ]
			}, {
				itemId : 'form_latitude',
				name : 'lat',
				xtype : 'textfield',
				fieldLabel : T('label.latitude')
			}, {
				itemId : 'form_longitude',
				name : 'lng',
				xtype : 'textfield',
				fieldLabel : T('label.longitude')
			}, {
				itemId : 'form_radius',
				name : 'rad',
				xtype : 'numberfield',
				fieldLabel : T('label.radius') + ' (m)',
				minValue : 0,
				step : 100,
				listeners : {
					change : function(field, newValue, oldValue, eOpts) {
						field.up('management_location').radiusChanged(newValue);
					}
				}
			}, {
				name : 'expl',
				fieldLabel : T('label.desc')
			}, {
				itemId : 'form_lat_lo',
				name : 'lat_lo',
				fieldLabel : T('label.latitude_min')
			}, {
				itemId : 'form_lng_lo',
				name : 'lng_lo',
				fieldLabel : T('label.longitude_min')
			}, {
				itemId : 'form_lat_hi',
				name : 'lat_hi',
				fieldLabel : T('label.latitude_max')
			}, {
				itemId : 'form_lng_hi',
				name : 'lng_hi',
				fieldLabel : T('label.longitude_max')
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
	},
	
	zmap : {
		xtype : 'panel',
		title : T('title.set_the_location'),
		cls : 'paddingPanel backgroundGray borderLeftGray',
		itemId : 'map',
		flex : 1,
		html : '<div class="map"></div>'
	}	
});
Ext.define('GreenFleet.view.management.Alarm', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_alarm',

	title : T('titla.alarm'),

	entityUrl : 'alarm',

	importUrl : 'alarm/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : "<div class='listTitle'>" + T('title.alarm_list') + "</div>"
	},

	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			
			var alarmName = record.data.name;
			Ext.Ajax.request({
				url : '/alarm/find',
				method : 'GET',
				params : { name : alarmName },
				success : function(response) {
					var alarmRecord = Ext.JSON.decode(response.responseText);
					if (alarmRecord.success) {
						record.data.vehicles = alarmRecord.vehicles;
						self.sub('form').loadRecord(record);
					} else {
						Ext.MessageBox.alert(T('label.failure'), response.responseText);
					}
				},
				failure : function(response) {
					Ext.MessageBox.alert(T('label.failure'), response.responseText);
				}
			});			
		});

		this.sub('grid').on('render', function(grid) {
			self.sub('form_location').store.load();
		});

		this.sub('name_filter').on('change', function(field, value) {
			self.search(false);
		});

		this.down('#search_reset').on('click', function() {
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search(true);
		});
	},

	search : function(remote) {
		this.sub('grid').store.remoteFilter = remote;
		this.sub('grid').store.clearFilter(true);

		this.sub('grid').store.filter([ {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'AlarmStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'kye',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'name',
				text : T('label.name'),
				type : 'string'
			}, {
				dataIndex : 'evt_type',
				text : T('label.event_type'),
				type : 'string'
			}, {
				dataIndex : 'evt_name',
				text : T('label.event_name'),
				type : 'string'
			}, {
				dataIndex : 'evt_trg',
				text : T('label.event_trigger'),
				type : 'string'
			}, {
				dataIndex : 'type',
				text : T('label.type'),
				type : 'string'	
			}, {
				dataIndex : 'always',
				text : T('label.period_always'),
				type : 'boolean'
			}, {
				dataIndex : 'enabled',
				text : T('label.enabled'),
				type : 'boolean'
			}, {
				dataIndex : 'from_date',
				text : T('label.from_date'),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'to_date',
				text : T('label.to_date'),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120				
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
			tbar : [ T('label.name'), {
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
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'AlarmStore',
	            cls : 'pagingtoolbar',
	            displayInfo: true,
	            displayMsg: 'Displaying alarms {0} - {1} of {2}',
	            emptyMsg: "No alarms to display"
	        }
		}
	},
	
	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.alarm_details'),
			autoScroll : true,
			flex : 1,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				hidden : true
			},
			{
				name : 'name',
				fieldLabel : T('label.name'),
				allowBlank : false
			},
			{
				xtype : 'codecombo',
				name : 'evt_type',
				group : 'AlarmEventType',
	            fieldLabel: T('label.event_type'),
	            allowBank : false,
				listeners : {
					change : function(combo, currentValue, beforeValue) {
						combo.up('form').down('fieldset').setVisible(currentValue == 'location');
					}
				}
	        },
	        {
				name : 'enabled',
				fieldLabel : T('label.enabled'),
				xtype : 'checkboxfield',
				flex : 1,
				checked : true
	        },
			{
	            xtype:'fieldset',
	            title: T('label.location'),
	            hidden : true,
	            layout: 'anchor',
	            defaults: {
	                anchor: '100%'
	            },
	            items :[{
	            	itemId : 'form_location',
					name : 'evt_name',
					fieldLabel : T('label.location'),
					xtype : 'combo',
					queryMode : 'local',
					store : 'LocationStore',
					displayField : 'name',
					valueField : 'name',
					allowBlank : false
	            }, {
	            	itemId : 'form_vehicles',
					name : 'vehicles',
					xtype : 'textfield',
					fieldLabel : T('label.vehicle'),
					allowBlank : false
	            }, {
					xtype : 'codecombo',
					name : 'evt_trg',
					group : 'LocationEvent',
		            fieldLabel: T('label.event_trigger'),
		            allowBlank : false		            
	            }]
	        },
	        {
				name : 'dest',
				fieldLabel : T('label.send_to'),
				emptyText : T('msg.select_users'),
				allowBlank : false
			}, {
				xtype : 'codecombo',
				name : 'type',
				group : 'AlarmType',
	            fieldLabel: T('label.type'),
	            allowBlank : false
			},
			{
                xtype: 'container',
                layout: 'hbox',
                items: [{
    				name : 'always',
    				fieldLabel : T('label.period_always'),
    				xtype : 'checkboxfield',
    				flex : 1,
					checked : true,
					handler : function(checkbox, value) {
						var alarmView = checkbox.up('management_alarm');
						var alarmFromDate = alarmView.sub('form_from_date');
						var alarmToDate = alarmView.sub('form_to_date');
						alarmFromDate.setVisible(!value);
						alarmToDate.setVisible(!value);
					}
                },
                {
                	itemId : 'form_from_date',
    				name : 'from_date',
    				fieldLabel : T('label.from_date'),
    				xtype : 'datefield',
    				format : F('date'),
    				margin : '0 30 0 0',
    				flex : 1,
    				hidden : true
                }, {
                	itemId : 'form_to_date',
    				name : 'to_date',
    				fieldLabel : T('label.to_date'),
    				xtype : 'datefield',
    				format : F('date'),
    				flex : 1,
    				hidden : true
                }]
            },
            {
				xtype: 'textarea',
	            name: 'msg',
	            fieldLabel: T('label.message'),
	            height: 100,
				allowBlank : false
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
						main.sub('name_filter').setValue('');
						main.search(true);
						//main.sub('grid').store.load(callback);
					},
					scope : main
				}
			} ]
		}
	},
	
	zmap : {
		xtype : 'panel',
		title : T('title.set_the_location'),
		cls : 'paddingPanel backgroundGray borderLeftGray',
		itemId : 'map',
		flex : 1,
		html : '<div class="map"></div>'
	}	
});
Ext.define('GreenFleet.view.management.Report', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_report',

	title : T('title.report'),

	entityUrl : 'report',
	
	importUrl : 'report/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	items : {
		html : "<div class='listTitle'>" + T('title.report_list') + "</div>"
	},
	
	initComponent : function() {
		var self = this;
		
		this.callParent(arguments);
		
		item = {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : { align : 'stretch', type : 'hbox' },
				items : [ this.buildList(this), this.buildForm(this) ]
			} ]
		};
		
		this.add(item);

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
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
		}]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'ReportStore',
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
				dataIndex : 'name',
				text : T('label.name'),
				type : 'string'
			}, {
				dataIndex : 'daily',
				text : T('label.daily'),
				type : 'boolean'
			}, {
				dataIndex : 'weekly',
				text : T('label.weekly'),
				type : 'boolean'
			}, {
				dataIndex : 'monthly',
				text : T('label.monthly'),
				type : 'boolean'
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
			tbar : [ T('label.name'), {
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
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'ReportStore',
	            cls : 'pagingtoolbar',
	            displayInfo: true,
	            displayMsg: 'Displaying report {0} - {1} of {2}',
	            emptyMsg: "No reports to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			itemId : 'details',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.report_details'),
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
					fieldLabel : T('label.id'),
					xtype : 'codecombo',
					group : 'ReportType'						
				}, {
					name : 'name',
					fieldLabel : T('label.name')
				}, {					
					name : 'cycle',
					xtype: 'checkboxgroup',
		            fieldLabel: T('label.cycle'),
		            columns: 1,
		            items: [
		                { boxLabel: T('label.daily'), name: 'daily' },
		                { boxLabel: T('label.weekly'), name: 'weekly' },
		                { boxLabel: T('label.monthly'), name: 'monthly' }
		            ]
				}, {
					name : 'send_to',
					xtype : 'textarea',
					rows : 6,
					fieldLabel: T('label.send_to')
					//xtype : 'user_selector',
					//selector_label : T('label.send_to')
				}, {
					xtype : 'textarea',
					name : 'expl',
					rows : 8,
					fieldLabel : T('label.desc')
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
Ext.define('GreenFleet.view.management.Vehicle', {
	extend : 'Ext.Container',

	alias : 'widget.management_vehicle',

	title : T('title.vehicle'),

	entityUrl : 'vehicle',
	
	importUrl : 'vehicle/import',

	afterImport : function() {
	},
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
		
	initComponent : function() {
		
		var self = this;

		this.items = [
		    { html : "<div class='listTitle'>" + T('title.vehicle_list') + "</div>"}, 
		    { xtype : 'container',
		      flex : 1,
		      layout : {
					type : 'hbox',
					align : 'stretch'
		      },
		      items : [ this.zvehiclelist, { 
		    	  		xtype : 'container',
						flex : 1,
						cls : 'borderRightGray',
						layout : {
							align : 'stretch',
							type : 'vbox'
						},
						items : [ this.ztabpanel ] } ]
		    }],

		this.callParent();
		
		/**
		 * Vehicle List에서 사용자가 차량을 선택하는 경우 - 현재 선택된 탭의 정보를 리프레쉬 
		 */
		this.sub('vehicle_list').on('itemclick', function(grid, record) {
			self.refresh(record.data.id, record.data.registration_number);
		});
		
		/**
		 * Tab 선택이 변경될 때 - 해당 탭을 리프레쉬 
		 */
		this.sub('tabs').on('tabchange', function(tabPanel, newCard, oldCard, eOpts) {
			if(self.vehicle) {
				newCard.refresh(self.vehicle, self.regNo);
			}
		});		
				
		/**
		 * Vehicle Id 검색 조건 변경시 Vehicle 데이터 Local filtering
		 */
		this.sub('id_filter').on('change', function(field, value) {
			self.search(false);
		});

		/**
		 * Vehicle Reg No. 검색 조건 변경시 Vehicle 데이터 Local filtering 
		 */
		this.sub('reg_no_filter').on('change', function(field, value) {
			self.search(false);
		});
	},
		
	/**
	 * 차량 조회 
	 */
	search : function(remote) {
		
		if(remote) {
			this.sub('vehicle_list').store.load();
			
		} else {
			this.sub('vehicle_list').store.clearFilter(true);			
			var idValue = this.sub('id_filter').getValue();
			var regNoValue = this.sub('reg_no_filter').getValue();
			
			if(idValue || regNoValue) {
				this.sub('vehicle_list').store.filter([ {
					property : 'id',
					value : idValue
				}, {
					property : 'registration_number',
					value : regNoValue
				} ]);
			}			
		}
	},
	
	/**
	 * 선택된 탭의 vehicle 정보 리프레쉬 
	 */
	refresh : function(vehicleId, regNo) {
		this.vehicle = vehicleId;
		this.regNo = regNo;
		
		var tabs = this.sub('tabs');
		var activeTab = tabs.getActiveTab();
		if(activeTab.refresh && (typeof(activeTab.refresh) === 'function')) {
			activeTab.refresh(vehicleId, regNo);
		}
	},
	
	/**
	 * 차량 리스트 그리드 
	 */
	zvehiclelist : {
		xtype : 'gridpanel',
		itemId : 'vehicle_list',
		store : 'VehicleImageBriefStore',
		title : T('title.vehicle_list'),
		width : 280,
		autoScroll : true,
		
		columns : [ {
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
			text : T('label.id'),
			flex : 1
		}, {
			dataIndex : 'registration_number',
			text : T('label.reg_no'),
			flex : 1
		} ],

		tbar : [
	    T('label.id'),
		{
			xtype : 'textfield',
			name : 'id_filter',
			itemId : 'id_filter',
			width : 60
		}, T('label.reg_no'),
		{
			xtype : 'textfield',
			name : 'reg_no_filter',
			itemId : 'reg_no_filter',
			width : 65
		}, ' ',
		{
			xtype : 'button',
			text : T('button.search'),
			handler : function(btn) {
				btn.up('management_vehicle').search(true);
			}
		}]
	},
	
	ztabpanel : {
		itemId : 'tabs',
		xtype : 'tabpanel',
		flex : 1,
		items : [ /*{
			xtype : 'management_vehicle_overview'
		}, */{
			xtype : 'management_vehicle_detail'
		}, {
			xtype : 'management_vehicle_consumables'
		}, {
			xtype : 'management_vehicle_track'
		}, {
			xtype : 'management_vehicle_incident'
		}, {
			xtype : 'management_vehicle_checkin'
		}, {
			xtype : 'management_vehicle_runstatus'
		}, {
			xtype : 'management_vehicle_speed'
		} ]
	},	
});
Ext.define('GreenFleet.view.management.VehicleOverview', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_overview',

	title : T('title.vehicle_overview'),

	entityUrl : 'vehicle',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {

		this.items = [ this.zinfo, this.zrunning,  this.zconsumables, this.zalerts ];

		this.callParent();
	},
	
	/**
	 * 리프레쉬
	 */
	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		
		// TODO 		
	},

	/**
	 * 차량 정보 
	 */
	zinfo : {
		xtype : 'panel',
		itemId : 'v_info_panel',
		cls : 'hIndexbar',
		title : T('title.information'),
		flex : 1,
		autoScroll : true
	},

	/**
	 * 주행 
	 */
	zrunning : {
		xtype : 'panel',
		itemId : 'v_running_panel',
		cls : 'hIndexbar',
		title : T('title.running'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 정비, 소모품  
	 */
	zconsumables : {
		xtype : 'panel',
		itemId : 'v_consumable_panel',
		cls : 'hIndexbar',
		title : T('title.consumables'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * alert  
	 */
	zalerts : {
		xtype : 'panel',
		itemId : 'v_alert_panel',
		cls : 'hIndexbar',
		title : T('title.alert'),
		flex : 1,
		autoScroll : true
	}	
});
Ext.define('GreenFleet.view.management.VehicleDetail', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_detail',

	title : T('title.vehicle_details'),

	layout : {
		align : 'stretch',
		type : 'vbox'
	},	
	
	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		this.add(this.vehicleForm());		
	},
	
	/**
	 * 차량 상세 페이지 리프레쉬 
	 */
	refresh : function(vehicleId, regNo) {		
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
				
		var self = this;
		this.vehicle = vehicleId;
		
		self.formSetDisabled(true);
	
		Ext.Ajax.request({
			url : 'vehicle/find',
			method : 'GET',
			params : {
				id : vehicleId
			},
			success : function(response, opts) {
				var record = Ext.JSON.decode(response.responseText);
				var newRecord = {};
				newRecord.data = {};
				
				// lat, lng 정보가 있다면 location 정보를 얻어와서 vehicle form loading...
	    		if(record.lat !== undefined && record.lng !== undefined && record.lat > 0 && record.lng > 0) {
	    			var latlng = new google.maps.LatLng(record.lat, record.lng);
	    			geocoder = new google.maps.Geocoder();
	    			geocoder.geocode({
	    				'latLng' : latlng
	    			}, function(results, status) {
	    				if (status == google.maps.GeocoderStatus.OK) {
	    					if (results[0]) {
	    						var address = results[0].formatted_address;
	    						record.location = address;
	    						newRecord.data = record;
	    						self.sub('form').loadRecord(newRecord);	    						
	    					}
	    				} else {
	    					console.log("Geocoder failed due to: " + status);
	    				}
	        		});    			
	    		}
			},
			failure : function(response, opts) {
				Ext.Msg.alert(T('label.failure'), response.responseText);
			}
		});		
	},
	
	vehicleForm : function(main) {
		return{
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',	
			title : T('title.vehicle_details'),
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			flex : 1,
			items : [{
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
					itemId: 'form_id',
					name : 'id',
					fieldLabel : T('label.id')
				}, {
					name : 'registration_number',
					fieldLabel : T('label.reg_no')
				}, {
					name : 'vehicle_model',
					fieldLabel : T('label.vehicle_model')
				}, {
					xtype : 'codecombo',
					name : 'manufacturer',
					group : 'V-Maker',
					fieldLabel : T('label.manufacturer')
				}, {
					xtype : 'codecombo',
					name : 'vehicle_type',
					group : 'V-Type1',
					fieldLabel : T('label.vehicle_type')
				}, {
					xtype : 'codecombo',
					name : 'fuel_type',
					group : 'V-Fuel',
					fieldLabel : T('label.fuel_type')
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
					fieldLabel : T('label.ownership_type')
				}, {
					xtype : 'combo',
					itemId: 'form_status',
					name : 'status',
					queryMode : 'local',
					store : 'VehicleStatusStore',
					displayField : 'desc',
					valueField : 'status',
					fieldLabel : T('label.status')
				}, {
					itemId: 'form_health_status',
					name : 'health_status',
					fieldLabel : T('label.health')							
				}, {
					itemId: 'form_total_distance',
					name : 'total_distance',
					fieldLabel : T('label.total_distance')
				}, {
					itemId: 'form_total_run_time',
					name : 'total_run_time',
					fieldLabel : T('label.total_run_time')
				}, {
					itemId: 'form_official_effcc',
					name : 'official_effcc',
					fieldLabel : T('label.official_effcc')
				}, {
					itemId: 'form_avg_effcc',
					name : 'avg_effcc',
					fieldLabel : T('label.avg_effcc')
				}, {
					itemId: 'form_eco_index',
					name : 'eco_index',
					fieldLabel : T('label.eco_index')
				}, {
					itemId: 'form_eco_run_rate',
					name : 'eco_run_rate',
					fieldLabel : T('label.eco_run_rate')
				}, {
					itemId: 'form_remaining_fuel',
					name : 'remaining_fuel',
					fieldLabel : T('label.remaining_fuel')
				}, {
					name : 'location',
					fieldLabel : T('label.location'),
					disabled : true
				}, {
					name : 'lat',
					fieldLabel : T('label.latitude'),
					disabled : true
				}, {
					name : 'lng',
					fieldLabel : T('label.longitude'),
					disabled : true
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : T('label.image_upload'),
					msgTarget : 'side',
					allowBlank : true,
					buttonText : T('button.file')
				}, {
					xtype : 'displayfield',
					name : 'image_clip',
					itemId : 'image_clip',
					hidden : true
				} ]
			}],
			
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : function(callback) {
						var vehicleStore = Ext.getStore('VehicleImageBriefStore');
						vehicleStore.load(callback);
					},
					resetFn : function(callback) {
						this.formSetDisabled(false);
					},
					scope : this
				}
			} ]
		}
	},
	
	formSetDisabled : function(mode){
		this.sub('form_id').setDisabled(mode);
		this.sub('form_status').setDisabled(mode);
		this.sub('form_health_status').setDisabled(mode);
		this.sub('form_total_run_time').setDisabled(mode);
		this.sub('form_total_distance').setDisabled(mode);
		this.sub('form_official_effcc').setDisabled(mode);
		this.sub('form_avg_effcc').setDisabled(mode);
		this.sub('form_eco_index').setDisabled(mode);
		this.sub('form_eco_run_rate').setDisabled(mode);
		this.sub('form_remaining_fuel').setDisabled(mode);
	}
	
});
Ext.define('GreenFleet.view.management.VehicleConsumables', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_consumables',

	title : T('title.vehicle_consumables'),
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},	
	
	initComponent : function() {
		var self = this;		
		this.callParent(arguments);
		this.add(this.consumablegrid);
		this.sub('edit_consumables_grid').on('edit', function(editor, e) {
			var record = e.record.data;
			self.save(record);
		});		
	},	
	
	/**
	 * 차량 소모품 기준 정보 페이지 리프레쉬  
	 */
	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		this.setPanelTitle(regNo);
		var store = this.sub('edit_consumables_grid').store; 
		store.getProxy().extraParams.vehicle_id = vehicleId;
		store.load();		
	},
	
	/**
	 * panel title을 설정 
	 */
	setPanelTitle : function(name) {
		var title = T('title.vehicle_consumables') + ' (' + name + ')';
		this.sub('edit_consumables_grid').setTitle(title);
	},	
	
	save : function(record) {
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
	},
	
	consumablegrid : {
		xtype : 'gridpanel',
		bodyPadding : 10,
		cls : 'hIndexbar',
		flex : 1,
    	itemId : 'edit_consumables_grid',		
        title: T('title.vehicle_consumables'),	        
        store: 'VehicleConsumableStore',
        plugins: [ Ext.create('Ext.grid.plugin.RowEditing', {
	        clicksToMoveEditor: 1,
	        autoCancel: true
	    }) ],
        vehicleId : '',
        columns: [{
        	header : 'Key',
        	dataIndex : 'key',
        	hidden : true
        }, {
        	header : 'Vehicle',
        	dataIndex : 'vehicle_id',
        	hidden : true
        }, {
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
        	header: T('label.repl_mileage') + '(km)',
        	dataIndex: 'repl_mileage',
        	width: 105,
        	editor: {
                xtype: 'numberfield',
                allowBlank: false,
                minValue: 0,
                maxValue: 500000,
                step : 1000
            }	        	
        }, {
            xtype: 'numbercolumn',
            header: T('label.repl_time') + T('label.parentheses_month'),
            dataIndex: 'repl_time',
            width: 105,
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
                minValue: 0,
                maxValue: 120
            }
        }]
	}
});
Ext.define('GreenFleet.view.management.VehicleIncident', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_incident',

	title : T('title.incidents'),

	entityUrl : 'incident',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {
		var self = this;
		this.items = [ this.buildList(this), this.buildForm(this) ];		
		this.callParent(arguments);

		this.sub('incidentGrid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('driver_filter').setValue('');
			self.sub('date_filter').setValue('');
		});

		this.down('#search').on('click', function() {
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

		this.sub('fullscreen').on('afterrender', function(comp) {
			comp.getEl().on('click', function() {
				if (!Ext.isWebKit)
					return;
				self.sub('video').getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
			});
		});
	},
	
	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		this.sub('vehicle_filter').setValue(this.vehicle);
		this.search();
	},

	search : function() {
		if(!this.sub('driver_filter') || !this.sub('date_filter') || !this.sub('vehicle_filter'))
			return null;
		
		var store = this.sub('incidentGrid').store;		
		var vehicleId = this.sub('vehicle_filter').getSubmitValue();		
		var driverId = this.sub('driver_filter').getSubmitValue();
		var dateValue = this.sub('date_filter').getSubmitValue();
		var filterData = [ {property : 'confirm', value : false} ];
		
		if(vehicleId && vehicleId != '') {
			filterData.push({property : 'vehicle_id', value : vehicleId});
		}
		
		if(driverId && driverId != '') {
			filterData.push({property : 'driver_id', value : driverId});
		}
		
		if(dateValue && dateValue != '') {
			filterData.push({"property" : "date", "value" : dateValue});
		}		
		
    	Ext.Ajax.request({
		    url: '/incident',
		    method : 'GET',
		    params : { 
		    	filter : Ext.JSON.encode(filterData),
		    	sort : Ext.JSON.encode([{property : 'datetime',	direction : 'DESC'}])
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	store.loadData(records);
					
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});		
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'incidentGrid',
			store : Ext.create('Ext.data.ArrayStore', {
				fields: [{name : 'key', type : 'string'},  
				        {name : 'datetime', type : 'date', dateFormat:'time' }, 
				      	{name : 'terminal_id', type : 'string'}, 
				    	{name : 'vehicle_id', type : 'string'}, 
				    	{name : 'driver_id', type : 'string'}, 
				    	{name : 'lat', type : 'float'}, 
				    	{name : 'lng', type : 'float'}, 
				    	{name : 'velocity', type : 'float'}, 
				    	{name : 'impulse_abs', type : 'float'}, 
				    	{name : 'impulse_x', type : 'float'}, 
				    	{name : 'impulse_y', type : 'float'},
				    	{name : 'impulse_z', type : 'float'}, 
				    	{name : 'impulse_threshold', type : 'float'}, 
				    	{name : 'obd_connected', type : 'boolean'}, 
				    	{name : 'confirm', type : 'boolean'}, 
				    	{name : 'engine_temp', type : 'float'}, 
				    	{name : 'engine_temp_threshold', type : 'float'}, 
				    	{name : 'video_clip', type : 'string'} ], 
				        data: []}),
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'datetime',
				text : T('label.datetime'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver'),
				type : 'string'
			}, {
				dataIndex : 'terminal_id',
				text : T('label.terminal'),
				type : 'string'
			}, {
				dataIndex : 'lat',
				text : T('label.latitude'),
				type : 'number'
			}, {
				dataIndex : 'lng',
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
			}],
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
		        maxValue: new Date(),
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
			title : T('title.incident_details'),
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [{
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
					fieldLabel : T('label.datetime'),
					format : F('datetime')					
				}, {
					xtype : 'textfield',
					name : 'vehicle_id',
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
					name : 'lat',
					fieldLabel : T('label.latitude')
				}, {
					xtype : 'textfield',
					name : 'lng',
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
					xtype : 'displayfield',
					name : 'video_clip',
					itemId : 'video_clip',
					hidden : true
				} ] 
			}, {
				xtype : 'panel',
				flex : 1,
				cls : 'incidentVOD paddingLeft10',
				layout : {
					type : 'vbox',
					align : 'stretch',
					itemCls : 'test'
				},
				items : [{
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
					tpl : [ '<video width="100%" height="100%" controls="controls">', '<source {value} type="video/mp4" />', 'Your browser does not support the video tag.', '</video>' ]
				}]
			}],
			dockedItems : [{
				xtype : 'entity_form_buttons',
				loader : {
					fn : main.search,
					scope : main
				}
			}]
		}
	}
});

Ext.define('GreenFleet.view.management.VehicleTrack', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_track',

	title : T('menu.track'),

	entityUrl : 'track',

	importUrl : 'track/import',

	afterImport : function() {
		this.search();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {
		var self = this;		
		this.items = [ this.buildList(this), this.buildForm(this) ];		
		this.callParent(arguments);

		/**
		 * track list에서 하나 선택시 
		 */
		this.sub('grid').on('itemclick', function(grid, record) {
    		// lat, lng 정보로 부터 위치 정보 얻어옴 
			if(record.data.lat !== undefined && record.data.lng !== undefined) {
    			var latlng = new google.maps.LatLng(record.data.lat, record.data.lng);
    			geocoder = new google.maps.Geocoder();
    			geocoder.geocode({
    				'latLng' : latlng
    			}, function(results, status) {
    				if (status == google.maps.GeocoderStatus.OK) {
    					if (results[0]) {
    						var address = results[0].formatted_address;
    						record.data.location = address;
    						self.sub('form').loadRecord(record);
    					}
    				} else {
    					console.log("Geocoder failed due to: " + status);
    				}
        		});    			
    		}    					
		});

		/**
		 * track grid의 store load 전 
		 */
		this.down('#grid').store.on('beforeload', function(store, operation, opt) {
			var filters = self.getFilter();
			if(filters && filters.length > 0) {
				operation.params = operation.params || {};
				operation.params['filter'] = Ext.JSON.encode(filters);
			}
		});
		
		/**
		 * 초기화 버튼 선택시 
		 */
		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('driver_filter').setValue('');
			self.sub('date_filter').setValue(new Date());
		});

		/**
		 * 검색 버튼 선택시 
		 */
		this.down('#search').on('click', function() {
			self.search();
		});
	},
	
	getFilter : function() {
		
		if(!this.sub('vehicle_filter') || !this.sub('driver_filter') || !this.sub('date_filter'))
			return null;
		
		if(!this.sub('vehicle_filter').getSubmitValue() && !this.sub('driver_filter').getSubmitValue() && !this.sub('date_filter').getSubmitValue())
			return null;
		
		var filters = [];
		
		if(this.sub('vehicle_filter').getSubmitValue()) {
			filters.push({"property" : "vehicle_id", "value" : this.sub('vehicle_filter').getSubmitValue()});
		}
		
		if(this.sub('date_filter').getSubmitValue()) {
			filters.push({"property" : "date", "value" : this.sub('date_filter').getSubmitValue()});
		}
				
		if(this.sub('driver_filter').getSubmitValue()) {
			filters.push({"property" : "driver_id", "value" : this.sub('driver_filter').getSubmitValue()});
		}		
		
		return filters;
	},	

	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		this.sub('vehicle_filter').setValue(this.vehicle);
		this.search();
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
				dataIndex : 'datetime',
				text : T('label.datetime'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'vehicle_id',
				text : T('label.vehicle'),
				type : 'string'
			}, {
				dataIndex : 'terminal_id',
				text : T('label.terminal'),
				type : 'string'
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver'),
				type : 'string'
			}, {
				dataIndex : 'velocity',
				text : T('label.velocity'),
				type : 'number'
			}, {
				dataIndex : 'lat',
				text : T('label.latitude'),
				type : 'number'
			}, {
				dataIndex : 'lng',
				text : T('label.longitude'),
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
				xtype : 'combo',
				name : 'driver_filter',
				itemId : 'driver_filter',
				queryMode : 'local',
				store : 'DriverBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.driver'),
				width : 200
			}, {
				xtype : 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : T('label.date'),
				format : 'Y-m-d',
				submitFormat : 'U',
				maxValue : new Date(),
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
				name : 'vehicle_id',
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
				name : 'velocity',
				fieldLabel : T('label.velocity')
			}, {
				name : 'lat',
				fieldLabel : T('label.latitude')
			}, {
				name : 'lng',
				fieldLabel : T('label.longitude')
			}, {
				name : 'location',
				fieldLabel : T('label.location'),
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
Ext.define('GreenFleet.view.management.VehicleCheckin', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_checkin',

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
		
	initComponent : function() {
		var self = this;
		this.disabled = GreenFleet.checkDisabled(this.xtype);
		this.items = [ this.buildList, this.buildForm(this) ];
		this.callParent(arguments);
		
		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.down('#grid').store.on('beforeload', function(store, operation, opt) {
			var filters = self.getFilter();
			if(filters && filters.length > 0) {
				operation.params = operation.params || {};
				operation.params['filter'] = Ext.JSON.encode(filters);
			}			
		});
		
		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('driver_filter').setValue('');
			self.sub('date_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search();
		});
		
	},
	
	getFilter : function() {
		
		if(!this.sub('driver_filter') || !this.sub('date_filter') || !this.sub('vehicle_filter'))
			return null;
		
		if(!this.sub('vehicle_filter').getSubmitValue() &&  !this.sub('driver_filter').getSubmitValue() && !this.sub('date_filter').getSubmitValue())
			return null;
		
		var filters = [];
		
		if(this.sub('date_filter').getSubmitValue()) {
			filters.push({"property" : "date", "value" : this.sub('date_filter').getSubmitValue()});
		}
		
		if(this.sub('vehicle_filter').getSubmitValue()) {
			filters.push({"property" : "vehicle_id", "value" : this.sub('vehicle_filter').getSubmitValue()});
		}
		
		if(this.sub('driver_filter').getSubmitValue()) {
			filters.push({"property" : "driver_id", "value" : this.sub('driver_filter').getSubmitValue()});
		}		
		
		return filters;
	},
	
	refresh : function(vehicleId, regNo) {		
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		this.sub('vehicle_filter').setValue(this.vehicle);
		this.search();
	},	

	search : function(callback) {
		this.sub('pagingtoolbar').moveFirst({callback : callback});
	},
	
	buildList : {		
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
			dataIndex : 'datetime',
			text : T('label.datetime'),
			xtype:'datecolumn',
			format:F('datetime'),
			width : 120
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
	        maxValue: new Date(),
			width : 200
		}, {
			itemId : 'search',
			text : T('button.search')
		}, {
			text : T('button.reset'),
			itemId : 'search_reset'
		} ],
		bbar: {
			xtype : 'pagingtoolbar',
			itemId : 'pagingtoolbar',
            store: 'CheckinDataStore',
            displayInfo: true,
            cls : 'pagingtoolbar',
            displayMsg: 'Displaying checkin data {0} - {1} of {2}',
            emptyMsg: "No checkin data to display"
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
				name : 'vehicle_id',
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
Ext.define('GreenFleet.view.management.VehicleRunStatus', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_runstatus',

	title : T('title.vehicle_runstatus'),

	entityUrl : 'vehicle_run',
	
	importUrl : 'vehicle_run/import',

	afterImport : function() {
	},
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	chartXTitle : 'month',
		
	timeView : 'monthly',
	
	chartPanel : null,

	initComponent : function() {
		var self = this;
//		this.disabled = GreenFleet.checkDisabled(this.xtype);
		this.items = [ this.zrunstatus, this.zrunstatus_chart ];
		this.callParent(arguments);
		
		this.sub('runstatus_grid').on('itemclick', function(grid, record) {			
			if(record.data.time_view == "yearly") {
				self.searchSummary(record.data.vehicle, null, "monthly", record.data.year, null);
				
			} else if(record.data.time_view == "monthly") {
				self.searchSummary(record.data.vehicle, null, "daily", record.data.year, record.data.month);
			}
		});
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		/**
		 * combo_chart_type에 값을 기본값(column)을 설정
		 */
		this.sub('combo_chart_type').setValue('column');
		/**
		 * combo_chart에 값을 기본값(run_dist)을 설정
		 */
		this.sub('combo_chart').setValue('run_dist');
		/**
		 * combo_view에 값을 기본값(monthly_view)을 설정
		 */
		this.sub('combo_view').setValue('monthly');	
		/**
		 * 검색버튼 추가
		 */
		this.down('#search').on('click', function() {
			self.searchSummary(null, null, null, null, null);
		});
	},
	
	/**
	 * grid title을 설정 
	 */
	setGridTitle : function(name) {
		var title = name ? T('title.runstatus_history') + ' (' + name + ')' : T('title.runstatus_history');
		this.sub('runstatus_panel').setTitle(title);
	},
	
	/**
	 * 차량 선택시 리프레쉬 
	 */
	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		this.searchSummary(vehicleId, regNo, null, null, null);
	},
	
	/**
	 * vehicle run summary 조회 
	 */
	searchSummary : function(vehicleId, regNo, timeView, year, month) {
		
		if(!vehicleId) {
			vehicleId = this.vehicle;
			
			if(!vehicleId)
				return;
		}
		
		if(!timeView) {
			timeView = this.sub('combo_view').getValue();
		}
		
		var runStatusStore = this.sub('runstatus_grid').store;
		var proxy = runStatusStore.getProxy();
		proxy.extraParams.vehicle = vehicleId;
		proxy.extraParams.time_view = timeView;
		
		if(timeView == "monthly") {
			this.chartXTitle = "month";
			if(year == null) {
				proxy.extraParams.from_year = this.sub('from_year').getValue();
				proxy.extraParams.to_year = this.sub('to_year').getValue();
				proxy.extraParams.from_month = this.sub('from_month').getValue();
				proxy.extraParams.to_month = this.sub('to_month').getValue();
			} else {
				proxy.extraParams.from_year = year;
				proxy.extraParams.to_year = year;
				proxy.extraParams.from_month = 1;
				proxy.extraParams.to_month = 12;
			}					
		} else if(timeView == "daily") {
			this.chartXTitle = "date";
			proxy.extraParams.year = year;
			proxy.extraParams.month = month;
			
		} else if(timeView == "yearly") {
			this.chartXTitle = "year";
		}
				
		runStatusStore.load({
			scope : this,
			callback : function() {
				if(regNo) {
					this.setGridTitle(regNo);
				}
				this.refreshChart();
			}
		});		
	},

	/**
	 * 차량 운행 이력 데이터 그리드
	 */
	zrunstatus : {
		xtype : 'panel',
		itemId : 'runstatus_panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_history'),
		flex : 1,
		autoScroll : true,
		layout : {
				type : 'hbox',
				align : 'stretch'
		},
		items : [{
			xtype : 'grid',
			itemId : 'runstatus_grid',
			store : 'VehicleRunStore',
			flex : 1,
			columns : [ {
				dataIndex : 'time_view',
				hidden : true
			}, {
				header : T('label.month'),
				dataIndex : 'month_str'
			}, {
				header : T('label.run_dist') + '(km)',
				dataIndex : 'run_dist'
			}, {
				header : T('label.run_time') + T('label.parentheses_min'),
				dataIndex : 'run_time'
			}, {
				header : T('label.fuel_consumption') + '(l)',
				dataIndex : 'consmpt'
			}, {
				header : T('label.co2_emissions') + '(g/km)',
				dataIndex : 'co2_emss'
			}, {
				header : T('label.fuel_efficiency') + '(km/l)',
				dataIndex : 'effcc'
			}, {
				header : T('label.eco_index') + '(%)',
				dataIndex : 'eco_index'
			}, {
				header : T('label.sud_accel_cnt'),
				dataIndex : 'sud_accel_cnt'
			}, {
				header : T('label.sud_brake_cnt'),
				dataIndex : 'sud_brake_cnt'
			}, {
				header : T('label.eco_drv_time') + T('label.parentheses_min'),
				dataIndex : 'eco_drv_time'
			}, {
				header : T('label.ovr_spd_time') + T('label.parentheses_min'),
				dataIndex : 'ovr_spd_time'
			}, {
				header : T('label.idle_time') + T('label.parentheses_min'),
				dataIndex : 'idle_time'					
			}, {
				header : T('label.inc_cnt'),
				dataIndex : 'inc_cnt'
			}, {
				header : T('label.outofservice_count'),
				dataIndex : 'oos_cnt'
			}, {
				header : T('label.maintenance_count'),
				dataIndex : 'mnt_cnt'
			}, {
				header : T('label.maintenance_time') + T('label.parentheses_min'),
				dataIndex : 'mnt_time'
			} ]
		}],

		tbar : [
	        T('label.view') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_view',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', { 
					fields : [ 'name', 'desc' ],
					data : [{ "name" : "monthly",	"desc" : T('label.monthly_view') },
					        { "name" : "yearly",	"desc" : T('label.yearly_view')  }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_vehicle_runstatus');
						thisView.searchSummary(null, null, null, null, null);
					}
			    }
			},
			T('label.chart_type') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart_type',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'name', 'desc' ],			
					data : [{ "name" : "column", "desc" : T('label.column') },
					        { "name" : "line",	 "desc" : T('label.line')   }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_vehicle_runstatus');
						thisView.refreshChart();
					}
			    }
			},
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : (new Date().getMonth() + 1 == 12) ? new Date().getFullYear() : new Date().getFullYear() -1,
				store : 'YearStore',
				width : 60				
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : (new Date().getMonth() + 1 == 12) ? new Date().getMonth() - 10 : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
		    T('label.chart') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',				
				store :  Ext.create('Ext.data.Store', { 
					fields : [ 'name', 'desc', 'unit' ], 
					data : [{ "name" : "run_dist", 		"desc" : T('label.run_dist'), 			"unit" : "(km)" },
					        { "name" : "run_time", 		"desc" : T('label.run_time'), 			"unit" : T('label.parentheses_min') },
					        { "name" : "rate_of_oper", 	"desc" : T('label.rate_of_oper'), 		"unit" : "(%)" },
							{ "name" : "consmpt", 		"desc" : T('label.fuel_consumption'), 	"unit" : "(l)" },
							{ "name" : "co2_emss", 		"desc" : T('label.co2_emissions'), 		"unit" : "(g/km)" },
							{ "name" : "effcc", 		"desc" : T('label.fuel_efficiency'), 	"unit" : "(km/l)" },
							{ "name" : "eco_index", 	"desc" : T('label.eco_index'), 			"unit" : "(%)" },							
							{ "name" : "eco_drv_time", 	"desc" : T('label.eco_drv_time'), 		"unit" : T('label.parentheses_min') },
							{ "name" : "ovr_spd_time", 	"desc" : T('label.ovr_spd_time'), 		"unit" : T('label.parentheses_min') },
							{ "name" : "idle_time", 	"desc" : T('label.idle_time'), 			"unit" : T('label.parentheses_min') },							
							{ "name" : "sud_accel_cnt", "desc" : T('label.sud_accel_cnt'), 		"unit" : "" },
							{ "name" : "sud_brake_cnt", "desc" : T('label.sud_brake_cnt'), 		"unit" : "" },
							{ "name" : "inc_cnt", 		"desc" : T('label.inc_cnt'), 			"unit" : "" },							
							{ "name" : "oos_cnt", 		"desc" : T('label.outofservice_count'), "unit" : "" },
							{ "name" : "mnt_cnt", 		"desc" : T('label.maintenance_count'), 	"unit" : "" },
							{ "name" : "mnt_time", 		"desc" : T('label.maintenance_time'), 	"unit" : T('label.parentheses_min') }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_vehicle_runstatus');
						
						if(currentValue != 'driving_habit')
							thisView.refreshChart();
						else
							thisView.refreshRadarChart();
					}
			    }
			},
			{
				text : T('button.search'),
				itemId : 'search'
			}
		]		
	},

	/**
	 * 차트 패널 
	 */
	zrunstatus_chart : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 차트 갱신
	 */
	refreshChart : function() {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chartType = this.sub('combo_chart_type').getValue();
		var comboChart = this.sub('combo_chart');
		var yField = comboChart.getValue();
		var store = this.sub('runstatus_grid').store;
		var chartTypeArr = comboChart.store.data;
		var yTitle = '';
		var unit = '';
		
		for(var i = 0 ; i < chartTypeArr.length ; i++) {
			var chartTypeData = chartTypeArr.items[i].data;
			if(yField == chartTypeData.name) {
				yTitle = chartTypeData.desc;
				unit = chartTypeData.unit;
				break;
			}
		}
		
		if(yField == 'rate_of_oper') {
			this.setRateOfOper(store);
		}
		
		var chart = this.buildChart(chartType, store, yField, yTitle, unit, 0, width, height);		
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * 가동율 차트를 선택했을 경우 가동율 계산 후 추가 
	 */
	setRateOfOper : function(store) {
		
		store.each(function(record) {
			var monthStr = record.get('month_str');
			var runTime = record.get('run_time');	
			var rateOfOper = runTime ? ((runTime * 100) / (30 * 24 * 60)) : 0;
			rateOfOper = Ext.util.Format.number(rateOfOper, '0.00');
			record.data.rate_of_oper = rateOfOper;
		});
	},
	
	/**
	 * 차트 타입을 Radar로 선택했을 때 차트 갱신 
	 */
	refreshRadarChart : function() {
		
		var store = this.sub('runstatus_grid').store;
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildRadar(store, width, height);
		chartPanel.add(chart);
		this.chartPanel = chart;
	},	
	
	/**
	 * 차트 리사이즈 
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 레이더 차트 생성 
	 */
	buildRadar : function(store, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				insetPadding: 20,
				legend: { position: 'right' },
	            axes: [{
	                type: 'Radial',
	                position: 'radial',
	                label: {
	                    display: true
	                }
	            }],
	            series: [{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'run_dist',
	                style: {
	                    opacity: 0.4
	                }
	            },{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'run_time',
	                style: {
	                    opacity: 0.4
	                }
	            },{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'consmpt',
	                style: {
	                    opacity: 0.4
	                }
	            },{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'co2_emss',
	                style: {
	                    opacity: 0.4
	                }
	            },{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'effcc',
	                style: {
	                    opacity: 0.4
	                }		            
	            }]
			}]
		};
	},	
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(chartType, store, yField, yTitle, unit, minValue, width, height) {
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: [yField],
	                label: { renderer: Ext.util.Format.numberRenderer('0,0') },
	                title: yTitle,
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['month_str'],
	                grid : true,
	                title: T('label.' + this.chartXTitle)
				}],
				series : [{
					type : chartType,
					axis: 'left',
					xField: 'month_str',
	                yField: yField,
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get('month_str') + ' : ' + storeItem.get(yField) + unit);
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : yField,
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}]
			}]
		}
	}
});
Ext.define('GreenFleet.view.management.VehicleSpeedSection', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_speed',

	title : T('title.vehicle_speed_section'),

	entityUrl : 'vehicle_speed',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
		
	timeView : 'monthly',
	
	chartPanel : null,

	initComponent : function() {
		var self = this;
//		this.disabled = GreenFleet.checkDisabled(this.xtype);
		this.items = [ this.zrunstatus, this.zrunstatus_chart ];
		this.callParent(arguments);

		this.sub('runstatus_grid').on('itemclick', function(grid, record) {			
			if(record.data.time_view == "yearly") {
				self.searchSummary(record.data.vehicle, null, "monthly", record.data.year, null);
				
			} else if(record.data.time_view == "monthly") {
				self.searchSummary(record.data.vehicle, null, "daily", record.data.year, record.data.month);
				
			} else if(record.data.time_view == "daily") {
				self.setChartTitle(record.data.month_str);
				self.refreshByMonth(record);				
			}
		});
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		/**
		 * combo_chart_type에 값을 기본값(column)을 설정
		 */
		this.sub('combo_chart_type').setValue('column');
		/**
		 * combo_view에 값을 기본값(monthly_view)을 설정
		 */
		this.sub('combo_view').setValue('monthly');
		/**
		 * 검색버튼 추가
		 */
		this.down('#search').on('click', function() {
			self.searchSummary(null, null, null, null, null);
		});
	},
	
	/**
	 * 운행이력 그리드 타이틀 
	 */
	setGridTitle : function(name) {
		var title = name ? T('title.runstatus_history') + ' (' + name + ') ' : T('title.runstatus_history');
		this.sub('runstatus_grid').setTitle(title);
	},
	
	/**
	 * 차트 그리드 타이틀 
	 */
	setChartTitle : function(month) {
		var title = month ? T('label.speed_section') + ' (' + month + ') ' + T('label.chart') : T('label.speed_section') + T('label.chart');
		this.sub('chart_panel').setTitle(title);
	},
	
	/**
	 * 차량 선택시 리프레쉬 
	 */
	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		this.searchSummary(vehicleId, regNo, null, null, null);
	},
	
	/**
	 * vehicle speed summary 조회 
	 */
	searchSummary : function(vehicleId, vehicleName, timeView, year, month) {
		
		if(!vehicleId) {
			vehicleId = this.vehicle;
			
			if(!vehicleId)
				return;
		}
		
		if(!timeView) {
			timeView = this.sub('combo_view').getValue();
		}
		
		var runStatusStore = this.sub('runstatus_grid').store;
		var proxy = runStatusStore.getProxy();
		proxy.extraParams.vehicle = vehicleId;
		proxy.extraParams.time_view = timeView;
		
		if(timeView == "monthly") {
			if(year == null) {
				proxy.extraParams.from_year = this.sub('from_year').getValue();
				proxy.extraParams.to_year = this.sub('to_year').getValue();
				proxy.extraParams.from_month = this.sub('from_month').getValue();
				proxy.extraParams.to_month = this.sub('to_month').getValue();
			} else {
				proxy.extraParams.from_year = year;
				proxy.extraParams.to_year = year;
				proxy.extraParams.from_month = 1;
				proxy.extraParams.to_month = 12;
			}					
		} else if(timeView == "daily") {
			proxy.extraParams.year = year;
			proxy.extraParams.month = month;			
		} 
				
		runStatusStore.load({
			scope : this,
			callback : function() {
				if(vehicleName) {
					this.setGridTitle(vehicleName);
				}
				
				if(year && month) {
					this.setChartTitle(year + '-' + month);
				}
				
				this.refreshChart();
			}
		});
	},
	
	/**
	 * 운행이력 그리드 패널 
	 */
	zrunstatus : {
		xtype : 'gridpanel',
		itemId : 'runstatus_grid',
		store : 'VehicleSpeedStore',
		cls : 'hIndexbar',
		title : T('title.runstatus_history'),
		autoScroll : true,
		flex : 1,
		columns : [ {
			dataIndex : 'month_str',
			text : T('label.month')
		}, {
			header : T('label.lessthan_km_min', {km : 10}),
			dataIndex : 'spd_lt10'
		}, {
			header : T('label.lessthan_km_min', {km : 20}),
			dataIndex : 'spd_lt20'
		}, {
			header : T('label.lessthan_km_min', {km : 30}),
			dataIndex : 'spd_lt30'
		}, {
			header : T('label.lessthan_km_min', {km : 40}),
			dataIndex : 'spd_lt40'
		}, {
			header : T('label.lessthan_km_min', {km : 50}),
			dataIndex : 'spd_lt50'
		}, {
			header : T('label.lessthan_km_min', {km : 60}),
			dataIndex : 'spd_lt60'
		}, {
			header : T('label.lessthan_km_min', {km : 70}),
			dataIndex : 'spd_lt70'
		}, {
			header : T('label.lessthan_km_min', {km : 80}),
			dataIndex : 'spd_lt80'
		}, {
			header : T('label.lessthan_km_min', {km : 90}),
			dataIndex : 'spd_lt90'
		}, {
			header : T('label.lessthan_km_min', {km : 100}),
			dataIndex : 'spd_lt100'
		}, {
			header : T('label.lessthan_km_min', {km : 110}),
			dataIndex : 'spd_lt110'
		}, {
			header : T('label.lessthan_km_min', {km : 120}),
			dataIndex : 'spd_lt120'
		}, {
			header : T('label.lessthan_km_min', {km : 130}),
			dataIndex : 'spd_lt130'
		}, {
			header : T('label.lessthan_km_min', {km : 140}),
			dataIndex : 'spd_lt140'
		}, {
			header : T('label.lessthan_km_min', {km : 150}),
			dataIndex : 'spd_lt150'
		}, {
			header : T('label.lessthan_km_min', {km : 160}),
			dataIndex : 'spd_lt160'
		} ],
	
		tbar : [
	        T('label.view') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_view',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', { 
					fields : [ 'name', 'desc' ],
					data : [{ "name" : "monthly",	"desc" : T('label.monthly_view') },
					        { "name" : "yearly",	"desc" : T('label.yearly_view')  }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_vehicle_speed');
						thisView.searchSummary(null, null, null, null, null);
					}
			    }
			},
			T('label.chart_type') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart_type',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'name', 'desc' ],			
					data : [{ "name" : "column", "desc" : T('label.column') },
					        { "name" : "radar",	 "desc" : T('label.radar')  }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_vehicle_speed');
						thisView.refreshChart();
					}
			    }
			},
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : (new Date().getMonth() + 1 == 12) ? new Date().getFullYear() : new Date().getFullYear() -1,
				store : 'YearStore',
				width : 60				
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : (new Date().getMonth() + 1 == 12) ? new Date().getMonth() - 10 : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search'
			}
		]
	},

	/**
	 * 차트 패널 
	 */
	zrunstatus_chart : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('title.speed_section_chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 차트 리프레쉬 
	 */
	refreshChart : function() {
				
		var chartType = this.sub('combo_chart_type').getValue();
		if(chartType == 'radar') 
			this.refreshRadarChart();
		else
			this.refreshColumnChart();
	},
	
	/**
	 * 컬럼 차트 리프레쉬 
	 */
	refreshColumnChart : function() {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var columnDataArr = [];
		var store = this.sub('runstatus_grid').store;
		store.each(function(record) {
			// speed 0 ~ 30
			var spd_30 = (record.get('spd_lt10') + record.get('spd_lt20') + record.get('spd_lt30'));
			// speed 40 ~ 60
			var spd_40_60 = (record.get('spd_lt40') + record.get('spd_lt50') + record.get('spd_lt60'));
			// speed 50 ~ 80
			var spd_70_90 = (record.get('spd_lt70') + record.get('spd_lt80') + record.get('spd_lt90'));			
			// speed 90 ~ 120
			var spd_100_120 = (record.get('spd_lt90') + record.get('spd_lt100') + record.get('spd_lt110') + record.get('spd_lt120'));			
			// speed 130 ~
			var spd_over_130 = (record.get('spd_lt130') + record.get('spd_lt140') + record.get('spd_lt150') + record.get('spd_lt160'));
			
			var columnData = { 	'month_str' : record.get('month_str'), 
								'value1' : spd_30, 			'desc1' : '0 ~ 30(km)', 
								'value2' : spd_40_60, 		'desc2' : '40 ~ 60(km)',
								'value3' : spd_70_90, 		'desc3' : '70 ~ 90(km)',
								'value4' : spd_100_120, 	'desc4' : '100 ~ 120(km)', 
								'value5' : spd_over_130, 	'desc5' : '130 ~ (km)' };
			columnDataArr.push(columnData);
		});
		
		var columnStore = Ext.create('Ext.data.JsonStore', {
			fields : ['month_str', 'value1', 'value2', 'value3', 'value4', 'value5', 'desc1', 'desc2', 'desc3', 'desc4', 'desc5'],
			autoDestroy : true,
			data : columnDataArr
		});
		
		var chart = this.buildColumnChart(columnStore, 0, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * 레이더 차트 리프레쉬 
	 */
	refreshRadarChart : function() {
		
		var store = this.sub('runstatus_grid').store;
		var spd_10 = 0;
		var spd_20 = 0;
		var spd_30 = 0;
		var spd_40 = 0;
		var spd_50 = 0;
		var spd_60 = 0;
		var spd_70 = 0;
		var spd_80 = 0;
		var spd_90 = 0;
		var spd_100 = 0;
		var spd_110 = 0;
		var spd_120 = 0;
		var spd_130 = 0;
		var spd_140 = 0;
		var spd_150 = 0;
		var spd_160 = 0;
		
		store.each(function(record) {
			spd_10 += record.get('spd_lt10');
			spd_20 += record.get('spd_lt20');
			spd_30 += record.get('spd_lt30');
			spd_40 += record.get('spd_lt40');
			spd_50 += record.get('spd_lt50');
			spd_60 += record.get('spd_lt60');
			spd_70 += record.get('spd_lt70');
			spd_80 += record.get('spd_lt80');
			spd_90 += record.get('spd_lt90');
			spd_100 += record.get('spd_lt100');
			spd_110 += record.get('spd_lt110');
			spd_120 += record.get('spd_lt120');
			spd_130 += record.get('spd_lt130');
			spd_140 += record.get('spd_lt140');
			spd_150 += record.get('spd_lt150');
			spd_160 += record.get('spd_lt160');
		});
		
		var radarStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'value'],
			autoDestroy : true,
			data : [ { 'name' : '0~10(km)', 		'value' : spd_10 },
	                 { 'name' : '10~20(km)', 		'value' : spd_20 },
	                 { 'name' : '20~30(km)', 		'value' : spd_30 },
	                 { 'name' : '30~40(km)', 		'value' : spd_40 },
	                 { 'name' : '40~50(km)', 		'value' : spd_50 },
	                 { 'name' : '50~60(km)', 		'value' : spd_60 },
	                 { 'name' : '60~70(km)', 		'value' : spd_70 },
	                 { 'name' : '70~80(km)', 		'value' : spd_80 },
	                 { 'name' : '80~90(km)', 		'value' : spd_90 },
	                 { 'name' : '90~100(km)', 		'value' : spd_100 },
	                 { 'name' : '100~110(km)', 		'value' : spd_110 },
	                 { 'name' : '110~120(km)', 		'value' : spd_120 },
	                 { 'name' : '120~130(km)', 		'value' : spd_130 },
	                 { 'name' : '130~140(km)', 		'value' : spd_140 },
	                 { 'name' : '140~150(km)', 		'value' : spd_150 },
	                 { 'name' : '150(km)~', 		'value' : spd_160 }]
		});
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildRadarChart(radarStore, width, height);
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * 차트 리사이즈 
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();		
		
		if(!height)
			height = chartContainer.getHeight();		
		
		var chartPanel = chartContainer.down('panel');		
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 레이더 차트 생성 
	 */
	buildRadarChart : function(store, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				insetPadding: 20,
				legend: {
	                position: 'right'
	            },
	            axes: [{
	                type: 'Radial',
	                position: 'radial',
	                label: {
	                    display: true
	                }
	            }],
	            series: [{
	                showInLegend: false,
	                showMarkers: true,
	                type: 'radar',
	                xField: 'name',
	                yField: 'value',
	                style: {
	                    opacity: 0.4
	                },
	                markerConfig: {
	                    radius: 3,
	                    size: 5
	                }
	            }]
			}]
		};
	},
	
	/**
	 * 컬럼 차트 생성 
	 */
	buildColumnChart : function(store, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 20,
				theme : 'Base:gradients',
				legend: { position: 'left' },
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: [ 'value1', 'value2', 'value3', 'value4', 'value5' ],
	                title: T('label.time') + '(' + T('label.minute_s') + ')',
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['month_str'],
	                grid : true,
	                title: T('label.month')
				}],			
				series : [{
					type : 'column',
					axis: 'left',
					xField: 'month_str',
	                yField: [ 'value1', 'value2', 'value3', 'value4', 'value5' ],
	                title : [ '0 ~ 30(km)', '40 ~ 60(km)', '70 ~ 90(km)', '100 ~ 120(km)', '130 ~ (km)' ],
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 100,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(item.value[0] + ' : ' + item.value[1]);
						}
					},
					highlight : {
						segment : { margin : 20 }
					},					
					label : {
						field : [ 'value1', 'value2', 'value3', 'value4', 'value5' ],
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '11px Arial'
					}
				}]
			}]
		}
	},
	
	/**
	 * 월별 리프레쉬 
	 */
	refreshByMonth : function(record) {
				
		var chartType = this.sub('combo_chart_type').getValue();		
		if(chartType == 'radar')
			this.refreshRadarChartByMonth(record);
		else
			this.refreshColumnChartByMonth(record);
	},
	
	/**
	 * 월별 레이더 차트 리프레쉬 
	 */
	refreshRadarChartByMonth : function(record) {
		
		var chartData = this.createChartData(record);
		var radarStore = Ext.create('Ext.data.JsonStore', {
			fields : [ 'name', 'value' ],
			autoDestroy : true,
			data :  chartData
		});
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildRadarByMonth(radarStore, width, height);
		chartPanel.add(chart);
		this.chartPanel = chart;
	},	
	
	/**
	 * 월별 컬럼 차트 리프레쉬 
	 */
	refreshColumnChartByMonth : function(record) {
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		var chartData = this.createChartData(record);
		
		var columnStore = Ext.create('Ext.data.JsonStore', {
			fields : [ 'name', 'value' ],
			autoDestroy : true,
			data : chartData
		});
				
		var chart = this.buildChartByMonth(columnStore, 0, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * 차트 데이터 생성 
	 */
	createChartData : function(record) {
		return [ { 'name' : '0~10(km)', 	'value' : record.get('spd_lt10') },
		         { 'name' : '10~20(km)', 	'value' : record.get('spd_lt20') },
		         { 'name' : '20~30(km)', 	'value' : record.get('spd_lt30') },
		         { 'name' : '30~40(km)', 	'value' : record.get('spd_lt40') },
		         { 'name' : '40~50(km)', 	'value' : record.get('spd_lt50') },
		         { 'name' : '50~60(km)', 	'value' : record.get('spd_lt60') },
		         { 'name' : '60~70(km)', 	'value' : record.get('spd_lt70') },
		         { 'name' : '70~80(km)', 	'value' : record.get('spd_lt80') },
		         { 'name' : '80~90(km)', 	'value' : record.get('spd_lt90') },
		         { 'name' : '90~100(km)', 	'value' : record.get('spd_lt100') },
		         { 'name' : '100~110(km)', 	'value' : record.get('spd_lt110') },
		         { 'name' : '110~120(km)', 	'value' : record.get('spd_lt120') },
		         { 'name' : '120~130(km)', 	'value' : record.get('spd_lt130') },
		         { 'name' : '130~140(km)', 	'value' : record.get('spd_lt140') },
		         { 'name' : '140~150(km)', 	'value' : record.get('spd_lt150') },
		         { 'name' : '150(km)~', 	'value' : record.get('spd_lt160') } ];
	},
	
	/**
	 * 월별 레이더 차트 생성 
	 */
	buildRadarByMonth : function(store, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				insetPadding: 20,
				legend: {
	                position: 'right'
	            },
	            axes: [{
	                type: 'Radial',
	                position: 'radial',
	                label: {
	                    display: true
	                }
	            }],
	            series: [{
	                showInLegend: false,
	                showMarkers: true,
	                type: 'radar',
	                xField: 'name',
	                yField: 'value',
	                style: {
	                    opacity: 0.4
	                },
	                markerConfig: {
	                    radius: 3,
	                    size: 5
	                }
	            }]
			}]
		};
	},	
	
	/**
	 * 월별 차트 생성 
	 */
	buildChartByMonth : function(store, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 20,
				theme : 'Base:gradients',
				legend: { position: 'left' },
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: [ 'value' ],
	                title: T('label.time') + '(' + T('label.minute_s') + ')',
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['name'],
	                title: T('label.speed_section') + '(km)'
				}],			
				series : [{
					type: 'column',
					axis: 'left',
					xField: 'name',
	                yField: [ 'value' ],
					showInLegend : false,
					tips : {
						trackMouse : true,
						width : 100,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(item.value[0] + '(km) : ' + item.value[1]);
						}
					},
					highlight : {
						segment : { margin : 20 }
					}
				}]
			}]
		}
	}	
});
Ext.define('GreenFleet.view.management.Driver', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_driver',

	title : T('title.driver'),
	
	entityUrl : 'driver',

	importUrl : 'driver/import',
	
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
		
		this.items = [
		    { html : "<div class='listTitle'>" + T('title.driver_list') + "</div>"}, 
		    { xtype : 'container',
		      flex : 1,
		      layout : {
					type : 'hbox',
					align : 'stretch'
		      },
		      items : [ this.zdriverlist, { 
		    	  		xtype : 'container',
						flex : 1,
						cls : 'borderRightGray',
						layout : {
							align : 'stretch',
							type : 'vbox'
						},
						items : [ this.ztabpanel ] } ]
		    }],

		this.callParent(arguments);

		/**
		 * Driver List에서 사용자가 운전자를 선택하는 경우 - 현재 선택된 탭의 정보를 리프레쉬 
		 */
		this.sub('driver_list').on('itemclick', function(grid, record) {			
			self.refresh(record.data.id, record.data.name);
		});
		
		/**
		 * Tab 선택이 변경될 때 - 해당 탭을 리프레쉬 
		 */
		this.sub('tabs').on('tabchange', function(tabPanel, newCard, oldCard, eOpts) {
			if(self.driver) {
				newCard.refresh(self.driver, self.driverName);
			}
		});		
		
		/**
		 * Driver Id 검색 조건 변경시 Driver 데이터 Local filtering
		 */
		this.sub('id_filter').on('change', function(field, value) {
			self.search(false);
		});

		/**
		 * Driver 이름 검색 조건 변경시 Driver 데이터 Local filtering 
		 */
		this.sub('name_filter').on('change', function(field, value) {
			self.search(false);
		});		
	},

	/**
	 * 운전자 조회 
	 */
	search : function(remote) {
		if(remote) {
			this.sub('driver_list').store.load();
			
		} else {
			this.sub('driver_list').store.clearFilter(true);			
			var idValue = this.sub('id_filter').getValue();
			var nameValue = this.sub('name_filter').getValue();
			
			if(idValue || nameValue) {
				this.sub('driver_list').store.filter([ {
					property : 'id',
					value : idValue
				}, {
					property : 'name',
					value : nameValue
				} ]);
			}			
		}
	},
	
	/**
	 * 선택된 탭의 driver 정보 리프레쉬   
	 */
	refresh : function(driverId, driverName) {
		this.driver = driverId;
		this.driverName = driverName;
		
		var tabs = this.sub('tabs');
		var activeTab = tabs.getActiveTab();
		if(activeTab.refresh && (typeof(activeTab.refresh) === 'function')) {
			activeTab.refresh(driverId, driverName);
		}
	},	
	
	/**
	 * 운전자 리스트 그리드 
	 */
	zdriverlist : {
		xtype : 'gridpanel',
		itemId : 'driver_list',
		store : 'DriverBriefStore',
		title : T('title.driver_list'),
		width : 280,
		autoScroll : true,
		
		columns : [ {
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
			text : T('label.id'),
			flex : 1
		}, {
			dataIndex : 'name',
			text : T('label.name'),
			flex : 1
		} ],

		tbar : [ T('label.id'),
		{
			xtype : 'textfield',
			name : 'id_filter',
			itemId : 'id_filter',
			width : 60
		}, T('label.name'),
		{
			xtype : 'textfield',
			name : 'name_filter',
			itemId : 'name_filter',
			width : 65
		}, ' ',
		{
			xtype : 'button',
			text : T('button.search'),
			handler : function(btn) {
				btn.up('management_driver').search(true);
			}
		} ]
	},
	
	ztabpanel : {
		itemId : 'tabs',
		xtype : 'tabpanel',
		flex : 1,
		items : [ {
			xtype : 'management_driver_detail'
		}, /*{
			xtype : 'management_driver_dashboard'
		}, */{
			xtype : 'management_driver_runstatus'
		}, {
			xtype : 'management_driver_speed'
		} ]
	}
});
Ext.define('GreenFleet.view.management.DriverDetail', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_driver_detail',

	title : T('title.driver_details'),

	layout : {
		align : 'stretch',
		type : 'vbox'
	},	
	
	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		this.add(this.driverForm);		
	},
	
	/**
	 * 운전자 상세 페이지 리프레쉬 
	 */	
	refresh : function(driverId, driverName) {
		// driverId 값이 없거나 이전에 선택한 driverId와 현재 선택된 driverId가 같다면 skip 
		if(!driverId || driverId == '' || driverId == this.driver)
			return;
		
		var self = this;
		this.driver = driverId;	
		
		Ext.Ajax.request({
			url : 'driver/find',
			method : 'GET',
			params : {
				id : driverId
			},
			success : function(response, opts) {
				var record = Ext.JSON.decode(response.responseText);
				var newRecord = {};
				newRecord.data = {};
				newRecord.data = record;
				self.sub('form').loadRecord(newRecord);
			},
			failure : function(response, opts) {
				Ext.Msg.alert(T('label.failure'), response.responseText);
			}
		});		
	},
	
	driverForm : {
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
		items : [ {
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
				fieldLabel : T('label.social_id')
			}, {
				name : 'phone_no_1',
				fieldLabel : T('label.phone_x', {x : 1})
			}, {
				name : 'phone_no_2',
				fieldLabel : T('label.phone_x', {x : 2})
			}, {
				name : 'total_distance',
				fieldLabel : T('label.total_distance')
			}, {
				name : 'total_run_time',
				fieldLabel : T('label.total_run_time')
			}, {
				name : 'avg_effcc',
				fieldLabel : T('label.avg_effcc')
			}, {
				name : 'eco_index',
				fieldLabel : T('label.eco_index')
			}, {
				name : 'eco_run_rate',
				fieldLabel : T('label.eco_run_rate')
			}, {
				xtype : 'filefield',
				name : 'image_file',
				fieldLabel : T('label.image_upload'),
				msgTarget : 'side',
				allowBlank : true,
				buttonText : T('button.file')
			}, {
				xtype : 'displayfield',
				name : 'image_clip',
				itemId : 'image_clip',
				hidden : true
			} ]
		} ],
		
		dockedItems : [ {
			xtype : 'entity_form_buttons',
			loader : {
				fn : function(callback) {
					var driverStore = Ext.getStore('DriverBriefStore');
					driverStore.load(callback);
				},
				scope : this
			}
		} ]
	}
});
Ext.define('GreenFleet.view.management.DriverRunStatus', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_driver_runstatus',

	title : T('title.driver_runstatus'),

	entityUrl : 'driver_run',
	
	importUrl : 'driver_run/import',

	afterImport : function() {
	},
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	chartXTitle : 'month',
	
	driver : '',
	
	timeView : 'monthly',
	
	chartPanel : null,	

	initComponent : function() {
		var self = this;
//		this.disabled = GreenFleet.checkDisabled(this.xtype);
		this.items = [ this.zrunstatus, this.zrunstatus_chart ];
		this.callParent(arguments);
		
		this.sub('runstatus_grid').on('itemclick', function(grid, record) {			
			if(record.data.time_view == "yearly") {
				self.searchSummary(record.data.driver, null, "monthly", record.data.year, null);
				
			} else if(record.data.time_view == "monthly") {
				self.searchSummary(record.data.driver, null, "daily", record.data.year, record.data.month);
			}
		});
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		/**
		 * combo_chart_type에 값을 기본값(column)을 설정
		 */
		this.sub('combo_chart_type').setValue('column');
		/**
		 * combo_chart에 값을 기본값(run_dist)을 설정
		 */
		this.sub('combo_chart').setValue('run_dist');
		/**
		 * combo_view에 값을 기본값(monthly_view)을 설정
		 */
		this.sub('combo_view').setValue('monthly');
		/**
		 * 검색버튼 추가
		 */
		this.down('#search').on('click', function() {
			self.searchSummary(null, null, null, null, null);
		});
	},
	
	/**
	 * grid title을 설정 
	 */
	setGridTitle : function(name) {
		var title = name ? T('title.runstatus_history') + ' (' + name + ')' : T('title.runstatus_history');
		this.sub('runstatus_panel').setTitle(title);
	},	
	
	/**
	 * 운전자 선택시 
	 */
	refresh : function(driverId, driverName) {
		// driverId 값이 없거나 이전에 선택한 driverId와 현재 선택된 driverId가 같다면 skip 
		if(!driverId || driverId == '' || driverId == this.driver)
			return;
		
		this.driver = driverId;
		this.searchSummary(driverId, driverName, null, null, null);
	},
	
	
	/**
	 * driver run summary 조회 
	 */
	searchSummary : function(driverId, driverName, timeView, year, month) {
		
		if(!driverId) {
			driverId = this.driver;
			
			if(!driverId)
				return;
		}
		
		if(!timeView) {
			timeView = this.sub('combo_view').getValue();
		}
		
		var runStatusStore = this.sub('runstatus_grid').store;
		var proxy = runStatusStore.getProxy();
		proxy.extraParams.driver = driverId;
		proxy.extraParams.time_view = timeView;
		
		if(timeView == "monthly") {
			this.chartXTitle = "month";
			if(year == null) {
				proxy.extraParams.from_year = this.sub('from_year').getValue();
				proxy.extraParams.to_year = this.sub('to_year').getValue();
				proxy.extraParams.from_month = this.sub('from_month').getValue();
				proxy.extraParams.to_month = this.sub('to_month').getValue();
			} else {
				proxy.extraParams.from_year = year;
				proxy.extraParams.to_year = year;
				proxy.extraParams.from_month = 1;
				proxy.extraParams.to_month = 12;
			}					
		} else if(timeView == "daily") {
			this.chartXTitle = "date";
			proxy.extraParams.year = year;
			proxy.extraParams.month = month;
			
		} else if(timeView == "yearly") {
			this.chartXTitle = "year";
		}
				
		runStatusStore.load({
			scope : this,
			callback : function() {
				if(driverName) {
					this.setGridTitle(driverName);
				}
				this.refreshChart();
			}
		});		
	},

	/**
	 * 운행이력 그리드 패널 
	 */
	zrunstatus : {
		xtype : 'panel',
		itemId : 'runstatus_panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_history'),
		flex : 1,
		autoScroll : true,
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		items : [{
			xtype : 'gridpanel',
			itemId : 'runstatus_grid',
			store : 'DriverRunStore',
			flex : 1,
			columns : [ {
				dataIndex : 'time_view',
				hidden : true
			}, {
				header : T('label.datetime'),
				dataIndex : 'month_str'		
			}, {
				header : T('label.run_dist') + '(km)',
				dataIndex : 'run_dist'
			}, {
				header : T('label.run_time') + T('label.parentheses_min'),
				dataIndex : 'run_time'
			}, {
				header : T('label.fuel_consumption') + '(l)',
				dataIndex : 'consmpt'
			}, {
				header : T('label.co2_emissions') + '(g/km)',
				dataIndex : 'co2_emss'
			}, {
				header : T('label.fuel_efficiency') + '(km/l)',
				dataIndex : 'effcc'
			}, {
				header : T('label.eco_index') + '(%)',
				dataIndex : 'eco_index'
			}, {
				header : T('label.eco_drv_time') + T('label.parentheses_min'),
				dataIndex : 'eco_drv_time'	
			}, {
				header : T('label.ovr_spd_time') + T('label.parentheses_min'),
				dataIndex : 'ovr_spd_time'
			}, {
				header : T('label.idle_time') + T('label.parentheses_min'),
				dataIndex : 'idle_time'
			}, {
				header : T('label.sud_accel_cnt'),
				dataIndex : 'sud_accel_cnt'
			}, {
				header : T('label.sud_brake_cnt'),
				dataIndex : 'sud_brake_cnt'
			}, {
				header : T('label.inc_cnt'),
				dataIndex : 'inc_cnt'
			} ]				
		}],
		tbar : [
	        T('label.view') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_view',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', { 
					fields : [ 'name', 'desc' ],
					data : [{ "name" : "monthly",	"desc" : T('label.monthly_view') },
					        { "name" : "yearly",	"desc" : T('label.yearly_view')  }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						if(currentValue != beforeValue) {
							var thisView = combo.up('management_driver_runstatus');
							thisView.searchSummary(null, null, null, null, null);
						}
					}
			    }
			},
			T('label.chart_type') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart_type',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'name', 'desc' ],			
					data : [{ "name" : "column", "desc" : T('label.column') },
					        { "name" : "line",	 "desc" : T('label.line')   }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_driver_runstatus');
						thisView.refreshChart();
					}
			    }
			},
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : (new Date().getMonth() + 1 == 12) ? new Date().getFullYear() : new Date().getFullYear() -1,
				store : 'YearStore',
				width : 60				
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : (new Date().getMonth() + 1 == 12) ? new Date().getMonth() - 10 : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
		    T('label.chart') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',				
				store :  Ext.create('Ext.data.Store', { 
					fields : [ 'name', 'desc', 'unit' ],					
					data : [{ "name" : "run_dist", 		"desc" : T('label.run_dist'),			"unit" : "(km)" },
					        { "name" : "run_time", 		"desc" : T('label.run_time'),			"unit" : T('label.parentheses_min') },
							{ "name" : "consmpt", 		"desc" : T('label.fuel_consumption'),	"unit" : "(l)" },
							{ "name" : "co2_emss", 		"desc" : T('label.co2_emissions'),		"unit" : "(g/km)" },
							{ "name" : "effcc", 		"desc" : T('label.fuel_efficiency'), 	"unit" : "(km/l)" },
							{ "name" : "eco_index", 	"desc" : T('label.eco_index'), 			"unit" : "(%)" },							
							{ "name" : "eco_drv_time", 	"desc" : T('label.eco_drv_time'), 		"unit" : T('label.parentheses_min') },
							{ "name" : "ovr_spd_time", 	"desc" : T('label.ovr_spd_time'), 		"unit" : T('label.parentheses_min') },
							{ "name" : "idle_time", 	"desc" : T('label.idle_time'), 			"unit" : T('label.parentheses_min') },							
							{ "name" : "sud_accel_cnt", "desc" : T('label.sud_accel_cnt'), 		"unit" : "" },
							{ "name" : "sud_brake_cnt", "desc" : T('label.sud_brake_cnt'), 		"unit" : "" },
							{ "name" : "inc_cnt", 		"desc" : T('label.inc_cnt'), 			"unit" : "" },							
							{ "name" : "driving_habit", "desc" : T('label.driving_habit'), 		"unit" : "" }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						combo.up('management_driver_runstatus').refreshChart();
					}
			    }
			},
			{
				text : T('button.search'),
				itemId : 'search'
			}
		]
	},

	/**
	 * 차트 패널 
	 */
	zrunstatus_chart : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_chart'),
		flex : 1,
		autoScroll : true,
		layout : {
			align : 'stretch',
			type : 'hbox'
		}
	},
	
	/**
	 * 차트 패널을 리사이즈 
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();		
		
		if(!height)
			height = chartContainer.getHeight();		
		
		var chartPanel = chartContainer.down('panel');		
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},	
	
	/**
	 * 차트를 리사이즈 
	 */
	refreshChart : function() {
		
		var chartValue = this.sub('combo_chart').getValue();
		
		if(chartValue == 'driving_habit') 
			this.refreshRadarChart();
		else
			this.refreshColumnChart();		
	},
	
	/**
	 * 컬럼 차트를 리프레쉬 
	 */
	refreshColumnChart : function() {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chartType = this.sub('combo_chart_type').getValue();
		var comboChart = this.sub('combo_chart');
		var yField = comboChart.getValue();
		var store = this.sub('runstatus_grid').store;
		var chartTypeArr = comboChart.store.data;
		var yTitle = '';
		var unit = '';
		
		for(var i = 0 ; i < chartTypeArr.length ; i++) {
			var chartTypeData = chartTypeArr.items[i].data;
			if(yField == chartTypeData.name) {
				yTitle = chartTypeData.desc;
				unit = chartTypeData.unit;
				break;
			}
		}
				
		var chart = this.buildChart(chartType, store, yField, yTitle, unit, 0, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * 레이더 차트를 리프레쉬 
	 */
	refreshRadarChart : function() {
		
		var store = this.sub('runstatus_grid').store;
		var totalRecordCnt = 0;
		var ecoIndex = 0;
		var overSpdCnt = 0;
		var sudAccelCnt = 0;
		var sudBrakeCnt = 0;
		var idleTime = 0;
		var ecoDrvTime = 0;
		var efficiency = 0;
		var ecoLevel = 0;
		
		store.each(function(record) {
			if(record.get('driver'))
				totalRecordCnt += 1;
			
			if(record.get('eco_index'))
				ecoIndex += record.get('eco_index')

			if(record.get('ovr_spd_time'))
				overSpdCnt += record.get('ovr_spd_time');
			
			if(record.get('sud_accel_cnt'))
				sudAccelCnt += record.get('sud_accel_cnt');
			
			if(record.get('sud_brake_cnt'))
				sudBrakeCnt += record.get('sud_brake_cnt');
			
			if(record.get('idle_time'))
				idleTime += record.get('idle_time');
			
			if(record.get('eco_drv_time'))
				ecoDrvTime += record.get('eco_drv_time');
			
			if(record.get('effcc'))
				efficiency += record.get('effcc');			
		});
		
		ecoIndex = ecoIndex / totalRecordCnt;
		overSpdCnt = overSpdCnt / totalRecordCnt;
		sudAccelCnt = sudAccelCnt / totalRecordCnt;
		sudBrakeCnt = sudBrakeCnt / totalRecordCnt;
		idleTime = idleTime /totalRecordCnt;
		ecoDrvTime = ecoDrvTime / totalRecordCnt;
		efficiency = efficiency / totalRecordCnt;
		ecoLevel = Math.floor(ecoIndex / 20);
		
		var radarData = [
		    { 'name' : T('label.eco_index'), 		'value' : ecoIndex },
		    { 'name' : T('label.ovr_spd_time'), 	'value' : overSpdCnt },		    
		    { 'name' : T('label.sud_accel_cnt'), 	'value' : sudAccelCnt },
		    { 'name' : T('label.sud_brake_cnt'),	'value' : sudBrakeCnt },
		    { 'name' : T('label.idle_time'), 		'value' : idleTime },
		    { 'name' : T('label.eco_drv_time'), 	'value' : ecoDrvTime },		    
		    { 'name' : T('label.fuel_efficiency'), 	'value' : efficiency }		    
		];
		
		var guageData = [
		    { 'name' : T('label.eco_index'), 'value' : ecoLevel }
		];
		
		var radarStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'value'],
			autoDestroy : true,
			data : radarData
		});
		
		var guageStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'value'],
			autoDestroy : true,
			data : guageData
		});		
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart1 = this.buildRadarChart(radarStore, width, height);
		var chart2 = this.buildGuageChart(guageStore, width, height);
		chartPanel.add(chart1);
		chartPanel.add(chart2);
		this.chartPanel = chart1;
	},
	
	/**
	 * 일반 컬럼, 라인 차트 
	 */
	buildChart : function(chartType, store, yField, yTitle, unit, minValue, width, height) {
		
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: [yField],
	                label: { renderer: Ext.util.Format.numberRenderer('0,0') },
	                title: yTitle,
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['month_str'],
	                grid : true,
	                title: T('label.' + this.chartXTitle)
				}],
				series : [{
					type : chartType,
					axis: 'left',
					xField: 'month_str',
	                yField: yField,
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get('month_str') + ' : ' + storeItem.get(yField) + unit);
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : yField,
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}]
			}]
		}
	},
	
	/**
	 * 레이더 차트 
	 */
	buildRadarChart : function(store, width, height) {
		width = width / 2;
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				insetPadding: 20,
				legend: {
	                position: 'bottom'
	            },
	            axes: [{
	                type: 'Radial',
	                position: 'radial',
	                label: {
	                    display: true
	                }
	            }],
	            series: [{
	                showInLegend: false,
	                showMarkers: true,
	                type: 'radar',
	                xField: 'name',
	                yField: 'value',
	                style: {
	                    opacity: 0.4
	                },
	                markerConfig: {
	                    radius: 3,
	                    size: 5
	                },
	                tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem) { 
							return this.setTitle(storeItem.data.name + ':' + Ext.util.Format.number(storeItem.data.value, '0.00')); 
						}
					}	                
	            }]
			}]
		};
	},	
	
	/**
	 * 게이지 차트 
	 */
	buildGuageChart : function(store, width, height) {
		width = width / 2;
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate: true,
				store : store,
				width : width - 25,
				height : height - 50,
				insetPadding: 20,
				legend: {
	                position: 'bottom'
	            },
	            axes: [{
	                type: 'gauge',
	                position: 'gauge',
	                minimum: 0,
	                maximum: 5,
	                steps: 5,
	                margin: -5,
	                label : {
	                	display : 'rotate',
	                	color : '#000',
	                	field : 'name',
	                	renderer : function(v) { return T('label.grade') + ' ' + v; }
	                }
	            }],
	            series: [{
	            	type: 'gauge',
	                field: 'value',
	                showInLegend: true,
	                highlight: true,
	                donut: 40,
	                colorSet: ['#3AA8CB', '#fff']
	            }]
			}]
		};		
	}
});
Ext.define('GreenFleet.view.management.DriverSpeedSection', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_driver_speed',

	title : T('title.driver_speed_section'),

	entityUrl : 'driver_speed',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	timeView : 'monthly',
	
	chartPanel : null,

	initComponent : function() {
		var self = this;
		this.disabled = GreenFleet.checkDisabled(this.xtype);
		this.items = [ this.zrunstatus, this.zrunstatus_chart ];
		this.callParent(arguments);

		this.sub('runstatus_grid').on('itemclick', function(grid, record) {
			if(record.data.time_view == "yearly") {
				self.searchSummary(record.data.driver, null, "monthly", record.data.year, null);
				
			} else if(record.data.time_view == "monthly") {
				self.searchSummary(record.data.driver, null, "daily", record.data.year, record.data.month);
				
			} else if(record.data.time_view == "daily") {
				self.setChartTitle(record.data.month_str);
				self.refreshByMonth(record);				
			}			
		});
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		/**
		 * combo_chart_type에 값을 기본값(column)을 설정
		 */
		this.sub('combo_chart_type').setValue('column');
		/**
		 * combo_view에 값을 기본값(monthly_view)을 설정
		 */
		this.sub('combo_view').setValue('monthly');
	},
	
	/**
	 * 운행이력 그리드 타이틀 
	 */	
	setGridTitle : function(name) {
		var title = name ? T('title.runstatus_history') + ' (' + name + ') ' : T('title.runstatus_history');
		this.sub('runstatus_grid').setTitle(title);
	},
	
	/**
	 * 차트 그리드 타이틀 
	 */	
	setChartTitle : function(month) {
		var title = month ? T('label.speed_section') + ' (' + month + ') ' + T('label.chart') : T('label.speed_section') + T('label.chart');
		this.sub('chart_panel').setTitle(title);
	},
	
	/**
	 * 차량 선택시 
	 */
	refresh : function(driverId, driverName) {
		// driverId 값이 없거나 이전에 선택한 driverId와 현재 선택된 driverId가 같다면 skip 
		if(!driverId || driverId == '' || driverId == this.driver)
			return;
		
		this.driver = driverId;		
		this.searchSummary(driverId, driverName, null, null, null);
	},		
		
	/**
	 * driver speed summary 조회 
	 */
	searchSummary : function(driverId, driverName, timeView, year, month) {
		
		if(!driverId) {
			driverId = this.driver;
			
			if(!driverId)
				return;
		}
		
		if(!timeView) {
			timeView = this.sub('combo_view').getValue();
		}
		
		var runStatusStore = this.sub('runstatus_grid').store;
		var proxy = runStatusStore.getProxy();
		proxy.extraParams.driver = driverId;
		proxy.extraParams.time_view = timeView;
		
		if(timeView == "monthly") {
			if(year == null) {
				proxy.extraParams.from_year = this.sub('from_year').getValue();
				proxy.extraParams.to_year = this.sub('to_year').getValue();
				proxy.extraParams.from_month = this.sub('from_month').getValue();
				proxy.extraParams.to_month = this.sub('to_month').getValue();
			} else {
				proxy.extraParams.from_year = year;
				proxy.extraParams.to_year = year;
				proxy.extraParams.from_month = 1;
				proxy.extraParams.to_month = 12;
			}					
		} else if(timeView == "daily") {
			proxy.extraParams.year = year;
			proxy.extraParams.month = month;			
		} 
				
		runStatusStore.load({
			scope : this,
			callback : function() {
				if(driverName) {
					this.setGridTitle(driverName);
				}
				
				if(year && month) {
					this.setChartTitle(year + '-' + month);
				}
				
				this.refreshChart();
			}
		});
	},
	
	/**
	 * 운행이력 그리드 패널 
	 */	
	zrunstatus : {
		xtype : 'gridpanel',
		itemId : 'runstatus_grid',
		store : 'DriverSpeedStore',
		cls : 'hIndexbar',
		title : T('title.runstatus_history'),
		autoScroll : true,
		flex : 1,
		columns : [ {
			dataIndex : 'month_str',
			text : T('label.month')
		}, {
			header : T('label.lessthan_km_min', {km : 10}),
			dataIndex : 'spd_lt10'
		}, {
			header : T('label.lessthan_km_min', {km : 20}),
			dataIndex : 'spd_lt20'
		}, {
			header : T('label.lessthan_km_min', {km : 30}),
			dataIndex : 'spd_lt30'
		}, {
			header : T('label.lessthan_km_min', {km : 40}),
			dataIndex : 'spd_lt40'
		}, {
			header : T('label.lessthan_km_min', {km : 50}),
			dataIndex : 'spd_lt50'
		}, {
			header : T('label.lessthan_km_min', {km : 60}),
			dataIndex : 'spd_lt60'
		}, {
			header : T('label.lessthan_km_min', {km : 70}),
			dataIndex : 'spd_lt70'
		}, {
			header : T('label.lessthan_km_min', {km : 80}),
			dataIndex : 'spd_lt80'
		}, {
			header : T('label.lessthan_km_min', {km : 90}),
			dataIndex : 'spd_lt90'
		}, {
			header : T('label.lessthan_km_min', {km : 100}),
			dataIndex : 'spd_lt100'
		}, {
			header : T('label.lessthan_km_min', {km : 110}),
			dataIndex : 'spd_lt110'
		}, {
			header : T('label.lessthan_km_min', {km : 120}),
			dataIndex : 'spd_lt120'
		}, {
			header : T('label.lessthan_km_min', {km : 130}),
			dataIndex : 'spd_lt130'
		}, {
			header : T('label.lessthan_km_min', {km : 140}),
			dataIndex : 'spd_lt140'
		}, {
			header : T('label.lessthan_km_min', {km : 150}),
			dataIndex : 'spd_lt150'
		}, {
			header : T('label.lessthan_km_min', {km : 160}),
			dataIndex : 'spd_lt160'
		} ],
	
		tbar : [
	        T('label.view') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_view',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', { 
					fields : [ 'name', 'desc' ],
					data : [{ "name" : "monthly",	"desc" : T('label.monthly_view') },
					        { "name" : "yearly",	"desc" : T('label.yearly_view')  }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_driver_speed');
						thisView.searchSummary(null, null, null, null, null);
					}
			    }
			},
			T('label.chart_type') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart_type',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'name', 'desc' ],			
					data : [{ "name" : "column", "desc" : T('label.column') },
					        { "name" : "radar",	 "desc" : T('label.radar')  }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_driver_speed');
						thisView.refreshChart();
					}
			    }
			},
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60				
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			}
		]
	},

	/**
	 * 차트 패널 
	 */	
	zrunstatus_chart : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('title.speed_section_chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 차트 리프레쉬 
	 */	
	refreshChart : function() {
				
		var chartType = this.sub('combo_chart_type').getValue();
		if(chartType == 'radar') 
			this.refreshRadarChart();
		else
			this.refreshColumnChart();
	},
	
	/**
	 * 컬럼 차트 리프레쉬 
	 */	
	refreshColumnChart : function() {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var columnDataArr = [];
		var store = this.sub('runstatus_grid').store;
		store.each(function(record) {
			// speed 0 ~ 30
			var spd_30 = (record.get('spd_lt10') + record.get('spd_lt20') + record.get('spd_lt30'));
			// speed 40 ~ 60
			var spd_40_60 = (record.get('spd_lt40') + record.get('spd_lt50') + record.get('spd_lt60'));
			// speed 50 ~ 80
			var spd_70_90 = (record.get('spd_lt70') + record.get('spd_lt80') + record.get('spd_lt90'));			
			// speed 90 ~ 120
			var spd_100_120 = (record.get('spd_lt90') + record.get('spd_lt100') + record.get('spd_lt110') + record.get('spd_lt120'));			
			// speed 130 ~
			var spd_over_130 = (record.get('spd_lt130') + record.get('spd_lt140') + record.get('spd_lt150') + record.get('spd_lt160'));
			
			var columnData = { 	'month_str' : record.get('month_str'), 
								'value1' : spd_30, 			'desc1' : '0 ~ 30(km)', 
								'value2' : spd_40_60, 		'desc2' : '40 ~ 60(km)',
								'value3' : spd_70_90, 		'desc3' : '70 ~ 90(km)',
								'value4' : spd_100_120, 	'desc4' : '100 ~ 120(km)', 
								'value5' : spd_over_130, 	'desc5' : '130 ~ (km)' };
			columnDataArr.push(columnData);
		});
		
		var columnStore = Ext.create('Ext.data.JsonStore', {
			fields : ['month_str', 'value1', 'value2', 'value3', 'value4', 'value5', 'desc1', 'desc2', 'desc3', 'desc4', 'desc5'],
			autoDestroy : true,
			data : columnDataArr
		});
		
		var chart = this.buildColumnChart(columnStore, 0, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * 레이더 차트 리프레쉬 
	 */	
	refreshRadarChart : function() {
		
		var store = this.sub('runstatus_grid').store;
		var spd_10 = 0;
		var spd_20 = 0;
		var spd_30 = 0;
		var spd_40 = 0;
		var spd_50 = 0;
		var spd_60 = 0;
		var spd_70 = 0;
		var spd_80 = 0;
		var spd_90 = 0;
		var spd_100 = 0;
		var spd_110 = 0;
		var spd_120 = 0;
		var spd_130 = 0;
		var spd_140 = 0;
		var spd_150 = 0;
		var spd_160 = 0;
		
		store.each(function(record) {
			spd_10 += record.get('spd_lt10');
			spd_20 += record.get('spd_lt20');
			spd_30 += record.get('spd_lt30');
			spd_40 += record.get('spd_lt40');
			spd_50 += record.get('spd_lt50');
			spd_60 += record.get('spd_lt60');
			spd_70 += record.get('spd_lt70');
			spd_80 += record.get('spd_lt80');
			spd_90 += record.get('spd_lt90');
			spd_100 += record.get('spd_lt100');
			spd_110 += record.get('spd_lt110');
			spd_120 += record.get('spd_lt120');
			spd_130 += record.get('spd_lt130');
			spd_140 += record.get('spd_lt140');
			spd_150 += record.get('spd_lt150');
			spd_160 += record.get('spd_lt160');
		});
		
		var radarStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'value'],
			autoDestroy : true,
			data : [ { 'name' : '0~10(km)', 		'value' : spd_10 },
	                 { 'name' : '10~20(km)', 		'value' : spd_20 },
	                 { 'name' : '20~30(km)', 		'value' : spd_30 },
	                 { 'name' : '30~40(km)', 		'value' : spd_40 },
	                 { 'name' : '40~50(km)', 		'value' : spd_50 },
	                 { 'name' : '50~60(km)', 		'value' : spd_60 },
	                 { 'name' : '60~70(km)', 		'value' : spd_70 },
	                 { 'name' : '70~80(km)', 		'value' : spd_80 },
	                 { 'name' : '80~90(km)', 		'value' : spd_90 },
	                 { 'name' : '90~100(km)', 		'value' : spd_100 },
	                 { 'name' : '100~110(km)', 		'value' : spd_110 },
	                 { 'name' : '110~120(km)', 		'value' : spd_120 },
	                 { 'name' : '120~130(km)', 		'value' : spd_130 },
	                 { 'name' : '130~140(km)', 		'value' : spd_140 },
	                 { 'name' : '140~150(km)', 		'value' : spd_150 },
	                 { 'name' : '150(km)~', 		'value' : spd_160 }]
		});
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildRadarChart(radarStore, width, height);
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * 차트 리사이즈 
	 */	
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();		
		
		if(!height)
			height = chartContainer.getHeight();		
		
		var chartPanel = chartContainer.down('panel');		
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 레이더 차트 생성 
	 */	
	buildRadarChart : function(store, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				insetPadding: 20,
				legend: {
	                position: 'right'
	            },
	            axes: [{
	                type: 'Radial',
	                position: 'radial',
	                label: {
	                    display: true
	                }
	            }],
	            series: [{
	                showInLegend: false,
	                showMarkers: true,
	                type: 'radar',
	                xField: 'name',
	                yField: 'value',
	                style: {
	                    opacity: 0.4
	                },
	                markerConfig: {
	                    radius: 3,
	                    size: 5
	                }
	            }]
			}]
		};
	},
	
	/**
	 * 컬럼 차트 생성 
	 */	
	buildColumnChart : function(store, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 20,
				theme : 'Base:gradients',
				legend: { position: 'left' },
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: [ 'value1', 'value2', 'value3', 'value4', 'value5' ],
	                title: T('label.time') + '(' + T('label.minute_s') + ')',
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['month_str'],
	                grid : true,
	                title: T('label.month')
				}],			
				series : [{
					type : 'column',
					axis: 'left',
					xField: 'month_str',
	                yField: [ 'value1', 'value2', 'value3', 'value4', 'value5' ],
	                title : [ '0 ~ 30(km)', '40 ~ 60(km)', '70 ~ 90(km)', '100 ~ 120(km)', '130 ~ (km)' ],
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 100,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(item.value[0] + ' : ' + item.value[1]);
						}
					},
					highlight : {
						segment : { margin : 20 }
					},					
					label : {
						field : [ 'value1', 'value2', 'value3', 'value4', 'value5' ],
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '11px Arial'
					}
				}]
			}]
		}
	},
	
	/**
	 * 월별 리프레쉬 
	 */	
	refreshByMonth : function(record) {
				
		var chartType = this.sub('combo_chart_type').getValue();		
		if(chartType == 'radar')
			this.refreshRadarChartByMonth(record);
		else
			this.refreshColumnChartByMonth(record);
	},
	
	/**
	 * 월별 레이더 차트 리프레쉬 
	 */	
	refreshRadarChartByMonth : function(record) {
		
		var chartData = this.createChartData(record);
		var radarStore = Ext.create('Ext.data.JsonStore', {
			fields : [ 'name', 'value' ],
			autoDestroy : true,
			data :  chartData
		});
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildRadarByMonth(radarStore, width, height);
		chartPanel.add(chart);
		this.chartPanel = chart;
	},	
	
	/**
	 * 월별 컬럼 차트 리프레쉬 
	 */	
	refreshColumnChartByMonth : function(record) {
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		var chartData = this.createChartData(record);
		
		var columnStore = Ext.create('Ext.data.JsonStore', {
			fields : [ 'name', 'value' ],
			autoDestroy : true,
			data : chartData
		});
				
		var chart = this.buildChartByMonth(columnStore, 0, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * 차트 데이터 생성 
	 */	
	createChartData : function(record) {
		return [ { 'name' : '0~10(km)', 		'value' : record.get('spd_lt10') },
		         { 'name' : '10~20(km)', 		'value' : record.get('spd_lt20') },
		         { 'name' : '20~30(km)', 		'value' : record.get('spd_lt30') },
		         { 'name' : '30~40(km)', 		'value' : record.get('spd_lt40') },
		         { 'name' : '40~50(km)', 		'value' : record.get('spd_lt50') },
		         { 'name' : '50~60(km)', 		'value' : record.get('spd_lt60') },
		         { 'name' : '60~70(km)', 		'value' : record.get('spd_lt70') },
		         { 'name' : '70~80(km)', 		'value' : record.get('spd_lt80') },
		         { 'name' : '80~90(km)', 		'value' : record.get('spd_lt90') },
		         { 'name' : '90~100(km)', 		'value' : record.get('spd_lt100') },
		         { 'name' : '100~110(km)', 		'value' : record.get('spd_lt110') },
		         { 'name' : '110~120(km)', 		'value' : record.get('spd_lt120') },
		         { 'name' : '120~130(km)', 		'value' : record.get('spd_lt130') },
		         { 'name' : '130~140(km)', 		'value' : record.get('spd_lt140') },
		         { 'name' : '140~150(km)', 		'value' : record.get('spd_lt150') },
		         { 'name' : '150(km)~', 		'value' : record.get('spd_lt160') }];
	},
	
	/**
	 * 월별 레이더 차트 생성 
	 */	
	buildRadarByMonth : function(store, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				insetPadding: 20,
				legend: {
	                position: 'right'
	            },
	            axes: [{
	                type: 'Radial',
	                position: 'radial',
	                label: {
	                    display: true
	                }
	            }],
	            series: [{
	                showInLegend: false,
	                showMarkers: true,
	                type: 'radar',
	                xField: 'name',
	                yField: 'value',
	                style: {
	                    opacity: 0.4
	                },
	                markerConfig: {
	                    radius: 3,
	                    size: 5
	                }
	            }]
			}]
		};
	},	
	
	/**
	 * 월별 차트 생성 
	 */	
	buildChartByMonth : function(store, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 20,
				theme : 'Base:gradients',
				legend: { position: 'left' },
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: [ 'value' ],
	                title: T('label.time') + '(' + T('label.minute_s') + ')',
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['name'],
	                grid : true,
	                title: T('label.speed_section') + '(km)'
				}],			
				series : [{
					type: 'column',
					axis: 'left',
					xField: 'name',
	                yField: [ 'value' ],
					showInLegend : false,
					tips : {
						trackMouse : true,
						width : 100,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(item.value[0] + '(km) : ' + item.value[1]);
						}
					},
					highlight : {
						segment : { margin : 20 }
					}
				}]
			}]
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
				dataIndex : 'vehicle_id',
				text : T('label.vehicle'),
				type : 'string'
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver'),
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
				layout : 'fit',
				cls : 'noImage paddingLeft10',
				items : [ {
					xtype : 'image',
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
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
			self.search();
		});

		this.sub('datetime_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('datetime_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search();
		});

	},

	search : function(callback) {
		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle_id',
				value : this.sub('vehicle_filter').getSubmitValue()
			}, {
				property : 'datetime',
				value : this.sub('datetime_filter').getSubmitValue()
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
				dataIndex : 'id',
				text : T('label.id'),
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'vehicle_id',
				text : T('label.vehicle'),
				type : 'string'
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver'),
				type : 'string'
			}, {
				dataIndex : 'start_date',
				text : T('label.from_date'),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'end_date',
				text : T('label.to_date'),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
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
				name : 'datetime_filter',
				itemId : 'datetime_filter',
				hideLabel : true,
				format : 'Y-m-d',
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
			title : T('title.reservation_details'),
			autoScroll : true,
			flex : 1,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'id',
				fieldLabel : T('label.id'),
				hidden : true
			}, {
				xtype : 'datefield',
				name : 'start_date',
				fieldLabel : T('label.from_date'),
				format : F('date')
			}, {
				xtype : 'datefield',
				name : 'end_date',
				fieldLabel : T('label.to_date'),
				format : F('date')
			}, {
				xtype : 'codecombo',
				name : 'vehicle_type',
				group : 'V-Type1',
				fieldLabel : T('label.vehicle_type')
//				name : 'vehicle_type',
//				fieldLabel : T('label.x_type', {x : T('label.vehicle')})
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
Ext.define('GreenFleet.view.management.Schedule', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_schedule',

	title : T('titla.schedule'),

	entityUrl : 'task',

	importUrl : 'task/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : "<div class='listTitle'>" + T('title.schedule') + "</div>"
	},

	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		var calendarPanel = this.buildCalendar(self);
		this.add(calendarPanel);
	},
	
	buildCalendar : function(main) {
		var calendarStore = Ext.getStore('CalendarStore');
		var eventStore = Ext.getStore('EventStore');
		eventStore.autoSync = true;
		eventStore.load();
		var calendar = Ext.create('Extensible.calendar.CalendarPanel', {
			calendarStore : calendarStore,
	        eventStore: eventStore,
	        flex : 1
	        /*listeners: {
	            'eventadd': {
	                fn: function(cp, rec) {	                	
	                	//cp.store.load();
	                	//GreenFleet.msg(T('label.success'), "Start : " + cp.viewStart.toString());
	                	//GreenFleet.msg(T('label.success'), "End : " + cp.viewEnd.toString());
	                },
	                scope: this
	            },
	            'eventupdate': {
	                fn: function(cp, rec) {
	                	//cp.store.load();	                	
	                },
	                scope: this
	            },
	            'eventdelete': {
	                fn: function(cp, rec) {
	                	//cp.store.load();
	                },
	                scope: this
	            }
	        }*/	        
	    });		
		return calendar;
	}
});
Ext.define('GreenFleet.view.dashboard.Reports', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_report',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	
	title : T('menu.dashboard'),

	initComponent : function() {
		//this.disabled = GreenFleet.checkDisabled(this.xtype);
		//if(this.disabled) {
		//	alert('You have no authority to access this menu!');
		//}
		
		var self = this;		
		this.items = [{
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [
			    this.reportlist(), 
			    {
			    	itemId : 'report_view',
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : {
						align : 'stretch',
						type : 'vbox'
					},
					items : [ this.dashboard_body() ]
				} 
			]
	    }],

		this.callParent();
		
		this.sub('report_list').on('itemclick', function(grid, record) {
			self.sub('report_view').removeAll();
			self.sub('report_view').add(self.dashboard_body(record.get('id')));
		});
	},
	
	dashboard_body : function(dashboard_id) {
		
		if(!dashboard_id)
			dashboard_id = "vehicle_summary";
		
		return {
			xtype : 'dashboard_' + dashboard_id,
			itemId : 'dashboard_panel',
			cls : 'hIndexbar',
			title : T('report.report'),
			flex : 1,
			autoScroll : true
		};
	},
	
	zvehiclelist : {
		xtype : 'gridpanel',
		itemId : 'driver_list',
		store : 'DriverStore',
		title : T('title.driver_list'),
		width : 260,
		autoScroll : true,
		
		columns : [ {
			dataIndex : 'id',
			text : T('label.id'),
			flex : 1
		}, {
			dataIndex : 'name',
			text : T('label.name'),
			flex : 1
		} ]
	},	
	
	reportlist : function() {
		return {
			xtype : 'gridpanel',
			itemId : 'report_list',
			store : Ext.create('Ext.data.Store', {
				fields : [ 'id', 'name' ],		        
				data : [{ "id" : "vehicle_summary", 	"name" : T('report.vehicle_summary') },
				        { "id" : "driver_summary", 		"name" : T('report.driver_summary') },				        
				        { "id" : "vehicle_health", 		"name" : T('report.vehicle_health') },
				        { "id" : "consumable_health", 	"name" : T('report.consumable_health') },				        
				        { "id" : "mttr", 				"name" : T('report.mttr') },
				        { "id" : "mtbf", 				"name" : T('report.mtbf') },
				        { "id" : "driving_trend", 		"name" : T('report.driving_trend') },
				        { "id" : "maint_trend", 		"name" : T('report.maint_trend') },
				        { "id" : "effcc_trend", 		"name" : T('report.effcc_trend') },
				        { "id" : "eco_driving_trend", 	"name" : T('report.eco_driving_trend') },
				        { "id" : "effcc_consmpt", 		"name" : T('report.effcc_consmpt') },
				        { "id" : "habit_ecoindex", 		"name" : T('report.habit_ecoindex') },
				        { "id" : "co2emss_ecoindex", 	"name" : T('report.co2emss_ecoindex') },
				        { "id" : "consmpt_ecoindex",	"name" : T('report.consmpt_ecoindex') }]
			}),
			title : T('title.report_list'),
			width : 180,
			autoScroll : true,			
			columns : [ {
				dataIndex : 'name',
				text : T('label.name'),
				flex : 1
			} ]
		}
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
		});
		
		var row1 = this.createRow(content);
		var row2 = this.createRow(content);		
		var dashboardStore = Ext.getStore('DashboardVehicleStore');
		
		dashboardStore.load({
			scope : this,
			callback: function(records, operation, success) {
				var healthRecord = this.findRecord(records, "health");
				var ageRecord = this.findRecord(records, "age");
				var mileageRecord = this.findRecord(records, "mileage");
				var runtimeRecord = this.findRecord(records, "runtime");
				
				this.addHealthChartToRow(row1, T('title.vehicle_health'), healthRecord);
				this.addChartToRow(row1, T('title.running_distance') + '(km)', mileageRecord);
				this.addChartToRow(row2, T('title.vehicle_age') + T('label.parentheses_year'), ageRecord);
				this.addChartToRow(row2, T('title.vehicle_runtime') + T('label.parentheses_hour'), runtimeRecord);
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
				
				insetPadding : 20,
				theme : 'Base:gradients',
				
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: ['value'],
	                label: {
	                    renderer: Ext.util.Format.numberRenderer('0,0')
	                },
	                //title: '',
	                grid: true,
	                minimum: 0
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['desc'],
	                //title: ''
	            }],
	            
				series : [ {
					type: 'column',
	                axis: 'left',
	                highlight: true,
	                xField: 'name',
	                yField: 'value',
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
					label: {
		                  display: 'insideEnd',
		                  'text-anchor': 'middle',
		                    field: 'value',
		                    renderer: Ext.util.Format.numberRenderer('0'),
		                    //orientation: 'vertical',
		                    color: '#333'
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
Ext.define('GreenFleet.view.dashboard.VehicleRunningSummary', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_vehicle_summary',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.runtime_by_vehicles') + T('label.parentheses_min'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'vehicle', 'year', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'sum' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.vehicle'),
	            dataIndex: 'vehicle',
	            width : 80,
				summaryType: 'count',
		        summaryRenderer: function(value) {
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : T('label.sum'),
				dataIndex : 'sum',
				width : 100,
				summaryType: 'sum',
		        summaryRenderer: function(value) {
		        	value = Ext.util.Format.number(value, '0.00');
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
	        }]
		}],

		tbar : [
			T('label.chart_type') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart_type',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'name', 'desc' ],			
					data : [{ "name" : "by_vehicles", "desc" : T('report.by_vehicles') },
					        { "name" : "by_years",	  "desc" : T('report.by_years') }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_vehicle_summary');
						thisView.refresh();
					}
			    }
			},		        
			T('title.vehicle_group'),
			{
				xtype : 'combo',
				itemId : 'combo_vehicle_group',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'id',
				store : 'VehicleGroupStore',
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_vehicle_summary');
						thisView.refresh();						
					}
			    }				
			},
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60				
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},			
		    T('label.chart') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',				
				store :  Ext.create('Ext.data.Store', { 
					fields : [ 'name', 'type', 'desc', 'unit' ], 
					data : [{ "name" : "run_time", 		"type": "int", 		"desc" : T('report.runtime_by_vehicles'), 		"unit" : T('label.parentheses_min') },
					        { "name" : "run_dist", 		"type": "float", 	"desc" : T('report.rundist_by_vehicles'), 		"unit" : "(km)" },					        
							{ "name" : "effcc", 		"type": "float",	"desc" : T('report.efficiency_by_vehicles'), 	"unit" : "(km/l)" },
							{ "name" : "consmpt", 		"type": "float",	"desc" : T('report.consumption_by_vehicles'), 	"unit" : "(l)" },
							{ "name" : "co2_emss", 		"type": "float",	"desc" : T('report.co2_emissions_by_vehicles'),	"unit" : "(g/km)" },
							{ "name" : "eco_index", 	"type": "int",		"desc" : T('report.eco_index_by_vehicles'), 	"unit" : "(%)" },
							{ "name" : "eco_drv_time", 	"type": "int",		"desc" : T('report.eco_drv_time_by_vehicles'), 	"unit" : T('label.parentheses_min') },
							{ "name" : "idle_time", 	"type": "int",		"desc" : T('report.idle_time_by_vehicles'), 	"unit" : T('label.parentheses_min') },
							{ "name" : "ovr_spd_time", 	"type": "int",		"desc" : T('report.ovr_spd_time_by_vehicles'), 	"unit" : T('label.parentheses_min') },
							{ "name" : "mnt_time", 		"type": "int",		"desc" : T('report.mnt_time_by_vehicles'), 		"unit" : T('label.parentheses_min') },
							{ "name" : "sud_accel_cnt", "type": "int",		"desc" : T('report.sud_accel_cnt_by_vehicles'), "unit" : "" },
							{ "name" : "sud_brake_cnt", "type": "int",		"desc" : T('report.sud_brake_cnt_by_vehicles'), "unit" : "" },
							{ "name" : "oos_cnt", 		"type": "int",		"desc" : T('report.oos_cnt_by_vehicles'), 		"unit" : "" },
							{ "name" : "mnt_cnt", 		"type": "int",		"desc" : T('report.mnt_cnt_by_vehicles'), 		"unit" : "" },
							{ "name" : "rate_of_oper", 	"type": "float",	"desc" : T('report.oprate_by_vehicles'), 		"unit" : "(%)" }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_vehicle_summary');
						thisView.refresh();
					}
			    }
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_vehicle_summary');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 차트 정보
	 */
	getChartInfo : function() {
		
		var comboChart = this.sub('combo_chart').getValue();
		if(!comboChart) {
			comboChart = 'run_time';
		}
		
		var chartInfo = null;
		var chartTypeArr = this.sub('combo_chart').store.data;
		
		for(var i = 0 ; i < chartTypeArr.length ; i++) {
			var chartTypeData = chartTypeArr.items[i].data;
			if(comboChart == chartTypeData.name) {
				chartInfo = chartTypeData;
				break;
			}
		}
		
		return chartInfo;
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var dataGrid = this.sub('data_grid');
		var vehicleGroup = this.sub('combo_vehicle_group');
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		var chartInfo = this.getChartInfo();		
		this.sub('datagrid_panel').setTitle(chartInfo.desc + chartInfo.unit);
		var store = Ext.getStore('VehicleRunStore');
		var proxy = store.getProxy();
		proxy.extraParams.from_year = fromYear;
		proxy.extraParams.from_month = fromMonth;
		proxy.extraParams.to_year = toYear;
		proxy.extraParams.to_month = toMonth;
		
		if(vehicleGroup.getValue())
			proxy.extraParams.vehicle_group = vehicleGroup.getValue();
		
		store.load({
			scope : this,
			callback : function(records, operation, success) {
				
				var newRecords = [];
				Ext.each(records, function(record) {
					var vehicle = record.data.vehicle;
					var year = record.data.year;
					var month = record.data.month;
					var runData = record.get(chartInfo.name);
					
					// 가동율 
					if('rate_of_oper' == chartInfo.name) {
						var runTime = record.data.run_time;
						runData = runTime ? ((runTime * 100) / (30 * 60 * 24)) : 0;
						
					// MTTR	
					} else if('mttr' == chartInfo.name) {
						var oosCnt = record.data.oos_cnt;
						var mntTime = record.data.mnt_time;
						runData = (oosCnt && mntTime) ? (mntTime / oosCnt) : 0;
						
					// MTBF
					} else if('mtbf' == chartInfo.name) {
						var runTime = record.data.run_time;
						var mntTime = record.data.mnt_time;
						var oosCnt = record.data.oos_cnt;
						runData = oosCnt ? ((runTime - mntTime > 0) ? ((runTime - mntTime) / oosCnt) : 0) : 0;										
					}
					
					if(chartInfo.type == 'float') {
						runData = parseFloat(Ext.util.Format.number(runData, '0.00'));
					}
					
					var newRecord = null;
					Ext.each(newRecords, function(nr) {
						if(vehicle == nr.vehicle && year == nr.year)
							newRecord = nr;
					});
					
					var monthStr = 'mon_' + month;
					if(newRecord == null) {
						newRecord = { 'vehicle' : vehicle, 'year' : year , 'sum' : runData };
						newRecord[monthStr] = runData;
						newRecords.push(newRecord);
					
					} else {
						newRecord[monthStr] = runData;
						if(runData && runData > 0) {
							newRecord['sum'] = newRecord.sum + runData;														
						}
					}
				});

				if(chartInfo.type == 'float') {
					Ext.each(newRecords, function(nr) {
						nr.sum = parseFloat(Ext.util.Format.number(nr.sum, '0.00'));
					});					
				}
				
				dataGrid.store.loadData(newRecords);
				this.refreshChart(newRecords, chartInfo.desc, chartInfo.unit);
			}
		});
	},
		
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records, yTitle, unit) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chartType = this.sub('combo_chart_type').getValue();
		var chart = ('by_years' == chartType) ? 
				this.refreshChartByYear(records, width, height, yTitle, unit) : 
				this.refreshChartByVehicle(records, width, height, yTitle, unit);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * X축이 Vehicle인 Chart를 생성 
	 */
	refreshChartByVehicle : function(records, width, height, yTitle, unit) {
		
		var yearFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['vehicle'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;
			var year = record.year;
			var contains = false;
			
			Ext.each(yearFields, function(yearField) {
				if(yearField == year)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push('' + year);
				yearFields.push(year);
				yFields.push(year + '_sum');
				fields.push(year + '_sum');
			}
		});		
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;			
			var year = record.year;
			var sum = record.sum;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(vehicle == data.vehicle) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'vehicle' : vehicle };
				dataList.push(chartData);
			}
			
			chartData[year + '_sum'] = sum;
		});
		
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'vehicle';
		var xTitle = T('label.vehicle');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);
	},
	
	/**
	 * X축이 Year인 Chart를 생성 
	 */
	refreshChartByYear : function(records, width, height, yTitle, unit) {
		
		var vehicleFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['year'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle; 
			var year = record.year;
			var contains = false;
			
			Ext.each(vehicleFields, function(vehicleField) {
				if(vehicleField == vehicle)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push(vehicle);
				vehicleFields.push(vehicle);
				yFields.push(vehicle + '_sum');
				fields.push(vehicle + '_sum');
			}
		});		
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;		
			var year = record.year;
			var sum = record.sum;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(year == data.year) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'year' : year };
				dataList.push(chartData);
			}
			
			chartData[vehicle + '_sum'] = sum;
		});
				
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'year';
		var xTitle = T('label.year');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);		
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성
	 */
	buildChart : function(store, xField, xTitle, yFields, yTitle, yTitles, unit, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 5,
				theme : 'Base:gradients',
				legend: { position: 'left' },
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: yFields,
	                title: yTitle + unit,
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: [xField],
	                grid : true,
	                title: xTitle	                
				}],
				series : [{
					type : 'column',
					axis: 'left',
					xField: xField,
	                yField: yFields,
	                title : yTitles,
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(item.value[0] + ' : ' + item.value[1]);
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : yFields,
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.DriverRunningSummary', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_driver_summary',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.runtime_by_drivers') + T('label.parentheses_min'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'driver', 'year', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'sum' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.driver'),
	            dataIndex: 'driver',
	            width : 80,
				summaryType: 'count',
		        summaryRenderer: function(value) {		        	
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : T('label.sum'),
				dataIndex : 'sum',
				width : 100,
				summaryType: 'sum',
		        summaryRenderer: function(value) {
		        	value = Ext.util.Format.number(value, '0.00');
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
	        }]
		}],

		tbar : [
			T('label.chart_type') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart_type',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'name', 'desc' ],			
					data : [{ "name" : "by_drivers", "desc" : T('report.by_drivers') },
					        { "name" : "by_years",	 "desc" : T('report.by_years') }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_driver_summary');
						thisView.refresh();
					}
			    }
			},		        
			T('title.driver_group'),
			{
				xtype : 'combo',
				itemId : 'combo_driver_group',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'id',
				store : 'DriverGroupStore',
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_driver_summary');
						thisView.refresh();						
					}
			    }
			},
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},			
		    T('label.chart') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',				
				store :  Ext.create('Ext.data.Store', { 
					fields : [ 'name', 'type', 'desc', 'unit' ], 
					data : [{ "name" : "run_time", 		"type": "int", 		"desc" : T('report.runtime_by_drivers'),		"unit" : T('label.parentheses_min') },					        
					        { "name" : "run_dist", 		"type": "float",	"desc" : T('report.rundist_by_drivers'), 		"unit" : "(km)" },
					        { "name" : "rate_of_oper", 	"type": "float",	"desc" : T('report.oprate_by_drivers'), 		"unit" : "(%)" },
					        { "name" : "effcc", 		"type": "float",	"desc" : T('report.efficiency_by_drivers'), 	"unit" : "(km/l)" },
					        { "name" : "consmpt", 		"type": "float",	"desc" : T('report.consumption_by_drivers'), 	"unit" : "(l)" },
							{ "name" : "co2_emss", 		"type": "float",	"desc" : T('report.co2_emissions_by_drivers'), 	"unit" : "(g/km)" },
							{ "name" : "eco_index", 	"type": "int",		"desc" : T('report.eco_index_by_drivers'), 		"unit" : "(%)" },														
							{ "name" : "sud_accel_cnt", "type": "int",		"desc" : T('report.sud_accel_cnt_by_drivers'),  "unit" : "" },
							{ "name" : "sud_brake_cnt", "type": "int",		"desc" : T('report.sud_brake_cnt_by_drivers'), 	"unit" : "" },
							{ "name" : "eco_drv_time", 	"type": "int",		"desc" : T('report.eco_drv_time_by_drivers'),  	"unit" : T('label.parentheses_min') },
							{ "name" : "ovr_spd_time",  "type": "int",		"desc" : T('report.ovr_spd_time_by_drivers'),  	"unit" : T('label.parentheses_min') },
							{ "name" : "idle_time", 	"type": "int",		"desc" : T('report.idle_time_by_vehicles'), 	"unit" : T('label.parentheses_min') },
							{ "name" : "inc_cnt",  		"type": "int",		"desc" : T('report.inc_cnt_by_drivers'), 		"unit" : "" }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_driver_summary');
						thisView.refresh();
					}
			    }
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_driver_summary');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 차트 정보
	 */
	getChartInfo : function() {
		
		var comboChart = this.sub('combo_chart').getValue();
		if(!comboChart) {
			comboChart = 'run_time';
		}
		
		var chartInfo = null;		
		var chartTypeArr = this.sub('combo_chart').store.data;
		
		for(var i = 0 ; i < chartTypeArr.length ; i++) {
			var chartTypeData = chartTypeArr.items[i].data;
			if(comboChart == chartTypeData.name) {
				chartInfo = chartTypeData;
				break;
			}
		}
		
		return chartInfo;
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		var dataGrid = this.sub('data_grid');
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		var chartInfo = this.getChartInfo();		
		this.sub('datagrid_panel').setTitle(chartInfo.desc + chartInfo.unit);		
		var driverGroup = this.sub('combo_driver_group').getValue();		
		var store = Ext.getStore('DriverRunStore');
		var proxy = store.getProxy();
		//proxy.extraParams.select = ['driver', 'month_str', chartInfo.name];
		proxy.extraParams.from_year = fromYear;
		proxy.extraParams.from_month = fromMonth;
		proxy.extraParams.to_year = toYear;
		proxy.extraParams.to_month = toMonth;
		
		if(driverGroup)
			proxy.extraParams.driver_group = driverGroup;
				
		store.load({
			scope : this,
			callback : function(records, operation, success) {
				
				var newRecords = [];
				Ext.each(records, function(record) {
					var driver = record.data.driver;
					var year = record.data.year;
					var month = record.data.month;
					var runData = record.get(chartInfo.name);
					
					if(chartInfo.name == 'rate_of_oper') {
						var runTime = record.data.run_time;
						runData = runTime ? ((runTime * 100) / (30 * 60 * 24)) : 0;
					}
					
					if(chartInfo.type == 'float') {
						runData = parseFloat(Ext.util.Format.number(runData, '0.00'));
					}
					
					var newRecord = null;
					Ext.each(newRecords, function(nr) {
						if(driver == nr.driver && year == nr.year)
							newRecord = nr;
					});
					
					var monthStr = 'mon_' + month;
					if(newRecord == null) {
						newRecord = { 'driver' : driver, 'year' : year , 'sum' : runData };
						newRecord[monthStr] = runData;
						newRecords.push(newRecord);
					
					} else {
						newRecord[monthStr] = runData;
						if(runData && runData > 0)
							newRecord['sum'] = newRecord.sum + runData;
					}
				});
				
				if(chartInfo.type == 'float') {
					Ext.each(newRecords, function(nr) {
						nr.sum = parseFloat(Ext.util.Format.number(nr.sum, '0.00'));
					});					
				}				
				
				dataGrid.store.loadData(newRecords);
				this.refreshChart(newRecords, chartInfo.desc, chartInfo.unit);
			}
		});
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records, yTitle, unit) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chartType = this.sub('combo_chart_type').getValue();
		var chart = ('by_years' == chartType) ? 
				this.refreshChartByYear(records, width, height, yTitle, unit) : 
				this.refreshChartByDriver(records, width, height, yTitle, unit);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * X축이 Drivers인 Chart를 생성 
	 */
	refreshChartByDriver : function(records, width, height, yTitle, unit) {
		
		var yearFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['driver'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var driver = record.driver;
			var year = record.year;
			var contains = false;
			
			Ext.each(yearFields, function(yearField) {
				if(yearField == year)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push('' + year);
				yearFields.push(year);
				yFields.push(year + '_sum');
				fields.push(year + '_sum');
			}
		});		
		
		Ext.each(records, function(record) {
			var driver = record.driver;			
			var year = record.year;
			var sum = record.sum;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(driver == data.driver) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'driver' : driver };
				dataList.push(chartData);
			}
			
			chartData[year + '_sum'] = sum;
		});
		
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'driver';
		var xTitle = T('label.driver');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);
	},
	
	/**
	 * X축이 Year인 Chart를 생성 
	 */
	refreshChartByYear : function(records, width, height, yTitle, unit) {
		
		var driverFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['year'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var driver = record.driver; 
			var year = record.year;
			var contains = false;
			
			Ext.each(driverFields, function(driverField) {
				if(driverField == driver)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push(driver);
				driverFields.push(driver);
				yFields.push(driver + '_sum');
				fields.push(driver + '_sum');
			}
		});		
		
		Ext.each(records, function(record) {
			var driver = record.driver;		
			var year = record.year;
			var sum = record.sum;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(year == data.year) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'year' : year };
				dataList.push(chartData);
			}
			
			chartData[driver + '_sum'] = sum;
		});
				
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'year';
		var xTitle = T('label.year');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);		
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성
	 */
	buildChart : function(store, xField, xTitle, yFields, yTitle, yTitles, unit, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 5,
				theme : 'Base:gradients',
				legend: { position: 'left' },
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: yFields,
	                title: yTitle + unit,
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: [xField],
	                grid : true,
	                title: xTitle	                
				}],
				series : [{
					type : 'column',
					axis: 'left',
					xField: xField,
	                yField: yFields,
	                title : yTitles,
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(item.value[0] + ' : ' + item.value[1]);
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : yFields,
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.Mttr', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_mttr',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.mttr'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'vehicle', 'year', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.vehicle'),
	            dataIndex: 'vehicle',
	            width : 80,
				summaryType: 'count',
		        summaryRenderer: function(value) {
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : 'Average',
				dataIndex : 'avg',
				width : 100,
				summaryType: 'average',
		        summaryRenderer: function(value) {
		        	value = value.toFixed(2);
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
	        }]
		}],

		tbar : [
			T('label.chart_type') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart_type',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'name', 'desc' ],			
					data : [{ "name" : "by_vehicles", "desc" : T('report.by_vehicles') },
					        { "name" : "by_years",	  "desc" : T('report.by_years') }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_mttr');
						thisView.refresh();
					}
			    }
			},		        
			T('title.vehicle_group'),
			{
				xtype : 'combo',
				itemId : 'combo_vehicle_group',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'id',
				store : 'VehicleGroupStore',
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_mttr');
						thisView.refresh();						
					}
			    }				
			},
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60				
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_mttr');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 차트 정보
	 */
	getChartInfo : function() {		
		return { "name" : "mttr", "type": "float", "desc" : T('report.mttr'), "unit" : T('label.parentheses_min') };
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var dataGrid = this.sub('data_grid');
		var vehicleGroup = this.sub('combo_vehicle_group');
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		var chartInfo = this.getChartInfo();		
		this.sub('datagrid_panel').setTitle(chartInfo.desc + chartInfo.unit);
		var store = Ext.getStore('VehicleRunStore');
		var proxy = store.getProxy();
		proxy.extraParams.from_year = fromYear;
		proxy.extraParams.from_month = fromMonth;
		proxy.extraParams.to_year = toYear;
		proxy.extraParams.to_month = toMonth;
		
		if(vehicleGroup.getValue())
			proxy.extraParams.vehicle_group = vehicleGroup.getValue();
		
		store.load({
			scope : this,
			callback : function(records, operation, success) {
				
				var newRecords = [];
				Ext.each(records, function(record) {
					var vehicle = record.data.vehicle;
					var year = record.data.year;
					var month = record.data.month;
					var runData = record.get(chartInfo.name);					
					var oosCnt = record.data.oos_cnt;
					var mntTime = record.data.mnt_time;
					runData = (oosCnt && mntTime) ? (mntTime / oosCnt) : 0;						
					runData = parseFloat(runData.toFixed(2));
					
					var newRecord = null;
					Ext.each(newRecords, function(nr) {
						if(vehicle == nr.vehicle && year == nr.year)
							newRecord = nr;
					});
					
					var monthStr = 'mon_' + month;
					if(newRecord == null) {
						newRecord = { 'vehicle' : vehicle, 'year' : year , 'sum' : runData, 'count' : 1, 'avg' : 0 };
						newRecord[monthStr] = runData;
						newRecords.push(newRecord);
					
					} else {
						newRecord[monthStr] = runData;
						if(runData && runData > 0) {
							newRecord['count'] = newRecord.count + 1;
							newRecord['sum'] = newRecord.sum + runData;							
						}
					}
				});

				Ext.each(newRecords, function(nr) {
					nr.avg = parseFloat((nr.sum / nr.count).toFixed(2));
					nr.sum = nr.sum.toFixed(2);						
				});							
				
				dataGrid.store.loadData(newRecords);
				this.refreshChart(newRecords, chartInfo.desc, chartInfo.unit);
			}
		});
	},
		
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records, yTitle, unit) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chartType = this.sub('combo_chart_type').getValue();
		var chart = ('by_years' == chartType) ? 
				this.refreshChartByYear(records, width, height, yTitle, unit) : 
				this.refreshChartByVehicle(records, width, height, yTitle, unit);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * X축이 Vehicle인 Chart를 생성 
	 */
	refreshChartByVehicle : function(records, width, height, yTitle, unit) {
		
		var yearFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['vehicle'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;
			var year = record.year;
			var contains = false;
			
			Ext.each(yearFields, function(yearField) {
				if(yearField == year)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push('' + year);
				yearFields.push(year);
				yFields.push(year + '_avg');
				fields.push(year + '_avg');
			}
		});		
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;			
			var year = record.year;
			var avg = record.avg;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(vehicle == data.vehicle) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'vehicle' : vehicle };
				dataList.push(chartData);
			}
			
			chartData[year + '_avg'] = avg;
		});
		
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'vehicle';
		var xTitle = T('label.vehicle');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);
	},
	
	/**
	 * X축이 Year인 Chart를 생성 
	 */
	refreshChartByYear : function(records, width, height, yTitle, unit) {
		
		var vehicleFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['year'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle; 
			var year = record.year;
			var contains = false;
			
			Ext.each(vehicleFields, function(vehicleField) {
				if(vehicleField == vehicle)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push(vehicle);
				vehicleFields.push(vehicle);
				yFields.push(vehicle + '_avg');
				fields.push(vehicle + '_avg');
			}
		});		
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;		
			var year = record.year;
			var avg = record.avg;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(year == data.year) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'year' : year };
				dataList.push(chartData);
			}
			
			chartData[vehicle + '_avg'] = avg;
		});
				
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'year';
		var xTitle = T('label.year');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);		
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성
	 */
	buildChart : function(store, xField, xTitle, yFields, yTitle, yTitles, unit, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 5,
				theme : 'Base:gradients',
				legend: { position: 'left' },
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: yFields,
	                title: yTitle + unit,
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: [xField],
	                grid : true,
	                title: xTitle	                
				}],
				series : [{
					type : 'column',
					axis: 'left',
					xField: xField,
	                yField: yFields,
	                title : yTitles,
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(item.value[0] + ' : ' + item.value[1]);
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : yFields,
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.Mtbf', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_mtbf',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.mtbf') + '(%)',
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'vehicle', 'year', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.vehicle'),
	            dataIndex: 'vehicle',
	            width : 80,
				summaryType: 'count',
		        summaryRenderer: function(value) {		        	
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : 'Average',
				dataIndex : 'avg',
				width : 100,
				summaryType: 'average',
		        summaryRenderer: function(value) {
		        	value = value.toFixed(2);
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
	        }]
		}],

		tbar : [
			T('label.chart_type') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart_type',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'name', 'desc' ],			
					data : [{ "name" : "by_vehicles", "desc" : T('report.by_vehicles') },
					        { "name" : "by_years",	  "desc" : T('report.by_years') }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_mtbf');
						thisView.refresh();
					}
			    }
			},		        
			T('title.vehicle_group'),
			{
				xtype : 'combo',
				itemId : 'combo_vehicle_group',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'id',
				store : 'VehicleGroupStore',
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_mtbf');
						thisView.refresh();						
					}
			    }				
			},
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60				
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_mtbf');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 차트 정보
	 */
	getChartInfo : function() {		
		return { "name" : "mtbf", "type": "float", "desc" : T('report.mtbf'), "unit" : T('label.parentheses_day') };
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var dataGrid = this.sub('data_grid');
		var vehicleGroup = this.sub('combo_vehicle_group');
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		var chartInfo = this.getChartInfo();		
		this.sub('datagrid_panel').setTitle(chartInfo.desc + chartInfo.unit);
		var store = Ext.getStore('VehicleRunStore');
		var proxy = store.getProxy();
		proxy.extraParams.from_year = fromYear;
		proxy.extraParams.from_month = fromMonth;
		proxy.extraParams.to_year = toYear;
		proxy.extraParams.to_month = toMonth;
		
		if(vehicleGroup.getValue())
			proxy.extraParams.vehicle_group = vehicleGroup.getValue();
		
		store.load({
			scope : this,
			callback : function(records, operation, success) {
				
				var newRecords = [];
				Ext.each(records, function(record) {
					var vehicle = record.data.vehicle;
					var year = record.data.year;
					var month = record.data.month;
					var runTime = record.data.run_time;
					//var runTime = 30 * 24 * 60;
					var mntTime = record.data.mnt_time;
					var oosCnt = record.data.oos_cnt;					
					var runData = runTime - mntTime;					
					runData = (runData && runData > 0) ? runData : 0;
					if(runData > 0) {					
						runData = (oosCnt && oosCnt > 0) ? (runData / oosCnt) : runData;
						runData = parseFloat((runData / (24 * 60)).toFixed(2));
					}
					
					var newRecord = null;
					Ext.each(newRecords, function(nr) {
						if(vehicle == nr.vehicle && year == nr.year)
							newRecord = nr;
					});
					
					var monthStr = 'mon_' + month;
					if(newRecord == null) {
						newRecord = { 'vehicle' : vehicle, 'year' : year , 'run_time_sum' : runTime, 'mnt_time_sum' : mntTime, 'oos_cnt_sum' : oosCnt, 'avg' : 0 };
						newRecord[monthStr] = runData;
						newRecords.push(newRecord);
					
					} else {
						newRecord[monthStr] = runData;
						newRecord['run_time_sum'] = newRecord.run_time_sum + runTime;
						newRecord['mnt_time_sum'] = newRecord.mnt_time_sum + mntTime;
						newRecord['oos_cnt_sum'] = newRecord.oos_cnt_sum + oosCnt;
					}
				});

				Ext.each(newRecords, function(nr) {					
					if(!nr.oos_cnt_sum || nr.oos_cnt_sum == 0)
						nr.oos_cnt_sum = 1;
					
					nr.avg = ((nr.run_time_sum - nr.mnt_time_sum) / nr.oos_cnt_sum);
					nr.avg = (nr.avg / (24 * 60)).toFixed(2);
				});
				
				dataGrid.store.loadData(newRecords);
				this.refreshChart(newRecords, chartInfo.desc, chartInfo.unit);
			}
		});
	},
		
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records, yTitle, unit) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chartType = this.sub('combo_chart_type').getValue();
		var chart = ('by_years' == chartType) ? 
				this.refreshChartByYear(records, width, height, yTitle, unit) : 
				this.refreshChartByVehicle(records, width, height, yTitle, unit);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * X축이 Vehicle인 Chart를 생성 
	 */
	refreshChartByVehicle : function(records, width, height, yTitle, unit) {
		
		var yearFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['vehicle'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;
			var year = record.year;
			var contains = false;
			
			Ext.each(yearFields, function(yearField) {
				if(yearField == year)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push('' + year);
				yearFields.push(year);
				yFields.push(year + '_avg');
				fields.push(year + '_avg');
			}
		});		
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;			
			var year = record.year;
			var avg = record.avg;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(vehicle == data.vehicle) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'vehicle' : vehicle };
				dataList.push(chartData);
			}
			
			chartData[year + '_avg'] = avg;
		});
		
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'vehicle';
		var xTitle = T('label.vehicle');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);
	},
	
	/**
	 * X축이 Year인 Chart를 생성 
	 */
	refreshChartByYear : function(records, width, height, yTitle, unit) {
		
		var vehicleFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['year'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle; 
			var year = record.year;
			var contains = false;
			
			Ext.each(vehicleFields, function(vehicleField) {
				if(vehicleField == vehicle)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push(vehicle);
				vehicleFields.push(vehicle);
				yFields.push(vehicle + '_avg');
				fields.push(vehicle + '_avg');
			}
		});		
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;		
			var year = record.year;
			var avg = record.avg;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(year == data.year) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'year' : year };
				dataList.push(chartData);
			}
			
			chartData[vehicle + '_avg'] = avg;
		});
				
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'year';
		var xTitle = T('label.year');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);		
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성
	 */
	buildChart : function(store, xField, xTitle, yFields, yTitle, yTitles, unit, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 25,
				height : height - 50,
				shadow : true,
				insetPadding : 5,
				theme : 'Base:gradients',
				legend: { position: 'left' },
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: yFields,
	                title: yTitle + unit,
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: [xField],
	                grid : true,
	                title: xTitle	                
				}],
				series : [{
					type : 'column',
					axis: 'left',
					xField: xField,
	                yField: yFields,
	                title : yTitles,
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(item.value[0] + ' : ' + item.value[1]);
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : yFields,
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.EfficiencyTrend', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_effcc_trend',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.effcc_trend'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'type', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.type'),
	            dataIndex: 'type',
	            width : 100
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : 'Average',
				dataIndex : 'avg',
				width : 100
	        }]
		}],

		tbar : [
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_effcc_trend');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var self = this;
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'fuel',
		    	type : 'effcc_trend',
		    	from_year : fromYear,
		    	from_month : fromMonth,
		    	to_year : toYear,
		    	to_month : toMonth
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	self.refreshGridData(resultObj.items);
		        	self.refreshChartData(resultObj.items);
		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
	},
	
	/**
	 * 그리드 데이터 Refresh 
	 */
	refreshGridData : function(records) {
		var dataList = [];
		var effccType = T('label.fuel_efficiency');
		var consmptType = T('label.fuel_consumption');
		
		Ext.each(records, function(record) {
			var effccData = null;
			var consmptData = null;
			
			Ext.each(dataList, function(data) {
				if(data.year == record.year && data.type == effccType) {
					effccData = data;
				}
				
				if(data.year == record.year && data.type == consmptType) {
					consmptData = data;
				}				
			});
			
			if(!effccData) {
				effccData = { "year" : record.year };
				effccData["type"] = effccType;
				effccData["count"] = 0;
				effccData["sum"] = 0;
				dataList.push(effccData);
			}
			
			if(!consmptData) {
				consmptData = { "year" : record.year };
				consmptData["type"] = consmptType;
				consmptData["count"] = 0;
				consmptData["sum"] = 0;
				dataList.push(consmptData);				
			} 
			
			var effcc = record.effcc;
			effccData["mon_" + record.month] = effcc
			effccData["count"] = effccData["count"] + 1;
			effccData["sum"] = effccData["sum"] + effcc;
			
			var consmpt = record.consmpt;
			consmptData["mon_" + record.month] = consmpt
			consmptData["count"] = consmptData["count"] + 1;
			consmptData["sum"] = consmptData["sum"] + consmpt;			
		});
		
		Ext.each(dataList, function(data) {
			data["avg"] = Ext.util.Format.number((data["sum"] / data["count"]), '0.00');
		});
		
		this.sub('data_grid').store.loadData(dataList);
	},
	
	/**
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var dataList = [];
		Ext.each(records, function(record) {
			dataList.push({"yearmonth" : record.yearmonth, "effcc" : record.effcc, "consmpt" : record.consmpt });
		});
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		
		if(chart == null) {
			this.refreshChart(dataList);
		} else {
			chart.store.loadData(dataList);
		}
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chart = this.buildChart(records, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(records, width, height) {
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',				
				animate : true,
				store : Ext.create('Ext.data.Store', { fields : ['yearmonth', 'effcc', 'consmpt'], data : records }),
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Category',
	                position: 'bottom',
	                fields: ['yearmonth'],
	                grid : true,
	                title: T('label.month')
				}, {
	                type: 'Numeric',
	                position: 'left',
	                fields: ['effcc'],
	                grid : true,
	                title: T('label.fuel_efficiency') + '(km/l)'
	            },{
	                type: 'Numeric',
	                position: 'right',
	                fields: ['consmpt'],
	                title: T('label.fuel_consumption') + '(l)'
	            } ],
				series : [{
					type : 'column',
					axis: 'left',
					xField: 'yearmonth',
	                yField: 'effcc',
					showInLegend : true,
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : 'effcc',
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}, {
	                type: 'line',
	                highlight: {
	                    size: 7,
	                    radius: 7
	                },
	                fill: true,
	                smooth: true,
	                fillOpacity: 0.5,
	                axis: 'right',
	                xField: 'yearmonth',
	                yField: 'consmpt',
					showInLegend : true,
	                title: T('label.fuel_consumption'),
					tips : {
						trackMouse : true,
						width : 90,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get('yearmonth') + ' : ' + storeItem.get('consmpt') + '(l)');
						}
					},	                
	            }]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.MaintTrend', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_maint_trend',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.refresh();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.maint_trend'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'vehicle', 'mnt_cnt', 'sum' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 100
			}, {
	            text     : T('label.vehicle'),
	            dataIndex: 'vehicle',
	            width : 100
			}, {
	            text     : T('label.maintenance_count'),
	            dataIndex: 'mnt_cnt',
	            width : 100
			}, {
				header : T('label.sum'),
				dataIndex : 'mnt_cnt',
				width : 100,
				summaryType: 'sum',
				summaryRenderer: function(value) {
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }				
	        }]
		}]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var self = this;		
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'repair_list',
		    	type : 'maint_trend'
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	self.sub('data_grid').store.loadData(records);
		        	self.refreshChartData(records);
		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
	},
	
	/**
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		var retObj = this.buildChartStore(records);
		var chartFieldList = retObj[0];
		var chartStore = retObj[1];
		
		if(chart == null) {
			this.refreshChart(chartFieldList, chartStore);
		} else {
			chart.store.loadData(chartStore.getData());
		}
	},
	
	/**
	 * 차트 데이터 변형 
	 */
	buildChartStore : function(records) {
		
		var bottomFieldList = [];
		var fieldList = ['year'];
		var chartDataList = [];
		
		Ext.each(records, function(record) {
			var item = null;
			
			Ext.each(chartDataList, function(chartData) {
				if(chartData.year == record.year) {
					item = chartData;
				}				
			});
			
			if(!item) {
				item = { "year" : record.year };
				chartDataList.push(item);
			}
			
			if(!Ext.Array.contains(fieldList, record.vehicle)) {
				fieldList.push(record.vehicle);
				bottomFieldList.push(record.vehicle);
			}
						
			item[record.vehicle] = record.mnt_cnt;
		});
		
		return [bottomFieldList, Ext.create('Ext.data.Store', { fields : fieldList, data : chartDataList })];
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(chartFieldList, chartStore) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chart = this.buildChart(chartFieldList, chartStore, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(chartFieldList, chartStore, width, height) {
				
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,			
			items : [{
				xtype : 'chart',				
				animate : true,
				store : chartStore,
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				legend: {
	                position: 'top'
	            },				
				axes: [{
	                type: 'Numeric',
	                position: 'bottom',
	                fields: chartFieldList,
	                grid : true,
	                title: T('label.maintenance_count'),
				}, {
	                type: 'Category',
	                position: 'left',
	                grid : true,
	                fields: ['year'],
	                title: T('label.year')
	            }],
				series : [{
					type: 'bar',
					axis: 'bottom',
					gutter: 80,
					xField: 'year',
					yField: chartFieldList,
					stacked: true,
					tips: {
	                    trackMouse: true,
	                    width: 65,
	                    height: 28,
	                    renderer: function(storeItem, item) {
	                        this.setTitle(item.value[1]);
	                    }
	                }
				}]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.EcoDrivingTrend', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_eco_driving_trend',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.eco_driving_trend'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'type', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.type'),
	            dataIndex: 'type',
	            width : 100
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : 'Average',
				dataIndex : 'avg',
				width : 100
	        }]
		}],

		tbar : [
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_eco_driving_trend');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var self = this;
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'eco',
		    	type : 'ecoindex_ecorate',
		    	from_year : fromYear,
		    	from_month : fromMonth,
		    	to_year : toYear,
		    	to_month : toMonth
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	self.refreshGridData(records);
		        	self.refreshChartData(records);
		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
	},
	
	/**
	 * 그리드 데이터 Refresh 
	 */
	refreshGridData : function(records) {
		var dataList = [];
		var ecoIndexType = T('label.eco_index');
		var ecoRunRateType = T('label.eco_run_rate');
		
		Ext.each(records, function(record) {
			var ecoIndexData = null;
			var ecoRunRateData = null;
			
			Ext.each(dataList, function(data) {
				if(data.year == record.year && data.type == ecoIndexType) {
					ecoIndexData = data;
				}
				
				if(data.year == record.year && data.type == ecoRunRateType) {
					ecoRunRateData = data;
				}
			});
			
			if(!ecoIndexData) {
				ecoIndexData = { "year" : record.year };
				ecoIndexData["type"] = ecoIndexType;
				ecoIndexData["count"] = 0;
				ecoIndexData["sum"] = 0;
				dataList.push(ecoIndexData);
			}
			
			if(!ecoRunRateData) {
				ecoRunRateData = { "year" : record.year };
				ecoRunRateData["type"] = ecoRunRateType;
				ecoRunRateData["count"] = 0;
				ecoRunRateData["sum"] = 0;
				dataList.push(ecoRunRateData);				
			} 
			
			var ecoIndex = record.eco_index;
			ecoIndexData["mon_" + record.month] = ecoIndex
			ecoIndexData["count"] = ecoIndexData["count"] + 1;
			ecoIndexData["sum"] = ecoIndexData["sum"] + ecoIndex;
			
			var ecoRunRate = record.eco_driving;
			ecoRunRateData["mon_" + record.month] = ecoRunRate
			ecoRunRateData["count"] = ecoRunRateData["count"] + 1;
			ecoRunRateData["sum"] = ecoRunRateData["sum"] + ecoRunRate;			
		});
		
		Ext.each(dataList, function(data) {
			data["avg"] = Ext.util.Format.number((data["sum"] / data["count"]), '0.00');
		});
		
		this.sub('data_grid').store.loadData(dataList);
	},
	
	/**
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var dataList = [];
		Ext.each(records, function(record) {
			dataList.push({"yearmonth" : record.yearmonth, "eco_index" : record.eco_index, "eco_run_rate" : record.eco_driving });
		});
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		
		if(chart == null) {
			this.refreshChart(dataList);
		} else {
			chart.store.loadData(dataList);
		}
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chart = this.buildChart(records, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(records, width, height) {
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',				
				animate : true,
				store : Ext.create('Ext.data.Store', { fields : ['yearmonth', 'eco_index', 'eco_run_rate'], data : records }),
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Category',
	                position: 'bottom',
	                fields: ['yearmonth'],
	                grid : true,
	                title: T('label.month')
				}, {
	                type: 'Numeric',
	                position: 'left',
	                fields: ['eco_index'],
	                grid : true,
	                title: T('label.eco_index') + '(%)'
	            },{
	                type: 'Numeric',
	                position: 'right',
	                fields: ['eco_run_rate'],
	                title: T('label.eco_run_rate') + '(%)'
	            } ],
				series : [{
					type : 'column',
					axis: 'left',
					xField: 'yearmonth',
	                yField: 'eco_index',
					showInLegend : true,
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : 'eco_index',
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}, {
	                type: 'line',
	                highlight: {
	                    size: 7,
	                    radius: 7
	                },
	                fill: true,
	                smooth: true,
	                fillOpacity: 0.5,
	                axis: 'right',
	                xField: 'yearmonth',
	                yField: 'eco_run_rate',
					showInLegend : true,
	                title: T('label.eco_run_rate'),
					tips : {
						trackMouse : true,
						width : 90,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get('yearmonth') + ' : ' + storeItem.get('eco_run_rate') + '(%)');
						}
					},	                
	            }]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.DrivingTrend', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_driving_trend',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.driving_trend'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'type', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.type'),
	            dataIndex: 'type',
	            width : 100
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : 'Average',
				dataIndex : 'avg',
				width : 100
	        }]
		}],

		tbar : [
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_driving_trend');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var self = this;
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'driving',
		    	//type : '',
		    	from_year : fromYear,
		    	from_month : fromMonth,
		    	to_year : toYear,
		    	to_month : toMonth
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	self.refreshGridData(records);
		        	self.refreshChartData(records);
		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
	},
	
	/**
	 * 그리드 데이터 Refresh 
	 */
	refreshGridData : function(records) {
		var dataList = [];
		var runDistType = T('label.run_dist');
		var runTimeType = T('label.run_time');
		
		Ext.each(records, function(record) {
			var runDistData = null;
			var runTimeData = null;
			
			Ext.each(dataList, function(data) {
				if(data.year == record.year && data.type == runDistType) {
					runDistData = data;
				}
				
				if(data.year == record.year && data.type == runTimeType) {
					runTimeData = data;
				}
			});
			
			if(!runDistData) {
				runDistData = { "year" : record.year };
				runDistData["type"] = runDistType;
				runDistData["count"] = 0;
				runDistData["sum"] = 0;
				dataList.push(runDistData);
			}
			
			if(!runTimeData) {
				runTimeData = { "year" : record.year };
				runTimeData["type"] = runTimeType;
				runTimeData["count"] = 0;
				runTimeData["sum"] = 0;
				dataList.push(runTimeData);				
			} 
			
			var runDist = record.run_dist;
			runDistData["mon_" + record.month] = runDist
			runDistData["count"] = runDistData["count"] + 1;
			runDistData["sum"] = runDistData["sum"] + runDist;
			
			var runTime = record.run_time;
			runTimeData["mon_" + record.month] = runTime
			runTimeData["count"] = runTimeData["count"] + 1;
			runTimeData["sum"] = runTimeData["sum"] + runTime;			
		});
		
		Ext.each(dataList, function(data) {
			data["avg"] = (data["sum"] / data["count"]).toFixed(2);
		});
		
		this.sub('data_grid').store.loadData(dataList);
	},
	
	/**
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var dataList = [];
		Ext.each(records, function(record) {
			dataList.push({"yearmonth" : record.yearmonth, "run_dist" : record.run_dist, "run_time" : record.run_time });
		});
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		
		if(chart == null) {
			this.refreshChart(dataList);
		} else {
			chart.store.loadData(dataList);
		}
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chart = this.buildChart(records, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(records, width, height) {
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',				
				animate : true,
				store : Ext.create('Ext.data.Store', { fields : ['yearmonth', 'run_dist', 'run_time'], data : records }),
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Category',
	                position: 'bottom',
	                fields: ['yearmonth'],
	                grid : true,
	                title: T('label.month')
				}, {
	                type: 'Numeric',
	                position: 'left',
	                fields: ['run_dist'],
	                title: T('label.run_dist') + '(km)'
	            },{
	                type: 'Numeric',
	                position: 'right',
	                fields: ['run_time'],
	                grid : true,
	                title: T('label.run_time') + T('label.parentheses_min')
	            } ],
				series : [{
					type : 'column',
					axis: 'left',
					xField: 'yearmonth',
	                yField: 'run_dist',
					showInLegend : true,
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : 'run_time',
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}, {
	                type: 'line',
	                highlight: {
	                    size: 7,
	                    radius: 7
	                },
	                fill: true,
	                smooth: true,
	                fillOpacity: 0.5,
	                axis: 'right',
	                xField: 'yearmonth',
	                yField: 'run_time',
					showInLegend : true,
	                title: T('label.run_time'),
					tips : {
						trackMouse : true,
						width : 90,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get('yearmonth') + ' : ' + storeItem.get('run_time') + '(min)');
						}
					},	                
	            }]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.Co2emssEcoindex', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_co2emss_ecoindex',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.co2emss_ecoindex'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'type', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.type'),
	            dataIndex: 'type',
	            width : 100
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : 'Average',
				dataIndex : 'avg',
				width : 100
	        }]
		}],

		tbar : [
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_co2emss_ecoindex');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var self = this;
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'eco',
		    	type : 'co2emss_ecoindex',
		    	from_year : fromYear,
		    	from_month : fromMonth,
		    	to_year : toYear,
		    	to_month : toMonth
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	self.refreshGridData(records);
		        	self.refreshChartData(records);
		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
	},
	
	/**
	 * 그리드 데이터 Refresh 
	 */
	refreshGridData : function(records) {
		var dataList = [];
		var ecoIndexType = T('label.eco_index');
		var co2EmssType = T('label.co2_emissions');
		
		Ext.each(records, function(record) {
			var ecoIndexData = null;
			var co2EmssData = null;
			
			Ext.each(dataList, function(data) {
				if(data.year == record.year && data.type == ecoIndexType) {
					ecoIndexData = data;
				}
				
				if(data.year == record.year && data.type == co2EmssType) {
					co2EmssData = data;
				}				
			});
			
			if(!ecoIndexData) {
				ecoIndexData = { "year" : record.year };
				ecoIndexData["type"] = ecoIndexType;
				ecoIndexData["count"] = 0;
				ecoIndexData["sum"] = 0;
				dataList.push(ecoIndexData);
			}
			
			if(!co2EmssData) {
				co2EmssData = { "year" : record.year };
				co2EmssData["type"] = co2EmssType;
				co2EmssData["count"] = 0;
				co2EmssData["sum"] = 0;
				dataList.push(co2EmssData);				
			} 
			
			var ecoIndex = record.eco_index;
			ecoIndexData["mon_" + record.month] = ecoIndex
			ecoIndexData["count"] = ecoIndexData["count"] + 1;
			ecoIndexData["sum"] = ecoIndexData["sum"] + ecoIndex;
			
			var co2Emss = record.co2_emss;
			co2EmssData["mon_" + record.month] = co2Emss
			co2EmssData["count"] = co2EmssData["count"] + 1;
			co2EmssData["sum"] = co2EmssData["sum"] + co2Emss;			
		});
		
		Ext.each(dataList, function(data) {
			data["avg"] = (data["sum"] / data["count"]).toFixed(2);
			//data["avg"] = Ext.util.Format.number((data["sum"] / data["count"]), '0.00');
		});
		
		this.sub('data_grid').store.loadData(dataList);
	},
	
	/**
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		
		if(chart == null) {
			this.refreshChart(records);
		} else {
			chart.store.loadData(records);
		}
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chart = this.buildChart(records, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(records, width, height) {		
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',				
				animate : true,
				store : Ext.create('Ext.data.Store', { fields : ['yearmonth', 'eco_index', 'co2_emss'], data : records }),
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'bottom',
	                fields: ['co2_emss'],
	                grid : true,
	                title: T('label.co2_emissions'),
				}, {
	                type: 'Numeric',
	                position: 'left',
	                fields: ['eco_index'],
	                grid : true,
	                label: { renderer: Ext.util.Format.numberRenderer('0,0') },
	                title: T('label.eco_index') + '(%)'
	            }],
				series : [{
					type: 'scatter',
					markerConfig: {
						radius: 5,
						size: 5
					},
					axis: 'left',
					xField: 'co2_emss',
					yField: 'eco_index'
				}]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.EffccConsumption', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_effcc_consmpt',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.effcc_consmpt'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'type', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.type'),
	            dataIndex: 'type',
	            width : 100
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : 'Average',
				dataIndex : 'avg',
				width : 100
	        }]
		}],

		tbar : [
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_effcc_consmpt');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var self = this;
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'fuel',
		    	type : 'effcc_consmpt',
		    	from_year : fromYear,
		    	from_month : fromMonth,
		    	to_year : toYear,
		    	to_month : toMonth
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	self.refreshGridData(resultObj.items);
		        	self.refreshChartData(resultObj.items);
		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
	},
	
	/**
	 * 그리드 데이터 Refresh 
	 */
	refreshGridData : function(records) {
		var dataList = [];
		var effccType = T('label.fuel_efficiency');
		var consmptType = T('label.fuel_consumption');
		
		Ext.each(records, function(record) {
			var effccData = null;
			var consmptData = null;
			
			Ext.each(dataList, function(data) {
				if(data.year == record.year && data.type == effccType) {
					effccData = data;
				}
				
				if(data.year == record.year && data.type == consmptType) {
					consmptData = data;
				}				
			});
			
			if(!effccData) {
				effccData = { "year" : record.year };
				effccData["type"] = effccType;
				effccData["count"] = 0;
				effccData["sum"] = 0;
				dataList.push(effccData);
			}
			
			if(!consmptData) {
				consmptData = { "year" : record.year };
				consmptData["type"] = consmptType;
				consmptData["count"] = 0;
				consmptData["sum"] = 0;
				dataList.push(consmptData);				
			} 
			
			var effcc = record.effcc;
			effccData["mon_" + record.month] = effcc
			effccData["count"] = effccData["count"] + 1;
			effccData["sum"] = effccData["sum"] + effcc;
			
			var consmpt = record.consmpt;
			consmptData["mon_" + record.month] = consmpt
			consmptData["count"] = consmptData["count"] + 1;
			consmptData["sum"] = consmptData["sum"] + consmpt;			
		});
		
		Ext.each(dataList, function(data) {
			data["avg"] = (data["sum"] / data["count"]).toFixed(2);
		});
		
		this.sub('data_grid').store.loadData(dataList);
	},
	
	/**
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		
		if(chart == null) {
			this.refreshChart(records);
		} else {
			chart.store.loadData(records);
		}
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chart = this.buildChart(records, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(records, width, height) {		
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',				
				animate : true,
				store : Ext.create('Ext.data.Store', { fields : ['yearmonth', 'effcc', 'consmpt'], data : records }),
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'bottom',
	                fields: ['consmpt'],
	                grid : true,
	                title: T('label.avg_consmpt') + '(l)',
				}, {
	                type: 'Numeric',
	                position: 'left',
	                fields: ['effcc'],
	                grid : true,
	                label: { renderer: Ext.util.Format.numberRenderer('0,0') },
	                title: T('label.avg_effcc') + '(km/l)'
	            }],
				series : [{
					type: 'scatter',
					markerConfig: {
						radius: 5,
						size: 5
					},
					axis: 'left',
					xField: 'consmpt',
					yField: 'effcc'
				}]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.ConsumptionEcoindex', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_consmpt_ecoindex',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.consmpt_ecoindex'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'type', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.type'),
	            dataIndex: 'type',
	            width : 100
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : 'Average',
				dataIndex : 'avg',
				width : 100
	        }]
		}],

		tbar : [
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_consmpt_ecoindex');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var self = this;
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'eco',
		    	type : 'consmpt_ecoindex',
		    	from_year : fromYear,
		    	from_month : fromMonth,
		    	to_year : toYear,
		    	to_month : toMonth
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	self.refreshGridData(records);
		        	self.refreshChartData(records);
		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
	},
	
	/**
	 * 그리드 데이터 Refresh 
	 */
	refreshGridData : function(records) {
		var dataList = [];
		var ecoIndexType = T('label.eco_index');
		var consmptType = T('label.fuel_consumption');
		
		Ext.each(records, function(record) {
			var ecoIndexData = null;
			var consmptData = null;
			
			Ext.each(dataList, function(data) {
				if(data.year == record.year && data.type == ecoIndexType) {
					ecoIndexData = data;
				}
				
				if(data.year == record.year && data.type == consmptType) {
					consmptData = data;
				}				
			});
			
			if(!ecoIndexData) {
				ecoIndexData = { "year" : record.year };
				ecoIndexData["type"] = ecoIndexType;
				ecoIndexData["count"] = 0;
				ecoIndexData["sum"] = 0;
				dataList.push(ecoIndexData);
			}
			
			if(!consmptData) {
				consmptData = { "year" : record.year };
				consmptData["type"] = consmptType;
				consmptData["count"] = 0;
				consmptData["sum"] = 0;
				dataList.push(consmptData);				
			} 
			
			var eco_index = record.eco_index;
			ecoIndexData["mon_" + record.month] = eco_index
			ecoIndexData["count"] = ecoIndexData["count"] + 1;
			ecoIndexData["sum"] = ecoIndexData["sum"] + eco_index;
			
			var consmpt = record.consmpt;
			consmptData["mon_" + record.month] = consmpt
			consmptData["count"] = consmptData["count"] + 1;
			consmptData["sum"] = consmptData["sum"] + consmpt;			
		});
		
		Ext.each(dataList, function(data) {
			data["avg"] = Ext.util.Format.number((data["sum"] / data["count"]), '0.0');
		});
		
		this.sub('data_grid').store.loadData(dataList);
	},
	
	/**
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		
		if(chart == null) {
			this.refreshChart(records);
		} else {
			chart.store.loadData(records);
		}
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chart = this.buildChart(records, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(records, width, height) {		
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',				
				animate : true,
				store : Ext.create('Ext.data.Store', { fields : ['yearmonth', 'eco_index', 'consmpt'], data : records }),
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'bottom',
	                fields: ['consmpt'],
	                grid : true,
	                title: T('label.fuel_consumption') + '(l)',
				}, {
	                type: 'Numeric',
	                position: 'left',
	                fields: ['eco_index'],
	                grid : true,
	                title: T('label.eco_index') + '(%)'
	            }],
				series : [{
					type: 'scatter',
					markerConfig: {
						radius: 5,
						size: 5
					},
					axis: 'left',
					xField: 'consmpt',
					yField: 'eco_index'
				}]
			}]
		}
	}
});
Ext.define('GreenFleet.view.dashboard.HabitEcoindex', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_habit_ecoindex',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.habit_ecoindex'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'type', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.type'),
	            dataIndex: 'type',
	            width : 100
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : 'Average',
				dataIndex : 'avg',
				width : 100
	        }]
		}],

		tbar : [
			T('label.period') + ' : ',
			{
				xtype : 'combo',
				name : 'from_year',
				itemId : 'from_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear() - 1,
				store : 'YearStore',
				width : 60
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 2,
				store : 'MonthStore',
				width : 40		
			},			
			' ~ ',
			{
				xtype : 'combo',
				name : 'to_year',
				itemId : 'to_year',
				displayField: 'year',
			    valueField: 'year',
			    value : new Date().getFullYear(),
				store : 'YearStore',
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store : 'MonthStore',
				width : 40		
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_habit_ecoindex');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var self = this;
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'eco',
		    	type : 'habit_ecoindex',
		    	from_year : fromYear,
		    	from_month : fromMonth,
		    	to_year : toYear,
		    	to_month : toMonth
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	self.refreshGridData(resultObj.items);
		        	self.refreshChartData(resultObj.items);
		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
	},
	
	/**
	 * 그리드 데이터 Refresh 
	 */
	refreshGridData : function(records) {
		var dataList = [];
		var ecoIndexType = T('label.eco_index');
		var sudCntType = T('label.sud_cnt');
		
		Ext.each(records, function(record) {
			var ecoIndexData = null;
			var sudCntData = null;
			
			Ext.each(dataList, function(data) {
				if(data.year == record.year && data.type == ecoIndexType) {
					ecoIndexData = data;
				}
				
				if(data.year == record.year && data.type == sudCntType) {
					sudCntData = data;
				}				
			});
			
			if(!ecoIndexData) {
				ecoIndexData = { "year" : record.year };
				ecoIndexData["type"] = ecoIndexType;
				ecoIndexData["count"] = 0;
				ecoIndexData["sum"] = 0;
				dataList.push(ecoIndexData);
			}
			
			if(!sudCntData) {
				sudCntData = { "year" : record.year };
				sudCntData["type"] = sudCntType;
				sudCntData["count"] = 0;
				sudCntData["sum"] = 0;
				dataList.push(sudCntData);				
			} 
			
			var eco_index = record.eco_index;
			ecoIndexData["mon_" + record.month] = eco_index
			ecoIndexData["count"] = ecoIndexData["count"] + 1;
			ecoIndexData["sum"] = ecoIndexData["sum"] + eco_index;
			
			var sud_cnt = record.sud_cnt;
			sudCntData["mon_" + record.month] = sud_cnt
			sudCntData["count"] = sudCntData["count"] + 1;
			sudCntData["sum"] = sudCntData["sum"] + sud_cnt;			
		});
		
		Ext.each(dataList, function(data) {
			data["avg"] = Ext.util.Format.number((data["sum"] / data["count"]), '0.00');
		});
		
		this.sub('data_grid').store.loadData(dataList);
	},
	
	/**
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		
		if(chart == null) {
			this.refreshChart(records);
		} else {
			chart.store.loadData(records);
		}
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chart = this.buildChart(records, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
	 */
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');
		
		if(!width)
			width = chartContainer.getWidth();
		
		if(!height)
			height = chartContainer.getHeight();
		
		var chartPanel = chartContainer.down('panel');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(records, width, height) {		
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',				
				animate : true,
				store : Ext.create('Ext.data.Store', { fields : ['yearmonth', 'eco_index', 'sud_cnt'], data : records }),
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'bottom',
	                fields: ['sud_cnt'],
	                grid : true,
	                title: T('label.sud_cnt'),
				}, {
	                type: 'Numeric',
	                position: 'left',
	                fields: ['eco_index'],
	                grid : true,
	                label: { renderer: Ext.util.Format.numberRenderer('0,0') },
	                title: T('label.eco_index') + '(%)'
	            }],
				series : [{
					type: 'scatter',
					markerConfig: {
						radius: 5,
						size: 5
					},
					axis: 'left',
					xField: 'sud_cnt',
					yField: 'eco_index'
				}]
			}]
		}
	}
});
/**
 * @class GreenFleet.view.portlet.Portlet
 * @extends Ext.panel.Panel
 * A {@link Ext.panel.Panel Panel} class that is managed by {@link GreenFleet.view.portlet.Portlet}.
 */
Ext.define('GreenFleet.view.portlet.Portlet', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.portlet',
    layout: 'fit',
    anchor: '100%',
    frame: true,
    closable: true,
    collapsible: true,
    animCollapse: true,
    draggable: {
        moveOnDrag: false    
    },
    cls: 'x-portlet',

    // Override Panel's default doClose to provide a custom fade out effect
    // when a portlet is removed from the portal
    doClose: function() {
        if (!this.closing) {
            this.closing = true;
            this.el.animate({
                opacity: 0,
                callback: function(){
                    this.fireEvent('close', this);
                    this[this.closeAction]();
                },
                scope: this
            });
        }
    }
});
/**
 * @class GreenFleet.view.portlet.PortalPanel
 * @extends Ext.panel.Panel
 * A {@link Ext.panel.Panel Panel} class used for providing drag-drop-enabled portal layouts.
 */
Ext.define('GreenFleet.view.portlet.PortalPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.portalpanel',
    cls: 'x-portal',
    bodyCls: 'x-portal-body',
    defaultType: 'portalcolumn',
    autoScroll: true,
    manageHeight: false,

    initComponent : function() {
        var me = this;

        // Implement a Container beforeLayout call from the layout to this Container
        this.layout = {
            type : 'column'
        };
        this.callParent();

        this.addEvents({
            validatedrop: true,
            beforedragover: true,
            dragover: true,
            beforedrop: true,
            drop: true
        });
    },

    // Set columnWidth, and set first and last column classes to allow exact CSS targeting.
    beforeLayout: function() {
        var items = this.layout.getLayoutItems(),
            len = items.length,
            firstAndLast = ['x-portal-column-first', 'x-portal-column-last'],
            i, item, last;

        for (i = 0; i < len; i++) {
            item = items[i];
            item.columnWidth = 1 / len;
            last = (i == len-1);

            if (!i) { // if (first)
                if (last) {
                    item.addCls(firstAndLast);
                } else {
                    item.addCls('x-portal-column-first');
                    item.removeCls('x-portal-column-last');
                }
            } else if (last) {
                item.addCls('x-portal-column-last');
                item.removeCls('x-portal-column-first');
            } else {
                item.removeCls(firstAndLast);
            }
        }

        return this.callParent(arguments);
    },

    // private
    initEvents : function(){
        this.callParent();
        this.dd = Ext.create('GreenFleet.view.portlet.PortalDropZone', this, this.dropConfig);
    },

    // private
    beforeDestroy : function() {
        if (this.dd) {
            this.dd.unreg();
        }
        this.callParent();
    }
});

/**
 * @class GreenFleet.view.portlet.PortalColumn
 * @extends Ext.container.Container
 * A layout column class used internally be {@link GreenFleet.view.portlet.PortalPanel}.
 */
Ext.define('GreenFleet.view.portlet.PortalColumn', {
    extend: 'Ext.container.Container',
    alias: 'widget.portalcolumn',
    layout: 'anchor',
    defaultType: 'portlet',
    cls: 'x-portal-column',
    listeners : {
    	dblclick : {
            element: 'el', 
            fn: function() {
            }
        }
    }
    // This is a class so that it could be easily extended
    // if necessary to provide additional behavior.
});
/**
 * @class GreenFleet.view.portlet.PortalDropZone
 * @extends Ext.dd.DropTarget
 * Internal class that manages drag/drop for {@link GreenFleet.view.portlet.PortalPanel}.
 */
Ext.define('GreenFleet.view.portlet.PortalDropZone', {
    extend: 'Ext.dd.DropTarget',

    constructor: function(portal, cfg) {
        this.portal = portal;
        Ext.dd.ScrollManager.register(portal.body);
        this.superclass.constructor.call(this, portal.body, cfg);
        portal.body.ddScrollConfig = this.ddScrollConfig;
    },

    ddScrollConfig: {
        vthresh: 50,
        hthresh: -1,
        animate: true,
        increment: 200
    },

    createEvent: function(dd, e, data, col, c, pos) {
        return {
            portal: this.portal,
            panel: data.panel,
            columnIndex: col,
            column: c,
            position: pos,
            data: data,
            source: dd,
            rawEvent: e,
            status: this.dropAllowed
        };
    },

    notifyOver: function(dd, e, data) {
        var xy = e.getXY(),
            portal = this.portal,
            proxy = dd.proxy;

        // case column widths
        if (!this.grid) {
            this.grid = this.getGrid();
        }

        // handle case scroll where scrollbars appear during drag
        var cw = portal.body.dom.clientWidth;
        if (!this.lastCW) {
            // set initial client width
            this.lastCW = cw;
        } else if (this.lastCW != cw) {
            // client width has changed, so refresh layout & grid calcs
            this.lastCW = cw;
            //portal.doLayout();
            this.grid = this.getGrid();
        }

        // determine column
        var colIndex = 0,
            colRight = 0,
            cols = this.grid.columnX,
            len = cols.length,
            cmatch = false;

        for (len; colIndex < len; colIndex++) {
            colRight = cols[colIndex].x + cols[colIndex].w;
            if (xy[0] < colRight) {
                cmatch = true;
                break;
            }
        }
        // no match, fix last index
        if (!cmatch) {
            colIndex--;
        }

        // find insert position
        var overPortlet, pos = 0,
            h = 0,
            match = false,
            overColumn = portal.items.getAt(colIndex),
            portlets = overColumn.items.items,
            overSelf = false;

        len = portlets.length;

        for (len; pos < len; pos++) {
            overPortlet = portlets[pos];
            h = overPortlet.el.getHeight();
            if (h === 0) {
                overSelf = true;
            } else if ((overPortlet.el.getY() + (h / 2)) > xy[1]) {
                match = true;
                break;
            }
        }

        pos = (match && overPortlet ? pos : overColumn.items.getCount()) + (overSelf ? -1 : 0);
        var overEvent = this.createEvent(dd, e, data, colIndex, overColumn, pos);

        if (portal.fireEvent('validatedrop', overEvent) !== false && portal.fireEvent('beforedragover', overEvent) !== false) {

            // make sure proxy width is fluid in different width columns
            proxy.getProxy().setWidth('auto');
            if (overPortlet) {
                dd.panelProxy.moveProxy(overPortlet.el.dom.parentNode, match ? overPortlet.el.dom : null);
            } else {
                dd.panelProxy.moveProxy(overColumn.el.dom, null);
            }

            this.lastPos = {
                c: overColumn,
                col: colIndex,
                p: overSelf || (match && overPortlet) ? pos : false
            };
            this.scrollPos = portal.body.getScroll();

            portal.fireEvent('dragover', overEvent);
            return overEvent.status;
        } else {
            return overEvent.status;
        }

    },

    notifyOut: function() {
        delete this.grid;
    },

    notifyDrop: function(dd, e, data) {
        delete this.grid;
        if (!this.lastPos) {
            return;
        }
        var c = this.lastPos.c,
            col = this.lastPos.col,
            pos = this.lastPos.p,
            panel = dd.panel,
            dropEvent = this.createEvent(dd, e, data, col, c, pos !== false ? pos : c.items.getCount());

        if (this.portal.fireEvent('validatedrop', dropEvent) !== false && 
            this.portal.fireEvent('beforedrop', dropEvent) !== false) {

            Ext.suspendLayouts();
            
            // make sure panel is visible prior to inserting so that the layout doesn't ignore it
            panel.el.dom.style.display = '';
            dd.panelProxy.hide();
            dd.proxy.hide();

            if (pos !== false) {
                c.insert(pos, panel);
            } else {
                c.add(panel);
            }

            Ext.resumeLayouts(true);

            this.portal.fireEvent('drop', dropEvent);

            // scroll position is lost on drop, fix it
            var st = this.scrollPos.top;
            if (st) {
                var d = this.portal.body.dom;
                setTimeout(function() {
                    d.scrollTop = st;
                },
                10);
            }
        }
        
        delete this.lastPos;
        return true;
    },

    // internal cache of body and column coords
    getGrid: function() {
        var box = this.portal.body.getBox();
        box.columnX = [];
        this.portal.items.each(function(c) {
            box.columnX.push({
                x: c.el.getX(),
                w: c.el.getWidth()
            });
        });
        return box;
    },

    // unregister the dropzone from ScrollManager
    unreg: function() {
        Ext.dd.ScrollManager.unregister(this.portal.body);
        GreenFleet.view.portlet.PortalDropZone.superclass.unreg.call(this);
    }
});

Ext.define('GreenFleet.view.portlet.GridI1Portlet', {
	
    extend: 'Ext.grid.Panel',
    
    alias: 'widget.grid_i1_portlet',    
        
    stripeRows: true,
    
    columnLines: true,
    
    store : Ext.create('Ext.data.ArrayStore', {
		fields: [ { name : 'datetime', type : 'date', dateFormat:'time' }, 
		          { name : 'vehicle_id', type : 'string' },
		          { name : 'driver_id', type : 'string' },
		          { name : 'location', type : 'string' },
		          { name : 'lat', type : 'number' },
		          { name : 'lng', type : 'number' },
		          { name : 'velocity', type : 'number' } ], data: []}),
    
    columns: [{
        text     : T('label.datetime'),
        sortable : true,
        dataIndex: 'datetime',
		xtype : 'datecolumn',
		format : F('datetime'),
		width : 110
    },{
        text     : T('label.vehicle'),
        width    : 60,
        dataIndex: 'vehicle_id'
    },{
        text     : T('label.velocity'),
        width    : 50,
        dataIndex: 'velocity'
    },{
        text     : T('label.location'),
        width    : 200,
        dataIndex : 'location'
    }],
    
    initComponent: function() {
    	var self = this;
        this.callParent(arguments);        
        this.reload();
    },
    
    reload : function() {
    	var self = this;
    	this.setLoading(true);
    	Ext.Ajax.request({
		    url: '/incident',
		    method : 'GET',
		    params : { 
		    	page : 1, 
		    	limit : 5,
		    	select : ['datetime', 'vehicle_id', 'driver_id', 'velocity', 'lat', 'lng'],
		    	filter : Ext.JSON.encode([{property : 'confirm', value : false}]),
		    	sort : Ext.JSON.encode([{property : 'datetime',	direction : 'DESC' }])
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	self.convert(records);
					Ext.defer(function() {self.setLoading(false);}, 100);
					
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
    },
    
    convert : function(records) {
    	var self = this;
    	Ext.each(records, function(record) {
    		if(record.lat !== undefined && record.lng !== undefined) {
    			var latlng = new google.maps.LatLng(record.lat, record.lng);
    			geocoder = new google.maps.Geocoder();
    			geocoder.geocode({
    				'latLng' : latlng
    			}, function(results, status) {
    				if (status == google.maps.GeocoderStatus.OK) {
    					if (results[0]) {
    						var address = results[0].formatted_address;
    						record.location = address;
    						self.store.loadData(records);
    					}
    				} else {
    					console.log("Geocoder failed due to: " + status);
    				}
        		});    			
    		}
    	});    	    	
    }
});

Ext.define('GreenFleet.view.portlet.GridVG1Portlet', {
    extend: 'Ext.panel.Panel',
    
    alias: 'widget.grid_vg1_portlet',
        
    layout : {
        type: 'accordion',
        animate: true
    },
    
    animCollapse: true,
    
    split: true,
    
    //collapsible: true,
    
    year : null,
    
    month : null,
    
    initComponent : function() {
    	this.callParent(arguments);
    	if(!this.year) {
    		var today = new Date();
    		this.year = today.getFullYear();
    		this.month = today.getMonth() + 1;
    	} 
    	//this.title = '차량 그룹별 운행 정보 [' + this.year + '-' + this.month + ']';
    	this.addVehicleGroupTab(this);
    },
    
    reload : function() {
    	this.addVehicleGroupTab(this);
    },
    
    addVehicleGroupTab : function(main) {
    	Ext.getStore('VehicleGroupStore').load({
    		scope : main,
    		callback: function(records, operation, success) {    			
    			Ext.each(records, function(record) {
    				var idx = 0;
    				var accTab = {
    					items : main.addVehicleGroupContent(main, record),
			            title : record.data.desc,
			            autoScroll : true,
			            border : true,
			            iconCls : 'nav',
			            isLoaded : false,
			            seqOrder : idx++,
			            listeners: {
			            	expand : function(pnl) {
			            		if(!pnl.isLoaded) {
			            			main.loadData(main, pnl.items.items[0].store, record);
			            			pnl.isLoaded = true;
			            		}
							}
						}
    				};
    				
    				main.add(accTab);    				
    				if(idx == 1) {
    					main.loadData(main, accTab.items.store, record);
    					accTab.isLoaded = true;
    				}
    			});
    	    }	
    	});
    },
    
    addVehicleGroupContent : function(main, record) {    	
    	var content = {
    		xtype : 'gridpanel',
            store: Ext.create('Ext.data.Store', {
    			fields : [ 'vehicle_id', 'run_time', 'run_dist', 'consmpt' ], 
    			data : []
    		}),
            stripeRows: true,
            columnLines: true,
            columns: [{
                text   : T('label.vehicle'),
                width    : 60,
                sortable : true,
                dataIndex: 'vehicle_id'
            },{
                text   : T('label.run_time'),
                width    : 70,
                sortable : true,
                renderer : function(val) {
                	return val + ' (' + T('label.minute_s') + ')';
                },
                dataIndex: 'run_time'
            },{
                text   : T('label.run_dist'),
                width    : 70,
                sortable : true,
                renderer : function(val) {
                	return val + ' (km)';
                },
                dataIndex: 'run_dist'
            },{
                text   : T('label.fuel_consumption'),
                width    : 70,
                sortable : true,
                renderer : function(val) {
                	return val + ' (l)';
                },
                dataIndex: 'consmpt'            	
            }]
    	};
    	
    	return content;
    },
    
    loadData : function(main, store, record) {
    	
		Ext.Ajax.request({
		    url: '/report/vehicle_group',
		    method : 'GET',
		    params: {
		        group_id: record.data.id,			        
		        report_type : 'run_summary',
		        year : main.year,
		        month : main.month
		    },
		    success: function(response) {
		        var resultObj = Ext.JSON.decode(response.responseText);
		        if(resultObj.success) {
		        	var runDataArr = resultObj.items;
		        	var total = { 'vehicle_id' : 'Total', 'run_time' : 0, 'run_dist' : 0, 'consmpt' : 0 };
		        	Ext.each(runDataArr, function(runData) {
		        		total.run_time += runData.run_time;
		        		total.run_dist += runData.run_dist;
		        		total.consmpt += runData.consmpt;
		        	}) ;
		        	runDataArr.push(total);
		        	store.loadData(runDataArr);		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
    }
});

Ext.define('GreenFleet.view.portlet.GridDG1Portlet', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.grid_dg1_portlet',
    title : '운전자 그룹별 정보',
    layout : {
        type: 'accordion',
        animate: true
    },
    animCollapse: true,
    split: true,
    collapsible: true,    
    initComponent : function() {
    	this.callParent(arguments);
    	this.addDriverGroupTab(this);
    },
    
    addDriverGroupTab : function(main) {
    	Ext.getStore('DriverGroupStore').load({
    		scope : main,
    		callback: function(records, operation, success) {
    			Ext.each(records, function(record) {
    				main.add({
			        	html: main.addDriverGroupContent(main, record),
			            title: record.data.desc,
			            autoScroll: true,
			            border: true,
			            iconCls: 'nav'
    				});
    			});
    	    }	
    	});
    },
    
    addDriverGroupContent : function(main, record) {
    	return "<div>" + record.data.desc + " 그룹 차량 운행 정보 서머리</div>";
    }
});

Ext.define('GreenFleet.view.portlet.ChartV1Portlet', {

	extend: 'Ext.panel.Panel',
    
	alias: 'widget.chart_v1_portlet',
	
	chartType : 'health',
	
	chartPanel : null,
	
    initComponent: function() {
    	var self = this;
        this.callParent(arguments);
        this.chartPanel = this.healthChart();
        this.add(this.chartPanel);
        this.reload();
    },
    
    reload : function() {
    	var self = this;
    	this.setLoading(true);
    	Ext.Ajax.request({
    		url: '/report/service',
		    method : 'GET',
		    params : { id : 'vehicle_health', health_type : self.chartType },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
					var healthRecord = self.findRecord(records, self.chartType);
					self.chartPanel.items[0].store.loadData(healthRecord.summary);
					Ext.defer(function() {self.setLoading(false);}, 100);					
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});    	
    },
    
	findRecord : function(records, chartType) {
		for(var i = 0 ; i < records.length ; i++) {
			if(records[i].name == chartType)
				return records[i];
		}
		return null;
	},
	
    healthChart : function() {
    	var self = this;
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard',
			height : self.height - 5,
			items : [{
				xtype: 'chart',
		        animate: true,
		        store: Ext.create('Ext.data.ArrayStore', {
					fields: [ {
				        name : 'name', type : 'string',
				        convert : function(value, record) {
				        	if(self.chartType == 'health')
				        		return T('label.' + value);
				        	else
				        		return value;
				        }
					},  'value'], data: []}),
				width : 245,
				height : self.height - 20,
		        shadow: false,
		        legend: {
		            position: 'right',
		            labelFont : '6px',
		            boxStroke : '#cfcfcf'
		        },
		        insetPadding: 10,
		        theme: 'Base:gradients',
		        series: [{
		            type: 'pie',
		            field: 'value',
		            showInLegend: true,
		            donut: false,
		            tips: {
		              trackMouse: true,
		              width: 140,
		              height: 25,
		              renderer: function(storeItem, item) {
		            	  var total = 0;
		            	  self.chartPanel.items[0].store.each(function(rec) {
		            		  total += rec.get('value');
		            	  });
		            	  var name = storeItem.get('name');
		            	  var count = storeItem.get('value');
		            	  var percent = Math.round(count / total * 100);
		            	  this.setTitle(name + ' : ' + count + '(' + percent + '%)');
		              }
		            },
		            highlight: {
		              segment: {
		                margin: 5
		              }
		            },
		            label: {
		                field: 'name',
		                display: 'rotate',
		                contrast: true,
		                font: '10px Arial'
		            }
		        }]
			}]
		}
	}
});

Ext.define('GreenFleet.view.portlet.CalendarPortlet', {
	
	extend : 'Ext.panel.Panel',

	alias : 'widget.calendar_portlet',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		var calendarPanel = this.buildCalendar(self);
		this.add(calendarPanel);
	},
	
	buildCalendar : function(main) {
		var calendarStore = Ext.getStore('CalendarStore');
		var eventStore = Ext.getStore('EventStore');
		eventStore.load();
		var calendar = Ext.create('Extensible.calendar.CalendarPanel', {
			calendarStore : calendarStore,
	        eventStore: eventStore,
	        flex : 1,
	        readOnly : true,
			showDayView : false,
			showMultiDayView : false,
			showMonthView : false,
			showMultiWeekView : false
	    });		
		return calendar;
	}
});
Ext.define('GreenFleet.view.portlet.GridC1Portlet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.grid_c1_portlet',    
    store : Ext.create('Ext.data.ArrayStore', {
		fields: [ {name : 'vehicle_id', type : 'string' }, 
		          {name : 'consumable_item', type : 'string' },
		          {name : 'health_rate', type : 'float' },
		          {name : 'status', type : 'string' } ], data: []}),
    stripeRows: true,
    columnLines: true,
    columns: [{
        text     : T('label.vehicle'),
        width    : 50,
        sortable : true,
        dataIndex: 'vehicle_id'
    },{
        text     : T('label.consumable_item'),
        width    : 100,
        sortable : true,
        dataIndex: 'consumable_item'
    },{
        text     : T('label.health_rate'),
        width    : 60,
        sortable : true,
        dataIndex: 'health_rate',
        renderer : function(val) {
        	return (Ext.util.Format.number(val * 100, '00')) + ('%');
        }
    },{
        text     : T('label.status'),
        width    : 70,
        sortable : true,
        dataIndex: 'status',
        renderer : function(val) {
        	return T('label.' + val);
        }
    }],
    initComponent: function() {
    	var self = this;
        this.callParent(arguments);        
        this.reload();
    },
    reload : function() {
    	var self = this;
    	this.setLoading(true);
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { id : 'consumables_to_replace', health_rate : 0.98 },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
					self.store.loadData(records);
					Ext.defer(function() {self.setLoading(false);}, 100);
					
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});    	
    }    
});

Ext.define('GreenFleet.view.portlet.GridM1Portlet', {
	
    extend: 'Ext.grid.Panel',
    
    alias: 'widget.grid_m1_portlet',
    
    stripeRows: true,
    
    columnLines: true,
    
    store : Ext.create('Ext.data.ArrayStore', {
		fields: [ { name : 'vehicle_id', type : 'string' },
		          { name : 'next_repair_date', type : 'date', dateFormat:'time' } ], data: []}),
    
    columns: [{
        text     : T('label.repair_date'),
        sortable : true,
        dataIndex: 'next_repair_date',
		xtype : 'datecolumn',
		format : F('date'),
		width : 110
    },{
        text     : T('label.vehicle'),
        width    : 60,
        dataIndex: 'vehicle_id'
    }],
    
    initComponent: function() {
    	var self = this;
        this.callParent(arguments);        
        this.reload();
    },
    
    reload : function() {
    	var self = this;
    	this.setLoading(true);
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	page : 1, 
		    	limit : 5,
		    	select : ['vehicle_id', 'next_repair_date'],
		    	id : 'repair_list'
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
					self.store.loadData(records);
					Ext.defer(function() {self.setLoading(false);}, 100);
					
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});     	
    }
});

Ext.define('GreenFleet.view.portlet.ChartF1Portlet', {

	extend: 'Ext.panel.Panel',
    
	alias: 'widget.chart_f1_portlet',
	
	chartPanel : null,
	
	category : 'vehicle',
	
    initComponent: function() {
    	var self = this;
        this.callParent(arguments);
        this.chartPanel = this.buildChart(370, 230);
        this.add(this.chartPanel);
        this.reload();
    },
    
    reload : function() {
    	var self = this;
    	this.setLoading(true);
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { id : 'fuel', type : 'top5', category : this.category },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
					self.chartPanel.items[0].store.loadData(records);
					Ext.defer(function() {self.setLoading(false);}, 100);
					
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});    	
    },
    
	findRecord : function(records, chartType) {
		for(var i = 0 ; i < records.length ; i++) {
			if(records[i].name == chartType)
				return records[i];
		}
		return null;
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(width, height) {
		var self = this;
		
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard',
			height : height - 5,
			items : [{
				xtype : 'chart',
				animate : true,
		        store: Ext.create('Ext.data.ArrayStore', { fields: [ { name : self.category, type : 'string' },  { name : 'effcc', type : 'double' } ], data: [] }),
				width : width - 35,
				height : height - 45,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: ['effcc'],
	                label: { renderer: Ext.util.Format.numberRenderer('0,0') },
	                title: T('label.fuel_efficiency'),
	                minimum: 0
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: [self.category],
	                title: T('label.' + self.category)
				}],
				series : [{
					type : 'column',
					axis: 'left',
					xField: 'vehicle',
	                yField: 'effcc',
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get(self.category) + ' : ' + storeItem.get('effcc') + '(km/l)');
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : 'effcc',
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}]
			}]
		}
	}	
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
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
		type : 'float'			
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
	}, {
		name : 'grade',
		type : 'string'			
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
		group : 'ReplacementUnit',
		desc : 'Unit of Consumables Replacement Cycle'
	}, {
		group : 'AlarmEventType',
		desc : 'Alarm Event Type'
	}, {
		group : 'AlarmType',
		desc : 'Alarm Type'
	}, {
		group : 'LocationEvent',
		desc : 'Location Event'
	}, {
		group : 'ReportType',
		desc : 'Report Type'
	}, {
		group : 'UserGradeType',
		desc : 'User Grade Type'
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
		name : 'vehicle_model',
		type : 'string'
	}, {
		name : 'fuel_type',
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
		name : 'total_run_time',
		type : 'int'
	}, {
		name : 'remaining_fuel',
		type : 'float'
	}, {
		name : 'driver_id',
		type : 'string'
	}, {
		name : 'terminal_id',
		type : 'string'
	}, {
		name : 'avg_effcc',
		type : 'float'
	}, {
		name : 'official_effcc',
		type : 'float'
	}, {
		name : 'eco_index',
		type : 'int'
	}, {
		name : 'eco_run_rate',
		type : 'int'
	}, {
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
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
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
		type : 'float'
	}, {
		name : 'location',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'vehicle',
		extraParams : {
			select : [ 'id', 'registration_number', 'status', 'driver_id', 'lat', 'lng' ]
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
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
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
		name : 'total_distance',
		type : 'float'
	}, {
		name : 'total_run_time',
		type : 'int'
	}, {
		name : 'avg_effcc',
		type : 'float'
	}, {
		name : 'eco_index',
		type : 'int'
	}, {
		name : 'eco_run_rate',
		type : 'int'
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
		name : 'start_date',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'end_date',
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
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
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

	pageSize : 4,

	remoteFilter : true,

	remoteSort : true,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'datetime',
		type : 'date',
		dateFormat : 'time'
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
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
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
		dateFormat : 'time'
	}, {
		name : 'updated_at',
		type : 'date',
		dateFormat : 'time'
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
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
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
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
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
		name : 'lat',
		type : 'float'
	}, {
		name : 'lng',
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
		"status" : "",
		"desc" : "-"
	}, {
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
		property : 'engine_end_time',
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
		name : 'lat',
		type : 'number'
	}, {
		name : 'lng',
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

    fields: [{
        name: 'key',
        type: 'string'
    },
    {
        name: 'datetime',
        type: 'date',
        dateFormat: 'time'
    },
    {
        name: 'terminal_id',
        type: 'string'
    },
    {
        name: 'vehicle_id',
        type: 'string'
    },
    {
        name: 'driver_id',
        type: 'string'
    },
    {
        name: 'lat',
        type: 'float'
    },
    {
        name: 'lng',
        type: 'float'
    },    
    {
        name: 'velocity',
        type: 'float'
    },
    {
        name: 'impulse_abs',
        type: 'float'
    },
    {
        name: 'impulse_x',
        type: 'float'
    },
    {
        name: 'impulse_y',
        type: 'float'
    },
    {
        name: 'impulse_z',
        type: 'float'
    },
    {
        name: 'impulse_threshold',
        type: 'float'
    },
    {
        name: 'obd_connected',
        type: 'boolean'
    },
    {
        name: 'confirm',
        type: 'boolean'
    },
    {
        name: 'engine_temp',
        type: 'float'
    },
    {
        name: 'engine_temp_threshold',
        type: 'float'
    },
    {
        name: 'video_clip',
        type: 'string'
    },
    {
        name: 'created_at',
        type: 'date',
        dateFormat: 'time'
    },
    {
        name: 'updated_at',
        type: 'date',
        dateFormat: 'time'
    }],

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
		type : 'string',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'vehicle_id',
		type : 'string'
	}, {
		name : 'driver_id',
		type : 'string'
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

	autoLoad : false,

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
		display : "(GMT -1:00) Azores, Cape Verde Islands"
	}, {
		value : 0.0,
		display : "(GMT) Western Europe Time, London, Lisbon, Casablanca"
	}, {
		value : 1.0,
		display : "(GMT +1:00) Brussels, Copenhagen, Madrid, Paris"
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
	
	pageSize : 10,
	
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
Ext.define('GreenFleet.store.VehicleByGroupStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 10,
	
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
		name : 'status',
		type : 'string'
	}, {
		name : 'image_clip',
		type : 'string'
	} ],

	proxy : {
		type : 'ajax',
		url : 'vehicle',
		extraParams : {
			select : [ 'id', 'registration_number', 'status', 'image_clip' ]
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
			name : 'repair_time',
			type : 'int'				
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
		url : 'report/service',
		extraParams : {
			id : 'vehicle_health',
			health_type : 'consumable_health'
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
		url : 'report/service',
		extraParams : {
			id : 'vehicle_health'
		},
		reader : {
			type : 'json',
			root : 'items'
		}
	}
});
Ext.define('GreenFleet.store.LocationStore', {
	extend : 'Ext.data.Store',

	storeId : 'location_store',
		
	fields : [ {
			name : 'key',
			type : 'string' 
	    }, {
			name : 'name',
			type : 'string'
		}, {
			name : 'addr',
			type : 'string'
		}, {
			name : 'lat',
			type : 'float'
		}, {
			name : 'lng',
			type : 'float'
		}, {
			name : 'rad',
			type : 'int'
		}, {
			name : 'lat_lo',
			type : 'float'
		}, {
			name : 'lat_hi',
			type : 'float'
		}, {
			name : 'lng_lo',
			type : 'float'
		}, {
			name : 'lng_hi',
			type : 'float'				
		}, {
			name : 'expl',
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

	pageSize : 20,
	
	sorters : [ {
		property : 'updated_at',		
		direction : 'DESC'
	} ],	

	proxy : {
		type : 'ajax',
		url : 'location',		
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}	
	}
});
Ext.define('GreenFleet.store.AlarmStore', {
	extend : 'Ext.data.Store',

	storeId : 'alarm_store',
	
	fields : [ 
	    {
			name : 'key',
			type : 'string'	          
	    }, {
			name : 'name',
			type : 'string'
		}, {
			name : 'evt_type',
			type : 'string'
		}, {
			name : 'evt_name',
			type : 'string'
		}, {
			name : 'evt_trg',
			type : 'string'
		}, {
			name : 'type',
			type : 'string'
		}, {
			name : 'always',
			type : 'boolean'
		}, {
			name : 'enabled',
			type : 'boolean'
		}, {
			name : 'from_date',
			type : 'date',
			dateFormat:'time'
		}, {
			name : 'to_date',
			type : 'date',
			dateFormat:'time'
		}, {
			name : 'vehicles',
			type : 'string'
		}, {
			name : 'dest',
			type : 'string'
		}, {
			name : 'msg',
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

	pageSize : 20,
	
	sorters : [ {
		property : 'updated_at',	
		direction : 'DESC'
	} ],

	proxy : {
		type : 'ajax',
		url : 'alarm',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.VehicleRunStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'year',
		type : 'integer'
	}, {
		name : 'month',
		type : 'integer'		
	}, {
		name : 'month_str',
		type : 'string'
	}, {
		name : 'time_view',
		type : 'string'
	}, {
		name : 'run_dist',
		type : 'float'
	}, {
		name : 'run_time',
		type : 'integer'
	}, {
		name : 'consmpt',
		type : 'float'
	}, {
		name : 'effcc',
		type : 'float'
	}, {
		name : 'co2_emss',
		type : 'float'
	}, {
		name : 'eco_index',
		type : 'integer'
	}, {
		name : 'sud_accel_cnt',
		type : 'integer'
	}, {
		name : 'sud_brake_cnt',
		type : 'integer'
	}, {
		name : 'eco_drv_time',
		type : 'integer'
	}, {
		name : 'ovr_spd_time',
		type : 'integer'
	}, {
		name : 'idle_time',
		type : 'integer'
	}, {
		name : 'inc_cnt',
		type : 'integer'
	}, {
		name : 'oos_cnt',
		type : 'integer'
	}, {
		name : 'mnt_cnt',
		type : 'integer'
	}, {
		name : 'mnt_time',
		type : 'integer'
	} ],
	
	sorters : [ {
		property : 'year',
		direction : 'ASC'
	},{
		property : 'month',
		direction : 'ASC'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_run',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.DriverRunStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	fields : [ {
		name : 'driver',
		type : 'string'
	}, {
		name : 'year',
		type : 'integer'
	}, {
		name : 'month',
		type : 'integer'
	}, {
		name : 'month_str',
		type : 'string'
	}, {
		name : 'time_view',
		type : 'string'
	}, {
		name : 'run_dist',
		type : 'float'
	}, {
		name : 'run_time',
		type : 'integer'
	}, {
		name : 'consmpt',
		type : 'float'
	}, {
		name : 'co2_emss',
		type : 'float'
	}, {
		name : 'effcc',
		type : 'float'
	}, {
		name : 'eco_index',
		type : 'integer'
	}, {
		name : 'sud_accel_cnt',
		type : 'integer'
	}, {
		name : 'sud_brake_cnt',
		type : 'integer'
	}, {
		name : 'eco_drv_time',
		type : 'integer'
	}, {
		name : 'ovr_spd_time',
		type : 'integer'
	}, {
		name : 'idle_time',
		type : 'integer'
	}, {
		name : 'inc_cnt',
		type : 'integer'
	} ],
	
	sorters : [ {
		property : 'year',
		direction : 'ASC'
	},{
		property : 'month',
		direction : 'ASC'
	} ],	
	
	proxy : {
		type : 'ajax',
		url : 'driver_run',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.DriverSpeedStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	fields : [ {
		name : 'driver',
		type : 'string'
	}, {
		name : 'year',
		type : 'integer'
	}, {
		name : 'month',
		type : 'integer'
	}, {
		name : 'month_str',
		type : 'string'
	}, {
		name : 'time_view',
		type : 'string'
	}, {
		name : 'spd_lt10',
		type : 'integer'
	}, {
		name : 'spd_lt20',
		type : 'integer'
	}, {
		name : 'spd_lt30',
		type : 'integer'
	}, {
		name : 'spd_lt40',
		type : 'integer'
	}, {
		name : 'spd_lt50',
		type : 'integer'
	}, {
		name : 'spd_lt60',
		type : 'integer'
	}, {
		name : 'spd_lt70',
		type : 'integer'
	}, {
		name : 'spd_lt80',
		type : 'integer'
	}, {
		name : 'spd_lt90',
		type : 'integer'
	}, {
		name : 'spd_lt100',
		type : 'integer'
	}, {
		name : 'spd_lt110',
		type : 'integer'
	}, {
		name : 'spd_lt120',
		type : 'integer'
	}, {
		name : 'spd_lt130',
		type : 'integer'
	}, {
		name : 'spd_lt140',
		type : 'integer'
	}, {
		name : 'spd_lt150',
		type : 'integer'
	}, {
		name : 'spd_lt160',
		type : 'integer'
	} ],
	
	sorters : [ {
		property : 'year',
		direction : 'ASC'
	}, {
		property : 'month',
		direction : 'ASC'
	} ],	
	
	proxy : {
		type : 'ajax',
		url : 'driver_speed',
		extraParams : {
			select : [ 'driver', 'year', 'month', 'month_str', 'spd_lt10', 'spd_lt20', 'spd_lt30', 'spd_lt40', 'spd_lt50', 'spd_lt60', 'spd_lt70', 'spd_lt80', 'spd_lt90', 'spd_lt100', 'spd_lt110', 'spd_lt120', 'spd_lt130', 'spd_lt140', 'spd_lt150', 'spd_lt160' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.YearStore', {
	extend : 'Ext.data.Store',

	fields : [ 'year' ],

	data : [ { "year" : 2001 },
	         { "year" : 2002 },
	         { "year" : 2003 },
	         { "year" : 2004 },
	         { "year" : 2005 },
	         { "year" : 2006 },
	         { "year" : 2007 },
	         { "year" : 2008 },
	         { "year" : 2009 },
	         { "year" : 2010 },
	         { "year" : 2011 },
	         { "year" : 2012 } ]
});
Ext.define('GreenFleet.store.MonthStore', {
	extend : 'Ext.data.Store',

	fields : [ 'month' ],

	data : [ { "month" : 1 },
	         { "month" : 2 },
	         { "month" : 3 },
	         { "month" : 4 },
	         { "month" : 5 },
	         { "month" : 6 },
	         { "month" : 7 },
	         { "month" : 8 },
	         { "month" : 9 },
	         { "month" : 10 },
	         { "month" : 11 },
	         { "month" : 12 } ]
});
Ext.define('GreenFleet.store.DriverGroupStore', {
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
		name : 'drivers',
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
		url : 'driver_group',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.DriverByGroupStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 10,
	
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
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'driver_group/drivers',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total',
			successProperty : 'success'
		}
	}
});
Ext.define('GreenFleet.store.VehicleGroupCountStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	pageSize : 10,
	
	fields : [ {
		name : 'id',
		type : 'string'
	}, {
		name : 'expl',
		type : 'string'
	}, {
		name : 'count',
		type : 'integer'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_group/group_count',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.CalendarStore', {
	extend : 'Extensible.calendar.data.MemoryCalendarStore',

	storeId : 'calendar_store',
	
	autoLoad: true,
	
	data : {
        "calendars" : [{
            "id"    : 1,
            "title" : "Maintenence",
            "color" : 2
        },{
            "id"    : 2,
            "title" : "Consumables",
            "color" : 22
        },{
            "id"    : 3,
            "title" : "Reservation",
            "color" : 7
        },{
            "id"    : 4,
            "title" : "Task",
            "color" : 26
        }]
    }

});
Ext.define('GreenFleet.store.EventStore', {
	extend : 'Extensible.calendar.data.EventStore',

	storeId : 'event_store',
	
	autoLoad: true,
	
	proxy : {
		type : 'ajax',
		url : 'task',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		},
		writer: {
			url : 'task',
            type: 'json',
            nameProperty: 'mapping'
        },
        listeners: {
            exception: function(proxy, response, operation, options) {
                //var msg = response.message ? response.message : Ext.decode(response.responseText).message;
                Ext.Msg.alert('Server Error', response.responseText);
            }
        }
	},
	
	listeners: {
		beforesync: function(options, eOpts) {
			if(options.destroy) {
				this.getProxy().extraParams.mode = 'destroy';
			} 
			
			if(options.update) {
				this.getProxy().extraParams.mode = 'update';
			}
			
			if(options.create) {
				this.getProxy().extraParams.mode = 'create';
			}
        }
    }
});
Ext.define('GreenFleet.store.ReportStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	pageSize : 50,
	
	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'name',
		type : 'string'
	}, {
		name : 'expl',
		type : 'string'
	}, {
		name : 'daily',
		type : 'boolean'
	}, {
		name : 'weekly',
		type : 'boolean'
	}, {
		name : 'monthly',
		type : 'boolean'
	}, {		
		name : 'send_to',
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
		url : 'report',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.store.VehicleSpeedStore', {
	extend : 'Ext.data.Store',

	autoLoad : false,
	
	fields : [ {
		name : 'vehicle',
		type : 'string'
	}, {
		name : 'year',
		type : 'integer'
	}, {
		name : 'month',
		type : 'integer'
	}, {
		name : 'month_str',
		type : 'string'
	}, {
		name : 'time_view',
		type : 'string'
	}, {
		name : 'spd_lt10',
		type : 'integer'
	}, {
		name : 'spd_lt20',
		type : 'integer'
	}, {
		name : 'spd_lt30',
		type : 'integer'
	}, {
		name : 'spd_lt40',
		type : 'integer'
	}, {
		name : 'spd_lt50',
		type : 'integer'
	}, {
		name : 'spd_lt60',
		type : 'integer'
	}, {
		name : 'spd_lt70',
		type : 'integer'
	}, {
		name : 'spd_lt80',
		type : 'integer'
	}, {
		name : 'spd_lt90',
		type : 'integer'
	}, {
		name : 'spd_lt100',
		type : 'integer'
	}, {
		name : 'spd_lt110',
		type : 'integer'
	}, {
		name : 'spd_lt120',
		type : 'integer'
	}, {
		name : 'spd_lt130',
		type : 'integer'
	}, {
		name : 'spd_lt140',
		type : 'integer'
	}, {
		name : 'spd_lt150',
		type : 'integer'
	}, {
		name : 'spd_lt160',
		type : 'integer'
	} ],
	
	sorters : [ {
		property : 'year',
		direction : 'ASC'
	}, {
		property : 'month',
		direction : 'ASC'
	} ],	
	
	proxy : {
		type : 'ajax',
		url : 'vehicle_speed',
		extraParams : {
			select : [ 'vehicle', 'year', 'month', 'month_str', 'spd_lt10', 'spd_lt20', 'spd_lt30', 'spd_lt40', 'spd_lt50', 'spd_lt60', 'spd_lt70', 'spd_lt80', 'spd_lt90', 'spd_lt100', 'spd_lt110', 'spd_lt120', 'spd_lt130', 'spd_lt140', 'spd_lt150', 'spd_lt160' ]
		},
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		}
	}
});
Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller', 

	requires : [ 'GreenFleet.store.IncidentLogChartStore', 'GreenFleet.view.management.Profile', 'GreenFleet.view.common.ImportPopup' ],

	stores : [ 'CompanyStore', 'UserStore', 'CodeGroupStore', 'CodeStore', 'VehicleStore', 'VehicleMapStore', 
	           'VehicleFilteredStore', 'VehicleInfoStore', 'VehicleBriefStore', 'DriverStore', 'DriverBriefStore', 
	           'ReservationStore', 'IncidentStore', 'IncidentByVehicleStore', 'IncidentViewStore', 'IncidentLogStore', 
	           'TrackStore', 'VehicleTypeStore', 'OwnershipStore', 'VehicleStatusStore', 'CheckinDataStore', 
	           'TrackByVehicleStore', 'RecentIncidentStore', 'TerminalStore', 'TerminalBriefStore', 'TimeZoneStore', 
	           'LanguageCodeStore', 'VehicleGroupStore', 'VehicleByGroupStore', 'VehicleImageBriefStore', 
	           'ConsumableCodeStore', 'VehicleConsumableStore', 'ConsumableHistoryStore', 'RepairStore', 
	           'VehicleByHealthStore', 'DashboardConsumableStore', 'DashboardVehicleStore', 'LocationStore', 'AlarmStore', 
	           'VehicleRunStore', 'DriverRunStore', 'DriverSpeedStore', 'YearStore', 'MonthStore', 'DriverGroupStore', 
	           'DriverByGroupStore', 'VehicleGroupCountStore', 'CalendarStore', 'EventStore', 'ReportStore', 'VehicleSpeedStore' ],

	models : [ 'Code' ],

	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 'SideMenu',
	          'common.CodeCombo', 'form.TimeZoneCombo', 'form.DateTimeField', 'common.EntityFormButtons', 
	          'common.ProgressColumn', 'common.MultiSelect', 'common.ItemSelector', 'common.UserSelector',
	          'form.SearchField', 'form.RepairForm', 'overview.Overview', 'pm.Consumable', 'pm.Maintenance',
	          'monitor.Map', 'monitor.InfoByVehicle', 'monitor.Information', 'monitor.IncidentView', 	          
	          'management.Company', 'management.User', 'management.Code', 'management.ConsumableCode', 'management.VehicleGroup',  
	          'management.DriverGroup', 'management.Location', 'management.Alarm', 'management.Report', 
	          'management.Vehicle', 'management.VehicleOverview', 'management.VehicleDetail', 'management.VehicleConsumables', 
	          'management.VehicleIncident', 'management.VehicleTrack', 'management.VehicleCheckin', 
	          'management.VehicleRunStatus', 'management.VehicleSpeedSection', 
	          'management.Driver',  'management.DriverDetail', 'management.DriverRunStatus', 'management.DriverSpeedSection',  
	          'management.Terminal', 'management.Reservation', 'management.Schedule',
	          'dashboard.Reports', 'dashboard.VehicleHealth', 'dashboard.ConsumableHealth', 
	          'dashboard.VehicleRunningSummary', 'dashboard.DriverRunningSummary', 'dashboard.Mttr', 'dashboard.Mtbf', 
	          'dashboard.EfficiencyTrend', 'dashboard.MaintTrend', 'dashboard.EcoDrivingTrend', 'dashboard.DrivingTrend', 
	          'dashboard.Co2emssEcoindex', 'dashboard.EffccConsumption', 'dashboard.ConsumptionEcoindex', 'dashboard.HabitEcoindex',  
	          'portlet.Portlet', 'portlet.PortalPanel', 'portlet.PortalColumn', 'portlet.PortalDropZone', 'portlet.GridI1Portlet', 
	          'portlet.GridVG1Portlet', 'portlet.GridDG1Portlet', 'portlet.ChartV1Portlet', 'portlet.CalendarPortlet', 
	          'portlet.GridC1Portlet',  'portlet.GridM1Portlet', 'portlet.ChartF1Portlet' ],

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



