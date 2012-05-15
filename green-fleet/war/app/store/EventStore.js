Ext.define('GreenFleet.store.EventStore', {
	extend : 'Extensible.calendar.data.EventStore',

	storeId : 'event_store',
	
	autoLoad: true,
	
	proxy : {
		type : 'rest',
		url : 'task',
		reader : {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
		},
		writer: {
			url : 'task/save',
            type: 'json',
            nameProperty: 'mapping'
        },
        
        listeners: {
            exception: function(proxy, response, operation, options){
                var msg = response.message ? response.message : Ext.decode(response.responseText).message;
                // ideally an app would provide a less intrusive message display
                Ext.Msg.alert('Server Error', msg);
            }
        }		
	}

});