Ext.define('GreenFleet.view.portlet.GridM1Portlet', {
	
    extend: 'Ext.grid.Panel',
    
    alias: 'widget.grid_m1_portlet',
    
    stripeRows: true,
    
    columnLines: true,
    
    store : Ext.create('Ext.data.ArrayStore', {
		fields: [ { name : 'vehicle_id', type : 'string' },
		          { name : 'next_repair_date', type : 'date', dateFormat:'time' } ], data: []}),
    
    columns: [{
        text     : T('label.repair_date'),
        sortable : true,
        dataIndex: 'next_repair_date',
		xtype : 'datecolumn',
		format : F('date'),
		width : 110
    },{
        text     : T('label.vehicle'),
        width    : 60,
        dataIndex: 'vehicle_id'
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
		    url: '/report/service',
		    method : 'GET',
		    params : { 
		    	page : 1, 
		    	limit : 5,
		    	select : ['vehicle_id', 'next_repair_date'],
		    	id : 'repair_list'
		    },
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
