function Label(opt_options) {
	// Initialization
	this.setValues(opt_options);

	// Label specific
	var span = this.span_ = document.createElement('span');
	span.style.cssText = 'position: relative; left: -50%; top: -65px; '
			+ 'white-space: nowrap; border: 1px solid #7499b5; ' + 'padding: 2px; background-color: white';

	var div = this.div_ = document.createElement('div');
	div.appendChild(span);
	div.style.cssText = 'position: absolute; display: none';
};
Label.prototype = new google.maps.OverlayView;

// Implement onAdd
Label.prototype.onAdd = function() {
	var pane = this.getPanes().overlayLayer;
	pane.appendChild(this.div_);

	// Ensures the label is redrawn if the text or position is changed.
	var me = this;
	this.listeners_ = [ google.maps.event.addListener(this, 'position_changed', function() {
		me.draw();
	}), google.maps.event.addListener(this, 'text_changed', function() {
		me.draw();
	}) ];
};

// Implement onRemove
Label.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);

	// Label is removed from the map, stop updating its position/text.
	for ( var i = 0, I = this.listeners_.length; i < I; ++i) {
		google.maps.event.removeListener(this.listeners_[i]);
	}
};

// Implement draw
Label.prototype.draw = function() {
	var projection = this.getProjection();
	var position = projection.fromLatLngToDivPixel(this.get('position'));

	var div = this.div_;
	div.style.left = position.x + 'px';
	div.style.top = position.y + 'px';
	div.style.display = 'block';

	this.span_.innerHTML = this.get('text').toString();
};

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
		mapbox.map = new google.maps.Map(mapbox.getEl().down('.map').dom, options);

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
		
		var images = {
			'Running' : 'resources/image/statusDriving.png',
			'Idle' : 'resources/image/statusStop.png',
			'Incident' : 'resources/image/statusIncident.png'
		};

		store.each(function(record) {
			var vehicle = record.get('id');
			var driver = record.get('driver');
			
			var marker = new google.maps.Marker({
				position : new google.maps.LatLng(record.get('lattitude'), record.get('longitude')),
				map : this.mapbox.map,
				icon : images[record.get('status')],
				title : vehicle,
				tooltip : vehicle + "(" + driver + ")"
			});

			var label = new Label({
				map : this.mapbox.map
			});
			label.bindTo('position', marker, 'position');
			label.bindTo('text', marker, 'tooltip');

			this.markers[vehicle] = marker;

			var mapbox = this.mapbox;
			google.maps.event.addListener(marker, 'click', function() {
				GreenFleet.getMenu('information').vehicle = record;
				GreenFleet.doMenu('information');
//				Ext.create('GreenFleet.view.vehicle.VehiclePopup', {
//					vehicle : record,
//				}).show();
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
			xtype : 'panel',
			flex : 1,
			title : 'Information',
			tools : [{
				xtype : 'checkbox',
				fieldLabel : 'Markers',
				checked : true,
				boxLabelAlign : 'before',
				labelWidth : 45,
				labelSeparator : '',
				itemId : 'markers',
				scope : this,
				handler : function(field, newValue) {
					for ( var vehicle in this.markers) {
						this.markers[vehicle].setVisible(newValue);
					}
				}
			}],
			html : '<div class="map" style="height:100%"></div>',
			listeners : {
				afterrender : function() {
					parent.displayMap(this, 37.56, 126.97);
				}
			}
		};
	}
});
