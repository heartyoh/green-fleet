Ext.define('GreenFleet.view.dashboard.RuntimeByVehicles', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_runtime_by_vehicles',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [
		    { html : "<div class='listTitle'>" + T('report.runtime_by_vehicles') + "</div>"}, 
		    {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'hbox',
					align : 'stretch'
				},
				items : [ 
				    {
						xtype : 'container',
						flex : 1,
						cls : 'borderRightGray',
						layout : {
							align : 'stretch',
							type : 'vbox'
						},
						items : [ this.zdatagrid, this.zchartpanel ]
					} 
				]
		    }
		],

		this.callParent();
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		});		
	},

	zdatagrid : {
		xtype : 'panel',
		flex : 1,
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			store : Ext.create('Ext.data.Store', { 
				fields : [ 'vehicle', 'year', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'sum' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.vehicle'),
	            dataIndex: 'vehicle',
	            width : 70
			}, {
				header : T('label.year'),
				dataIndex : 'year',
				width : 50
	        }, {
	            text: T('label.month'),
	            columns: [{
					dataIndex : 'mon_1',
					text : 'Jan',
					width : 60
	            }, {
					dataIndex : 'mon_2',
					text : 'Feb',
					width : 60
	            }, {
					dataIndex : 'mon_3',
					text : 'Mar',
					width : 60
	            }, {
					dataIndex : 'mon_4',
					text : 'Apr',
					width : 60
	            }, {
					dataIndex : 'mon_5',
					text : 'May',
					width : 60
	            }, {
					dataIndex : 'mon_6',
					text : 'Jun',
					width : 60
	            }, {
					dataIndex : 'mon_7',
					text : 'Jul',
					width : 60
	            }, {
					dataIndex : 'mon_8',
					text : 'Aug',
					width : 60
	            }, {
					dataIndex : 'mon_9',
					text : 'Sep',
					width : 60
	            }, {
					dataIndex : 'mon_10',
					text : 'Oct',
					width : 60
	            }, {
					dataIndex : 'mon_11',
					text : 'Nov',
					width : 60
	            }, {
					dataIndex : 'mon_12',
					text : 'Dec',
					width : 60
	            }]
	        }, {
				header : T('label.sum'),
				dataIndex : 'sum',
				width : 80
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
					data : [{ "name" : "by_vehicle", "desc" : 'By Vehicle' },
					        { "name" : "by_year",	 "desc" : 'By Year' }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_runtime_by_vehicles');
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
						var thisView = combo.up('dashboard_runtime_by_vehicles');
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
			    value : new Date().getFullYear(),
				store : Ext.create('Ext.data.Store', {
					fields : [ 'year' ],			
					data : [{ "year" : 2001 },{ "year" : 2002 },{ "year" : 2003 },{ "year" : 2004 },{ "year" : 2005 },{ "year" : 2006 },
					        { "year" : 2007 },{ "year" : 2008 },{ "year" : 2009 },{ "year" : 2010 },{ "year" : 2011 },{ "year" : 2012 }]
				}),
				width : 60				
			},
			{
				xtype : 'combo',
				name : 'from_month',
				itemId : 'from_month',
				displayField: 'month',
			    valueField: 'month',
			    value : 1,
				store : Ext.create('Ext.data.Store', {
					fields : [ 'month' ],			
					data : [{ "month" : 1 },{ "month" : 2 },{ "month" : 3 },{ "month" : 4 }, { "month" : 5 }, { "month" : 6 },
					        { "month" : 7 },{ "month" : 8 },{ "month" : 9 },{ "month" : 10 },{ "month" : 11 },{ "month" : 12 }]
				}),
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
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'year' ],			
					data : [{ "year" : 2001 },{ "year" : 2002 },{ "year" : 2003 },{ "year" : 2004 },{ "year" : 2005 },{ "year" : 2006 },
					        { "year" : 2007 },{ "year" : 2008 },{ "year" : 2009 },{ "year" : 2010 },{ "year" : 2011 },{ "year" : 2012 }]
				}),
				width : 60			
			},
			{
				xtype : 'combo',
				name : 'to_month',
				itemId : 'to_month',
				displayField: 'month',
			    valueField: 'month',
			    value : new Date().getMonth() + 1,
				store :  Ext.create('Ext.data.Store', {
					fields : [ 'month' ],			
					data : [{ "month" : 1 },{ "month" : 2 },{ "month" : 3 },{ "month" : 4 }, { "month" : 5 }, { "month" : 6 },
					        { "month" : 7 },{ "month" : 8 },{ "month" : 9 },{ "month" : 10 },{ "month" : 11 },{ "month" : 12 }]
				}),
				width : 40
			},			
			' ', {
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_runtime_by_vehicles');
					thisView.refresh();
				}
			}
		]
	},
	
	zchartpanel : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('report.runtime_by_vehicles') + ' ' + T('label.chart'),
		flex : 1,
		autoScroll : true
	},
	
	getDateValue : function(from) {
		
		var fromTo = from ? 'from_' : 'to_';
		var fromYear = this.sub(fromTo + 'year').getValue();
		var fromMonthStr = null;
		if(fromYear) {
			var fromMonth = this.sub(fromTo + 'month').getValue();
			fromMonthStr = fromMonth ? (fromMonth < 10 ? '0' + fromMonth : '' + fromMonth) : null;
		}
		
		return (fromYear && fromMonthStr) ? (fromYear + '-' + fromMonthStr + '-01') : null;
	},
		
	refresh : function() {
		var dataGrid = this.sub('data_grid');
		var vehicleGroup = this.sub('combo_vehicle_group');
		var fromDateStr = this.getDateValue(true);
		var toDateStr = this.getDateValue(false);
		var store = Ext.getStore('VehicleRunStore');
		var proxy = store.getProxy();
		proxy.extraParams.select = ['vehicle', 'month', 'run_time'];
		
		if(fromDateStr)
			proxy.extraParams.from_date = fromDateStr;
		
		if(toDateStr)
			proxy.extraParams.to_date = toDateStr;
		
		if(vehicleGroup.getValue())
			proxy.extraParams.vehicle_group = vehicleGroup.getValue();
		
		store.load({
			scope : this,
			callback : function(records, operation, success) {
				
				var newRecords = [];
				Ext.each(records, function(record) {
					var vehicle = record.data.vehicle;
					var year = record.data.month.getFullYear();
					var month = record.data.month.getMonth() + 1;
					var runTime = record.data.run_time;
					
					var newRecord = null;
					Ext.each(newRecords, function(nr) {
						if(vehicle == nr.vehicle && year == nr.year)
							newRecord = nr;
					});
					
					var monthStr = 'mon_' + month;
					if(newRecord == null) {
						newRecord = { 'vehicle' : vehicle, 'year' : year , 'sum' : runTime };
						newRecord[monthStr] = runTime;
						newRecords.push(newRecord);
					
					} else {
						newRecord[monthStr] = runTime;
						if(runTime && runTime > 0)
							newRecord['sum'] = newRecord.sum + runTime;
					}
				});
				
				dataGrid.store.loadData(newRecords);
				this.refreshChart(newRecords);
			}
		});
	},
	
	refreshChart : function(records) {
		
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
		var chart = null;
		if('by_year' == chartType)
			chart = this.refreshChartByYear(records, width, height);
		else
			chart = this.refreshChartByVehicle(records, width, height);
		
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	refreshChartByVehicle : function(records, width, height) {
		
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
		return this.buildChart(store, xField, xTitle, yFields, yTitles, 0, width, height);
	},
	
	refreshChartByYear : function(records, width, height) {
		
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
		return this.buildChart(store, xField, xTitle, yFields, yTitles, 0, width, height);		
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
	
	buildChart : function(store, xField, xTitle, yFields, yTitles, minValue, width, height) {
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
	                title: T('label.run_time') + ' (min)',
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
						font : '14px Arial',
					}
				}]
			}]
		}
	}
});