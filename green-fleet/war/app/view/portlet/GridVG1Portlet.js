Ext.define('GreenFleet.view.portlet.GridVG1Portlet', {
    extend: 'Ext.panel.Panel',
    
    alias: 'widget.grid_vg1_portlet',
        
    layout : {
        type: 'accordion',
        animate: true
    },
    
    animCollapse: true,
    
    split: true,
    
    //collapsible: true,
    
    year : null,
    
    month : null,
    
    initComponent : function() {
    	this.callParent(arguments);
    	if(!this.year) {
    		var today = new Date();
    		this.year = today.getFullYear();
    		this.month = today.getMonth() + 1;
    	} 
    	//this.title = '차량 그룹별 운행 정보 [' + this.year + '-' + this.month + ']';
    	this.addVehicleGroupTab(this);
    },
    
    reload : function() {
    	this.addVehicleGroupTab(this);
    },
    
    addVehicleGroupTab : function(main) {
    	Ext.getStore('VehicleGroupStore').load({
    		scope : main,
    		callback: function(records, operation, success) {    			
    			Ext.each(records, function(record) {
    				var idx = 0;
    				var accTab = {
    					items : main.addVehicleGroupContent(main, record),
			            title : record.data.desc,
			            autoScroll : true,
			            border : true,
			            iconCls : 'nav',
			            isLoaded : false,
			            seqOrder : idx++,
			            listeners: {
			            	expand : function(pnl) {
			            		if(!pnl.isLoaded) {
			            			main.loadData(main, pnl.items.items[0].store, record);
			            			pnl.isLoaded = true;
			            		}
							}
						}
    				};
    				
    				main.add(accTab);    				
    				if(idx == 1) {
    					main.loadData(main, accTab.items.store, record);
    					accTab.isLoaded = true;
    				}
    			});
    	    }	
    	});
    },
    
    addVehicleGroupContent : function(main, record) {    	
    	var content = {
    		xtype : 'gridpanel',
            store: Ext.create('Ext.data.Store', {
    			fields : [ 'vehicle_id', 'run_time', 'run_dist', 'consmpt' ], 
    			data : []
    		}),
            stripeRows: true,
            columnLines: true,
            columns: [{
                text   : T('label.vehicle'),
                width    : 60,
                sortable : true,
                dataIndex: 'vehicle_id'
            },{
                text   : T('label.run_time'),
                width    : 70,
                sortable : true,
                renderer : function(val) {
                	return val + ' (' + T('label.minute_s') + ')';
                },
                dataIndex: 'run_time'
            },{
                text   : T('label.run_dist'),
                width    : 70,
                sortable : true,
                renderer : function(val) {
                	return val + ' (km)';
                },
                dataIndex: 'run_dist'
            },{
                text   : T('label.fuel_consumption'),
                width    : 70,
                sortable : true,
                renderer : function(val) {
                	return val + ' (l)';
                },
                dataIndex: 'consmpt'            	
            }]
    	};
    	
    	return content;
    },
    
    loadData : function(main, store, record) {
    	
		Ext.Ajax.request({
		    url: '/report/vehicle_group',
		    method : 'GET',
		    params: {
		        group_id: record.data.id,			        
		        report_type : 'run_summary',
		        year : main.year,
		        month : main.month
		    },
		    success: function(response) {
		        var resultObj = Ext.JSON.decode(response.responseText);
		        if(resultObj.success) {
		        	var runDataArr = resultObj.items;
		        	var total = { 'vehicle_id' : 'Total', 'run_time' : 0, 'run_dist' : 0, 'consmpt' : 0 };
		        	Ext.each(runDataArr, function(runData) {
		        		total.run_time += runData.run_time;
		        		total.run_dist += runData.run_dist;
		        		total.consmpt += runData.consmpt;
		        	}) ;
		        	runDataArr.push(total);
		        	store.loadData(runDataArr);		        	
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
