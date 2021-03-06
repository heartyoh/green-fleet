Ext.define('GreenFleet.view.monitor.IncidentView', {
	extend : 'Ext.container.Container',

	alias : 'widget.monitor_incident',

	title : T('title.incident_view'),

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
			height : 460,
			items : [ this.zInfo, this.zVideoAndMap ]
		}, {
			xtype : 'container',
			autoScroll : true,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [ this.zList ]
		} ];

		this.callParent(arguments);

		/*
		 * Content
		 */

		var self = this;

		this.sub('map').on('afterrender', function() {
			var options = {
				zoom : 12,
				minZoom : 3,
				maxZoom : 19,
				center : new google.maps.LatLng(System.props.lat, System.props.lng),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.map = new google.maps.Map(self.sub('map').getEl().down('.map').dom, options);

			self.getLogStore().on('load', function(store, records, success) {
				if(success)
					self.refreshTrack();
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
			if (value != null && value.length > 1) {
				if (value.indexOf('http') == 0)
					url = 'src=' + value;
				else
					url = 'src="download?blob-key=' + value + '"';
			}

			self.sub('video').update({
				value : url
			});
		});

		this.down('datefield[name=datetime]').on('change', function(field, value) {
			self.sub('incident_time').setValue(Ext.Date.format(value, 'D Y-m-d H:i:s'));
		});

		this.down('displayfield[name=driver_id]').on('change', function(field, value) {
			if(value && value != '') {
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
		var self = this;
		this.incident = incident;
		if (refresh) {
			this.sub('vehicle_filter').setValue(incident.get('vehicle_id'));
			this.sub('driver_filter').reset();
			this.refreshIncidentList();
		}

		if((incident.data.lat !== undefined && incident.data.lng !== undefined) && (incident.data.lat > 0 && incident.data.lng > 0)) {
			var latlng = new google.maps.LatLng(incident.data.lat, incident.data.lng);
			geocoder = new google.maps.Geocoder();
			geocoder.geocode({
				'latLng' : latlng
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						var address = results[0].formatted_address;
						incident.data.location = address;
						self.sub('incident_form').loadRecord(incident);
					}
				} else {
					console.log("Geocoder failed due to: " + status);
				}
			});			
		} else {
			self.sub('incident_form').loadRecord(incident);
		}
				
		this.refreshMap();
	},

	getIncident : function() {
		return this.incident;
	},

	refreshIncidentList : function() {
		this.sub('pagingtoolbar').moveFirst();
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
		
		if (!incident)
			return;
		
		var location = null;
		if (!incident) {
			location = new google.maps.LatLng(System.props.lat, System.props.lng);
		} else {
			if(incident.get('lat') && incident.get('lng') && incident.get('lat') > 0 && incident.get('lng') > 0) {
				location = new google.maps.LatLng(incident.get('lat'), incident.get('lng'));
			}
		}
		
		if (!location)
			return;
		
		this.getMap().setCenter(location);		

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
			
			if(!record.get('lat') || record.get('lat') == 0 || !record.get('lng') || record.get('lng') == 0)
				return false;
			
			latlng = new google.maps.LatLng(record.get('lat'), record.get('lng'));
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
			fieldLabel : T('label.x_time', {
				x : T('label.incident')
			})
		}, {
			xtype : 'displayfield',
			name : 'location',
			width : 300,
			fieldLabel : T('label.location')
		}, {
			xtype : 'displayfield',
			name : 'vehicle_id',
			width : 100,
			fieldLabel : T('label.vehicle')
		}, {
			xtype : 'displayfield',
			name : 'driver_id',
			width : 100,
			fieldLabel : T('label.driver')
		}, {
			xtype : 'displayfield',
			name : 'impulse_abs',
			width : 100,
			fieldLabel : T('label.impulse')
		}, {
			xtype : 'displayfield',
			name : 'engine_temp',
			width : 100,
			fieldLabel : T('label.engine_temp')
		}, {
			xtype : 'checkbox',
			name : 'confirm',
			itemId : 'confirm',
			fieldLabel : T('label.confirm'),
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
					// title : T('title.incident_details'),
					cls : 'paddingAll10 incidentVOD',
					width : 690,
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
								flex : 1,
								itemId : 'video',
								tpl : [ '<video width="100%" height="100%" controls="controls">', 
								        '<source {value} type="video/mp4" />',
										'Your browser does not support the video tag.', '</video>' ]
							} ]
				}, {
					xtype : 'panel',
					// title : T('title.position_of_incident'),
					cls : 'backgroundGray borderLeftGray',
					flex : 1,
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					items : [ {
						xtype : 'box',
						itemId : 'map',
						html : '<div class="map"></div>',
						flex : 3
					}, {
						xtype : 'chart',
						itemId : 'chart',
						flex : 1,
						legend : {
							position : 'bottom',
							itemSpacing : 5,
							padding : 0,
							labelFont : "10px Helvetica, sans-serif",
							boxStroke : "transparent",
							boxFill : "transparent"
						},
						store : 'IncidentLogStore',
						axes : [ {
							// title : T('label.acceleration'),
							type : 'Numeric',
							position : 'left',
							fields : [ 'accelate_x', 'accelate_y', 'accelate_z' ]
						}, {
							// title : T('label.acceleration'),
							type : 'Numeric',
							position : 'right',
							fields : [ 'velocity' ]
						}, {
							// title : T('label.time'),
							type : 'Time',
							position : 'bottom',
							fields : [ 'datetime' ],
							dateFormat : 'H:i:s',
							step : [ Ext.Date.SECOND, 1 ],
							label : {
								rotate : {
									degrees : 45
								}
							}
						} ],
						series : [ {
							type : 'line',
							xField : 'datetime',
							yField : 'accelate_x',
							axis : 'left',
							smooth : true
						}, {
							type : 'line',
							xField : 'datetime',
							yField : 'accelate_y',
							axis : 'left',
							smooth : true
						}, {
							type : 'line',
							xField : 'datetime',
							yField : 'accelate_z',
							axis : 'left',
							smooth : true
						}, {
							type : 'line',
							xField : 'datetime',
							yField : 'velocity',
							axis : 'right',
							smooth : true
						} ],
						flex : 2
					} ]
				} ]
	},

	zList : {
		xtype : 'gridpanel',
		itemId : 'grid',
		cls : 'hIndexbar',
		title : T('title.incident_list'),
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
			text : T('label.confirm'),
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			align : 'center',
			width : 50
		}, {
			dataIndex : 'datetime',
			text : T('label.x_time', {
				x : T('label.incident')
			}),
			xtype : 'datecolumn',
			width : 120,
			format : F('datetime')
		}, {
			dataIndex : 'driver_id',
			text : T('label.driver'),
			type : 'string',
			width : 80
		}, {
			dataIndex : 'vehicle_id',
			text : T('label.vehicle'),
			type : 'string',
			width : 80
		}, {
			dataIndex : 'terminal_id',
			text : T('label.terminal'),
			type : 'string',
			width : 80
		}, {
			dataIndex : 'lat',
			text : T('label.latitude'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'lng',
			text : T('label.longitude'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'velocity',
			text : T('label.velocity'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_abs',
			text : T('label.impulse'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_x',
			text : T('label.impulse_x', {
				x : 'X'
			}),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_y',
			text : T('label.impulse_x', {
				x : 'Y'
			}),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_z',
			text : T('label.impulse_x', {
				x : 'Z'
			}),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'impulse_threshold',
			text : T('label.impulse_threshold'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'obd_connected',
			text : T('label.obd'),
			renderer : function(value, cell) {
				return '<input type="checkbox" disabled="true" ' + (!!value ? 'checked ' : '') + '"/>';
			},
			align : 'center',
			width : 40
		}, {
			dataIndex : 'engine_temp',
			text : T('label.engine_temp'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'engine_temp_threshold',
			text : T('label.engine_temp_threshold'),
			type : 'number',
			width : 80
		}, {
			dataIndex : 'created_at',
			text : T('label.created_at'),
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'updated_at',
			text : T('label.updated_at'),
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
			fieldLabel : T('label.vehicle'),
			itemId : 'vehicle_filter',
			width : 200
		}, {
			xtype : 'combo',
			queryMode : 'local',
			store : 'DriverBriefStore',
			displayField : 'id',
			valueField : 'id',
			fieldLabel : T('label.driver'),
			itemId : 'driver_filter',
			width : 200
		}, {
			itemId : 'search',
			text : T('button.search')
		}, {
			itemId : 'reset',
			text : T('button.reset')
		} ],
		bbar : {
			xtype : 'pagingtoolbar',
			itemId : 'pagingtoolbar',
			cls : 'pagingtoolbar', // 하단 page tool bar에 대한 아이콘 버튼 class
			store : 'IncidentViewStore',
			displayInfo : true,
			displayMsg : 'Displaying incidents {0} - {1} of {2}',
			emptyMsg : "No incidents to display"
		}
	}
});
