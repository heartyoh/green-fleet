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
			GreenFleet.doMenu('monitor_map');

			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');

			GreenFleet.show_running_vehicle = true;
			if (GreenFleet.show_idle_vehicle) {
				GreenFleet.show_idle_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Running'
				} ])
			} else {
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
			}
		});

		this.sub('state_idle').on('click', function() {
			GreenFleet.doMenu('monitor_map');

			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');

			GreenFleet.show_idle_vehicle = true;
			if (GreenFleet.show_incident_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Idle'
				} ])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
			}
		});

		this.sub('state_incident').on('click', function() {
			GreenFleet.doMenu('monitor_map');

			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');

			GreenFleet.show_incident_vehicle = true;
			if (GreenFleet.show_running_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_idle_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Incident'
				} ])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_idle_vehicle = true;
			}
		});

		setInterval(function() {
			if (self.isHidden())
				return;

			self.sub('time').update(Ext.Date.format(new Date(), 'D Y-m-d H:i:s'));
		}, 1000);

		this.on('afterrender', function() {
			Ext.getStore('VehicleMapStore').on('load',self.refreshVehicleCounts, self);
			Ext.getStore('RecentIncidentStore').on('load', self.refreshIncidents, self);
			Ext.getStore('RecentIncidentStore').load();
			Ext.getStore('VehicleGroupStore').on('load', self.refreshVehicleGroups, self);
		});
	},

	toggleHide : function() {
		if (this.isVisible())
			this.hide();
		else
			this.show();
	},

	refreshVehicleCounts : function() {
		if (this.isHidden())
			return;

		var store = Ext.getStore('VehicleMapStore');

		var total = store.count();

		var running = 0;
		var idle = 0;
		var incident = 0;

		store.each(function(record) {
			switch (record.get('status')) {
			case 'Running':
				running++;
				break;
			case 'Idle':
				idle++;
				break;
			case 'Incident':
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
		if (!store)
			store = Ext.getStore('RecentIncidentStore');

		this.sub('incidents').removeAll();

		var count = store.count() > 5 ? 5 : store.count();

		for ( var i = 0; i < count; i++) {
			var incident = store.getAt(i);

			this.sub('incidents').add(
					{
						xtype : 'button',
						listeners : {
							click : function(button) {
								GreenFleet.doMenu('monitor_incident');
								GreenFleet.getMenu('monitor_incident').setIncident(button.incident, true);
							}
						},
						incident : incident,
						html : '<a href="#">'
								+ incident.get('vehicle_id')
								+ ', '
								+ incident.get('driver_id')
								+ '<span>'
								+ Ext.Date.format(incident.get('datetime'),
										'D Y-m-d H:i:s') + '</span></a>'
					});
		}
	},

	refreshVehicleGroups : function() {
		if (this.isHidden())
			return;

		var self = this;
		self.sub('vehicle_groups').removeAll();
		
		Ext.getStore('VehicleGroupStore').each(function(record) {
			self.sub('vehicle_groups').add(
					{
						xtype : 'button',
						listeners : {
							click : self.filterByVehicleGroup,
							scope : self
						},
						vehicleGroup : record,
						html : '<a href="#">'
								+ record.data.id
								+ '<span>('
								+ record.data.vehicles.length
								+ ')</span></a>'
					});			
		});
	},

	filterByVehicleGroup : function(button) {
		GreenFleet.doMenu('monitor_map');
		this.sub('search').setValue('');

		var vehicleGroupId = button.vehicleGroup.get('id');
		var vehicleGroups = Ext.getStore('VehicleGroupStore').findRecord('id', vehicleGroupId);
		var vehicles = vehicleGroups? vehicleGroups.get('vehicles') : [];
		
		var vehicleStore = Ext.getStore('VehicleFilteredStore');
		vehicleStore.clearFilter();
		vehicleStore.filter([ {
			filterFn : function(record) {
				var myVehicleId = record.get('id');
				if (Ext.Array.indexOf(vehicles, myVehicleId) >= 0) {
					return true;
				}
			}
		} ]);
	},

	items : [ {
		xtype : 'searchfield',
		cls : 'searchField',
		fieldLabel : T('button.search'),
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
		html : T('label.total_running_vehicles') + ' : 0'
	}, {
		xtype : 'panel',
		title : T('title.vehicle_status'),
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
		title : T('title.vehicle_group'),
		cls : 'groupPanel',
		itemId : 'vehicle_groups'
	}, {
		xtype : 'panel',
		title : T('title.incidents_alarm'),
		itemId : 'incidents',
		cls : 'incidentPanel'
	} ]
});