Ext.define('GreenFleet.view.portlet.GridI1Portlet', {
	
    extend: 'Ext.grid.Panel',
    
    alias: 'widget.grid_i1_portlet',    
        
    stripeRows: true,
    
    columnLines: true,
    
    store : Ext.create('Ext.data.ArrayStore', {
		fields: [ { name : 'datetime', type : 'date', dateFormat:'time' }, 
		          { name : 'vehicle_id', type : 'string' },
		          { name : 'driver_id', type : 'string' },
		          { name : 'location', type : 'string' },
		          { name : 'lat', type : 'number' },
		          { name : 'lng', type : 'number' },
		          { name : 'velocity', type : 'number' } ], data: []}),
    
    columns: [{
        text     : T('label.datetime'),
        sortable : true,
        dataIndex: 'datetime',
		xtype : 'datecolumn',
		format : F('datetime'),
		width : 110
    },{
        text     : T('label.vehicle'),
        width    : 60,
        dataIndex: 'vehicle_id'
    },/*{
        text     : T('label.driver'),
        width    : 60,
        dataIndex: 'driver_id'
    },*/{
        text     : T('label.velocity'),
        width    : 50,
        dataIndex: 'velocity'
    },{
        text     : T('label.location'),
        width    : 200,
        dataIndex : 'location'
    }/*{
        text     : T('label.latitude'),
        width    : 50,
        dataIndex: 'lat'
    },{
        text     : T('label.longitude'),
        width    : 50,
        dataIndex: 'lng'
    }*/],
    
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
		    params : { 
		    	page : 1, 
		    	limit : 5,
		    	select : ['datetime', 'vehicle_id', 'driver_id', 'velocity', 'lat', 'lng'],
		    	filter : Ext.JSON.encode([{property : 'confirm', value : false}]),
		    	sort : Ext.JSON.encode([{property : 'datetime',	direction : 'DESC' }])
		    },
		    success: function(response) {		    	
		        var resultObj = Ext.JSON.decode(response.responseText);
		        
		        if(resultObj.success) {
		        	var records = resultObj.items;
		        	self.convert(records);
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
    
    convert : function(records) {
    	var self = this;
    	Ext.each(records, function(record) {
    		if(record.lat !== undefined && record.lng !== undefined) {
    			var latlng = new google.maps.LatLng(record.lat, record.lng);
    			geocoder = new google.maps.Geocoder();
    			geocoder.geocode({
    				'latLng' : latlng
    			}, function(results, status) {
    				if (status == google.maps.GeocoderStatus.OK) {
    					if (results[0]) {
    						var address = results[0].formatted_address;
    						record.location = address;
    						self.store.loadData(records);
    					}
    				} else {
    					console.log("Geocoder failed due to: " + status);
    				}
        		});    			
    		}
    	});    	    	
    }
});
