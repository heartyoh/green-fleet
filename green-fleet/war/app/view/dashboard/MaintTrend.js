Ext.define('GreenFleet.view.dashboard.MaintTrend', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_maint_trend',

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
		
		this.refresh();
		
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
		title : T('report.maint_trend'),
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'data_grid',
			features : [ { groupHeaderTpl: 'Group : {name}', ftype: 'groupingsummary' } ],
			store : Ext.create('Ext.data.Store', { 
				groupField : 'year',
				fields : [ 'year', 'vehicle', 'mnt_cnt', 'sum' ],
				data : []
			}),
			autoScroll : true,
			columnLines: true,
	        columns: [{
	            text     : T('label.year'),
	            dataIndex: 'year',
	            width : 100
			}, {
	            text     : T('label.vehicle'),
	            dataIndex: 'vehicle',
	            width : 100
			}, {
	            text     : T('label.maintenance_count'),
	            dataIndex: 'mnt_cnt',
	            width : 100
			}, {
				header : T('label.sum'),
				dataIndex : 'mnt_cnt',
				width : 100,
				summaryType: 'sum',
				summaryRenderer: function(value) {
		            return Ext.String.format('{0} {1}', T('label.total'), value);
		        }				
	        }]
		}]
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
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	id : 'repair_list',
		    	type : 'maint_trend'
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	self.sub('data_grid').store.loadData(records);
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
	 * 차트 데이터 Refresh
	 */
	refreshChartData : function(records) {
		
		var chartPanel = this.sub('chart_panel');
		var chart = chartPanel.down('chart');
		var retObj = this.buildChartStore(records);
		var chartFieldList = retObj[0];
		var chartStore = retObj[1];
		
		if(chart == null) {
			this.refreshChart(chartFieldList, chartStore);
		} else {
			chart.store.loadData(chartStore);
		}
	},
	
	/**
	 * 차트 데이터 변형 
	 */
	buildChartStore : function(records) {
		
		var bottomFieldList = [];
		var fieldList = ['year'];
		var chartDataList = [];
		
		Ext.each(records, function(record) {
			var item = null;
			
			Ext.each(chartDataList, function(chartData) {
				if(chartData.year == record.year) {
					item = chartData;
				}				
			});
			
			if(!item) {
				item = { "year" : record.year };
				chartDataList.push(item);
			}
			
			if(!Ext.Array.contains(fieldList, record.vehicle)) {
				fieldList.push(record.vehicle);
				bottomFieldList.push(record.vehicle);
			}
						
			item[record.vehicle] = record.mnt_cnt;
		});
		
		return [bottomFieldList, Ext.create('Ext.data.Store', { fields : fieldList, data : chartDataList })];
	},
	
	/**
	 * Chart를 새로 생성
	 */
	refreshChart : function(chartFieldList, chartStore) {
		
		var chartPanel = this.sub('chart_panel');
		var width = null;
		var height = null;
		try {
			width = chartPanel.getWidth();
			height = chartPanel.getHeight();
		} catch (e) {
			return;
		}
		
		var chart = this.buildChart(chartFieldList, chartStore, width, height);
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
	buildChart : function(chartFieldList, chartStore, width, height) {
				
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 45,			
			items : [{
				xtype : 'chart',				
				animate : true,
				store : chartStore,
				width : width - 25,
				height : height - 50,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				legend: {
	                position: 'top'
	            },				
				axes: [{
	                type: 'Numeric',
	                position: 'bottom',
	                fields: chartFieldList,
	                grid : true,
	                title: T('label.maintenance_count'),
				}, {
	                type: 'Category',
	                position: 'left',
	                grid : true,
	                fields: ['year'],
	                title: T('label.year')
	            }],
				series : [{
					type: 'bar',
					axis: 'bottom',
					gutter: 80,
					xField: 'year',
					yField: chartFieldList,
					stacked: true,
					tips: {
	                    trackMouse: true,
	                    width: 65,
	                    height: 28,
	                    renderer: function(storeItem, item) {
	                        this.setTitle(item.value[1]);
	                    }
	                }
				}]
			}]
		}
	}
});