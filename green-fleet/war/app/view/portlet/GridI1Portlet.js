Ext.define('GreenFleet.view.portlet.GridI1Portlet', {
	
    extend: 'Ext.grid.Panel',
    
    alias: 'widget.grid_i1_portlet',    
        
    stripeRows: true,
    
    columnLines: true,
    
    store : Ext.create('Ext.data.ArrayStore', {
		fields: [ { name : 'datetime', type : 'date', dateFormat:'time' }, 
		          { name : 'vehicle_id', type : 'string' },
		          { name : 'driver_id', type : 'string' } ], data: []}),
    
    columns: [{
        text     : T('label.datetime'),
        sortable : true,
        dataIndex: 'datetime',
		xtype : 'datecolumn',
		format : F('datetime'),
		width : 110
    },{
        text     : T('label.vehicle'),
        width    : 70,
        sortable : true,
        dataIndex: 'vehicle_id'
    },{
        text     : T('label.driver'),
        width    : 70,
        sortable : true,
        dataIndex: 'driver_id'
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
		    url: '/incident',
		    method : 'GET',
		    params : { page : 1, limit : 5 },
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
    }
});
