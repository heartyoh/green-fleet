Ext.define('GreenFleet.view.management.VehicleRunStatus', {
	extend : 'Ext.Container',

	alias : 'widget.management_vehicle_runstatus',

	title : T('title.vehicle_runstatus'),

	entityUrl : 'vehicle_run',
	
	importUrl : 'vehicle_run/import',

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
		    { html : "<div class='listTitle'>" + T('title.vehicle_runstatus') + "</div>"}, 
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
			proxy.extraParams.select = ['vehicle', 'month', 'month_str', 'run_dist', 'run_time', 'consmpt', 'co2_emss', 'effcc', 'oos_cnt', 'mnt_cnt', 'mnt_time'];
			proxy.extraParams.vehicle = record.data.id;
			proxy.extraParams.from_date = self.sub('from_date').getValue();
			proxy.extraParams.to_date = self.sub('to_date').getValue();
			runStatusStore.load({
				scope : self,
				callback : function() {					
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
		 * combo_chart에 값을 기본값(run_dist)을 설정
		 */
		this.sub('combo_chart').setValue('run_dist');
		/**
		 * combo_view에 값을 기본값(monthly_view)을 설정
		 */
		this.sub('combo_view').setValue('monthly_view');		
	},
	
	/**
	 * 차량 조회 
	 */
	searchVehicles : function(searchRemote) {
		
		if(searchRemote) {
			this.sub('vehicle_list').store.load();
			
		} else {
			this.sub('vehicle_list').store.clearFilter(true);			
			var idValue = this.sub('id_filter').getValue();
			var regNoValue = this.sub('reg_no_filter').getValue();
			
			if(idValue || regNoValue) {
				this.sub('vehicle_list').store.filter([ {
					property : 'id',
					value : idValue
				}, {
					property : 'registration_number',
					value : regNoValue
				} ]);
			}			
		}		
	},		
	
	/**
	 * 차량 리스트 그리드 
	 */
	zvehiclelist : function(self) {
		return {
			xtype : 'gridpanel',
			itemId : 'vehicle_list',
			store : 'VehicleBriefStore',
			title : T('title.vehicle_list'),
			width : 280,
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
				T('label.reg_no'),
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
						btn.up('management_vehicle_runstatus').searchVehicles(true);
					}
				}
			]
		}
	},

	/**
	 * 차량 운행 이력 데이터 그리드
	 */
	zrunstatus : {
		xtype : 'panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_history'),
		flex : 1,
		autoScroll : true,
		items : [{
			xtype : 'grid',
			itemId : 'runstatus_grid',
			store : 'VehicleRunStore',
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
				header : T('label.outofservice_count'),
				dataIndex : 'oos_cnt'
			}, {
				header : T('label.maintenance_count'),
				dataIndex : 'mnt_cnt'
			}, {
				header : T('label.maintenance_time') + ' (min)',
				dataIndex : 'mnt_time'
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
						var thisView = combo.up('management_vehicle_runstatus');
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
					data : [{ "name" : "run_dist", 		"desc" : T('label.run_dist'), 			"unit" : "(km)" },
					        { "name" : "run_time", 		"desc" : T('label.run_time'), 			"unit" : "(min)" },
					        { "name" : "rate_of_oper", 	"desc" : T('label.rate_of_oper'), 		"unit" : "(%)" },
							{ "name" : "consmpt", 		"desc" : T('label.fuel_consumption'), 	"unit" : "(l)" },
							{ "name" : "co2_emss", 		"desc" : T('label.co2_emissions'), 		"unit" : "(g/km)" },
							{ "name" : "effcc", 		"desc" : T('label.fuel_efficiency'), 	"unit" : "(km/l)" },
							{ "name" : "oos_cnt", 		"desc" : T('label.outofservice_count'), "unit" : "" },
							{ "name" : "mnt_cnt", 		"desc" : T('label.maintenance_count'), 	"unit" : "" },
							{ "name" : "mnt_time", 		"desc" : T('label.maintenance_time'), 	"unit" : "" }]
				}),
				listeners: {
					change : function(combo, currentValue, beforeValue) {
						var thisView = combo.up('management_vehicle_runstatus');
						
						if(currentValue != 'driving_habit')
							thisView.refreshChart();
						else
							thisView.refreshRadarChart();
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
		autoScroll : true
	},
	
	/**
	 * 차트 갱신
	 */
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
		
		if(yField == 'rate_of_oper') {
			this.setRateOfOper(store);
		}
		
		var chart = this.buildChart(chartType, store, yField, yTitle, unit, 0, width, height);		
		chartPanel.removeAll();
		chartPanel.add(chart);
		this.chartPanel = chart;
	},
	
	/**
	 * 가동율 차트를 선택했을 경우 가동율 계산 후 추가 
	 */
	setRateOfOper : function(store) {
		
		store.each(function(record) {
			var monthStr = record.get('month_str');
			var mntTime = record.get('mnt_time');			
			var rateOfOper = mntTime ? ((mntTime / 30 * 24 * 60) * 100) : 0;
			record.data.rate_of_oper = rateOfOper;
		});
	},
	
	/**
	 * 차트 타입을 Radar로 선택했을 때 차트 갱신 
	 */
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
	
	/**
	 * 차트 리사이즈 
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
	 * 레이더 차트 생성 
	 */
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
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(chartType, store, yField, yTitle, unit, minValue, width, height) {
		return {
			xtype : 'panel',
			autoscroll : true,
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