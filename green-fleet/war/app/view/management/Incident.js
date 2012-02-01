Ext.define('GreenFleet.view.management.Incident', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_incident',

	title : 'Incident',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	items: {
		html : '<div class="listTitle">Incident List</div>'
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
				format : F('datetime'),
				width : 120
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
			cls : 'hIndexbar',
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
						xtype : 'panel',
						cls : 'incidentVOD paddingLeft10',
						flex : 1,
						layout : {
							type : 'vbox',
							align : 'stretch',
							itemCls : 'test'
						},
						items : [
								{
									xtype : 'box',
									itemId : 'video',
									cls : ' incidentDetail',
									tpl : [ '<video width="100%" height="95%" controls="controls">',
											'<source src="download?blob-key={value}" type="video/mp4" />',
											'Your browser does not support the video tag.', '</video>' ]
								}, {
									xtype : 'box',
									html : '<div class="btnFullscreen"></div>',
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
					xtype : 'tbfill'
				},{
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
