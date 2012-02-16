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
		html : '<h1>Vehicle Health</h1>'
	}],
	
	initComponent : function() {
		this.callParent();
		
		var content = this.add({
			xtype : 'container',
			flex : 1,
			layout : 'auto'
		});
		
		var store = Ext.create('Ext.data.JsonStore', {
		    fields: ['name', 'data1', 'data2', 'data3', 'data4', 'data5'],
		    data: [
		        { 'name': 'Best',   'data1': 10, 'data2': 12, 'data3': 14, 'data4': 8,  'data5': 13 },
		        { 'name': 'Better',   'data1': 7,  'data2': 8,  'data3': 16, 'data4': 10, 'data5': 3  },
		        { 'name': 'Good', 'data1': 5,  'data2': 2,  'data3': 14, 'data4': 12, 'data5': 7  },
		        { 'name': 'Worse',  'data1': 2,  'data2': 14, 'data3': 6,  'data4': 1,  'data5': 23 },
		        { 'name': 'Worst',  'data1': 27, 'data2': 38, 'data3': 36, 'data4': 13, 'data5': 33 }
		    ]
		});

		content.add(this.buildHealthChart(store, 'data1'));
		content.add(this.buildHealthChart(store, 'data2'));
		content.add(this.buildHealthChart(store, 'data3'));
		content.add(this.buildHealthChart(store, 'data4'));
	},
	
	buildHealthChart : function(store, idx) {
		return {
			width : 420,
			height : 300,
			xtype: 'chart',
	        animate: true,
	        store: store,
	        shadow: true,
	        legend: {
	            position: 'right'
	        },
	        insetPadding: 60,
	        theme: 'Base:gradients',
	        series: [{
	            type: 'pie',
	            field: idx,
	            showInLegend: true,
	            donut: false,
	            tips: {
	              trackMouse: true,
	              width: 140,
	              height: 28,
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
		}
	}

});