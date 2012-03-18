Ext.define('GreenFleet.view.management.VehicleConsumableGrid', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle_consumable_grid',

	title : T('title.vehicle_consumable'),
	
	initComponent : function() {
		var self = this;		
		this.callParent(arguments);
		this.add(this.buildGrid(this));
		
		this.sub('edit_consumables_grid').on('edit', function(editor, e) {
			var record = editor.record.data;
			
			Ext.Ajax.request({
			    url: '/vehicle_consumable/save',
			    method : 'POST',
			    params: {
			    	key : record.key,
			        vehicle_id : record.vehicle_id,
			        consumable_item : record.consumable_item,
			        repl_unit : record.repl_unit,
			        fst_repl_mileage : record.fst_repl_mileage,
			        fst_repl_time : record.fst_repl_time,
			        repl_mileage : record.repl_mileage,
			        repl_time : record.repl_time
			    },
			    success: function(response) {
			        var resultObj = Ext.JSON.decode(response.responseText);
			        if(resultObj.success) {
				        GreenFleet.msg("Success", resultObj.key);
			        } else {
			        	Ext.MessageBox.alert("Failure", resultObj.msg);
			        }
			    },
			    failure: function(response) {
			    	Ext.MessageBox.alert("Failure", response.responseText);
			    }
			});			
		});		
	},	
		
	buildGrid : function(main) {

	    var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
	        clicksToMoveEditor: 1,
	        autoCancel: false
	    });

	    var grid = Ext.create('Ext.grid.Panel', {
	    	
	    	itemId : 'edit_consumables_grid',
	        title: T('title.vehicle_consumables'),	        
	        frame: true,	     
	        store: 'VehicleConsumableStore',
	        plugins: [rowEditing],
	        vehicleId : '',
	        
	        columns: [
		        {
		        	header : 'Key',
		        	dataIndex : 'key',
		        	hidden : true,
		        },
		        {
		        	header : 'Vehicle',
		        	dataIndex : 'vehicle_id',
		        	hidden : true,
		        },		        
		        {
		            header: T('label.consumable_item'),
		            dataIndex: 'consumable_item'	
		        }, {
		            header: T('label.repl_unit'),
		            dataIndex: 'repl_unit',
		            width: 100,
		            editor: {
		            	xtype : 'codecombo',
		                allowBlank: false,
						name : 'repl_unit',
						group : 'ReplacementUnit'
					}
		        }, {
		            xtype: 'numbercolumn',
		            header: T('label.repl_mileage') + " (km)",
		            dataIndex: 'repl_mileage',
		            width: 105,
		            editor: {
		                xtype: 'numberfield',
		                allowBlank: false,
		                minValue: 0,
		                maxValue: 500000
		            }	        	
		        }, {
		            xtype: 'numbercolumn',
		            header: T('label.repl_time') + " (month)",
		            dataIndex: 'repl_time',
		            width: 105,
		            editor: {
		                xtype: 'numberfield',
		                allowBlank: false,
		                minValue: 0,
		                maxValue: 120
		            }
		        }, {
		            header: T('label.last_repl_date'),
		            dataIndex: 'last_repl_date',
		            width: 100
		        }, {
		            xtype: 'numbercolumn',
		            header: T('label.miles_last_repl') + " (km)",
		            dataIndex: 'miles_last_repl',
		            width: 115
		        }, {
		        	header : T('label.next_repl_mileage') + " (km)",
		        	dataIndex : 'next_repl_mileage',
		        	width : 130		        	
		        }, {
		        	header : T('label.next_repl_date'),
		        	dataIndex : 'next_repl_date',
		        	width : 90		        	
		        }, {
		        	header : T('label.accrued_cost'),
		        	dataIndex : 'accrued_cost',
		        	width : 90		        	
		        }
	        ],
	        
	        /*tbar: [{
	            text: T('button.sync'),
	            handler : function() {
	            }
	        }],
	        
	        listeners: {
	            selectionchange: function(view, records) {	                
	            }
	        }*/
	    });
	    
	    return grid;
	}
});