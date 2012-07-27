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
				GreenFleet.show_maint_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Running'
				} ])
			} else {
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
				GreenFleet.show_maint_vehicle = true;
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
				GreenFleet.show_maint_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Idle'
				} ])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
				GreenFleet.show_maint_vehicle = true;
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
				GreenFleet.show_maint_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Incident'
				} ])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_maint_vehicle = true;
			}
		});

		this.sub('state_maint').on('click', function() {
			GreenFleet.doMenu('monitor_map');

			var store = Ext.getStore('VehicleFilteredStore');
			store.clearFilter();
			self.sub('search').setValue('');

			GreenFleet.show_maint_vehicle = true;
			if (GreenFleet.show_running_vehicle) {
				GreenFleet.show_running_vehicle = false;
				GreenFleet.show_idle_vehicle = false;
				GreenFleet.show_incident_vehicle = false;
				store.filter([ {
					property : 'status',
					value : 'Maint'
				} ])
			} else {
				GreenFleet.show_running_vehicle = true;
				GreenFleet.show_idle_vehicle = true;
				GreenFleet.show_incident_vehicle = true;
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
			Ext.getStore('VehicleGroupCountStore').on('load', self.refreshVehicleGroups, self);
		});
		
		Ext.getStore('RecentIncidentStore').load();
		// GAE Channel 연결 
		//this.initChannel();
	},

	// Channel 연결 시도
	initChannel : function() {
		var self = this;
		
		// 서버에 채널 생성 요청 
		Ext.Ajax.request({
			url : '/channel/init',
			method : 'POST',
			success : function(response) {
				self.openChannel(response.responseText);
			},
			failure : function(response) {
				Ext.Msg.alert(T('label.failure'), response.responseText);
			}
		});
	},
	
	// 서버로 부터 넘겨받은 토큰으로 채널 오픈 
	openChannel : function(token) {
		var self = this;
		var channel = new goog.appengine.Channel(token);
		var socket = channel.open();
		
		socket.onopen = function() {
			GreenFleet.msg('Channel', 'Channel opened!');
		};
		
		socket.onmessage = function(message) {			
			var data = Ext.String.trim(message.data);
			
			// 사고 상황
			if(data == 'Incident') {
				Ext.Msg.alert("Incident", "There seems to be an accident. Please check!");
				Ext.getStore('RecentIncidentStore').load();				
			} else {
				GreenFleet.msg("Message arrived", data);
			}
		};
		
		socket.onerror = function(error) {
			Ext.Msg.alert('Channel', "There was a problem with the channel connection!");
		};
		
		socket.onclose = function() {
			Ext.Msg.alert('Channel', "Channel closed!");
		};
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
		var maint = 0;

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
			case 'Maint':
				maint++;
				break;
			}
		});

		this.sub('state_running').update(T('label.state_running') + '</br><span>' + running + '</span>');
		this.sub('state_idle').update(T('label.state_idle') + '</br><span>' + idle + '</span>');
		this.sub('state_incident').update(T('label.state_incident') + '</br><span>' + incident + '</span>');
		this.sub('state_maint').update(T('label.state_maint') + '</br><span>' + maint + '</span>');
		this.sub('vehicle_count').update(T('title.total_running_vehicles') + ' : ' + total);
	},

	refreshIncidents : function(store) {
				
		if (!store)
			store = Ext.getStore('RecentIncidentStore');
		
		var incidents = this.sub('incidents');
		if(!incidents)
			incidents = this.up('viewport.east').sub('incidents');

		incidents.removeAll();
		var count = store.count() > 5 ? 5 : store.count();

		for (var i = 0; i < count; i++) {			
			var incident = store.getAt(i);
			incidents.add(
					{
						xtype : 'button',
						listeners : {
							click : function(button) {
								GreenFleet.doMenu('monitor_incident');
								GreenFleet.getMenu('monitor_incident').setIncident(button.incident, true);
							}
						},
						incident : incident,
						text : '<a href="#">'
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
		
		Ext.getStore('VehicleGroupCountStore').each(function(record) {
			self.sub('vehicle_groups').add(
					{
						xtype : 'button',
						listeners : {
							click : self.findVehiclesOnMap,
							scope : self
						},
						vehicleGroup : record,
						text : '<a href="#">'
								+ record.data.expl
								+ '<span>('
								+ record.data.count
								+ ')</span></a>'
					});			
		});
	},
	
	findVehiclesOnMap : function(button) {
		
		var self = this;
		GreenFleet.doMenu('monitor_map');
		this.sub('search').setValue('');
		var groupId = button.vehicleGroup.get('id');		
		
		Ext.Ajax.request({
			url : '/vehicle_group/vehicle_ids',
			method : 'GET',
			params : {
				group_id : groupId
			},
			success : function(response) {
				var resultObj = Ext.JSON.decode(response.responseText);
				if (resultObj.success) {
					var vehicles = resultObj.items;
					self.filterByVehicleGroup(vehicles);
				} else {
					Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
				}
			},
			failure : function(response) {
				Ext.MessageBox.alert(T('label.failure'), response.responseText);
			}
		});		
	},

	filterByVehicleGroup : function(vehicles) {
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
		html : T('title.total_running_vehicles') + ' : 0'
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
		}, {
			xtype : 'button',
			itemId : 'state_maint',
			flex : 1,
			cls : 'btnMaint'
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