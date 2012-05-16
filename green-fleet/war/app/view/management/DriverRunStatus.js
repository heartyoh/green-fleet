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
			proxy.extraParams.from_year = self.sub('from_year').getValue();
			proxy.extraParams.to_year = self.sub('to_year').getValue();
			proxy.extraParams.from_month = self.sub('from_month').getValue();
			proxy.extraParams.to_month = self.sub('to_month').getValue();
			proxy.extraParams.select = ['driver', 'year', 'month', 'month_str', 'run_dist', 'run_time', 'consmpt', 'co2_emss', 'effcc', 'sud_accel_cnt', 'sud_brake_cnt', 'eco_drv_time', 'ovr_spd_time', 'inc_cnt'];
			runStatusStore.load({
				scope : self,
				callback : function() {
					self.setGridTitle(record.get('name'));
					self.refreshChart();
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
		
		/**
		 * combo_chart_type에 값을 기본값(column)을 설정
		 */
		this.sub('combo_chart_type').setValue('column');
		/**
		 * combo_chart에 값을 기본값(run_dist)을 설정
		 */
		this.sub('combo_chart').setValue('run_dist');
		/**
		 * combo_view에 값을 기본값(monthly_view)을 설정
		 */
		this.sub('combo_view').setValue('monthly_view');
	},
	
	setGridTitle : function(name) {
		var title = name ? T('title.runstatus_history') + ' (' + name + ') ' : T('title.runstatus_history');
		this.sub('runstatus_panel').setTitle(title);
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
		xtype : 'panel',
		itemId : 'runstatus_panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_history'),
		flex : 1,
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'runstatus_grid',
			store : 'DriverRunStore',
			columns : [ {
				dataIndex : 'month_str',
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
		}],
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
					        { "name" : "line",	 "desc" : T('label.line')   }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_driver_runstatus');
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
			},
		    T('label.chart') + ' : ',
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
						combo.up('management_driver_runstatus').refreshChart();
					}
			    }
			}
		]
	},

	zrunstatus_chart : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_chart'),
		flex : 1,
		autoScroll : true,
		layout : {
			align : 'stretch',
			type : 'hbox'
		}
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
	
	refreshChart : function() {
		
		var chartValue = this.sub('combo_chart').getValue();
		
		if(chartValue == 'driving_habit') 
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
		
		var chartType = this.sub('combo_chart_type').getValue();
		var comboChart = this.sub('combo_chart');
		var yField = comboChart.getValue();
		var store = this.sub('runstatus_grid').store;
		var chartTypeArr = comboChart.store.data;
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
				
		var chart = this.buildChart(chartType, store, yField, yTitle, unit, 0, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	refreshRadarChart : function() {
		
		var store = this.sub('runstatus_grid').store;
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
		    { 'name' : T('label.x_time', {x : T('label.eco_driving')}), 	'value' : ecoDrvTime },
		    { 'name' : T('label.fuel_efficiency'), 							'value' : efficiency },
		    { 'name' : T('label.x_time', {x : T('label.over_speeding')}), 	'value' : overSpdCnt },
		    { 'name' : T('label.x_count', {x : T('label.sudden_accel')}), 	'value' : sudAccelCnt },
		    { 'name' : T('label.x_count', {x : T('label.sudden_brake')}),	'value' : sudBrakeCnt },
		];
		
		var radarStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'value'],
			autoDestroy : true,
			data : radarData
		});
		
		var guageStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'value'],
			autoDestroy : true,
			data : [ {'name' : T('label.eco_drv_index'), 'value' : 3 } ]
		});		
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart1 = this.buildRadar(radarStore, width, height);
		var chart2 = this.buildGuageChart(guageStore, width, height);
		chartPanel.add(chart1);
		chartPanel.add(chart2);
		this.chartPanel = chart1;
	},
	
	buildChart : function(chartType, store, yField, yTitle, unit, minValue, width, height) {
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
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: [yField],
	                label: { renderer: Ext.util.Format.numberRenderer('0,0') },
	                title: yTitle,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['month_str'],
	                title: T('label.month')
				}],
				series : [{
					type : chartType,
					axis: 'left',
					xField: 'month_str',
	                yField: yField,
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get('month_str') + ' : ' + storeItem.get(yField) + unit);
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
					}
				}]
			}]
		}
	},
	
	buildRadar : function(store, width, height) {
		width = width / 2;
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
	                position: 'bottom'
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
	                },
	                tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem) { 
							return this.setTitle(storeItem.data.name + ':' + Ext.util.Format.number(storeItem.data.value, '0.00')); 
						}
					},	                
	            }]
			}]
		};
	},	
	
	buildGuageChart : function(store, width, height) {
		width = width / 2;
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',
				animate: true,
				store : store,
				width : width - 25,
				height : height - 50,
				insetPadding: 20,
				legend: {
	                position: 'bottom'
	            },
	            axes: [{
	                type: 'gauge',
	                position: 'gauge',
	                minimum: 0,
	                maximum: 5,
	                steps: 5,
	                margin: -5,
	                label : {
	                	display : 'rotate',
	                	color : '#000',
	                	field : 'name',
	                	renderer : function(v) { return T('label.grade') + ' ' + v; }
	                }
	            }],
	            series: [{
	            	type: 'gauge',
	                field: 'value',
	                showInLegend: true,
	                highlight: true,
	                donut: 40,
	                colorSet: ['#3AA8CB', '#fff']
	            }]
			}]
		};		
	}
});