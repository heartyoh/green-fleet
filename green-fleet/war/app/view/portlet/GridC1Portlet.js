Ext.define('GreenFleet.view.portlet.GridC1Portlet', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.grid_c1_portlet',    
    store : Ext.create('Ext.data.ArrayStore', {
		fields: [ {name : 'vehicle_id', type : 'string' }, 
		          {name : 'consumable_item', type : 'string' },
		          {name : 'health_rate', type : 'float' },
		          {name : 'status', type : 'string' } ], data: []}),
    stripeRows: true,
    columnLines: true,
    columns: [{
        text     : T('label.vehicle'),
        width    : 50,
        sortable : true,
        dataIndex: 'vehicle_id'
    },{
        text     : T('label.consumable_item'),
        width    : 100,
        sortable : true,
        dataIndex: 'consumable_item'
    },{
        text     : T('label.health_rate'),
        width    : 60,
        sortable : true,
        dataIndex: 'health_rate',
        renderer : function(val) {
        	return (Ext.util.Format.number(val * 100, '00')) + ('%');
        }
    },{
        text     : T('label.status'),
        width    : 70,
        sortable : true,
        dataIndex: 'status',
        renderer : function(val) {
        	return T('label.' + val);
        }
    }],
    initComponent: function() {
    	var self = this;
        this.callParent(arguments);        
        this.reload();
    },
    reload : function() {
    	var self = this;
    	this.setLoading(true);
    	Ext.Ajax.request({
		    url: '/vehicle_consumable/by_health_rate',
		    method : 'GET',
		    params : { health_rate : 0.98 },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
					self.store.loadData(records);
					Ext.defer(function() {self.setLoading(false);}, 100);
					
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});    	
    },    
});
