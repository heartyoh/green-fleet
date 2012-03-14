Ext.define('GreenFleet.view.management.VehicleConsumableGrid', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle_consumable_grid',

	title : T('title.vehicle_consumable'),
	
	initComponent : function() {
		var self = this;		
		this.callParent(arguments);
		this.add(this.buildGrid(this));
		
		this.sub('edit_consumables_grid').store.on('beforeload', function(store, operation, opt) {
			var vehicleId = self.sub('edit_consumables_grid').vehicleId;
			
			if(!vehicleId) {
				Ext.Msg.alert('Vehicle Id Not Selected!', 'Please select vehicle from vehicle list!');
				return false;
			} else {				
				operation.params = operation.params || {};
				operation.params['vehicle_id'] = vehicleId;				
			}
		});
		
		this.sub('edit_consumables_grid').on('edit', function(editor, e) {
			var record = editor.record.data;
			
			Ext.Ajax.request({
			    url: '/vehicle_consumable/save',
			    method : 'POST',
			    params: {
			    	key : record.key,
			        vehicle_id : record.vehicle_id,
			        consumable_code : record.consumable_code,
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
		            header: T('label.consumable_code'),
		            dataIndex: 'consumable_code'	
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
		            header: T('label.fst_repl_mileage') + " (km)",
		            dataIndex: 'fst_repl_mileage',
		            width: 130,
		            editor: {
						xtype : 'numberfield',
						minValue : 0,
						maxValue : 500000,
		            }
		        }, {
		            xtype: 'numbercolumn',
		            header: T('label.fst_repl_time') + " (" + T('label.month') + ")",
		            dataIndex: 'fst_repl_time',
		            width: 130,
		            editor: {
		                xtype: 'numberfield',
		                allowBlank: false,
		                minValue: 0,
		                maxValue: 120
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
		            header: T('label.repl_time') + " (" + T('label.month') + ")",
		            dataIndex: 'repl_time',
		            width: 105,
		            editor: {
		                xtype: 'numberfield',
		                allowBlank: false,
		                minValue: 0,
		                maxValue: 120
		            }
		        }
	        ],
	        
	        /*tbar: [{
	            text: T('button.add'),
	            handler : function() {
	                rowEditing.cancelEdit();

	                var r = Ext.create('VehicleConsumable', {
	                    cosumable_code: '',
	                    repl_unit: 'Mileage',
	                    fst_repl_mileage: 0,
	                    fst_repl_time: 0,
	                    repl_mileage: 0,
	                    repl_time: 0
	                });

	                store.insert(0, r);
	                rowEditing.startEdit(0, 0);
	            }
	        }, {
	            itemId: 'remove_cosumable',
	            text: T('button.del'),
	            disabled: true,
	            
	            handler: function() {
	                var sm = grid.getSelectionModel();
	                rowEditing.cancelEdit();
	                store.remove(sm.getSelection());
	                if (store.getCount() > 0) {
	                    sm.select(0);
	                }
	            }	            
	        }],       
	        
	        listeners: {
	            'selectionchange': function(view, records) {
	                grid.down('#remove_cosumable').setDisabled(!records.length);
	            }
	        }*/
	    });
	    
	    return grid;
	}
});