Ext.define('GreenFleet.view.dashboard.VehicleHealth', {
	extend : 'Ext.Container',
	
	alias : 'widget.dashboard_vehicle_health',
	
	layout : {
		type : 'vbox',
		align : 'stretch'
	},
	
	items : [{
		xtype : 'container',
		cls :'pageTitle',
		height: 35,
		html : '<h1>' + T('title.vehicle_health') + '</h1>'
	}],
	
	initComponent : function() {
		this.callParent();
		var content = this.add({
			xtype : 'panel',
			flex : 1,
			cls : 'paddingAll10',
			layout : {
				type : 'vbox',
				align : 'stretch'
			}
		});
		
		var row1 = this.createRow(content);
		var row2 = this.createRow(content);		
		var dashboardStore = Ext.getStore('DashboardVehicleStore');
		
		dashboardStore.load({
			scope : this,
			callback: function(records, operation, success) {
				var healthRecord = this.findRecord(records, "health");
				var ageRecord = this.findRecord(records, "age");
				var mileageRecord = this.findRecord(records, "mileage");
				var runtimeRecord = this.findRecord(records, "runtime");
				
				this.addHealthChartToRow(row1, T('title.vehicle_health'), healthRecord);
				this.addChartToRow(row1, T('title.running_distance') + '(km)', mileageRecord);
				this.addChartToRow(row2, T('title.vehicle_age') + T('label.parentheses_year'), ageRecord);
				this.addChartToRow(row2, T('title.vehicle_runtime') + T('label.parentheses_hour'), runtimeRecord);
			}
		});
	},
	
	addHealthChartToRow : function(row, title, record) {
		var store = Ext.create('Ext.data.JsonStore', {
		    fields: [
		        {
		        	name : 'name',
		        	type : 'string',
		        	convert : function(value, record) {
		        		return T('label.' + value);
		        	}
				},  'value'],
		    data: record.data.summary
		});
		
		row.add(this.buildHealthChart(title, store, 'value'));		
	},
	
	addChartToRow : function(row, title, record) {
		var store = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'value'],
		    data: record.data.summary
		});
		
		row.add(this.buildHealthChart(title, store, 'value'));		
	},
	
	findRecord : function(records, healthName) {
		for(var i = 0 ; i < records.length ; i++) {
			if(records[i].data.name == healthName) {
				return records[i];
			}
		}
		
		return null;
	},
	
	createRow : function(content) {
		return content.add({
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			}
		});		
	},
	
	buildEmptyChart : function() {
		return {
			xtype : 'panel',
			cls : 'paddingPanel healthDashboard',
			flex:1,
			height : 280
		}
	},	
	
	buildHealthChart : function(title, store, idx) {
		return {
			xtype : 'panel',
			title : title,
			cls : 'paddingPanel healthDashboard',
			flex:1,
			height : 280,
			items : [{
				xtype: 'chart',
		        animate: true,
		        store: store,
				width : 440,
				height : 270,
		        shadow: true,
		        legend: {
		            position: 'right',
		            labelFont : '10px',
		            boxStroke : '#cfcfcf'
		        },
		        insetPadding: 15,
		        theme: 'Base:gradients',
		        series: [{
		            type: 'pie',
		            field: idx,
		            showInLegend: true,
		            donut: false,
		            tips: {
		              trackMouse: true,
		              width: 140,
		              height: 25,
		              renderer: function(storeItem, item) {
		            	  // calculate percentage.
		            	  var total = 0;
		            	  store.each(function(rec) {
		            		  total += rec.get(idx);
		            	  });
		            	  var name = storeItem.get('name');
		            	  var count = storeItem.get('value');
		            	  var percent = Math.round(count / total * 100);
		            	  this.setTitle(name + ' : ' + count + '(' + percent + '%)');
		              }
		            },
		            highlight: {
		              segment: {
		                margin: 20
		              }
		            },
		            label: {
		                field: 'name',
		                display: 'rotate',
		                contrast: true,
		                font: '14px Arial'
		            }
		        }]
			}]
		}
	}

});