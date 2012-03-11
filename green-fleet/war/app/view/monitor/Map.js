Ext.define('GreenFleet.view.monitor.Map', {
	extend : 'Ext.Container',

	alias : 'widget.monitor_map',
	
	id : 'monitor_map',

//	title : 'Maps',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [ this.ztitle, this.zmap ];
		
		this.callParent();
		
		var self = this;
		
		this.on('afterrender', function() {
			var vehicleMapStore = Ext.getStore('VehicleMapStore');
			var vehicleFilteredStore = Ext.getStore('VehicleFilteredStore');
			var incidentStore = Ext.getStore('RecentIncidentStore');
			
			vehicleFilteredStore.on('datachanged', function() {
				self.refreshMap(vehicleFilteredStore);
			});
			
			vehicleMapStore.load();
			
			/*
			 * TODO 1분에 한번씩 리프레쉬하도록 함.
			 */
			setInterval(function() {
				vehicleMapStore.load();
				incidentStore.load();
			}, 10000);
			
//			var vehicleStore = Ext.getStore('VehicleInfoStore');
//			vehicleStore.load();
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
			if(self.sub('autofit').getValue())
				self.refreshMap(Ext.getStore('VehicleFilteredStore'));
		});
		
		this.sub('autofit').on('change', function(check, newValue) {
			if(newValue)
				self.refreshMap(Ext.getStore('VehicleFilteredStore'));
		});
	},
	
	getMap : function() {
		if(!this.map) {
			this.map = new google.maps.Map(this.sub('mapbox').getEl().down('.map').dom, {
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
			var driver = record.get('driver_id');
			var driverRecord = Ext.getStore('DriverBriefStore').findRecord('id', driver);
			
			var latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
			
			var marker = new google.maps.Marker({
				position : latlng,
				map : this.getMap(),
				status : record.get('status'),
				icon : images[record.get('status')],
				title : driverRecord ? driverRecord.get('name') : driver,
				tooltip : record.get('registration_number') + "(" + (driverRecord ? driverRecord.get('name') : driver) + ")"
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
		
		if(!bounds) {
			this.getMap().setCenter(new google.maps.LatLng(System.props.lattitude, System.props.longitude));
		} else if(bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else {
			this.getMap().fitBounds(bounds);
		}
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
