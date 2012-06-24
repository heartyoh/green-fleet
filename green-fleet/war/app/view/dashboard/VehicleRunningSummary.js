Ext.define('GreenFleet.view.dashboard.VehicleRunningSummary', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_vehicle_summary',

	layout : { align : 'stretch', type : 'vbox' },
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    {
				xtype : 'container',
				flex : 1,
				layout : { type : 'hbox', align : 'stretch' },
				items : [ {
					xtype : 'container',
					flex : 1,
					cls : 'borderRightGray',
					layout : { align : 'stretch', type : 'vbox' },
					items : [ this.zdatagrid, this.zchartpanel ]
				} ]
		    } ],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.runtime_by_vehicles') + T('label.parentheses_x', {x : T('label.minute_s')}),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'vehicle', 'year', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'sum' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.vehicle'),
	            dataIndex: 'vehicle',
	            width : 80,
				summaryType: 'count',
		        summaryRenderer: function(value) {
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
			}, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : '1',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : '2',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : '3',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : '4',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : '5',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : '6',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : '7',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : '8',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : '9',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : '10',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : '11',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : '12',
					width : 60
	            }]
	        }, {
				header : T('label.sum'),
				dataIndex : 'sum',
				width : 100,
				summaryType: 'sum',
		        summaryRenderer: function(value) {
		        	value = Ext.util.Format.number(value, '0.00');
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }
	        }]
		}],

		tbar : [
			T('label.chart_type') + ' : ',
			{
				xtype : 'combo',
				itemId : 'combo_chart_type',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'name',
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'name', 'desc' ],			
					data : [{ "name" : "by_vehicles", "desc" : T('report.by_vehicles') },
					        { "name" : "by_years",	  "desc" : T('report.by_years') }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_vehicle_summary');
						thisView.refresh();
					}
			    }
			},		        
			T('title.vehicle_group'),
			{
				xtype : 'combo',
				itemId : 'combo_vehicle_group',
				padding : '3 0 0 0',
				displayField: 'desc',
			    valueField: 'id',
				store : 'VehicleGroupStore',
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_vehicle_summary');
						thisView.refresh();						
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
					fields : [ 'name', 'type', 'desc', 'unit' ], 
					data : [{ "name" : "run_time", 		"type": "int", 		"desc" : T('report.runtime_by_vehicles'), 		"unit" : T('label.parentheses_x', {x : T('label.minute_s')}) },
					        { "name" : "rate_of_oper", 	"type": "float",	"desc" : T('report.oprate_by_vehicles'), 		"unit" : "%" },
					        { "name" : "run_dist", 		"type": "float", 	"desc" : T('report.rundist_by_vehicles'), 		"unit" : "(km)" },
							{ "name" : "consmpt", 		"type": "float",	"desc" : T('report.consumption_by_vehicles'), 	"unit" : "(l)" },
							{ "name" : "co2_emss", 		"type": "float",	"desc" : T('report.co2_emissions_by_vehicles'),	"unit" : "(g/km)" },
							{ "name" : "effcc", 		"type": "float",	"desc" : T('report.efficiency_by_vehicles'), 	"unit" : "(km/l)" },
							{ "name" : "oos_cnt", 		"type": "int",		"desc" : T('report.oos_cnt_by_vehicles'), 		"unit" : "" },
							{ "name" : "mnt_cnt", 		"type": "int",		"desc" : T('report.mnt_cnt_by_vehicles'), 		"unit" : "" },
							{ "name" : "mnt_time", 		"type": "int",		"desc" : T('report.mnt_time_by_vehicles'), 		"unit" : T('label.parentheses_x', {x : T('label.minute_s')}) },
							{ "name" : "mttr", 			"type": "float",	"desc" : T('report.mttr_by_vehicles'), 			"unit" : "" },
							{ "name" : "mtbf", 			"type": "float",	"desc" : T('report.mtbf_by_vehicles'), 			"unit" : "" }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_vehicle_summary');
						thisView.refresh();
					}
			    }
			},
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_vehicle_summary');
					thisView.refresh();
				}
			}
		]
	},
	
	/**
	 * 차트 패널 
	 */
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	/**
	 * 차트 정보
	 */
	getChartInfo : function() {
		
		var comboChart = this.sub('combo_chart').getValue();
		if(!comboChart) {
			comboChart = 'run_time';
		}
		
		var chartInfo = null;
		var chartTypeArr = this.sub('combo_chart').store.data;
		
		for(var i = 0 ; i < chartTypeArr.length ; i++) {
			var chartTypeData = chartTypeArr.items[i].data;
			if(comboChart == chartTypeData.name) {
				chartInfo = chartTypeData;
				break;
			}
		}
		
		return chartInfo;
	},
	
	/**
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var dataGrid = this.sub('data_grid');
		var vehicleGroup = this.sub('combo_vehicle_group');
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		var chartInfo = this.getChartInfo();		
		this.sub('datagrid_panel').setTitle(chartInfo.desc + chartInfo.unit);
		var store = Ext.getStore('VehicleRunStore');
		var proxy = store.getProxy();
		//proxy.extraParams.select = ['vehicle', 'month_str', chartInfo.name];
		proxy.extraParams.from_year = fromYear;
		proxy.extraParams.from_month = fromMonth;
		proxy.extraParams.to_year = toYear;
		proxy.extraParams.to_month = toMonth;
		
		if(vehicleGroup.getValue())
			proxy.extraParams.vehicle_group = vehicleGroup.getValue();
		
		store.load({
			scope : this,
			callback : function(records, operation, success) {
				
				var newRecords = [];
				Ext.each(records, function(record) {
					var vehicle = record.data.vehicle;
					var year = record.data.year;
					var month = record.data.month;
					var runData = record.get(chartInfo.name);
					
					// 가동율 
					if('rate_of_oper' == chartInfo.name) {
						var runTime = record.data.run_time;
						runData = runTime ? ((runTime * 100) / (30 * 60 * 24)) : 0;
						
					// MTTR	
					} else if('mttr' == chartInfo.name) {
						var oosCnt = record.data.oos_cnt;
						var mntTime = record.data.mnt_time;
						runData = (oosCnt && mntTime) ? (mntTime / oosCnt) : 0;
						
					// MTBF
					} else if('mtbf' == chartInfo.name) {
						var runTime = record.data.run_time;
						var mntTime = record.data.mnt_time;
						var oosCnt = record.data.oos_cnt;
						runData = oosCnt ? ((runTime - mntTime > 0) ? ((runTime - mntTime) / oosCnt) : 0) : 0;
					}
					
					if(chartInfo.type == 'float') {
						runData = parseFloat(Ext.util.Format.number(runData, '0.00'));
					}
					
					var newRecord = null;
					Ext.each(newRecords, function(nr) {
						if(vehicle == nr.vehicle && year == nr.year)
							newRecord = nr;
					});
					
					var monthStr = 'mon_' + month;
					if(newRecord == null) {
						newRecord = { 'vehicle' : vehicle, 'year' : year , 'sum' : runData };
						newRecord[monthStr] = runData;
						newRecords.push(newRecord);
					
					} else {
						newRecord[monthStr] = runData;
						if(runData && runData > 0) {
							newRecord['sum'] = newRecord.sum + runData;
						}
					}
				});
				
				if(chartInfo.type == 'float') {
					Ext.each(newRecords, function(nr) {
						nr.sum = parseFloat(Ext.util.Format.number(nr.sum, '0.00'));
					});					
				}
				
				dataGrid.store.loadData(newRecords);
				this.refreshChart(newRecords, chartInfo.desc, chartInfo.unit);
			}
		});
	},
		
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(records, yTitle, unit) {
		
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
		var chart = ('by_years' == chartType) ? 
				this.refreshChartByYear(records, width, height, yTitle, unit) : 
				this.refreshChartByVehicle(records, width, height, yTitle, unit);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * X축이 Vehicle인 Chart를 생성 
	 */
	refreshChartByVehicle : function(records, width, height, yTitle, unit) {
		
		var yearFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['vehicle'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;
			var year = record.year;
			var contains = false;
			
			Ext.each(yearFields, function(yearField) {
				if(yearField == year)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push('' + year);
				yearFields.push(year);
				yFields.push(year + '_sum');
				fields.push(year + '_sum');
			}
		});		
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;			
			var year = record.year;
			var sum = record.sum;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(vehicle == data.vehicle) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'vehicle' : vehicle };
				dataList.push(chartData);
			}
			
			chartData[year + '_sum'] = sum;
		});
		
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'vehicle';
		var xTitle = T('label.vehicle');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);
	},
	
	/**
	 * X축이 Year인 Chart를 생성 
	 */
	refreshChartByYear : function(records, width, height, yTitle, unit) {
		
		var vehicleFields = [];
		var yFields = [];
		var yTitles = [];
		var fields = ['year'];
		var dataList = [];
		var count = 0;
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle; 
			var year = record.year;
			var contains = false;
			
			Ext.each(vehicleFields, function(vehicleField) {
				if(vehicleField == vehicle)
					contains = true;
			});
			
			if(!contains) {
				yTitles.push(vehicle);
				vehicleFields.push(vehicle);
				yFields.push(vehicle + '_sum');
				fields.push(vehicle + '_sum');
			}
		});		
		
		Ext.each(records, function(record) {
			var vehicle = record.vehicle;		
			var year = record.year;
			var sum = record.sum;
			var chartData = null;
			
			Ext.each(dataList, function(data) {
				if(year == data.year) {
					chartData = data;
				}
			});
			
			if(!chartData) {
				chartData = { 'year' : year };
				dataList.push(chartData);
			}
			
			chartData[vehicle + '_sum'] = sum;
		});
				
		var store = Ext.create('Ext.data.Store', { fields : fields, data : dataList });
		var xField = 'year';
		var xTitle = T('label.year');
		return this.buildChart(store, xField, xTitle, yFields, yTitle, yTitles, unit, 0, width, height);		
	},

	/**
	 * 페이지를 resize할 때마다 chart를 resize
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
	 * 차트 생성
	 */
	buildChart : function(store, xField, xTitle, yFields, yTitle, yTitles, unit, minValue, width, height) {
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
				legend: { position: 'left' },
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: yFields,
	                title: yTitle + unit,
	                minimum: minValue
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: [xField],
	                title: xTitle	                
				}],
				series : [{
					type : 'column',
					axis: 'left',
					xField: xField,
	                yField: yFields,
	                title : yTitles,
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(item.value[0] + ' : ' + item.value[1]);
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : yFields,
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}]
			}]
		}
	}
});