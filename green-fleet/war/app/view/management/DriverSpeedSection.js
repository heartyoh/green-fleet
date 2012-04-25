Ext.define('GreenFleet.view.management.DriverSpeedSection', {
	extend : 'Ext.Container',

	alias : 'widget.management_driver_speed',

	title : T('title.driver_speed_section'),

	entityUrl : 'driver_run',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    { html : "<div class='listTitle'>" + T('title.driver_speed_section') + "</div>"}, 
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
					self.setGridTitle(record.get('name'));
					self.setChartTitle();
					self.refreshChart();
				}
			});
		});
		
		this.sub('runstatus_grid').on('itemclick', function(grid, record) {
			self.setChartTitle(record.get('month_str'));
			self.refreshByMonth(record);
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
		
		/**
		 * combo_chart_type에 값을 기본값(column)을 설정
		 */
		this.sub('combo_chart_type').setValue('column');
		/**
		 * combo_view에 값을 기본값(monthly_view)을 설정
		 */
		this.sub('combo_view').setValue('monthly_view');
	},
	
	setGridTitle : function(name) {
		var title = name ? T('title.runstatus_history') + ' (' + name + ') ' : T('title.runstatus_history');
		this.sub('runstatus_grid').setTitle(title);
	},
	
	setChartTitle : function(month) {
		var title = month ? T('label.speed_section') + ' (' + month + ') ' + T('label.chart') : T('label.speed_section') + T('label.chart');
		this.sub('chart_panel').setTitle(title);
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
						btn.up('management_driver_speed').searchDrivers(true);
					}
				}
			]
		}
	},
	
	zrunstatus : {
		xtype : 'gridpanel',
		itemId : 'runstatus_grid',
		store : 'DriverSpeedStore',
		cls : 'hIndexbar',
		title : T('title.runstatus_history'),
		autoScroll : true,
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
					data : [{ "name" : "monthly_view",	"desc" : T('label.monthly_view') },
					        { "name" : "yearly_view",	"desc" : T('label.yearly_view')  }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						// TODO 월간보기에서 년간보기로 변경시 년 설정으로 변경 ...
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
			}
		]
	},

	zrunstatus_chart : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('title.speed_section_chart'),
		flex : 1,
		autoScroll : true
	},
	
	refreshChart : function() {
				
		var chartType = this.sub('combo_chart_type').getValue();
		if(chartType == 'radar') 
			this.refreshRadarChart();
		else
			this.refreshColumnChart();
	},
	
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
			// speed 10 ~ 30
			var spd_10_30 = (record.get('spd_lt10') + record.get('spd_lt20') + record.get('spd_lt30'));
			// speed 40 ~ 60
			var spd_40_60 = (record.get('spd_lt40') + record.get('spd_lt50') + record.get('spd_lt60'));
			// speed 50 ~ 80
			var spd_70_90 = (record.get('spd_lt70') + record.get('spd_lt80') + record.get('spd_lt90'));			
			// speed 90 ~ 120
			var spd_100_120 = (record.get('spd_lt90') + record.get('spd_lt100') + record.get('spd_lt110') + record.get('spd_lt120'));			
			// speed 130 ~
			var spd_over_130 = (record.get('spd_lt130') + record.get('spd_lt140') + record.get('spd_lt150') + record.get('spd_lt160'));
			
			var columnData = { 	'month' : record.get('month_str'), 
								'value1' : spd_10_30, 		'desc1' : '10 ~ 30(km)', 
								'value2' : spd_40_60, 		'desc2' : '40 ~ 60(km)',
								'value3' : spd_70_90, 		'desc3' : '70 ~ 90(km)',
								'value4' : spd_100_120, 	'desc4' : '100 ~ 120(km)', 
								'value5' : spd_over_130, 	'desc5' : '130 ~ (km)' };
			columnDataArr.push(columnData);
		});
		
		var columnStore = Ext.create('Ext.data.JsonStore', {
			fields : ['month', 'value1', 'value2', 'value3', 'value4', 'value5', 'desc1', 'desc2', 'desc3', 'desc4', 'desc5'],
			autoDestroy : true,
			data : columnDataArr
		});
		
		var chart = this.buildColumnChart(columnStore, 0, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	refreshRadarChart : function() {
		
		var store = this.sub('runstatus_grid').store;
		var totalRecordCnt = 0;
		var spd_10_30 = 0;
		var spd_40_60 = 0;
		var spd_70_90 = 0;
		var spd_100_120 = 0;
		var spd_over_130 = 0;
		
		store.each(function(record) {
			
			if(record.get('driver'))
				totalRecordCnt += 1;
			
			// speed 10 ~ 30
			spd_10_30 += (record.get('spd_lt10') + record.get('spd_lt20') + record.get('spd_lt30'));

			// speed 40 ~ 60
			spd_40_60 += (record.get('spd_lt40') + record.get('spd_lt50') + record.get('spd_lt60'));
			
			// speed 50 ~ 80
			spd_70_90 += (record.get('spd_lt70') + record.get('spd_lt80') + record.get('spd_lt90'));
			
			// speed 90 ~ 120
			spd_100_120 += (record.get('spd_lt90') + record.get('spd_lt100') + record.get('spd_lt110') + record.get('spd_lt120'));
			
			// speed 130 ~
			spd_over_130 += (record.get('spd_lt130') + record.get('spd_lt140') + record.get('spd_lt150') + record.get('spd_lt160'));
		});
		
		spd_10_30 = spd_10_30 / totalRecordCnt;
		spd_40_60 = spd_40_60 / totalRecordCnt;
		spd_70_90 = spd_70_90 / totalRecordCnt;
		spd_100_120 = spd_100_120 / totalRecordCnt;
		spd_over_130 = spd_over_130 / totalRecordCnt;
		
		var radarData = [
		    { 'name' : '10 ~ 30(km)', 	'value' : spd_10_30 },
		    { 'name' : '40 ~ 60(km)', 	'value' : spd_40_60 },
		    { 'name' : '70 ~ 90(km)', 	'value' : spd_70_90 },
		    { 'name' : '100 ~ 120(km)', 'value' : spd_100_120 },
		    { 'name' : '130(km) ~ ', 	'value' : spd_over_130 },
		];
		
		var radarStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'value'],
			autoDestroy : true,
			data : radarData
		});
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildRadarChart(radarStore, width, height);
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
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 45);
		
		var chart = chartPanel.down('chart');
		chart.setWidth(width - 25);
		chart.setHeight(height - 50);
	},
	
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
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['month'],
	                title: T('label.month'),
				}],			
				series : [{
					type : 'column',
					axis: 'left',
					xField: 'month',
	                yField: [ 'value1', 'value2', 'value3', 'value4', 'value5' ],
	                title : [ '10 ~ 30(km)', '40 ~ 60(km)', '70 ~ 90(km)', '100 ~ 120(km)', '130 ~ (km)' ],
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
	
	refreshByMonth : function(record) {
				
		var chartType = this.sub('combo_chart_type').getValue();		
		if(chartType == 'radar')
			this.refreshRadarChartByMonth(record);
		else
			this.refreshColumnChartByMonth(record);
	},
	
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
	
	createChartData : function(record) {
		return [  { 'name' : '10~20', 		'value' : record.get('spd_lt10') },
		          { 'name' : '20~30', 		'value' : record.get('spd_lt20') },
		          { 'name' : '30~40', 		'value' : record.get('spd_lt30') },
		          { 'name' : '40~50', 		'value' : record.get('spd_lt40') },
		          { 'name' : '50~60', 		'value' : record.get('spd_lt50') },
		          { 'name' : '60~70', 		'value' : record.get('spd_lt60') },
		          { 'name' : '70~80', 		'value' : record.get('spd_lt70') },
		          { 'name' : '80~90', 		'value' : record.get('spd_lt80') },
		          { 'name' : '90~100', 		'value' : record.get('spd_lt90') },
		          { 'name' : '100~110', 	'value' : record.get('spd_lt100') },
		          { 'name' : '110~120', 	'value' : record.get('spd_lt110') },
		          { 'name' : '120~130', 	'value' : record.get('spd_lt120') },
		          { 'name' : '130~140', 	'value' : record.get('spd_lt130') },
		          { 'name' : '140~150', 	'value' : record.get('spd_lt140') },
		          { 'name' : '150~', 		'value' : record.get('spd_lt150') } ];
	},
	
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
	                title: T('label.speed_section') + '(km)',
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