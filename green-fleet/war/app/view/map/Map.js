Ext.define('GreenFleet.view.map.Map', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.map',

	title : 'Maps',

	height : 100,

	width : 100,

	layout : 'fit',

	initComponent : function() {
		Ext.applyIf(this, {
			items : [ this.buildMap(this) ],
		});

		this.callParent();
	},

	displayMap : function(mapbox, lat, lng) {
		var options = {
			zoom : 12,
			center : new google.maps.LatLng(lat, lng),
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};

		mapbox.map = new google.maps.Map(mapbox.getEl().first('.map').dom, options);

		google.maps.event.addListener(mapbox.map, 'zoom_changed', function() {
			setTimeout(function() {
				mapbox.map.setCenter(options.center);
			}, 3000);
		});

		var marker = new google.maps.Marker({
			position : options.center,
			map : mapbox.map,
			title : "Hello World!"
		});

		google.maps.event.addListener(marker, 'click', function() {
			var infowindow = new google.maps.InfoWindow({
				content : marker.getTitle(),
				size : new google.maps.Size(50, 50)
			});
			infowindow.open(mapbox.map, marker);
		});
	},

	buildMap : function(parent) {
		return {
			xtype : 'box',
			flex : 1,
			html : '<div class="map" style="height:100%"></div>',
			listeners : {
				afterrender : function() {
					console.log(this);
					parent.displayMap(this, 37.56, 126.97);
				}
			}
		}
	}
});