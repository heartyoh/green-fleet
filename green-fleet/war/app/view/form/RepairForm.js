Ext.define('GreenFleet.view.form.RepairForm', {
	extend : 'Ext.form.Panel',

	alias : 'widget.repair_form',
	
	autoScroll : true,

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;		
		this.callParent();
	},
	
	setVehicleId : function(vehicleId) {
		this.sub('vehicle_id').setValue(vehicleId);
	},
	
	items : [
		{
		    xtype: 'fieldset',
		    title: 'Vehicle',
		    defaultType: 'textfield',
		    layout: 'anchor',
		    collapsible: true,
		    padding : '10,5,5,5',
		    defaults: {
		        anchor: '100%'
		    },
		    items: [
		        {
					name : 'key',
					fieldLabel : 'Key',
					hidden : true
		        },						            
				{
		        	itemId : 'vehicle_id',
					name : 'vehicle_id',
					fieldLabel : T('label.vehicle_id')
				}
		    ]
		},
		{
		    xtype: 'fieldset',
		    title: 'Repair',
		    defaultType: 'textfield',
		    layout: 'anchor',
		    padding : '10,5,5,5',
		    defaults: {
		        anchor: '100%'
		    },				
		    items: [
				{
					name : 'repair_date',
					fieldLabel : T('label.repair_date'),
					xtype : 'datefield',
					format : F('date'),
					value : new Date()
				}, {
					xtype : 'numberfield',
					name : 'repair_mileage',
					fieldLabel : T('label.repair_mileage') + ' (km)'
				}, {
					name : 'repair_man',
					fieldLabel : T('label.repair_man')
				}, {
					name : 'repair_shop',
					fieldLabel : T('label.repair_shop')
				}, {
					xtype : 'numberfield',
					name : 'cost',
					fieldLabel : T('label.cost'),
					minValue : 0					
				}, {
					xtype : 'textarea',
					name : 'content',
					fieldLabel : T('label.content')
				}, {				
					name : 'comment',
					xtype : 'textarea',
					fieldLabel : T('label.comment')
				}						        
		    ]							
		}        
	],
	
	buttons: [
	    {
	    	text: T('button.save'),
	    	handler : function() {
        		var thisForm = this.up('form');
        		
	    		thisForm.getForm().submit({
                    url: '/repair/save',
                    submitEmptyText: false,
                    waitMsg: T('msg.saving'),
                    success: function(form, action) {
                    	if(action.result.success) {		                    		
                    		GreenFleet.msg(T('label.success'), T('msg.processed_successfully'));		                    				                    		
                    	} else {
                    		Ext.Msg.alert(T('label.failure'), action.result.msg);
                    	}
                     },
                     failure: function(form, action) {
                         switch (action.failureType) {
                             case Ext.form.action.Action.CLIENT_INVALID:
                                 Ext.Msg.alert(T('label.failure'), T('msg.invalid_form_values'));
                                 break;
                             case Ext.form.action.Action.CONNECT_FAILURE:
                                 Ext.Msg.alert(T('label.failure'), T('msg.failed_to_ajax'));
                                 break;
                             case Ext.form.action.Action.SERVER_INVALID:
                                Ext.Msg.alert(T('label.failure'), action.result.msg);
                        }
                     }		                    
                });	    		
	    	}
        }, {
        	text: T('button.cancel'),
        	handler : function() {
        	}
        }
    ]
	
});
