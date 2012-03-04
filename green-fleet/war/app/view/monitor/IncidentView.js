Ext.define('GreenFleet.view.monitor.IncidentView', {
	extend : 'Ext.container.Container',

	alias : 'widget.monitor_incident',

	title : 'Incident View',

	layout : {
		type : 'vbox',
		align : 'stretch'
	},

	initComponent : function() {
		this.items = [ {
			xtype : 'container',
			autoScroll : true,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			flex : 1,
			items : [ this.zInfo, this.zVideoAndMap ]
		}, {
			xtype : 'container',
			autoScroll : true,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [ this.zList, this.buildChart() ]
		} ];

		this.callParent(arguments);

		/*
		 * Content
		 */

		var self = this;

		this.sub('map').on('afterrender', function() {
			var options = {
				zoom : 12,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.map = new google.maps.Map(self.sub('map').getEl().down('.map').dom, options);

			self.getLogStore().on('load', function(store, records, success) {

				self.refreshTrack();

				if(success) {
//					var store = Ext.create('GreenFleet.store.IncidentLogChartStore');
					self.sub('chart').store.loadData(records);
//					self.sub('chart').bindStore(store);
				} else {
					self.sub('chart').store.loadData([]);
				}
			});
		});

		this.on('activate', function(comp) {
			google.maps.event.trigger(self.getMap(), 'resize');
		});

		this.down('button[itemId=search]').on('click', function() {
			self.refreshIncidentList();
		});

		this.down('button[itemId=reset]').on('click', function() {
			self.sub('vehicle_filter').reset();
			self.sub('driver_filter').reset();
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
			var driverStore = Ext.getStore('DriverBriefStore');
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
			}
		});

		this.sub('vehicle_filter').on('specialkey', function(field, e) {
			if (e.getKey() == e.ENTER) {
				self.refreshIncidentList();
			}
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

		this.sub('incident_form').on(
				'afterrender',
				function() {
					this.down('[itemId=confirm]').getEl().on(
							'click',
							function(e, t) {
								var form = self.sub('incident_form').getForm();

								if (form.getRecord() != null) {
									form.submit({
										url : 'incident/save',
										success : function(form, action) {
											self.sub('grid').store.findRecord('key', action.result.key).set('confirm',
													form.findField('confirm').getValue());
										},
										failure : function(form, action) {
											GreenFleet.msg('Failed', action.result.msg);
											form.reset();
										}
									});
								}
							});
				});

		this.down('#grid').store.on('beforeload', function(store, operation, opt) {
			operation.params = operation.params || {};
			operation.params['vehicle_id'] = self.sub('vehicle_filter').getSubmitValue();
			operation.params['driver_id'] = self.sub('driver_filter').getSubmitValue();
		});

	},

	getLogStore : function() {
		if (!this.logStore)
			this.logStore = Ext.getStore('IncidentLogStore');
		return this.logStore;
	},

	setIncident : function(incident, refresh) {
		this.incident = incident;
		if (refresh) {
			this.sub('vehicle_filter').setValue(incident.get('vehicle_id'));
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
		this.sub('pagingtoolbar').moveFirst();
		//
		// this.sub('grid').store.load({
		// filters : [ {
		// property : 'vehicle_id',
		// value : this.sub('vehicle_filter').getValue()
		// }, {
		// property : 'driver_id',
		// value : this.sub('driver_filter').getValue()
		// }, {
		// property : 'confirm',
		// value : false
		// } ],
		// callback : callback
		// });
	},

	getTrackLine : function() {
		return this.trackline;
	},

	setTrackLine : function(trackline) {
		if (this.trackline)
			this.trackline.setMap(null);
		this.trackline = trackline;
	},

	getMarker : function() {
		return this.marker;
	},

	setMarker : function(marker) {
		if (this.marker)
			this.marker.setMap(null);
		this.marker = marker;
	},

	refreshMap : function() {
		this.setMarker(null);

		var incident = this.getIncident();
		var location = null;
		if (!incident)
			location = new google.maps.LatLng(System.props.lattitude, System.props.longitude);
		else
			location = new google.maps.LatLng(incident.get('lattitude'), incident.get('longitude'));

		this.getMap().setCenter(location);

		if (!incident)
			return;

		this.setMarker(new google.maps.Marker({
			position : location,
			map : this.getMap()
		}));

		this.getLogStore().clearFilter(true);
		this.getLogStore().filter([ {
			property : "incident",
			value : incident.get('key')
		} ]);
		this.getLogStore().load();
	},

	refreshTrack : function() {
		this.setTrackLine(new google.maps.Polyline({
			map : this.getMap(),
			strokeColor : '#FF0000',
			strokeOpacity : 1.0,
			strokeWeight : 4
		}));

		var path = this.getTrackLine().getPath();
		var bounds;
		var latlng;

		this.getLogStore().each(function(record) {
			latlng = new google.maps.LatLng(record.get('lattitude'), record.get('longitude'));
			path.push(latlng);
			if (!bounds)
				bounds = new google.maps.LatLngBounds(latlng, latlng);
			else
				bounds.extend(latlng);
		});

		if (!bounds)
			return;

		if (bounds.isEmpty() || bounds.getNorthEast().equals(bounds.getSouthWest())) {
			this.getMap().setCenter(bounds.getNorthEast());
		} else {
			this.getMap().fitBounds(bounds);
		}
	},

	getMap : function() {
		return this.map;
	},

	zInfo : {
		xtype : 'form',
		itemId : 'incident_form',
		cls : 'incidentSummary',
		height : 50,
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
			height : 37
		}, {
			xtype : 'datefield',
			name : 'datetime',
			hidden : true,
			format : 'd-m-Y H:i:s'
		}, {
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
			uncheckedValue : 'off',
			labelCls : 'labelStyle1',
			cls : 'backgroundNone'
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
							},
							{
								xtype : 'box',
								cls : 'incidentDetail',
								itemId : 'video',
								tpl : [ '<video width="100%" height="95%" controls="controls">', '<source {value} type="video/mp4" />',
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

	buildChart : function() {
		return {
			xtype : 'chart',
			itemId : 'chart',
			flex : 1,
			legend : true,
			store : Ext.create('GreenFleet.store.IncidentLogChartStore'),
			axes : [ {
				title : 'Acceleration',
				type : 'Numeric',
				position : 'left',
				fields : [ 'accelate_x', 'accelate_y', 'accelate_z' ]
			// minimum : -2,
			// maximum : 2
			}, {
				title : 'Time',
				type : 'Category',
				position : 'bottom',
				fields : [ 'datetime' ]
			// dateFormat : 'M d g:i:s',
			// step : [Ext.Date.SECOND, 1]
			} ],
			series : [ {
				type : 'line',
				smooth : true,
				xField : 'datetime',
				yField : 'accelate_x'
			}, {
				type : 'line',
				smooth : true,
				xField : 'datetime',
				yField : 'accelate_y'
			}, {
				type : 'line',
				smooth : true,
				xField : 'datetime',
				yField : 'accelate_z'
			} ]
		}
	},

	zList : {
		xtype : 'gridpanel',
		itemId : 'grid',
		cls : 'hIndexbar',
		title : 'Incident List',
		store : 'IncidentViewStore',
		autoScroll : true,
		flex : 1,
		columns : [ new Ext.grid.RowNumberer(), {
			dataIndex : 'key',
			text : 'Key',
			type : 'string',
			hidden : true
		}, {
			dataIndex : 'video_clip',
			text : 'V',
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			width : 20
		}, {
			dataIndex : 'confirm',
			text : 'Confirm',
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			align : 'center',
			width : 50
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
			text : 'OBD',
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			align : 'center',
			width : 40
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
		viewConfig : {},
		tbar : [ {
			xtype : 'combo',
			queryMode : 'local',
			store : 'VehicleBriefStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : 'Vehicle',
			itemId : 'vehicle_filter',
			width : 200
		}, {
			xtype : 'combo',
			queryMode : 'local',
			store : 'DriverBriefStore',
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
		} ],
		bbar : {
			xtype : 'pagingtoolbar',
			itemId : 'pagingtoolbar',
			store : 'IncidentViewStore',
			displayInfo : true,
			displayMsg : 'Displaying incidents {0} - {1} of {2}',
			emptyMsg : "No incidents to display"
		}
	}
});
