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
			grid.store.load();
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
			self.search(self);
		});

		this.sub('driver_filter').on('change', function(field, value) {
			self.search(self);
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('driver_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
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

	search : function(self) {
		self.sub('grid').store.clearFilter();

		self.sub('grid').store.filter([ {
			property : 'vehicle_id',
			value : self.sub('vehicle_filter').getValue()
		}, {
			property : 'driver_id',
			value : self.sub('driver_filter').getValue()
		} ]);
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
									itemId : 'video',
									cls : 'incidentDetail',
									tpl : [ '<video width="100%" height="95%" controls="controls">', '<source {value} type="video/mp4" />',
											'Your browser does not support the video tag.', '</video>' ]
								}, {
									xtype : 'box',
									html : '<div class="btnFullscreen"></div>',
									handler : function(button) {
										if (!Ext.isWebKit)
											return;
										var video = button.up('container').getComponent('video');
										video.getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
									}
								} ]
					} ],

			dockedItems : [ {
				xtype : 'entity_form_buttons',
			} ]
		}
	}
});
