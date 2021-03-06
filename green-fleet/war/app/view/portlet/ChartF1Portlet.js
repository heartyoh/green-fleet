Ext.define('GreenFleet.view.portlet.ChartF1Portlet', {

	extend: 'Ext.panel.Panel',
    
	alias: 'widget.chart_f1_portlet',
	
	chartPanel : null,
	
	category : 'vehicle',
	
    initComponent: function() {
    	var self = this;
        this.callParent(arguments);
        this.chartPanel = this.buildChart(370, 230);
        this.add(this.chartPanel);
        this.reload();
    },
    
    reload : function() {
    	var self = this;
    	this.setLoading(true);
    	Ext.Ajax.request({
		    url: '/report/service',
		    method : 'GET',
		    params : { id : 'fuel', type : 'top5', category : this.category },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
					self.chartPanel.items[0].store.loadData(records);
					Ext.defer(function() {self.setLoading(false);}, 100);
					
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});    	
    },
    
	findRecord : function(records, chartType) {
		for(var i = 0 ; i < records.length ; i++) {
			if(records[i].name == chartType)
				return records[i];
		}
		return null;
	},
	
	/**
	 * 차트 생성 
	 */
	buildChart : function(width, height) {
		var self = this;
		
		return {
			xtype : 'panel',
			autoscroll : true,
			cls : 'paddingPanel healthDashboard',
			height : height - 5,
			items : [{
				xtype : 'chart',
				animate : true,
		        store: Ext.create('Ext.data.ArrayStore', { fields: [ { name : self.category, type : 'string' },  { name : 'effcc', type : 'double' } ], data: [] }),
				width : width - 35,
				height : height - 45,
				shadow : false,
				insetPadding : 5,
				theme : 'Base:gradients',
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: ['effcc'],
	                label: { renderer: Ext.util.Format.numberRenderer('0,0') },
	                title: T('label.fuel_efficiency'),
	                minimum: 0
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: [self.category],
	                title: T('label.' + self.category)
				}],
				series : [{
					type : 'column',
					axis: 'left',
					xField: 'vehicle',
	                yField: 'effcc',
					showInLegend : true,
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							this.setTitle(storeItem.get(self.category) + ' : ' + storeItem.get('effcc') + '(km/l)');
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label : {
						field : 'effcc',
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
