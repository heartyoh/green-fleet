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
					format : F('datetime'),
					allowBlank : false,
					afterLabelTextTpl: required			
				}, {
					xtype : 'textfield',
					name : 'vehicle_id',
					fieldLabel : T('label.vehicle'),
					allowBlank : false,
					afterLabelTextTpl: required
				}, {
					xtype : 'combo',
					name : 'driver_id',
					queryMode : 'local',
					store : 'DriverBriefStore',
					displayField : 'id',
					valueField : 'id',
					fieldLabel : T('label.driver'),
					allowBlank : false,
					afterLabelTextTpl: required
				}, {
					xtype : 'combo',
					name : 'terminal_id',
					queryMode : 'local',
					store : 'TerminalStore',
					displayField : 'id',
					valueField : 'id',
					fieldLabel : T('label.terminal'),
					allowBlank : false,
					afterLabelTextTpl: required
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
