Ext.define('GreenFleet.view.overview.Overview', {
	
	extend : 'Ext.Container',
	
	alias : 'widget.overview',
	
	id : 'overview',
    
	layout: {
        type: 'border',
        padding: '0 5 5 5'
    },
    
	initComponent : function() {
		this.items = [{		    
		    id: 'overview-header',
		    region: 'north',
		    xtype : 'box',
			cls : 'pageTitle',
			html : '<h1>' + T('menu.overview') + '</h1>',
			height : 35		    
		}, {
            xtype: 'container',
            region: 'center',
            layout: 'border',
            //items: [ this.zwest, this.zportal(), this.zeast ]
            items : [ this.zportal() ]
		}];
		this.callParent(arguments);
		var self = this;
	},
	
	/*zwest : {
        id: 'overview-vehicle-group',
        xtype : 'grid_vg1_portlet',
        region: 'west',
        animCollapse: true,
        width: 280,
        minWidth: 150,
        maxWidth: 310,
        split: true,
        collapsible: true
	},
	
	zeast :  {
        id: 'overview-driver-group',
        xtype : 'grid_dg1_portlet',
        region: 'east',
        animCollapse: true,
        width: 280,
        minWidth: 150,
        maxWidth: 310,
        split: true,
        collapsible: true
	},*/
	
	zportal : function() {
		
		return {
	        id: 'overview-portal',
	        xtype: 'portalpanel',
	        region: 'center',
	        items: [{
	            id: 'col-1',
	            items: [{
	                id: 'portlet-1-1',
	                title: T('title.running_distance'),
	                tools: this.getTools(),
	                height : 230,
	                items : {
	                	xtype : 'chart_v1_portlet',
	                	height : 230,
	                	chartType : 'mileage'
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-1-2',
	                title: T('portlet.today_maint_list'),
	                tools: this.getTools(),
	                height : 200,
	                items : {
	                	xtype : 'grid_m1_portlet',
	                	height : 200
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-1-3',
	                title: T('title.schedule'),
	                tools: this.getTools(),
	                height : 230,
	                items : {
	                	xtype : 'calendar_portlet',
	                	height : 230
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }]
	        },{
	            id: 'col-2',
	            items: [{
	                id: 'portlet-2-1',
	                title: T('title.vehicle_health'),
	                tools: this.getTools(),
	                height : 230,
	                items : {
	                	xtype : 'chart_v1_portlet',
	                	height : 230,
	                	chartType : 'health'
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            },{
	                id: 'portlet-2-2',
	                title : T('portlet.latest_incident_x', {x : '5'}),
	                tools: this.getTools(),
	                height : 200,
	                items: {
	                	xtype : 'grid_i1_portlet',
	                	height : 200
	                },	                
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-2-3',
	                title : T('portlet.vehicle_group_driving_summary'),
	                tools: this.getTools(),
	                height : 230,
	                items: {
	                    id: 'overview-vehicle-group',
	                    xtype : 'grid_vg1_portlet',
	                    width: 230
	                },	                
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	        	}]
	        },{
	            id: 'col-3',
	            items: [{
	                id: 'portlet-3-1',
	                title: T('title.vehicle_age'),
	                tools: this.getTools(),
	                height : 230,
	                items : {
	                	xtype : 'chart_v1_portlet',
	                	height : 230,
	                	chartType : 'age'
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-3-2',
	                title: T('portlet.upcomming_x_replacement', {x : T('label.consumable_item')}),
	                tools: this.getTools(),
	                height : 200,
	                items : {
	                	xtype : 'grid_c1_portlet',
	                	height : 200	                	
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }, {
	                id: 'portlet-3-3',
	                title: T('portlet.avg_fuel_effcc'),
	                tools: this.getTools(),
	                height : 230,
	                items : {
	                	xtype : 'chart_f1_portlet',
	                	height : 230
	                },
	                listeners: {
	                    close : Ext.bind(this.onPortletClose, this)
	                }
	            }]
	        }]
		};
	},
	
	getTools: function() {
        return [{
            xtype: 'tool',
            type: 'gear',
            handler: function(e, target, panelHeader, tool) {
                var portlet = panelHeader.ownerCt;
                portlet.items.items[0].reload();
            }
        }];
    },
        
    onPortletClose: function(portlet) {
    	GreenFleet.msg('Close', "'" + portlet.title + "' was removed");
    }
});
