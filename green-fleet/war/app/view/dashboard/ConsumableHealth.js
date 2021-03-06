Ext.define('GreenFleet.view.dashboard.ConsumableHealth', {
	extend : 'Ext.Container',

	alias : 'widget.dashboard_consumable_health',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	items : [ {
		xtype : 'container',
		cls : 'pageTitle',
		height : 35,
		html : '<h1>' + T('title.consumable_health') + '</h1>'
	} ],

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

		var dashboardStore = Ext.getStore('DashboardConsumableStore');

		dashboardStore.load({
			scope : this,
			callback : function(records, operation, success) {

				var columnCount = 0;
				var row = null;

				for ( var i = 0; i < records.length; i++) {
					var record = records[i];
					var consumableItem = record.data.consumable;				
					
					if (columnCount == 0) {
						row = this.createRow(content);
						columnCount++;
					} else if (columnCount == 1) {
						columnCount++;
					} else if (columnCount == 2) {
						columnCount = 0;
					}
					
					this.addToRow(row, consumableItem, record);
				}

				var addCount = 3 - columnCount;
				if (addCount < 3) {
					for ( var j = 0; j < addCount; j++)
						row.add(this.buildEmptyChart());
				}
			}
		});
	},
	
	addToRow : function(row, consumableItem, record) {
		
		var summaryRecords = record.data.summary;		
		Ext.Array.each(summaryRecords, function(summaryRecord) {
	        summaryRecord.consumable = consumableItem;
	        summaryRecord.desc = T('label.' + summaryRecord.name);
	    });
		
		var store = Ext.create('Ext.data.JsonStore', {
			fields : ['consumable', 'name', 'desc', 'value' ],
			autoDestroy : true,
			data : summaryRecords
		});
		
		row.add(this.buildHealthChart(consumableItem + ' ' + T('menu.health'), store, 'value'));		
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
			flex : 1,
			height : 280
		}
	},

	buildHealthChart : function(title, store, idx) {
		return {
			xtype : 'panel',
			title : title,
			cls : 'paddingPanel healthDashboard',
			flex : 1,
			height : 280,
			items : [ {
				xtype : 'chart',
				animate : true,
				store : store,
				width : 290,
				height : 150,
				shadow : true,
				
				insetPadding : 20,
				theme : 'Base:gradients',
				
				axes: [{
	                type: 'Numeric',
	                position: 'left',
	                fields: ['value'],
	                label: {
	                    renderer: Ext.util.Format.numberRenderer('0,0')
	                },
	                //title: '',
	                grid: true,
	                minimum: 0
	            }, {
	                type: 'Category',
	                position: 'bottom',
	                fields: ['desc'],
	                //title: ''
	            }],
	            
				series : [ {
					type: 'column',
	                axis: 'left',
	                highlight: true,
	                xField: 'name',
	                yField: 'value',
					tips : {
						trackMouse : true,
						width : 140,
						height : 25,
						renderer : function(storeItem, item) {
							// calculate percentage.
							var total = 0;
							store.each(function(rec) {
								total += rec.get(idx);
							});
							var name = storeItem.get('desc');
							var count = storeItem.get('value');
							var percent = Math.round(count / total * 100);
							this.setTitle(name + ' : ' + count + '(' + percent + '%)');
						}
					},
					highlight : {
						segment : {
							margin : 20
						}
					},
					label: {
		                  display: 'insideEnd',
		                  'text-anchor': 'middle',
		                    field: 'value',
		                    renderer: Ext.util.Format.numberRenderer('0'),
		                    //orientation: 'vertical',
		                    color: '#333'
		                },
					listeners : {
						itemmousedown : function(target, event) {
							GreenFleet.doMenu("consumable");
							var menu = GreenFleet.getMenu('consumable');
							menu.setConsumable(target.storeItem.data.consumable, target.storeItem.data.name);
						}
					}
				} ]
			} ]
		}
	}

});