Ext.define('GreenFleet.view.management.DriverRunStatus', {
	extend : 'Ext.panel.Panel',

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
	
	chartXTitle : 'month',
	
	driver : '',
	
	timeView : 'monthly',
	
	chartPanel : null,	

	initComponent : function() {
		var self = this;
		this.disabled = GreenFleet.checkDisabled(this.xtype);
		this.items = [ this.zrunstatus, this.zrunstatus_chart ];
		this.callParent(arguments);
		
		this.sub('runstatus_grid').on('itemclick', function(grid, record) {			
			if(record.data.time_view == "yearly") {
				self.searchSummary(record.data.driver, null, "monthly", record.data.year, null);
				
			} else if(record.data.time_view == "monthly") {
				self.searchSummary(record.data.driver, null, "daily", record.data.year, record.data.month);
			}
		});
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
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
		this.sub('combo_view').setValue('monthly');
	},
	
	/**
	 * grid title을 설정 
	 */
	setGridTitle : function(name) {
		var title = name ? T('title.runstatus_history') + ' (' + name + ')' : T('title.runstatus_history');
		this.sub('runstatus_panel').setTitle(title);
	},	
	
	/**
	 * 운전자 선택시 
	 */
	refresh : function(driverId, driverName) {
		// driverId 값이 없거나 이전에 선택한 driverId와 현재 선택된 driverId가 같다면 skip 
		if(!driverId || driverId == '' || driverId == this.driver)
			return;
		
		this.driver = driverId;
		this.searchSummary(driverId, driverName, null, null, null);
	},
	
	/**
	 * driver run summary 조회 
	 */
	searchSummary : function(driverId, driverName, timeView, year, month) {
		
		if(!driverId) {
			driverId = this.driver;
			
			if(!driverId)
				return;
		}
		
		if(!timeView) {
			timeView = this.sub('combo_view').getValue();
		}
		
		var runStatusStore = this.sub('runstatus_grid').store;
		var proxy = runStatusStore.getProxy();
		proxy.extraParams.driver = driverId;
		proxy.extraParams.time_view = timeView;
		
		if(timeView == "monthly") {
			this.chartXTitle = "month";
			if(year == null) {
				proxy.extraParams.from_year = this.sub('from_year').getValue();
				proxy.extraParams.to_year = this.sub('to_year').getValue();
				proxy.extraParams.from_month = this.sub('from_month').getValue();
				proxy.extraParams.to_month = this.sub('to_month').getValue();
			} else {
				proxy.extraParams.from_year = year;
				proxy.extraParams.to_year = year;
				proxy.extraParams.from_month = 1;
				proxy.extraParams.to_month = 12;
			}					
		} else if(timeView == "daily") {
			this.chartXTitle = "date";
			proxy.extraParams.year = year;
			proxy.extraParams.month = month;
			
		} else if(timeView == "yearly") {
			this.chartXTitle = "year";
		}
				
		runStatusStore.load({
			scope : this,
			callback : function() {
				if(driverName) {
					this.setGridTitle(driverName);
				}
				this.refreshChart();
			}
		});		
	},

	/**
	 * 운행이력 그리드 패널 
	 */
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
				dataIndex : 'time_view',
				hidden : true
			}, {
				header : T('label.datetime'),
				dataIndex : 'month_str'		
			}, {
				header : T('label.run_dist') + '(km)',
				dataIndex : 'run_dist'
			}, {
				header : T('label.run_time') + T('label.parentheses_min'),
				dataIndex : 'run_time'
			}, {
				header : T('label.fuel_consumption') + '(l)',
				dataIndex : 'consmpt'
			}, {
				header : T('label.co2_emissions') + '(g/km)',
				dataIndex : 'co2_emss'
			}, {
				header : T('label.fuel_efficiency') + '(km/l)',
				dataIndex : 'effcc'
			}, {
				header : T('label.eco_index') + '(%)',
				dataIndex : 'eco_index'
			}, {
				header : T('label.eco_drv_time') + T('label.parentheses_min'),
				dataIndex : 'eco_drv_time'	
			}, {
				header : T('label.ovr_spd_time') + T('label.parentheses_min'),
				dataIndex : 'ovr_spd_time'
			}, {
				header : T('label.idle_time') + T('label.parentheses_min'),
				dataIndex : 'idle_time'
			}, {
				header : T('label.sud_accel_cnt'),
				dataIndex : 'sud_accel_cnt'
			}, {
				header : T('label.sud_brake_cnt'),
				dataIndex : 'sud_brake_cnt'
			}, {
				header : T('label.inc_cnt'),
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
					data : [{ "name" : "monthly",	"desc" : T('label.monthly_view') },
					        { "name" : "yearly",	"desc" : T('label.yearly_view')  }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						if(currentValue != beforeValue) {
							var thisView = combo.up('management_driver_runstatus');
							thisView.searchSummary(null, null, null, null, null);
						}
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
					data : [{ "name" : "run_dist", 		"desc" : T('label.run_dist'),			"unit" : "(km)" },
					        { "name" : "run_time", 		"desc" : T('label.run_time'),			"unit" : T('label.parentheses_min') },
							{ "name" : "consmpt", 		"desc" : T('label.fuel_consumption'),	"unit" : "(l)" },
							{ "name" : "co2_emss", 		"desc" : T('label.co2_emissions'),		"unit" : "(g/km)" },
							{ "name" : "effcc", 		"desc" : T('label.fuel_efficiency'), 	"unit" : "(km/l)" },
							{ "name" : "eco_index", 	"desc" : T('label.eco_index'), 			"unit" : "(%)" },							
							{ "name" : "eco_drv_time", 	"desc" : T('label.eco_drv_time'), 		"unit" : T('label.parentheses_min') },
							{ "name" : "ovr_spd_time", 	"desc" : T('label.ovr_spd_time'), 		"unit" : T('label.parentheses_min') },
							{ "name" : "idle_time", 	"desc" : T('label.idle_time'), 			"unit" : T('label.parentheses_min') },							
							{ "name" : "sud_accel_cnt", "desc" : T('label.sud_accel_cnt'), 		"unit" : "" },
							{ "name" : "sud_brake_cnt", "desc" : T('label.sud_brake_cnt'), 		"unit" : "" },
							{ "name" : "inc_cnt", 		"desc" : T('label.inc_cnt'), 			"unit" : "" },							
							{ "name" : "driving_habit", "desc" : T('label.driving_habit'), 		"unit" : "" }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						combo.up('management_driver_runstatus').refreshChart();
					}
			    }
			}
		]
	},

	/**
	 * 차트 패널 
	 */
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
	
	/**
	 * 차트 패널을 리사이즈 
	 */
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
	
	/**
	 * 차트를 리사이즈 
	 */
	refreshChart : function() {
		
		var chartValue = this.sub('combo_chart').getValue();
		
		if(chartValue == 'driving_habit') 
			this.refreshRadarChart();
		else
			this.refreshColumnChart();		
	},
	
	/**
	 * 컬럼 차트를 리프레쉬 
	 */
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
	
	/**
	 * 레이더 차트를 리프레쉬 
	 */
	refreshRadarChart : function() {
		
		var store = this.sub('runstatus_grid').store;
		var totalRecordCnt = 0;
		var ecoIndex = 0;
		var overSpdCnt = 0;
		var sudAccelCnt = 0;
		var sudBrakeCnt = 0;
		var idleTime = 0;
		var ecoDrvTime = 0;
		var efficiency = 0;
		var ecoLevel = 0;
		
		store.each(function(record) {
			if(record.get('driver'))
				totalRecordCnt += 1;
			
			if(record.get('eco_index'))
				ecoIndex += record.get('eco_index')

			if(record.get('ovr_spd_time'))
				overSpdCnt += record.get('ovr_spd_time');
			
			if(record.get('sud_accel_cnt'))
				sudAccelCnt += record.get('sud_accel_cnt');
			
			if(record.get('sud_brake_cnt'))
				sudBrakeCnt += record.get('sud_brake_cnt');
			
			if(record.get('idle_time'))
				idleTime += record.get('idle_time');
			
			if(record.get('eco_drv_time'))
				ecoDrvTime += record.get('eco_drv_time');
			
			if(record.get('effcc'))
				efficiency += record.get('effcc');			
		});
		
		ecoIndex = ecoIndex / totalRecordCnt;
		overSpdCnt = overSpdCnt / totalRecordCnt;
		sudAccelCnt = sudAccelCnt / totalRecordCnt;
		sudBrakeCnt = sudBrakeCnt / totalRecordCnt;
		idleTime = idleTime /totalRecordCnt;
		ecoDrvTime = ecoDrvTime / totalRecordCnt;
		efficiency = efficiency / totalRecordCnt;
		ecoLevel = Math.floor(ecoIndex / 20);
		
		var radarData = [
		    { 'name' : T('label.eco_index'), 		'value' : ecoIndex },
		    { 'name' : T('label.ovr_spd_time'), 	'value' : overSpdCnt },		    
		    { 'name' : T('label.sud_accel_cnt'), 	'value' : sudAccelCnt },
		    { 'name' : T('label.sud_brake_cnt'),	'value' : sudBrakeCnt },
		    { 'name' : T('label.idle_time'), 		'value' : idleTime },
		    { 'name' : T('label.eco_drv_time'), 	'value' : ecoDrvTime },		    
		    { 'name' : T('label.fuel_efficiency'), 	'value' : efficiency }		    
		];
		
		var guageData = [
		    { 'name' : T('label.eco_index'), 'value' : ecoLevel }
		];
		
		var radarStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'value'],
			autoDestroy : true,
			data : radarData
		});
		
		var guageStore = Ext.create('Ext.data.JsonStore', {
			fields : ['name', 'value'],
			autoDestroy : true,
			data : guageData
		});		
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart1 = this.buildRadarChart(radarStore, width, height);
		var chart2 = this.buildGuageChart(guageStore, width, height);
		chartPanel.add(chart1);
		chartPanel.add(chart2);
		this.chartPanel = chart1;
	},
	
	/**
	 * 일반 컬럼, 라인 차트 
	 */
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
	                grid : true,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['month_str'],
	                grid : true,
	                title: T('label.' + this.chartXTitle)
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
						font : '14px Arial'
					}
				}]
			}]
		}
	},
	
	/**
	 * 레이더 차트 
	 */
	buildRadarChart : function(store, width, height) {
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
					}	                
	            }]
			}]
		};
	},	
	
	/**
	 * 게이지 차트 
	 */
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