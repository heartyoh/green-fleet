Ext.define('GreenFleet.view.portlet.ChartV1Portlet', {

	extend: 'Ext.panel.Panel',
    
	alias: 'widget.chart_v1_portlet',
	
	chartType : 'health',
	
	chartPanel : null,
	
    initComponent: function() {
    	var self = this;
        this.callParent(arguments);
        this.chartPanel = this.healthChart();
        this.add(this.chartPanel);
        this.reload();
    },
    
    reload : function() {
    	var self = this;
    	this.setLoading(true);
    	Ext.Ajax.request({
    		url: '/report/service',
		    method : 'GET',
		    params : { id : 'vehicle_health', health_type : self.chartType },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
					var healthRecord = self.findRecord(records, self.chartType);
					self.chartPanel.items[0].store.loadData(healthRecord.summary);
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
	
    healthChart : function() {
    	var self = this;
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard',
			height : self.height - 5,
			items : [{
				xtype: 'chart',
		        animate: true,
		        store: Ext.create('Ext.data.ArrayStore', {
					fields: [ {
				        name : 'name', type : 'string',
				        convert : function(value, record) {
				        	if(self.chartType == 'health')
				        		return T('label.' + value);
				        	else
				        		return value;
				        }
					},  'value'], data: []}),
				width : 245,
				height : self.height - 20,
		        shadow: false,
		        legend: {
		            position: 'right',
		            labelFont : '6px',
		            boxStroke : '#cfcfcf'
		        },
		        insetPadding: 10,
		        theme: 'Base:gradients',
		        series: [{
		            type: 'pie',
		            field: 'value',
		            showInLegend: true,
		            donut: false,
		            tips: {
		              trackMouse: true,
		              width: 140,
		              height: 25,
		              renderer: function(storeItem, item) {
		            	  var total = 0;
		            	  self.chartPanel.items[0].store.each(function(rec) {
		            		  total += rec.get('value');
		            	  });
		            	  var name = storeItem.get('name');
		            	  var count = storeItem.get('value');
		            	  var percent = Math.round(count / total * 100);
		            	  this.setTitle(name + ' : ' + count + '(' + percent + '%)');
		              }
		            },
		            highlight: {
		              segment: {
		                margin: 5
		              }
		            },
		            label: {
		                field: 'name',
		                display: 'rotate',
		                contrast: true,
		                font: '10px Arial'
		            }
		        }]
			}]
		}
	}
});
