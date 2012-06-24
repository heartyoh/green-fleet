Ext.define('GreenFleet.view.management.VehicleSpeedSection', {
	extend : 'Ext.Container',

	alias : 'widget.management_vehicle_speed',

	title : T('title.vehicle_speed_section'),

	entityUrl : 'vehicle_speed',
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    { html : "<div class='listTitle'>" + T('title.vehicle_speed_section') + "</div>"}, 
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

		this.sub('vehicle_list').on('itemclick', function(grid, record) {
			var runStatusStore = self.sub('runstatus_grid').store;
			var proxy = runStatusStore.getProxy();
			proxy.extraParams.vehicle = record.data.id;
			proxy.extraParams.from_year = self.sub('from_year').getValue();
			proxy.extraParams.to_year = self.sub('to_year').getValue();
			proxy.extraParams.from_month = self.sub('from_month').getValue();
			proxy.extraParams.to_month = self.sub('to_month').getValue();
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
			self.searchVehicles(false);
		});

		/**
		 * Vehicle Reg No. 검색 조건 변경시 Vehicle 데이터 Local filtering 
		 */
		this.sub('reg_no_filter').on('change', function(field, value) {
			self.searchVehicles(false);
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
	
	searchVehicles : function(searchRemote) {
		
		if(searchRemote) {
			this.sub('vehicle_list').store.load();
			
		} else {
			this.sub('vehicle_list').store.clearFilter(true);			
			var idValue = this.sub('id_filter').getValue();
			var nameValue = this.sub('reg_no_filter').getValue();
			
			if(idValue || nameValue) {
				this.sub('vehicle_list').store.filter([ {
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
			itemId : 'vehicle_list',
			store : 'VehicleBriefStore',
			title : T('title.vehicle_list'),
			width : 260,
			autoScroll : true,
			
			columns : [ {
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
				}, 
				T('label.name'),
				{
					xtype : 'textfield',
					name : 'reg_no_filter',
					itemId : 'reg_no_filter',
					width : 65
				},
				' ',
				{
					xtype : 'button',
					text : T('button.search'),
					handler : function(btn) {
						btn.up('management_vehicle_speed').searchVehicles(true);
					}
				}
			]
		}
	},
	
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
	                fields: ['month_str'],
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