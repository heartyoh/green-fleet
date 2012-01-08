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

		/*
		 * Content
		 */
		var incident = this.add({
			xtype : 'container',
			autoScroll : true,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			flex : 1
		});

		incident.add(this.buildInfo(this));
		incident.add(this.buildVideoAndMap(this));

		this.add(this.buildList(this));
		
		var map = this.down('[itemId=map]');
		map.on('afterrender', function() {
			var options = {
				zoom : 10,
				center : new google.maps.LatLng(37.56, 126.97),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			map = new google.maps.Map(map.getEl().down('.map').dom, options);
		});
	},

	buildInfo : function(main) {
		return {
			xtype : 'form',
			title : 'Incident Information.',
			height : 40,
			autoScroll : true,
			defaults : {
				anchor : '100%'
			},
			items : [ {
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
				name : 'impulse',
				fieldLabel : 'Impulse'
			}, {
				xtype : 'displayfield',
				name : 'videoClip',
				hidden : true,
				listeners : {
					change : function(field, value) {
						var video = main.down('[itemId=video]');
						video.update({
							value : value
						});
					}
				}
			} ]
		};
	},

	buildVideoAndMap : function(main) {
		return {
			xtype : 'container',
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [
					{
						xtype : 'panel',
						bodyPadding : 10,
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
										var video = button.previousSibling('box');
										video.getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
									}
								} ]
					}, {
						xtype : 'panel',
						title : 'Position of Incident',
						flex : 1,
						itemId : 'map',
						html : '<div class="map" style="height:100%"></div>'
					} ]
		};
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
	}
});