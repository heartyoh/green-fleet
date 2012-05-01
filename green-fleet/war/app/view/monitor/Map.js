Ext.define('GreenFleet.view.monitor.Map', {
	extend : 'Ext.Container',

	alias : 'widget.monitor_map',
	
	id : 'monitor_map',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [ this.ztitle, this.zmap ];
		
		this.callParent();
		
		var self = this;
		
		var interval = null;
		var vehicleMapStore = null;
		var incidentStore = null;
		
		this.on('afterrender', function() {
			vehicleMapStore = Ext.getStore('VehicleMapStore');
			incidentStore = Ext.getStore('RecentIncidentStore');
			var vehicleFilteredStore = Ext.getStore('VehicleFilteredStore');
			
			vehicleFilteredStore.on('datachanged', function() {
				if(self.isVisible()) {
					self.refreshMap(vehicleFilteredStore, self.sub('autofit').getValue());
				}
			});
			
			vehicleMapStore.load();
			
			/*
			 * TODO 디폴트로 1분에 한번씩 리프레쉬하도록 함.
			 */
			interval = setInterval(function() {
				vehicleMapStore.load();
				incidentStore.load();
			}, 10000);
		});
		
		this.on('resize', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
			if(self.sub('autofit').getValue())
				self.refreshMap(Ext.getStore('VehicleFilteredStore'), true);
		});
		
		this.sub('autofit').on('change', function(check, newValue) {
			if(newValue)
				self.refreshMap(Ext.getStore('VehicleFilteredStore'), newValue);
		});

		this.sub('refreshterm').on('change', function(combo, newValue) {
			if(newValue) {
				clearInterval(interval);
				interval = setInterval(function() {
					vehicleMapStore.load();
					incidentStore.load();
				}, newValue * 1000);
			}
		});
	},
	
	getMap : function() {
		if(!this.map) {
			this.map = new google.maps.Map(this.sub('mapbox').getEl().down('.map').dom, {
				zoom : 10,
				maxZoom : 19,
				minZoom : 3,
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
	refreshMap : function(store, autofit) {
		this.resetMarkers();
		this.resetLabels();
		
		var images = {
			'Running' : 'resources/image/statusDriving.png',
			'Idle' : 'resources/image/statusStop.png',
			'Incident' : 'resources/image/statusIncident.png',
			'Maint' : 'resources/image/statusMaint.png'
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
		} else if(autofit){ // 자동 스케일 조정 경우 
			this.getMap().fitBounds(bounds);
//		} else { // 자동 스케일 조정이 아니어도, 센터에 맞추기를 한다면, 이렇게.
//			this.getMap().setCenter(bounds.getCenter());
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
			html : '<h1>' + T('title.map') + '</h1>'
		}, {
			xtype : 'combo',
			valueField : 'value',
			displayField : 'display',
			value : 10,
			width : 180,
			labelWidth : 110,
			labelAlign : 'right',
			labelSeparator : '',
			store : Ext.create('Ext.data.Store', {
				data : [{
					value : 3,
					display : '3' + T('label.second_s')
				}, {
					value : 5,
					display : '5' + T('label.second_s')
				}, {
					value : 10,
					display : '10' + T('label.second_s')
				}, {
					value : 30,
					display : '30' + T('label.second_s')
				}, {
					value : 60,
					display : '1' + T('label.minute_s')
				}, {
					value : 300,
					display : '5' + T('label.minute_s')
				}],
				fields : [
					'value', 'display'
				]
			}),
			queryMode : 'local',
			fieldLabel : T('label.refreshterm'),
			itemId : 'refreshterm'
		}, {
			xtype : 'checkboxgroup',
			width : 80,
			defaults : {
				boxLabelAlign : 'before',
				width : 80,
				checked : true,
				labelWidth : 60,
				labelAlign : 'right',
				labelSeparator : ''
			},
			items : [{
				fieldLabel : T('label.autofit'),
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
