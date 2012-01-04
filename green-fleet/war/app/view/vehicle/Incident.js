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
			xtype : 'form',
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
						xtype : 'container',
						flex : 1,
						layout : {
							type : 'vbox',
							align : 'stretch'
						},
						items : [ {
							xtype : 'textfield',
							name : 'key',
							fieldLabel : 'Key',
							anchor : '100%',
							hidden : true
						}, {
							xtype : 'datefield',
							name : 'incidentTime',
							fieldLabel : 'Incident Time',
							anchor : '100%',
							submitFormat : 'U'
						}, {
							xtype : 'combo',
							name : 'vehicle',
							queryMode : 'local',
							store : 'VehicleStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : 'Vehicle',
							anchor : '100%'
						}, {
							xtype : 'combo',
							name : 'driver',
							queryMode : 'local',
							store : 'DriverStore',
							displayField : 'id',
							valueField : 'id',
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
							xtype : 'filefield',
							name : 'videoFile',
							fieldLabel : 'Video Upload',
							msgTarget : 'side',
							allowBlank : true,
							anchor : '100%',
							buttonText : 'file...'
						}, {
							xtype : 'datefield',
							name : 'updatedAt',
							disabled : true,
							fieldLabel : 'Updated At',
							format : 'd-m-Y H:i:s',
							anchor : '100%'
						}, {
							xtype : 'datefield',
							name : 'createdAt',
							disabled : true,
							fieldLabel : 'Created At',
							format : 'd-m-Y H:i:s',
							anchor : '100%'
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
									tpl : [ '<video controls="controls">',
											'<source src="download?blob-key={value}" type="video/mp4" />',
											'Your browser does not support the video tag.', '</video>' ]
								}, {
									xtype : 'displayfield',
									name : 'videoClip',
									hidden : true,
									listeners : {
										change : function(field, value) {
											var video = field.previousSibling('box');
											video.update({
												value : value
											});
										}
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