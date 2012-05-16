Ext.define('GreenFleet.store.EventStore', {
	extend : 'Extensible.calendar.data.EventStore',

	storeId : 'event_store',
	
	autoLoad: true,
	
	proxy : {
		type : 'ajax',
		url : 'task',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		},
		writer: {
			url : 'task',
            type: 'json',
            nameProperty: 'mapping'
        },
        listeners: {
            exception: function(proxy, response, operation, options) {
                //var msg = response.message ? response.message : Ext.decode(response.responseText).message;
                Ext.Msg.alert('Server Error', response.responseText);
            }
        }
	},
	
	listeners: {
		beforesync: function(options, eOpts) {
			if(options.destroy) {
				this.getProxy().extraParams.mode = 'destroy';
			} 
			
			if(options.update) {
				this.getProxy().extraParams.mode = 'update';
			}
			
			if(options.create) {
				this.getProxy().extraParams.mode = 'create';
			}
        }
    }
});