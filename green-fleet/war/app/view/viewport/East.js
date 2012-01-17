Ext.define('GreenFleet.view.viewport.East', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.viewport.east',
	
	id : 'east',
	
	cls : 'summaryBoard',
	
	width : 200,

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.callParent();
		
		var self = this;
		
		this.getStateRunning().on('click', function() {
			GreenFleet.show_running_vehicle = !GreenFleet.show_running_vehicle;
		});
		
		this.getStateIdle().on('click', function() {
			GreenFleet.show_idle_vehicle = !GreenFleet.show_idle_vehicle;
		});
		
		this.getStateIncident().on('click', function() {
			GreenFleet.show_incident_vehicle = !GreenFleet.show_incident_vehicle;
		});
		
		setInterval(function() {
			self.getTimeField().update(Ext.Date.format(new Date(), 'D Y-m-d H:i:s'));
		}, 1000);
		
		this.on('afterrender', function() {
			Ext.getStore('RecentIncidentStore').on('load', self.refreshIncidents, self);
			Ext.getStore('RecentIncidentStore').load();
		});
	},
	
	refreshVehicleCounts : function() {
		var store = Ext.getStore('VehicleStore');
		
		var total = store.count();
		
		var running = 0;
		var idle = 0;
		var incident = 0;

		store.each(function(record) {
			switch(record.get('status')) {
			case 'Running' :
				running++;
				break;
			case 'Idle' :
				idle++;
				break;
			case 'Incident' :
				incident++;
				break;
			}
		});
		
		this.getStateRunning().update('Driving</br><span>' + running + '</span>');
		this.getStateIdle().update('Idle</br><span>' + idle + '</span>');
		this.getStateIncident().update('Incident</br><span>' + incident + '</span>');
		this.getVehicleCount().update('Total Running Vehicles : ' + total);
	},
	
	refreshIncidents : function(store) {
		if(!store)
			store = Ext.getStore('RecentIncidentsStore');
		
		this.getIncidents().removeAll();
		
		var count = store.count() > 5 ? 5 : store.count();
		
		for(var i = 0;i < count;i++) {
			var incident = store.getAt(i);
			
			this.getIncidents().add({
				xtype : 'button',
				listeners : {
					click : function(button) {
						GreenFleet.doMenu('monitor_incident');
						GreenFleet.getMenu('monitor_incident').setIncident(button.incident, true);
					}
				},
				incident : incident,
				html : '<a href="#">' + incident.get('vehicle') + ', ' + incident.get('driver') + '<span>' + 
					Ext.Date.format(incident.get('incidentTime'), 'D Y-m-d H:i:s') + '</span></a>'
			});
		}
	},
	
	getIncidents : function() {
		if(!this.incidents)
			this.incidents = this.down('[itemId=incidents]');
		return this.incidents;
	},
	
	getVehicleCount : function() {
		if(!this.vehicleCount)
			this.vehicleCount = this.down('[itemId=vehicle_count]');
		return this.vehicleCount;
	},
	
	getTimeField : function() {
		if(!this.timefield)
			this.timefield = this.down('[itemId=time]');
		return this.timefield;
	},
	
	getStateRunning : function() {
		if(!this.state_running)
			this.state_running = this.down('[itemId=state_running]');
		return this.state_running;
	},
	
	getStateIdle : function() {
		if(!this.state_idle)
			this.state_idle = this.down('[itemId=state_idle]');
		return this.state_idle;
	},
	
	getStateIncident : function() {
		if(!this.state_incident)
			this.state_incident = this.down('[itemId=state_incident]');
		return this.state_incident;
	},
	
	items : [ {
		xtype : 'combo',
		cls : 'searchField',
		fieldLabel : 'Search',
		labelWidth : 50,
		labelSeparator : '',
		itemId : 'search'
	}, {
		xtype : 'component',
		cls : 'time',
		itemId : 'time',
		html : Ext.Date.format(new Date(), 'D Y-m-d H:i:s')
	}, {
		xtype : 'box',
		cls : 'count',
		itemId : 'vehicle_count',
		html : 'Total Running Vehicles : 0'
	}, {
		xtype : 'panel',
		title : '상황별 운행 현황',
		cls : 'statusPanel',
		items : [ {
			xtype : 'button',
			itemId : 'state_running',
			flex : 1,
			cls : 'btnDriving'
		}, {
			xtype : 'button',
			itemId : 'state_idle',
			flex : 1,
			cls : 'btnStop'
		}, {
			xtype : 'button',
			itemId : 'state_incident',
			flex : 1,
			cls : 'btnIncident'
		} ]
	}, {
		xtype : 'panel',
		title : 'Group',
		cls :'groupPanel',
		items : [{
			html : '<a href="#">강남 ~ 분당노선 1 <span>(14)</span></a><a href="#">강남 ~ 분당노선 1 <span>(14)</span></a>'
		}]
	}, {
		xtype : 'panel',
		title : 'Incidents Alarm',
		itemId : 'incidents',
		cls : 'incidentPanel'
	} ]
});