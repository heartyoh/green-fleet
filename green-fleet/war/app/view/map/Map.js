Ext.define('GreenFleet.view.map.Map', {
	extend : 'Ext.Container',

	alias : 'widget.map',

	title : 'Maps',

	layout : {
		type : 'hbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.callParent();
		
		this.mapbox = this.add(this.buildMap(this));
		this.board = this.add(this.buildBoard(this));
	},

	displayMap : function(mapbox, lat, lng) {
		/*
		 * Setting map options
		 */
		var options = {
			zoom : 10,
			center : new google.maps.LatLng(lat, lng),
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};

		/*
		 * Draw map
		 */
		mapbox.map = new google.maps.Map(mapbox.getEl().first('.map').dom, options);

		/*
		 * Set map event listeners
		 */
		google.maps.event.addListener(mapbox.map, 'zoom_changed', function() {
			// setTimeout(function() {
			// mapbox.map.setCenter(options.center);
			// }, 3000);
		});

		/*
		 * Set map markers
		 */
		this.buildMarkers(mapbox);
	},

	/*
	 * refreshMarkers : scope
	 */
	refreshMarkers : function(store) {
		for ( var vehicle in this.markers) {
			this.markers[vehicle].setMap(null);
		}
		this.markers = {};

		store.each(function(record) {
			var vehicle = record.get('id');
			var marker = new google.maps.Marker({
				position : new google.maps.LatLng(record.get('lattitude'), record.get('longitude')),
				map : this.mapbox.map,
				title : vehicle
			});
			this.markers[vehicle] = marker;

			var mapbox = this.mapbox;
			google.maps.event.addListener(marker, 'click', function() {
				var infowindow = new google.maps.InfoWindow({
					content : marker.getTitle(),
					size : new google.maps.Size(100, 100)
				});
				infowindow.open(mapbox.map, marker);
			});
		}, this);
	},
	
	buildMarkers : function() {
		this.markers = {};

		var vehicleStore = Ext.getStore('VehicleStore');
		vehicleStore.on('datachanged', this.refreshMarkers, this);

		this.refreshMarkers(vehicleStore);
	},

	buildMap : function(parent) {
		return {
			xtype : 'box',
			flex : 1,
			html : '<div class="map" style="height:100%"></div>',
			listeners : {
				afterrender : function() {
					parent.displayMap(this, 37.56, 126.97);
				}
			}
		};
	},

	buildBoard : function(parent) {
		return {
			xtype : 'panel',
			width : 200,
			items : [{
				xtype : 'checkbox',
				fieldLabel : 'Markers',
				checked : true,
				name : 'markers',
				scope : this,
				handler : function(field, newValue) {
					for ( var vehicle in this.markers) {
						this.markers[vehicle].setVisible(newValue);
					}
				}
			}]
		}
	}
});