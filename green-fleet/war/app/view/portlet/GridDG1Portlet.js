Ext.define('GreenFleet.view.portlet.GridDG1Portlet', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.grid_dg1_portlet',
    title : '운전자 그룹별 정보',
    layout : {
        type: 'accordion',
        animate: true
    },
    animCollapse: true,
    split: true,
    collapsible: true,    
    initComponent : function() {
    	this.callParent(arguments);
    	this.addDriverGroupTab(this);
    },
    
    addDriverGroupTab : function(main) {
    	Ext.getStore('DriverGroupStore').load({
    		scope : main,
    		callback: function(records, operation, success) {
    			Ext.each(records, function(record) {
    				main.add({
			        	html: main.addDriverGroupContent(main, record),
			            title: record.data.desc,
			            autoScroll: true,
			            border: true,
			            iconCls: 'nav'
    				});
    			});
    	    }	
    	});
    },
    
    addDriverGroupContent : function(main, record) {
    	return "<div>" + record.data.desc + " 그룹 차량 운행 정보 서머리</div>";
    }
});
