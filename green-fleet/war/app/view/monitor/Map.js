Ext.define('GreenFleet.view.monitor.Map', {
	extend : 'Ext.Container',

	alias : 'widget.monitor_map',

	title : 'Maps',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [ this.ztitle, this.zmap ];
		
		this.callParent();
		
		var self = this;
		
		this.on('afterrender', function() {
			var vehicleStore = Ext.getStore('VehicleStore');
			vehicleStore.on('load', self.refreshMap, self);
			vehicleStore.load();
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
			if(self.getAutofitCheck().getValue())
				self.refreshMap(Ext.getStore('VehicleStore'));
		});
		
		Ext.getCmp('east').getStateRunning().on('click', function() {
			self.refreshMarkers();
		});
		
		Ext.getCmp('east').getStateIdle().on('click', function() {
			self.refreshMarkers();
		});
		
		Ext.getCmp('east').getStateIncident().on('click', function() {
			self.refreshMarkers();
		});

		this.getAutofitCheck().on('change', function(check, newValue) {
			if(newValue)
				self.refreshMap(Ext.getStore('VehicleStore'));
		});
	},
	
	refreshMarkers : function() {
		var markers = this.getMarkers();
		var labels = this.getLabels();
		
		for (var vehicle in markers) {
			var marker = markers[vehicle];
			var label = labels[vehicle]; 

			switch(marker.status) {
			case 'Running' :
				marker.setVisible(GreenFleet.show_running_vehicle);
				label.setVisible(GreenFleet.show_running_vehicle);
				break;
			case 'Idle' :
				marker.setVisible(GreenFleet.show_idle_vehicle);
				label.setVisible(GreenFleet.show_idle_vehicle);
				break;
			case 'Incident' :
				marker.setVisible(GreenFleet.show_incident_vehicle);
				label.setVisible(GreenFleet.show_incident_vehicle);
				break;
			}
		}
	},
	
	getAutofitCheck : function() {
		if(!this.autofitCheck)
			this.autofitCheck = this.down('[itemId=autofit]');
		return this.autofitCheck;
	},
	
	getMapBox : function() {
		if(!this.mapbox)
			this.mapbox = this.down('[itemId=mapbox]');
		return this.mapbox;
	},
	
	getMap : function() {
		if(!this.map) {
			this.map = new google.maps.Map(this.getMapBox().getEl().down('.map').dom, {
				zoom : 10,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			});
		}
		return this.map;
	},
	
	getMarkers : function() {
		if(!this.markers)
			this.markers = {};
		return this.markers;
	},
	
	getLabels : function() {
		if(!this.labels)
			this.labels = {};
		return this.labels;
	},
	
	resetLabels : function() {
		for ( var vehicle in this.labels) {
			this.labels[vehicle].setMap(null);
		}
		this.labels = {};
	},
	
	resetMarkers : function() {
		for ( var vehicle in this.markers) {
			google.maps.event.clearListeners(this.markers[vehicle]);
			this.markers[vehicle].setMap(null);
		}
		this.markers = {};
	},
	
	/*
	 * refreshMap : scope
	 */
	refreshMap : function(store) {
		this.resetMarkers();
		this.resetLabels();
		
		var images = {
			'Running' : 'resources/image/statusDriving.png',
			'Idle' : 'resources/image/statusStop.png',
			'Incident' : 'resources/image/statusIncident.png'
		};

		var bounds;
		
		store.each(function(record) {
			var vehicle = record.get('id');
			var driver = record.get('driver');
			var driverRecord = Ext.getStore('DriverStore').findRecord('id', driver);
			
			var latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
			
			var marker = new google.maps.Marker({
				position : latlng,
				map : this.getMap(),
				status : record.get('status'),
				icon : images[record.get('status')],
				title : driverRecord ? driverRecord.get('name') : driver,
				tooltip : record.get('registrationNumber') + "(" + (driverRecord ? driverRecord.get('name') : driver) + ")"
			});

			if(!bounds)
				bounds = new google.maps.LatLngBounds(latlng, latlng);
			else
				bounds.extend(latlng);
			
			var label = new Label({
				map : this.getMap()
			});
			label.bindTo('position', marker, 'position');
			label.bindTo('text', marker, 'tooltip');

			this.getMarkers()[vehicle] = marker;
			this.getLabels()[vehicle] = label;

			google.maps.event.addListener(marker, 'click', function() {
				GreenFleet.doMenu('information');
				GreenFleet.getMenu('information').setVehicle(record);
			});
		}, this);
		
		if(!bounds || bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(new google.maps.LatLng(System.props.lattitude, System.props.longitude));
		} else {
			this.getMap().fitBounds(bounds);
		}

		this.refreshMarkers();
	},
	
	ztitle : {
		xtype : 'container',
		cls :'pageTitle',
		height: 35,
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		items : [{
			flex : 1,
			html : '<h1>Information</h1>'
		}, {
			xtype : 'checkboxgroup',
			width : 80,
			defaults : {
				boxLabelAlign : 'before',
				width : 80,
				checked : true,
				labelWidth : 50,
				labelSeparator : ''
			},
			items : [{
				fieldLabel : 'Autofit',
				itemId : 'autofit'
			}]
		}]
	},
	
	zmap : {
		xtype : 'panel',
		flex : 1,
		itemId : 'mapbox',
		html : '<div class="map" style="height:100%"></div>'
	}
});
