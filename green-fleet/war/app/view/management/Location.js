	Ext.define('GreenFleet.view.management.Location', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_location',

	title : T('titla.location'),

	entityUrl : 'location',

	importUrl : 'location/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;

		this.items = [
		    { html : "<div class='listTitle'>" + T('title.location_list') + "</div>" },
		    {
		    	xtype : 'container',
		    	flex : 1,
		    	layout : {
			    	type : 'hbox',
			    	align : 'stretch'
			    },
			    items : [			        
			        this.buildList(this),
				    {
				    	xtype : 'container',
				    	flex : 1,
				    	layout : {
					    	type : 'vbox',
					    	align : 'stretch'
					    },
					    items : [ this.buildForm(this), this.zmap ]
				    }			        
			    ]		    	
		    }
		];
		
		this.callParent(arguments);
		
		this.sub('map').on('afterrender', function(mapbox) {
			self.setGeocoder(new google.maps.Geocoder());
			var center = new google.maps.LatLng(System.props.lat, System.props.lng);
			var options = {
				zoom : 10,
				minZoom : 3,
				maxZoom : 19,
				center : center,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.setMap(new google.maps.Map(mapbox.getEl().down('.map').dom, options));
		});
		
		this.on('activate', function() {			
			google.maps.event.trigger(self.getMap(), 'resize');
			self.markCenter();
		});		

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);			
			self.refreshMap(new google.maps.LatLng(record.data.lat, record.data.lng), record.data.rad);
		});

		this.sub('name_filter').on('change', function(field, value) {
			self.search(false);
		});

		this.down('#search_reset').on('click', function() {
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search(true);
		});
	},
	
	getGeocoder : function() {
		return this.geocoder;
	},
	
	setGeocoder : function(geocoder) {
		this.geocoder = geocoder;
	},
	
	getMap : function() {
		return this.map;
	},

	setMap : function(map) {
		this.map = map;
	},
	
	getMarker : function() {
		return this.marker;
	},

	setMarker : function(marker) {
		if (this.marker)
			this.marker.setMap(null);
		
		this.marker = marker;
	},
	
	getCircle : function() {
		return this.circle;
	},
	
	setCircle : function(circle) {	
		if (this.circle)
			this.circle.setMap(null);
					
		this.circle = circle;
	},
	
	markCenter : function() {
		this.setMarker(this.createMarker(this.map.getCenter()));
	},
	
	refreshMap : function(center, radius) {

		if (!center)
			return;
		
		// 지도 중심 이동
		this.map.setCenter(center);
		
		// 마커 표시 
		this.setMarker(null);
		this.setMarker(this.createMarker(center));
		
		if(!radius)
			radius = this.sub('form_radius').getValue();
		
		// Circle Refresh
		this.refreshCircle(radius);		
	},
	
	refreshLocation : function(center, radius) {		
		this.refreshMap(center, radius);
		// 폼 위도, 경도에 추가	
		this.sub('form_latitude').setValue(center.lat());
		this.sub('form_longitude').setValue(center.lng());		
	},	
	
	refreshLocByAddr : function(address) {
		if(!address){
			Ext.Msg.alert(T('msg.address_notfound_title'), T('msg.address_empty'));
			return;
		}
		var self = this;
		// 주소로 위치 검색
	    this.geocoder.geocode({'address': address}, function(results, status) {
	    	
	    	if (status == google.maps.GeocoderStatus.OK) {	    		
	    		var center = results[0].geometry.location;
	    		self.refreshLocation(center);
	      } else {
	    	  	self.setMarker(null);
	    	  	//Ext.Msg.alert("Failed to search!", "Address (" + address + ") Not Found!");
	    	  	Ext.Msg.alert(T('msg.address_notfound_title'), T('msg.address_notfound', {x:address}));
	      }
	    });
	},
	
	moveMarker : function(marker) {		
		var self = this;
		var position = marker.getPosition();
		
		// 위치로 주소 검색
		this.geocoder.geocode({'latLng': position}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				self.refreshLocation(position);
				// 폼의 주소 필드에 주소값 업데이트
				self.sub('form_address').setValue(results[0].formatted_address);				
			} else {
				self.map.setCenter(position);
				Ext.Msg.alert("Failed to search!", "Couldn't find address by position [" + position.lat() + ", " + position.lng() + "]!");
			}
		});
	},
	
	refreshCircle : function(radius) {
		
		if(!this.marker)
			return;
		
		if(!radius)
			radius = this.sub('form_radius').getValue();
		
		this.setCircle(null);
		if(radius) {
			var map = this.map;
			var marker = this.marker;
			this.setCircle(this.createCircle(marker.getPosition(), radius));
			
			// North, West, South, East lat, lng를 구함
			var bounds = this.circle.getBounds();
			var northWest = bounds.getNorthEast();
			var southEast = bounds.getSouthWest();
			
			this.sub('form_radius').setValue(radius);
			this.sub('form_lat_hi').setValue(northWest.lat());
			this.sub('form_lng_hi').setValue(northWest.lng());
			this.sub('form_lat_lo').setValue(southEast.lat());
			this.sub('form_lng_lo').setValue(southEast.lng());
		}
	},
	
	createMarker : function(center) {
		var self = this;
		var marker = new google.maps.Marker({
			position : center,
			map : self.map,
			draggable : true
		});
		
		if(this.marker && this.marker.dragend_listener) {
			google.maps.event.removeListener(this.marker.dragend_listener);
		}
		
		marker.dragend_listener = google.maps.event.addListener(marker, 'dragend', function() {
			self.moveMarker(marker);
		});
				
		return marker;
	},
	
	createCircle : function(center, radius) {
		
		if(!center)
			return;
		
		if(!radius)
			radius = this.sub('form_radius').getValue();
		
		var self = this;
		var circle = new google.maps.Circle({
			map: this.map,
			center : center,
			radius: radius,
			strokeColor : 'red',
			editable : true
  	  	});
		
		if(this.circle && this.circle.radius_change_listener) {
			google.maps.event.removeListener(this.circle.radius_change_listener);
		}
		
		circle.radius_change_listener = google.maps.event.addListener(circle, 'radius_changed', function() {
			self.radiusChanged(circle.getRadius());
		});
		
		return circle;
	},
	
	radiusChanged : function(radius) {		
		if(this.marker) {
			this.refreshCircle(radius);
		}
	},
	
	search : function(remote) {
		this.sub('grid').store.remoteFilter = remote; 
		this.sub('grid').store.clearFilter(true); 

		this.sub('grid').store.filter([ {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'LocationStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'name',
				text : T('label.name'),
				type : 'string'
			}, {
				dataIndex : 'addr',
				text : T('label.address'),
				type : 'string'
			}, {
				dataIndex : 'lat',
				text : T('label.latitude'),
				type : 'float'
			}, {
				dataIndex : 'lng',
				text : T('label.longitude'),
				type : 'float'
			}, {
				dataIndex : 'rad',
				text : T('label.radius') + ' (m)',
				type : 'int'
			}, {
				dataIndex : 'lat_lo',
				text : T('label.latitude_min'),
				type : 'float'
			}, {
				dataIndex : 'lng_lo',
				text : T('label.longitude_min'),
				type : 'float'					
			}, {
				dataIndex : 'lat_hi',
				text : T('label.latitude_max'),
				type : 'float'
			}, {
				dataIndex : 'lng_hi',
				text : T('label.longitude_max'),
				type : 'float'					
			}, {
				dataIndex : 'expl',
				text : T('label.desc'),
				type : 'string'					
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
			viewConfig : {

			},
			tbar : [ T('label.name'), {
				xtype : 'textfield',
				name : 'name_filter',
				itemId : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				text : T('button.search'),
				itemId : 'search'
			}, {
				text : T('button.reset'),
				itemId : 'search_reset'
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'LocationStore',
	            cls : 'pagingtoolbar',
	            displayInfo: true,
	            displayMsg: 'Displaying locations {0} - {1} of {2}',
	            emptyMsg: "No locations to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.location_details'),
			autoScroll : true,
			height : 395,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Key',
				hidden : true
			}, {
				name : 'name',
				fieldLabel : T('label.name'),
				allowBlank: false,
				afterLabelTextTpl: required
			}, {
                xtype: 'fieldcontainer',
                fieldLabel: T('label.address'),
				allowBlank: false,
				afterLabelTextTpl: required,
                layout: 'hbox',
                defaults: {
                    hideLabel: true
                },
                items: [
                    {
                    	itemId : 'form_address',
                        xtype : 'textfield',
                        name : 'addr',
                        fieldLabel : T('label.address'),
                        flex : 1
                    },
                    {
                        xtype : 'button',
                        text : T('button.search'),
                        margin : '0 0 0 5',
                        handler : function(btn, event) {
                        	var locationView = btn.up('management_location');
                        	var address = btn.up('fieldcontainer').down('textfield').getValue();
                        	locationView.refreshLocByAddr(address);                        	
                        }
                    }
                ]
			}, {
				itemId : 'form_latitude',
				name : 'lat',
				xtype : 'textfield',
				fieldLabel : T('label.latitude')
			}, {
				itemId : 'form_longitude',
				name : 'lng',
				xtype : 'textfield',
				fieldLabel : T('label.longitude')
			}, {
				itemId : 'form_radius',
				name : 'rad',
				xtype : 'numberfield',
				fieldLabel : T('label.radius') + ' (m)',
				minValue : 0,
				step : 100,
				listeners : {
					change : function(field, newValue, oldValue, eOpts) {
						field.up('management_location').radiusChanged(newValue);
					}
				}
			}, {
				name : 'expl',
				fieldLabel : T('label.desc')
			}, {
				itemId : 'form_lat_lo',
				name : 'lat_lo',
				fieldLabel : T('label.latitude_min')
			}, {
				itemId : 'form_lng_lo',
				name : 'lng_lo',
				fieldLabel : T('label.longitude_min')
			}, {
				itemId : 'form_lat_hi',
				name : 'lat_hi',
				fieldLabel : T('label.latitude_max')
			}, {
				itemId : 'form_lng_hi',
				name : 'lng_hi',
				fieldLabel : T('label.longitude_max')
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : T('label.updated_at'),
				format : F('datetime')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : T('label.created_at'),
				format : F('datetime')
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : function(callback) {
						//main.sub('grid').store.load(callback);
						main.sub('name_filter').setValue('');
						main.search(true);
					},
					scope : main
				}
			} ]
		}
	},
	
	zmap : {
		xtype : 'panel',
		title : T('title.set_the_location'),
		cls : 'paddingPanel backgroundGray borderLeftGray',
		itemId : 'map',
		flex : 1,
		html : '<div class="map"></div>'
	}	
});