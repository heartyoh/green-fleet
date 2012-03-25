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
		})
		
		var store1 = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'age', 'data2', 'data3', 'data4', 'data5'],
		    data: [
		        { 'name': '~ 1Y',   'age': 10, 'data2': 12, 'data3': 14, 'data4': 8,  'data5': 13 },
		        { 'name': '1Y ~ 2Y',   'age': 13,  'data2': 8,  'data3': 16, 'data4': 10, 'data5': 3  },
		        { 'name': '2Y ~ 3Y', 'age': 18,  'data2': 2,  'data3': 14, 'data4': 12, 'data5': 7  },
		        { 'name': '3Y ~ 5Y',  'age': 5,  'data2': 14, 'data3': 6,  'data4': 1,  'data5': 23 },
		        { 'name': '5Y ~ 10Y',  'age': 3, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 },
		        { 'name': '10Y ~',  'age': 1, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 }
		    ]
		});

		var store2 = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'rd', 'data2', 'data3', 'data4', 'data5'],
		    data: [
		        { 'name': '~ 10K',   'rd': 1, 'data2': 12, 'data3': 14, 'data4': 8,  'data5': 13 },
		        { 'name': '10K ~ 30K',   'rd': 4,  'data2': 8,  'data3': 16, 'data4': 10, 'data5': 3  },
		        { 'name': '30K ~ 50K', 'rd': 5,  'data2': 2,  'data3': 14, 'data4': 12, 'data5': 7  },
		        { 'name': '50K ~ 100K',  'rd': 22,  'data2': 14, 'data3': 6,  'data4': 1,  'data5': 23 },
		        { 'name': '100K ~ 200K',  'rd': 12, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 },
		        { 'name': '200K ~',  'rd': 6, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 }
		    ]
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
				
				this.addHealthChartToRow(row1, T('title.vehicle_health'), healthRecord);
				this.addChartToRow(row1, T('title.running_distance'), mileageRecord);
				this.addChartToRow(row2, T('title.vehicle_age'), ageRecord);
				row2.add(this.buildEmptyChart());
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
				},  'count'],
		    data: record.data.summary
		});
		
		row.add(this.buildHealthChart(title, store, 'count'));		
	},
	
	addChartToRow : function(row, title, record) {
		var store = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'count'],
		    data: record.data.summary
		});
		
		row.add(this.buildHealthChart(title, store, 'count'));		
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
		                this.setTitle(storeItem.get('name') + ': ' + Math.round(storeItem.get(idx) / total * 100) + '%');
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