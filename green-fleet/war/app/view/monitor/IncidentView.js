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
		
		this.add({
			xtype : 'panel',
			cls : 'pageTitle',
			html : '<h1>Incident : Vehicle ID or Driver ID</h1>',
			height : 35
		});

		var detail = this.add(this.buildForm(this));
		this.form = detail.down('form');
		this.list = this.add(this.buildList(this));
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
	},

	buildForm : function(main) {
		return {
			xtype : 'container',
			bodyPadding : 10,
			autoScroll : true,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [
					{
						xtype : 'panel',
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
										var video = button.up('container').getComponent('video');
										video.getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
									}
								} ]
					}, {
						xtype : 'form',
						flex : 1,
						title : 'Information.',
						autoScroll : true,
						defaults : {
							anchor : '100%'
						},
						items : [ {
							xtype : 'displayfield',
							name : 'key',
							fieldLabel : 'Key',
							hidden : true
						}, {
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
							name : 'lattitude',
							fieldLabel : 'Lattitude'
						}, {
							xtype : 'displayfield',
							name : 'longitude',
							fieldLabel : 'Longitude'
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
									var video = main.form.previousSibling('container').getComponent('video');
									video.update({
										value : value
									});
								}
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

		}
	}
});