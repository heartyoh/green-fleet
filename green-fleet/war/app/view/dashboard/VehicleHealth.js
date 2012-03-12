Ext.define('GreenFleet.view.dashboard.VehicleHealth', {
	extend : 'Ext.Container',
	
	alias : 'widget.dashboard_health',
	
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
			autoScroll : true,
			layout : {
				type : 'vbox',
				align : 'stretch'
			}
		})
		var row1 = content.add({
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			}
		});
		
		var row2 = content.add({
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			}
		});
		
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

		var store3 = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'tb', 'eo', 'data3', 'data4', 'data5'],
		    data: [
		        { 'name': T('label.health'),   'tb': 31, 'eo': 27, 'data3': 14, 'data4': 8,  'data5': 13 },
		        { 'name': T('label.impending'),   'tb': 17,  'eo': 19,  'data3': 16, 'data4': 10, 'data5': 3  },
		        { 'name': T('label.overdue'), 'tb': 2,  'eo': 4,  'data3': 14, 'data4': 12, 'data5': 7  }
		    ]
		});

		row1.add(this.buildHealthChart(T('title.vehicle_age'), store1, 'age'));
		row1.add(this.buildHealthChart(T('title.running_distance'), store2, 'rd'));
		row2.add(this.buildHealthChart(T('title.timing_belt_health'), store3, 'tb'));
		row2.add(this.buildHealthChart(T('title.engine_oil_health'), store3, 'eo'));
		
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