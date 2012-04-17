Ext.define('GreenFleet.view.management.DriverRunStatus', {
	extend : 'Ext.Container',

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
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    { html : "<div class='listTitle'>" + T('title.driver_runstatus') + "</div>"}, 
		    {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'hbox',
					align : 'stretch'
				},
				items : [ 
				    this.zvehiclelist(self), 
				    {
						xtype : 'container',
						flex : 1,
						cls : 'borderRightGray',
						layout : {
							align : 'stretch',
							type : 'vbox'
						},
						items : [ this.zrunstatus, this.zrunstatus_chart ]
					} 
				]
		    }
		],

		this.callParent();

		this.sub('driver_list').on('itemclick', function(grid, record) {
			var runStatusStore = self.sub('runstatus_grid').store;
			var proxy = runStatusStore.getProxy();
			proxy.extraParams.driver = record.data.id;
			proxy.extraParams.from_date = self.sub('from_date').getValue();
			proxy.extraParams.to_date = self.sub('to_date').getValue();
			runStatusStore.load({
				scope : self,
				callback : function() {					
					self.refreshChart(runStatusStore, 'run_dist');
					self.sub('combo_chart').setValue('run_dist');
				}
			});
		});
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
		
		/**
		 * Vehicle Id 검색 조건 변경시 Vehicle 데이터 Local filtering
		 */
		this.sub('id_filter').on('change', function(field, value) {
			self.searchDrivers(false);
		});

		/**
		 * Vehicle Reg No. 검색 조건 변경시 Vehicle 데이터 Local filtering 
		 */
		this.sub('name_filter').on('change', function(field, value) {
			self.searchDrivers(false);
		});		
	},
	
	searchDrivers : function(searchRemote) {
		
		if(searchRemote) {
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
	
	zvehiclelist : function(self) {
		return {
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
			} ],

			tbar : [
			    T('label.id'),
				{
					xtype : 'textfield',
					name : 'id_filter',
					itemId : 'id_filter',
					width : 60
				}, 
				T('label.name'),
				{
					xtype : 'textfield',
					name : 'name_filter',
					itemId : 'name_filter',
					width : 65
				},
				' ',
				{
					xtype : 'button',
					text : T('button.search'),
					handler : function(btn) {
						btn.up('management_driver_runstatus').searchDrivers(true);
					}
				}
			]
		}
	},

	zrunstatus : {
		xtype : 'grid',
		itemId : 'runstatus_grid',
		store : 'DriverRunStore',
		cls : 'hIndexbar',
		title : T('title.runstatus_history'),
		flex : 1,
		columns : [ {
			header : 'Key',
			dataIndex : 'key',
			hidden : true
		}, {
			dataIndex : 'month',
			text : T('label.datetime'),
			xtype:'datecolumn',
			format:F('date')
		}, {
			header : T('label.run_dist') + ' (km)',
			dataIndex : 'run_dist'
		}, {
			header : T('label.run_time') + ' (min)',
			dataIndex : 'run_time'
		}, {
			header : T('label.fuel_consumption') + ' (l)',
			dataIndex : 'consmpt'
		}, {
			header : T('label.co2_emissions') + ' (g/km)',
			dataIndex : 'co2_emss'
		}, {
			header : T('label.fuel_efficiency') + ' (km/l)',
			dataIndex : 'effcc'
		}, {
			header : T('label.x_count', {x : T('label.sudden_accel')}),
			dataIndex : 'sud_accel_cnt'
		}, {
			header : T('label.x_count', {x : T('label.sudden_brake')}),
			dataIndex : 'sud_brake_cnt'
		}, {
			header : T('label.x_time', {x : T('label.eco_driving')}) + ' (min)',
			dataIndex : 'eco_drv_time'	
		}, {
			header : T('label.x_time', {x : T('label.over_speeding')}) + ' (min)',
			dataIndex : 'ovr_spd_time'
		}, {
			header : T('label.x_count', {x : T('label.incident')}),
			dataIndex : 'inc_cnt'
		} ]
	},

	zrunstatus_chart : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_chart'),
		flex : 1.5,
		autoScroll : true,
		tbar : [
		    { xtype : 'tbfill' },
			T('label.period') + ' : ',
			{
				xtype : 'datefield',
				name : 'from_date',
				itemId : 'from_date',
				format : 'Y-m-d',
				submitFormat : 'U',
				maxValue : new Date(),
				value : Ext.Date.add(new Date(), Ext.Date.YEAR, -1),
				width : 90
			},
			' ~ ',
			{
				xtype : 'datefield',
				name : 'to_date',
				itemId : 'to_date',
				format : 'Y-m-d',
				submitFormat : 'U',
				maxValue : new Date(),
				value : new Date(),
				width : 90
			},		    
		    '  ' + T('label.chart') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',				
				store :  Ext.create('Ext.data.Store', { 
					fields : [ 'name', 'desc', 'unit' ],					
					data : [{ "name" : "run_dist", 		"desc" : T('label.run_dist'), 								"unit" : "(km)" },
					        { "name" : "run_time", 		"desc" : T('label.run_time'), 								"unit" : "(min)" },
							{ "name" : "consmpt", 		"desc" : T('label.fuel_consumption'), 						"unit" : "(l)" },
							{ "name" : "co2_emss", 		"desc" : T('label.co2_emissions'), 							"unit" : "(g/km)" },
							{ "name" : "effcc", 		"desc" : T('label.fuel_efficiency'), 						"unit" : "(km/l)" },
							{ "name" : "sud_accel_cnt", "desc" : T('label.x_count', {x : T('label.sudden_accel')}), "unit" : "" },
							{ "name" : "sud_brake_cnt", "desc" : T('label.x_count', {x : T('label.sudden_brake')}),	"unit" : "" },
							{ "name" : "eco_drv_time", 	"desc" : T('label.x_time', {x : T('label.eco_driving')}), 	"unit" : "(min)" },
							{ "name" : "ovr_spd_time",  "desc" : T('label.x_time', {x : T('label.over_speeding')}), "unit" : "(min)" },
							{ "name" : "inc_cnt",  		"desc" : T('label.x_count', {x : T('label.incident')}), 	"unit" : "" },
							{ "name" : "driving_habit", "desc" : T('label.driving_habit'), 							"unit" : "" }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_driver_runstatus');
						var runStatusStore = thisView.sub('runstatus_grid').store;
						
						if(currentValue != 'driving_habit')
							thisView.refreshChart(runStatusStore, currentValue);
						else
							thisView.refreshRadarChart(runStatusStore);
					}
			    }
			}, 
			'  '
		]
	},
	
	refreshChart : function(store, yField) {
		
		var chartTypeArr = this.sub('combo_chart').store.data;
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
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildChart(store, yField, yTitle, unit, 0, width, height);
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	refreshRadarChart : function(store) {
		
		var totalRecordCnt = 0;
		var ecoDrvTime = 0;
		var efficiency = 0;
		var overSpdCnt = 0;
		var sudAccelCnt = 0;
		var sudBrakeCnt = 0;
		
		store.each(function(record) {
			if(record.get('driver'))
				totalRecordCnt += 1;
			
			if(record.get('eco_drv_time'))
				ecoDrvTime += record.get('eco_drv_time');
			
			if(record.get('effcc'))
				efficiency += record.get('effcc');
			
			if(record.get('ovr_spd_time'))
				overSpdCnt += record.get('ovr_spd_time');
			
			if(record.get('sud_accel_cnt'))
				sudAccelCnt += record.get('sud_accel_cnt');
			
			if(record.get('sud_brake_cnt'))
				sudBrakeCnt += record.get('sud_brake_cnt');			
		});
		
		ecoDrvTime = ecoDrvTime / totalRecordCnt;
		efficiency = efficiency / totalRecordCnt;
		overSpdCnt = overSpdCnt / totalRecordCnt;
		sudAccelCnt = sudAccelCnt / totalRecordCnt;
		sudBrakeCnt = sudBrakeCnt / totalRecordCnt;
		
		var radarData = [
		    { 'name' : 'eco_drv_time',  'desc' : T('label.x_time', {x : T('label.eco_driving')}), 	'value' : ecoDrvTime },
		    { 'name' : 'effcc', 		'desc': T('label.fuel_efficiency'), 						'value' : efficiency },
		    { 'name' : 'ovr_spd_time', 	'desc': T('label.x_time', {x : T('label.over_speeding')}), 	'value' : overSpdCnt },
		    { 'name' : 'sud_accel_cnt', 'desc': T('label.x_count', {x : T('label.sudden_accel')}), 	'value' : sudAccelCnt },
		    { 'name' : 'sud_brake_cnt', 'desc': T('label.x_count', {x : T('label.sudden_brake')}),	'value' : sudBrakeCnt },
		];
		
		var radarStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'desc', 'value' ],
			autoDestroy : true,
			data : radarData
		});		
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildRadar(radarStore, width, height);
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	resizeChart : function(width, height) {
		
		var chartContainer = this.sub('chart_panel');		
		if(!width)
			width = chartContainer.getWidth();		
		if(!height)
			height = chartContainer.getHeight();		
		
		var chartPanel = chartContainer.down('panel');
		var chart = chartPanel.down('chart');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 70);
		chart.setWidth(width - 25);
		chart.setHeight(height - 85);
	},
	
	buildRadar : function(store, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 70,
			items : [
				{
					xtype : 'chart',
					animate : true,
					store : store,
					width : width - 50,
					height : height - 85,
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
		                title : 'desc',
		                style: {
		                    opacity: 0.4
		                },
		                markerConfig: {
		                    radius: 5,
		                    size: 5
		                },
		                tips: {
		                	trackMouse: true,
		                	width: 140,
		                	height: 28,
		                	renderer: function(storeItem, item) {
		                		this.setTitle(storeItem.get('name') + ': ' + storeItem.get('value'));
		                	}
	                	},
		            }]
				}
			]
		};
	},
	
	buildChart : function(store, yField, yTitle, unit, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 70,
			items : [ 
				{
					xtype : 'chart',
					animate : true,
					store : store,
					width : width - 25,
					height : height - 85,
					shadow : true,
					insetPadding : 15,
					theme : 'Base:gradients',
					axes: [
						{
			                type: 'Numeric',
			                position: 'left',
			                fields: [yField],
			                label: {
			                	renderer: Ext.util.Format.numberRenderer('0,0')
			                },
			                title: yTitle,
			                minimum: minValue
			            }, {
			                type: 'Category',
			                position: 'bottom',
			                fields: ['month'],
			                title: T('label.month'),
			                label: {
			                	renderer: Ext.util.Format.dateRenderer('Y-m')
			                }
			            }
		            ],
					series : [
						{
							type : 'column',
							axis: 'left',
							xField: 'month',
			                yField: yField,
							showInLegend : true,
							tips : {
								trackMouse : true,
								width : 140,
								height : 25,
								renderer : function(storeItem, item) {
									this.setTitle(Ext.util.Format.date(storeItem.get('month'), 'Y-m') + ' : ' + storeItem.get(yField) + unit);
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
								font : '14px Arial',
							},
							listeners : {
								itemmousedown : function(target, event) {
								}
							}
						}
					]
				}
			]
		}
	}	
});