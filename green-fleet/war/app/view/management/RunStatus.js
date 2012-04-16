Ext.define('GreenFleet.view.management.RunStatus', {
	extend : 'Ext.Container',

	alias : 'widget.management_runstatus',

	title : T('title.vehicle_runstatus'),

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	chartPanel : null,

	initComponent : function() {
		var self = this;

		this.items = [ {
			html : "<div class='listTitle'>" + T('title.vehicle_runstatus') + "</div>"
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.zvehiclelist(self), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.zrunstatus, this.zrunstatus_chart ]
			} ]
		} ],

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
					self.refreshChart('Running Distance', runStatusStore, 'month', 'run_dist');
				}
			});
		});

		this.sub('runstatus_grid').on('itemclick', function(grid, record) {			
		});
		
		this.sub('runstatus_grid').on('itemdblclick', function(grid, record) {
		});
		
		this.sub('chart_panel').on('resize', function(panel, adjWidth, adjHeight, eOpts) {
			if(self.chartPanel) {				
				self.resizeChart();
			}
		})		
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
			    /*{
			    	xtype : 'container',
			    	layout : 'hbox',
			    	items : [
						{
							xtype : 'textfield',
							name : 'id_filter',
							itemId : 'id_filter',
							fieldLabel : T('label.id'),
							width : 100
						}, {
							xtype : 'textfield',
							name : 'reg_no_filter',
							fieldLabel : T('label.reg_no'),
							itemId : 'reg_no_filter',
							width : 100
						}		    	       
			    	]
			    },*/
				T('label.period') + ' : ',
				{
					xtype : 'datefield',
					name : 'from_date',
					itemId : 'from_date',
					format : 'Y-m-d',
					submitFormat : 'U',
					maxValue : new Date(),
					value : new Date() - 7,
					width : 90
				},
				{
					xtype : 'label',
					fieldLabel : ' ~ '
				},
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
				{
					xtype : 'button',
					text : T('button.search'),
					handler : function(btn) {
						btn.up('gridpanel').store.load();
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
			header : T('label.fuel_efficiency') + ' (g/km)',
			dataIndex : 'effcc'
		} ]
	},

	zrunstatus_chart : {
		xtype : 'panel',
		itemId : 'chart_panel',
		cls : 'hIndexbar',
		title : T('title.runstatus_chart'),
		flex : 1.5,
		autoScroll : true
	},	
	
	refreshChart : function(title, store, x_field, y_field) {
		var chartPanel = this.sub('chart_panel');
		var width = chartPanel.getWidth();
		var height = chartPanel.getHeight();
		chartPanel.removeAll();
		var chart = this.buildChart(title, store, x_field, y_field, width, height);
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
		chartPanel.setWidth(width);
		chartPanel.setHeight(height);
		chart.setWidth(width);
		chart.setHeight(height);
	},	
	
	buildChart : function(title, store, x_field, y_field, width, height) {
		return {
			xtype : 'panel',
			title : title,
			cls : 'paddingPanel healthDashboard',
			width : width,
			height : height,
			items : [ {
				xtype : 'chart',
				animate : true,
				store : store,
				width : width - 10,
				height : height - 10,
				shadow : true,
				legend : {
					position : 'right',
					labelFont : '10px',
					boxStroke : '#cfcfcf'
				},
				insetPadding : 15,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: [y_field],
	                label: {
	                	renderer: Ext.util.Format.numberRenderer('0,0')
	                },
	                title: 'Number',
	                minimum: 1000
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: [x_field],
	                title: 'Month',
	                label: {
	                	renderer: Ext.util.Format.dateRenderer('Y-m')
	                }	                
	            }],	
				series : [ {
					type : 'column',
					axis: 'left',
					xField: x_field,
	                yField: y_field,
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : 'run_dist',
						display : 'insideEnd',
						contrast : true,
						color: '#333',
						font : '14px Arial',
					},
					listeners : {
						itemmousedown : function(target, event) {
							
						}
					}
				} ]
			} ]			
		}
	}	
});