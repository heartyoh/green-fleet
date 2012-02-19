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
		
		this.down('displayfield[name=video_clip]').on('change', function(field, value) {
			var url = '';
			if (value != null && value.length > 1)
				url = 'src="download?blob-key=' + value + '"'

			self.sub('video').update({
				value : url
			});
		});
		
		this.down('datefield[name=datetime]').on('change', function(field, value) {
			self.sub('incident_time').setValue(Ext.Date.format(value, 'D Y-m-d H:i:s'));
		});
		
		this.down('displayfield[name=driver_id]').on('change', function(field, value) {
			/*
			 * Get Driver Information (Image, Name, ..) from DriverStore
			 */
			var driverStore = Ext.getStore('DriverStore');
			var driverRecord = driverStore.findRecord('id', value);
			var driver = driverRecord.get('id');
			var driverImageClip = driverRecord.get('image_clip');
			if (driverImageClip) {
				self.sub('driverImage').setSrc('download?blob-key=' + driverImageClip);
			} else {
				self.sub('driverImage').setSrc('resources/image/bgDriver.png');
			}
		});

		this.sub('driver_filter').on('specialkey', function(fleld, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			};
		});
		
		this.sub('vehicle_filter').on('specialkey', function(field, e) {
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
		
		this.sub('incident_form').on('afterrender', function(form) {
			this.down('[itemId=confirm]').getEl().on('click', function(checkbox, dirty) {
				var form = self.sub('incident_form').getForm();

				if (form.getRecord() != null) {
					form.submit({
						url : 'incident/save',
						success : function(form, action) {
							var store = self.sub('grid').store;
							store.load(function() {
								form.loadRecord(store.findRecord('key', action.result.key));
							});
						},
						failure : function(form, action) {
							GreenFleet.msg('Failed', action.result.msg);
						}
					});
				}
			});
		});
		
	},
	
	setIncident : function(incident, refresh) {
		this.incident = incident;
		if(refresh) {
			this.sub('vehicle_filter').setValue(incident.get('vehicle'));
			this.sub('driver_filter').reset();
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
				property : 'vehicle_id',
				value : this.sub('vehicle_filter').getValue()
			}, {
				property : 'driver_id',
				value : this.sub('driver_filter').getValue()
			} ]
		});
	},
	
	resetIncidentList : function() {
		this.sub('vehicle_filter').reset();
		this.sub('driver_filter').reset();
		
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
			xtype : 'textfield',
			name : 'key',
			hidden : true
		}, {
			xtype : 'image',
			itemId : 'driverImage',
			cls : 'imgDriverSmall',
			height: 37
		},{
			xtype : 'datefield',
			name : 'datetime',
			hidden : true,
			format : 'd-m-Y H:i:s'
		},{
			xtype : 'displayfield',
			itemId : 'incident_time',
			width : 160,
			fieldLabel : 'Incident Time'
		}, {
			xtype : 'displayfield',
			name : 'vehicle_id',
			width : 100,
			fieldLabel : 'Vehicle'
		}, {
			xtype : 'displayfield',
			name : 'driver_id',
			width : 100,
			fieldLabel : 'Driver'
		}, {
			xtype : 'displayfield',
			name : 'impulse_abs',
			width : 100,
			fieldLabel : 'Impulse'
		}, {
			xtype : 'displayfield',
			name : 'engine_temp',
			width : 100,
			fieldLabel : 'Engine Temp.'
		}, {
			xtype : 'checkbox',
			name : 'confirm',
			itemId : 'confirm',
			fieldLabel : 'Confirm',
			uncheckedValue : 'off'
		}, {
			xtype : 'displayfield',
			name : 'video_clip',
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
								cls : 'incidentDetail',
								itemId : 'video',
								tpl : [ '<video width="100%" height="95%" controls="controls">',
										'<source {value} type="video/mp4" />',
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
			dataIndex : 'datetime',
			text : 'Incident Time',
			xtype : 'datecolumn',
			width : 120,
			format : 'd-m-Y H:i:s'
		}, {
			dataIndex : 'driver_id',
			text : 'Driver',
			type : 'string',
			width : 80
		}, {
			dataIndex : 'vehicle_id',
			text : 'Vehicle',
			type : 'string',
			width : 80
		}, {
			dataIndex : 'terminal_id',
			text : 'Terminal',
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
			dataIndex : 'velocity',
			text : 'Velocity',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_abs',
			text : 'Impulse',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_x',
			text : 'Impulse X',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_y',
			text : 'Impulse Y',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_z',
			text : 'Impulse Z',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_threshold',
			text : 'Impulse Threshold',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'obd_connected',
			text : 'OBD Connected',
			type : 'boolean',
			width : 80
		}, {
			dataIndex : 'confirm',
			text : 'Confirm',
			type : 'boolean',
			width : 80
		}, {
			dataIndex : 'engine_temp',
			text : 'Engine Temp.',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'engine_temp_threshold',
			text : 'Engine Temp. Threshold',
			type : 'number',
			width : 80
		}, {
			dataIndex : 'created_at',
			text : 'Created At',
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'updated_at',
			text : 'Updated At',
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
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
			itemId : 'vehicle_filter',
			width : 200
		}, {
			xtype : 'combo',
			queryMode : 'local',
			store : 'DriverStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : 'Driver',
			itemId : 'driver_filter',
			width : 200
		}, {
			itemId : 'search',
			text : 'Search'
		}, {
			itemId : 'reset',
			text : 'Reset'
		} ]
	}
});
