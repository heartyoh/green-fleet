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
		
		this.sub('state_running').on('click', function() {
			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');
			
			GreenFleet.show_running_vehicle = true;
			if(GreenFleet.show_idle_vehicle) {
				GreenFleet.show_idle_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				store.filter([{
					property : 'status',
					value : 'Running'
				}])
			} else {
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
			}
		});
		
		this.sub('state_idle').on('click', function() {
			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');
			
			GreenFleet.show_idle_vehicle = true;
			if(GreenFleet.show_incident_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				store.filter([{
					property : 'status',
					value : 'Idle'
				}])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
			}
		});
		
		this.sub('state_incident').on('click', function() {
			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');
			
			GreenFleet.show_incident_vehicle = true;
			if(GreenFleet.show_running_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_idle_vehicle = false;
				store.filter([{
					property : 'status',
					value : 'Incident'
				}])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_idle_vehicle = true;
			}
		});
		
		setInterval(function() {
			self.sub('time').update(Ext.Date.format(new Date(), 'D Y-m-d H:i:s'));
		}, 1000);
		
		this.on('afterrender', function() {
			Ext.getStore('VehicleMapStore').on('load', self.refreshVehicleCounts, self);
			Ext.getStore('RecentIncidentStore').on('load', self.refreshIncidents, self);
			Ext.getStore('RecentIncidentStore').load();
		});
	},
	
	refreshVehicleCounts : function() {
		var store = Ext.getStore('VehicleMapStore');

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
		
		this.sub('state_running').update('Driving</br><span>' + running + '</span>');
		this.sub('state_idle').update('Idle</br><span>' + idle + '</span>');
		this.sub('state_incident').update('Incident</br><span>' + incident + '</span>');
		this.sub('vehicle_count').update('Total Running Vehicles : ' + total);
	},
	
	refreshIncidents : function(store) {
		if(!store)
			store = Ext.getStore('RecentIncidentStore');
		
		this.sub('incidents').removeAll();
		
		var count = store.count() > 5 ? 5 : store.count();
		
		for(var i = 0;i < count;i++) {
			var incident = store.getAt(i);
			
			this.sub('incidents').add({
				xtype : 'button',
				listeners : {
					click : function(button) {
						GreenFleet.doMenu('monitor_incident');
						GreenFleet.getMenu('monitor_incident').setIncident(button.incident, true);
					}
				},
				incident : incident,
				html : '<a href="#">' + incident.get('vehicle_id') + ', ' + incident.get('driver_id') + '<span>' + 
					Ext.Date.format(incident.get('datetime'), 'D Y-m-d H:i:s') + '</span></a>'
			});
		}
	},
	
	items : [ {
		xtype : 'searchfield',
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