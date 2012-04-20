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
						var thisView = combo.up('dashboard_runtime_by_vehicles');
						thisView.refreshChart();
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
					data : [{ "name" : "run_dist", 	"desc" : T('label.run_dist'), 			"unit" : "(km)" },
					        { "name" : "run_time", 	"desc" : T('label.run_time'), 			"unit" : "(min)" },
							{ "name" : "consmpt", 	"desc" : T('label.fuel_consumption'), 	"unit" : "(l)" },
							{ "name" : "co2_emss", 	"desc" : T('label.co2_emissions'), 		"unit" : "(g/km)" },
							{ "name" : "effcc", 	"desc" : T('label.fuel_efficiency'), 	"unit" : "(km/l)" }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('dashboard_runtime_by_vehicles');
						
						if(currentValue != 'driving_habit')
							thisView.refreshChart();
						else
							thisView.refreshRadarChart();
					}
			    }
			}, ' ', {
				text : T('button.search'),
				itemId : 'search',
				handler : function(btn) {
					var dataGrid = btn.up('panel').down('grid');
					var store = Ext.getStore('VehicleRunStore');
					store.getProxy().extraParams.select = ['vehicle', 'month', 'run_dist'];
					store.load({
						scope : this,
						callback : function(records, operation, success) {
							
							var newRecords = [];							
							Ext.each(records, function(record) {
								var vehicle = record.data.vehicle;
								var year = record.data.month.getFullYear();
								var month = record.data.month.getMonth() + 1;
								var runDist = record.data.run_dist;
								
								var newRecord = null;
								Ext.each(newRecords, function(nr) {
									if(vehicle == nr.vehicle && year == nr.year)
										newRecord = nr;
								});
								
								var monthStr = 'mon_' + month;
								if(newRecord == null) {									
									newRecord = { 'vehicle' : vehicle, 'year' : year , 'sum' : runDist };
									newRecord[monthStr] = runDist;
									newRecords.push(newRecord);
								} else {
									newRecord[monthStr] = runDist;
									if(runDist && runDist > 0)
										newRecord['sum'] = newRecord.sum + runDist; 
								}
							});
							
							dataGrid.store.loadData(newRecords);
						}						
					});
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
	
	refreshChart : function() {
		
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
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildRadar(store, width, height);
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
	
	buildRadar : function(store, width, height) {
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
				legend: { position: 'right' },
	            axes: [{
	                type: 'Radial',
	                position: 'radial',
	                label: {
	                    display: true
	                }
	            }],
	            series: [{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'run_dist',
	                style: {
	                    opacity: 0.4
	                }
	            },{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'run_time',
	                style: {
	                    opacity: 0.4
	                }
	            },{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'consmpt',
	                style: {
	                    opacity: 0.4
	                }
	            },{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'co2_emss',
	                style: {
	                    opacity: 0.4
	                }
	            },{
	                showInLegend: true,
	                type: 'radar',
	                xField: 'month_str',
	                yField: 'effcc',
	                style: {
	                    opacity: 0.4
	                }		            
	            }]
			}]
		};
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
	                fields: ['month'],
	                title: T('label.month'),
	                label: { renderer: Ext.util.Format.dateRenderer('Y-m') }
				}],
				series : [{
					type : chartType,
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
					}
				}]
			}]
		}
	}
});