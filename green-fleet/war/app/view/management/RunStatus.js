Ext.define('GreenFleet.view.management.RunStatus', {
	extend : 'Ext.Container',

	alias : 'widget.management_runstatus',

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

		this.sub('vehicle_info').on('itemclick', function(grid, record) {
			var runStatusStore = self.sub('runstatus_grid').store;
			var proxy = runStatusStore.getProxy();
			proxy.extraParams.vehicle = record.data.id;
			proxy.extraParams.from_date = self.sub('from_date').getValue();
			proxy.extraParams.to_date = self.sub('to_date').getValue();
			runStatusStore.load({
				scope : self,
				callback : function() {					
					self.refreshChart(runStatusStore, 'run_dist');
					self.sub('combo_chart').setValue('run_dist');
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
	},
	
	searchVehicles : function(searchRemote) {
		
		if(searchRemote) {
			this.sub('vehicle_info').store.load();
		} else {
			this.sub('vehicle_info').store.clearFilter(true);			
			var idValue = this.sub('id_filter').getValue();
			var regNoValue = this.sub('reg_no_filter').getValue();
			
			if(idValue || regNoValue) {
				this.sub('vehicle_info').store.filter([ {
					property : 'id',
					value : idValue
				}, {
					property : 'registration_number',
					value : regNoValue
				} ]);
			}			
		}		
	},		
	
	zvehiclelist : function(self) {
		return {
			xtype : 'gridpanel',
			itemId : 'vehicle_info',
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
						btn.up('management_runstatus').searchVehicles(true);
					}
				}
			]
		}
	},

	zrunstatus : {
		xtype : 'grid',
		itemId : 'runstatus_grid',
		store : 'VehicleRunStore',
		cls : 'hIndexbar',
		title : T('title.runstatus_history'),
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
		} ]
	},

	zrunstatus_chart : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_chart'),
		flex : 1.5,
		autoScroll : true,
		tbar : [
		    { xtype : 'tbfill' },
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
		    '  ' + T('label.chart') + ' : ',
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
						var thisView = combo.up('management_runstatus');
						var runStatusStore = thisView.sub('runstatus_grid').store;
						thisView.refreshChart(runStatusStore, currentValue);
					}
			    }
			}, 
			'  '
		]
	},
	
	getOneYearBefore : function() {
		return new Date();
	},
	
	refreshChart : function(store, yField) {
		
		var chartTypeArr = this.sub('combo_chart').store.data;
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
		
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildChart(store, yField, yTitle, unit, 0, width, height);
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
		var chart = chartPanel.down('chart');
		chartPanel.setWidth(width - 25);
		chartPanel.setHeight(height - 70);
		chart.setWidth(width - 25);
		chart.setHeight(height - 85);
	},	
	
	buildChart : function(store, yField, yTitle, unit, minValue, width, height) {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard paddingAll10',
			width : width - 25,
			height : height - 70,
			items : [ 
				{
					xtype : 'chart',
					animate : true,
					store : store,
					width : width - 25,
					height : height - 85,
					shadow : true,
					insetPadding : 15,
					theme : 'Base:gradients',
					axes: [
						{
			                type: 'Numeric',
			                position: 'left',
			                fields: [yField],
			                label: {
			                	renderer: Ext.util.Format.numberRenderer('0,0')
			                },
			                title: yTitle,
			                minimum: minValue
			            }, {
			                type: 'Category',
			                position: 'bottom',
			                fields: ['month'],
			                title: T('label.month'),
			                label: {
			                	renderer: Ext.util.Format.dateRenderer('Y-m')
			                }
			            }
		            ],
					series : [
						{
							type : 'column',
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
							},
							listeners : {
								itemmousedown : function(target, event) {
								}
							}
						}
					]
				}
			]
		}
	}	
});