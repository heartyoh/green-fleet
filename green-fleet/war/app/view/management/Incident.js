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
