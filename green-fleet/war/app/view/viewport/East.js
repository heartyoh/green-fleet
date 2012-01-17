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
		
		self.refreshVehicleCounts();
	},
	
	refreshVehicleCounts : function() {
		this.getStateRunning().update('Driving</br><span>1</span>');
		this.getStateIdle().update('Idle</br><span>2</span>');
		this.getStateIncident().update('Incident</br><span>3</span>');
		this.getVehicleCount().update('Total Running Vehicles : 6');
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
		cls : 'incidentPanel',
		items : [{
			html : '<a href="#">id_KS937362, 김형용<span>2011.12.30 16:25:41</span></a><a href="#">id_KS937362, 변사또<span>2011.12.30 16:25:41</span></a>'
		}]
	} ]
});