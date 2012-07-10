Ext.define('GreenFleet.view.dashboard.EcoDrivingTrend', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_eco_driving_trend',

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
		
		this.refresh();
	},

	/**
	 * 데이터 그리드 패널 
	 */
	zdatagrid : {
		itemId : 'datagrid_panel',
		xtype : 'panel',
		flex : 1,
		cls : 'hIndexbar',
		title : T('report.eco_driving_trend'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'type', 'mon_1', 'mon_2', 'mon_3', 'mon_4', 'mon_5', 'mon_6', 'mon_7', 'mon_8', 'mon_9', 'mon_10', 'mon_11', 'mon_12', 'avg' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 50
			}, {
	            text     : T('label.type'),
	            dataIndex: 'type',
	            width : 100
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
				header : 'Average',
				dataIndex : 'avg',
				width : 100
	        }]
		}],

		tbar : [
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
			{
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var thisView = btn.up('dashboard_eco_driving_trend');
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
	 * 그리드와 차트를 새로 고침 
	 */
	refresh : function() {
		
		var self = this;
		var fromYear = this.sub('from_year').getValue();
		var toYear = this.sub('to_year').getValue();
		var fromMonth = this.sub('from_month').getValue();
		var toMonth = this.sub('to_month').getValue();
		
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'eco',
		    	type : 'ecoindex_ecorate',
		    	from_year : fromYear,
		    	from_month : fromMonth,
		    	to_year : toYear,
		    	to_month : toMonth
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	self.refreshGridData(records);
		        	self.refreshChartData(records);
		        	
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});
	},
	
	/**
	 * 그리드 데이터 Refresh 
	 */
	refreshGridData : function(records) {
		var dataList = [];
		var ecoIndexType = T('label.eco_index');
		var ecoRunRateType = T('label.eco_run_rate');
		
		Ext.each(records, function(record) {
			var ecoIndexData = null;
			var ecoRunRateData = null;
			
			Ext.each(dataList, function(data) {
				if(data.year == record.year && data.type == ecoIndexType) {
					ecoIndexData = data;
				}
				
				if(data.year == record.year && data.type == ecoRunRateType) {
					ecoRunRateData = data;
				}
			});
			
			if(!ecoIndexData) {
				ecoIndexData = { "year" : record.year };
				ecoIndexData["type"] = ecoIndexType;
				ecoIndexData["count"] = 0;
				ecoIndexData["sum"] = 0;
				dataList.push(ecoIndexData);
			}
			
			if(!ecoRunRateData) {
				ecoRunRateData = { "year" : record.year };
				ecoRunRateData["type"] = ecoRunRateType;
				ecoRunRateData["count"] = 0;
				ecoRunRateData["sum"] = 0;
				dataList.push(ecoRunRateData);				
			} 
			
			var ecoIndex = record.eco_index;
			ecoIndexData["mon_" + record.month] = ecoIndex
			ecoIndexData["count"] = ecoIndexData["count"] + 1;
			ecoIndexData["sum"] = ecoIndexData["sum"] + ecoIndex;
			
			var ecoRunRate = record.eco_driving;
			ecoRunRateData["mon_" + record.month] = ecoRunRate
			ecoRunRateData["count"] = ecoRunRateData["count"] + 1;
			ecoRunRateData["sum"] = ecoRunRateData["sum"] + ecoRunRate;			
		});
		
		Ext.each(dataList, function(data) {
			data["avg"] = Ext.util.Format.number((data["sum"] / data["count"]), '0.00');
		});
		
		this.sub('data_grid').store.loadData(dataList);
	},
	
	/**
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var dataList = [];
		Ext.each(records, function(record) {
			dataList.push({"yearmonth" : record.yearmonth, "eco_index" : record.eco_index, "eco_run_rate" : record.eco_driving });
		});
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		
		if(chart == null) {
			this.refreshChart(dataList);
		} else {
			chart.store.loadData(dataList);
		}
	},
	
	/**
	 * Chart를 새로 생성
	 */
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
		
		var chart = this.buildChart(records, width, height);
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
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
	buildChart : function(records, width, height) {
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,
			items : [{
				xtype : 'chart',				
				animate : true,
				store : Ext.create('Ext.data.Store', { fields : ['yearmonth', 'eco_index', 'eco_run_rate'], data : records }),
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Category',
	                position: 'bottom',
	                fields: ['yearmonth'],
	                grid : true,
	                title: T('label.month')
				}, {
	                type: 'Numeric',
	                position: 'left',
	                fields: ['eco_index'],
	                grid : true,
	                title: T('label.eco_index') + '(%)'
	            },{
	                type: 'Numeric',
	                position: 'right',
	                fields: ['eco_run_rate'],
	                title: T('label.eco_run_rate') + '(%)'
	            } ],
				series : [{
					type : 'column',
					axis: 'left',
					xField: 'yearmonth',
	                yField: 'eco_index',
					showInLegend : true,
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : 'eco_index',
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial'
					}
				}, {
	                type: 'line',
	                highlight: {
	                    size: 7,
	                    radius: 7
	                },
	                fill: true,
	                smooth: true,
	                fillOpacity: 0.5,
	                axis: 'right',
	                xField: 'yearmonth',
	                yField: 'eco_run_rate',
					showInLegend : true,
	                title: T('label.eco_run_rate'),
					tips : {
						trackMouse : true,
						width : 90,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get('yearmonth') + ' : ' + storeItem.get('eco_run_rate') + '(%)');
						}
					},	                
	            }]
			}]
		}
	}
});