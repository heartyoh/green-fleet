Ext.define('GreenFleet.view.monitor.IncidentView', {
	extend : 'Ext.container.Container',

	alias : 'widget.monitor_incident',

	title : 'Incident View',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [{
			xtype : 'container',
			autoScroll : true,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			flex : 1,
			items : [this.zInfo, this.zVideoAndMap]
		}, this.zList];
		
		this.callParent(arguments);

		/*
		 * Content
		 */

		var self = this;
		
		this.getMapBox().on('afterrender', function() {
			var options = {
				zoom : 10,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.map = new google.maps.Map(self.getMapBox().getEl().down('.map').dom, options);
		});
		
		this.on('activate', function(comp) {
			google.maps.event.trigger(self.getMap(), 'resize');
		});
		
		this.down('button[itemId=search]').on('click', function() {
			self.refreshIncidentList();
		});
		
		this.down('button[itemId=reset]').on('click', function() {
			self.resetIncidentList();
		});
		
		this.down('displayfield[name=videoClip]').on('change', function(field, value) {
			self.getVideo().update({
				value : value
			});
		});

		this.getDriverFilter().on('specialkey', function(fleld, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			};
		});
		
		this.getVehicleFilter().on('specialkey', function(field, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			};
		});

		this.getIncidentList().on('itemclick', function(grid, record) {
			self.setIncident(record, false);
		});
		
		this.down('[itemId=fullscreen]').on('click', function() {
			if (!Ext.isWebKit)
				return;
			self.getVideo().getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
		});
	},
	
	setIncident : function(incident, refresh) {
		this.incident = incident;
		if(refresh) {
			this.getVehicleFilter().setValue(incident.get('vehicle'));
			this.getDriverFilter().reset();
			this.refreshIncidentList();
		}
		
		this.getForm().loadRecord(incident);
		this.refreshMap();
	},
	
	getIncident : function() {
		return this.incident;
	},
	
	refreshIncidentList : function() {
		this.getGrid().store.load({
			filters : [ {
				property : 'vehicle',
				value : this.getVehicleFilter().getValue()
			}, {
				property : 'driver',
				value : this.getDriverFilter().getValue()
			} ]
		});
	},
	
	resetIncidentList : function() {
		this.getVehicleFilter().reset();
		this.getDriverFilter().reset();
		
		this.refreshIncidentList();
	},
	
	getMarker : function() {
		return this.marker;
	},
	
	setMarker : function(marker) {
		if(this.marker)
			this.marker.setMap(null);
		this.marker = marker;
	},
	
	refreshMap : function() {
		this.setMarker(null);
		
		var incident = this.getIncident();
		var location = null;
		if(!incident)
			location = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
		else
			location = new google.maps.LatLng(incident.get('lattitude'), incident.get('longitude'));
		
		this.getMap().setCenter(location);

		if(incident) {
			this.setMarker(new google.maps.Marker({
			    position: location,
			    map: this.getMap()
			}));
		}
	},
	
	getIncidentList : function() {
		if(!this.incidents)
			this.incidents = this.down('[itemId=grid]');
		return this.incidents;
	},
	
	getVideo : function() {
		if(!this.video)
			this.video = this.down('[itemId=video]');
		return this.video;
	},
	
	getVehicleFilter : function() {
		if(!this.vehicle_filter)
			this.vehicle_filter = this.getGrid().down('textfield[name=vehicleFilter]');
		return this.vehicle_filter;
	},
	
	getDriverFilter : function() {
		if(!this.driver_filter)
			this.driver_filter = this.getGrid().down('textfield[name=driverFilter]');
		return this.driver_filter;
	},

	getForm : function() {
		if(!this.incident_form)
			this.incident_form = this.down('[itemId=incident_form]');
		return this.incident_form;
	},
	
	getMapBox : function() {
		if(!this.mapbox)
			this.mapbox = this.down('[itemId=map]');
		return this.mapbox;
	},
	
	getMap : function() {
		return this.map;
	},
	
	getGrid : function() {
		if(!this.grid)
			this.grid = this.down('[itemId=grid]');
		return this.grid;
	},
	
	zInfo : {
		xtype : 'form',
		itemId : 'incident_form',
		title : 'Incident Information.',
		height : 40,
		autoScroll : true,
		defaults : {
			anchor : '100%'
		},
		items : [ {
			xtype : 'displayfield',
			name : 'incidentTime',
			fieldLabel : 'Incident Time'
		}, {
			xtype : 'displayfield',
			name : 'vehicle',
			fieldLabel : 'Vehicle'
		}, {
			xtype : 'displayfield',
			name : 'driver',
			fieldLabel : 'Driver'
		}, {
			xtype : 'displayfield',
			name : 'impulse',
			fieldLabel : 'Impulse'
		}, {
			xtype : 'displayfield',
			name : 'videoClip',
			hidden : true
		} ]
	},

	zVideoAndMap : {
		xtype : 'container',
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		flex : 1,
		items : [
				{
					xtype : 'panel',
					bodyPadding : 10,
					title : 'Incident Details',
					flex : 1,
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					items : [
							{
								xtype : 'box',
								itemId : 'video',
								tpl : [ '<video width="300" height="200" controls="controls">',
										'<source src="download?blob-key={value}" type="video/mp4" />',
										'Your browser does not support the video tag.', '</video>' ]
							}, {
								xtype : 'button',
								itemId : 'fullscreen',
								text : 'FullScreen(WebKit Only)'
							} ]
				}, {
					xtype : 'panel',
					title : 'Position of Incident',
					cls : 'paddingPanel',
					flex : 1,
					itemId : 'map',
					html : '<div class="map" style="width:100%;height:100%;border:1px solid #999;border-width:1px 2px 2px 1px"></div>'
				} ]
	},

	zList : {
		xtype : 'gridpanel',
		itemId : 'grid',
		title : 'Incident List',
		store : 'IncidentStore',
		autoScroll : true,
		flex : 1,
		columns : [ {
			dataIndex : 'key',
			text : 'Key',
			type : 'string',
			hidden : true
		}, {
			dataIndex : 'incidentTime',
			text : 'Incident Time',
			xtype : 'datecolumn',
			format : 'd-m-Y H:i:s'
		}, {
			dataIndex : 'driver',
			text : 'Driver',
			type : 'string'
		}, {
			dataIndex : 'vehicle',
			text : 'Vehicle',
			type : 'string'
		}, {
			dataIndex : 'lattitude',
			text : 'Lattitude',
			type : 'number'
		}, {
			dataIndex : 'longitude',
			text : 'Longitude',
			type : 'number'
		}, {
			dataIndex : 'impulse',
			text : 'Impulse',
			type : 'number'
		}, {
			dataIndex : 'createdAt',
			text : 'Created At',
			xtype : 'datecolumn',
			format : 'd-m-Y H:i:s'
		}, {
			dataIndex : 'updatedAt',
			text : 'Updated At',
			xtype : 'datecolumn',
			format : 'd-m-Y H:i:s'
		} ],
		viewConfig : {
		},
		tbar : [ {
			xtype : 'combo',
			queryMode : 'local',
			store : 'VehicleStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : 'Vehicle',
			name : 'vehicleFilter',
			width : 200
		}, {
			xtype : 'combo',
			queryMode : 'local',
			store : 'DriverStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : 'Driver',
			name : 'driverFilter',
			width : 200
		}, {
			xtype : 'button',
			itemId : 'search',
			text : 'Search',
			tooltip : 'Find Incident'
		}, {
			xtype : 'button',
			itemId : 'reset',
			text : 'Reset'
		} ]
	}
});