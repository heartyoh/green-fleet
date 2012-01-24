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
		
		this.sub('map').on('afterrender', function() {
			var options = {
				zoom : 10,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.map = new google.maps.Map(self.sub('map').getEl().down('.map').dom, options);
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
			self.sub('video').update({
				value : value
			});
		});
		
		this.down('datefield[name=incidentTime]').on('change', function(field, value) {
			self.sub('incident_time').setValue(Ext.Date.format(value, 'D Y-m-d H:i:s'));
		});
		
		this.down('displayfield[name=driver]').on('change', function(field, value) {
			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', value);
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('imageClip');
			if (driverImageClip) {
				self.sub('driverImage').setSrc('download?blob-key=' + driverImageClip);
			} else {
				self.sub('driverImage').setSrc('resources/image/bgDriver.png');
			}
		});

		this.sub('driverFilter').on('specialkey', function(fleld, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			};
		});
		
		this.sub('vehicleFilter').on('specialkey', function(field, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			};
		});

		this.sub('grid').on('itemclick', function(grid, record) {
			self.setIncident(record, false);
		});
		
		this.sub('fullscreen').on('afterrender', function(comp) {
			comp.getEl().on('click', function() {
				if (!Ext.isWebKit)
					return;
				self.sub('video').getEl().dom.getElementsByTagName('video')[0].webkitEnterFullscreen();
			});
		});
	},
	
	setIncident : function(incident, refresh) {
		this.incident = incident;
		if(refresh) {
			this.sub('vehicleFilter').setValue(incident.get('vehicle'));
			this.sub('driverFilter').reset();
			this.refreshIncidentList();
		}
		
		this.sub('incident_form').loadRecord(incident);
		this.refreshMap();
	},
	
	getIncident : function() {
		return this.incident;
	},
	
	refreshIncidentList : function() {
		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle',
				value : this.sub('vehicleFilter').getValue()
			}, {
				property : 'driver',
				value : this.sub('driverFilter').getValue()
			} ]
		});
	},
	
	resetIncidentList : function() {
		this.sub('vehicleFilter').reset();
		this.sub('driverFilter').reset();
		
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
	
	getMap : function() {
		return this.map;
	},
	
	zInfo : {
		xtype : 'form',
		itemId : 'incident_form',
		cls : 'incidentSummary',
		height: 50,
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		autoScroll : true,
		defaults : {
			anchor : '100%',
			labelAlign : 'top',
			cls : 'summaryCell'
		},
		items : [ {
			xtype : 'image',
			itemId : 'driverImage',
			cls : 'imgDriverSmall',
			height: 37
		},{
			xtype : 'datefield',
			name : 'incidentTime',
			hidden : true,
			fieldLabel : 'Incident Time'
		},{
			xtype : 'displayfield',
			itemId : 'incident_time',
			width : 160,
			fieldLabel : 'Incident Time'
		}, {
			xtype : 'displayfield',
			name : 'vehicle',
			width : 100,
			fieldLabel : 'Vehicle'
		}, {
			xtype : 'displayfield',
			name : 'driver',
			width : 100,
			fieldLabel : 'Driver'
		}, {
			xtype : 'displayfield',
			name : 'impulse',
			width : 100,
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
					title : 'Incident Details',
					cls : 'paddingPanel incidentVOD',
					flex : 1,
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					items : [
							{
								xtype : 'box',
								itemId : 'fullscreen',
								html : '<div class="btnFullscreen"></div>'
							}, {
								xtype : 'box',
								cls : ' incidentDetail',
								itemId : 'video',
								tpl : [ '<video width="100%" height="95%" controls="controls">',
										'<source src="download?blob-key={value}" type="video/mp4" />',
										'Your browser does not support the video tag.', '</video>' ]
							} ]
				}, {
					xtype : 'panel',
					title : 'Position of Incident',
					cls : 'paddingPanel backgroundGray borderLeftGray',
					flex : 1,
					itemId : 'map',
					html : '<div class="map"></div>'
				} ]
	},

	zList : {
		xtype : 'gridpanel',
		itemId : 'grid',
		cls : 'hIndexbar',
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
			width : 120,
			format : 'd-m-Y H:i:s'
		}, {
			dataIndex : 'driver',
			text : 'Driver',
			type : 'string',
			width : 80
		}, {
			dataIndex : 'vehicle',
			text : 'Vehicle',
			type : 'string',
			width : 80
		}, {
			dataIndex : 'lattitude',
			text : 'Lattitude',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'longitude',
			text : 'Longitude',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse',
			text : 'Impulse',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'createdAt',
			text : 'Created At',
			xtype : 'datecolumn',
			width : 120,
			format : 'd-m-Y H:i:s'
		}, {
			dataIndex : 'updatedAt',
			text : 'Updated At',
			xtype : 'datecolumn',
			width : 120,
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
			itemId : 'vehicleFilter',
			width : 200
		}, {
			xtype : 'combo',
			queryMode : 'local',
			store : 'DriverStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : 'Driver',
			itemId : 'driverFilter',
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
