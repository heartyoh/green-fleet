Ext.define('GreenFleet.view.management.Location', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_location',

	title : T('titla.location'),

	entityUrl : 'location',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
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
			var options = {
				zoom : 10,
				minZoom : 3,
				maxZoom : 19,
				center : new google.maps.LatLng(System.props.lattitude, System.props.longitude),
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};

			self.setMap(new google.maps.Map(mapbox.getEl().down('.map').dom, options));
		});
		
		this.on('activate', function() {
			google.maps.event.trigger(self.getMap(), 'resize');
		});		

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);			
			self.refreshMapByLoc(record);
		});

		this.sub('name_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
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
	
	refreshMapByLoc : function(locRecord) {
		
		this.setMarker(null);
		var center = locRecord ? new google.maps.LatLng(locRecord.data.lat, locRecord.data.lng) : new google.maps.LatLng(System.props.lattitude, System.props.longitude);
		
		if (!center)
			return;
		
		var map = this.getMap();
		map.setCenter(center);
		
		this.setMarker(new google.maps.Marker({
			position : center,
			map : map
		}));
		
		if(locRecord.data.rad && locRecord.data.rad > 100) {		
			this.setCircle(new google.maps.Circle({
				map: map,
				center : center,
				radius: locRecord.data.rad,
				strokeColor : 'red'
	  	  	}));
		} else {
			this.setCircle(null);
		}
	},
	
	refreshMapByAddr : function(address, radius) {
		var self = this;
		var map = this.getMap();

		// 주소로 검색
	    this.geocoder.geocode( {'address': address}, function(results, status) {
	    	if (status == google.maps.GeocoderStatus.OK) {
	    		
	    		var center = results[0].geometry.location;
	    		map.setCenter(center);
	    		
	    		// 폼 위도, 경도에 추가	    		
	    		self.sub('form_lattitude').setValue(center.Xa);
	    		self.sub('form_longitude').setValue(center.Ya);	        
	    		// 마커 리셋
	    		self.setMarker(null);
	    		self.setMarker(new google.maps.Marker({
	    			map: map,
	    			position: center
	    		}));
	    		
	    		if(radius) {
		    		self.setCircle(new google.maps.Circle({
		    			map: map,
		    			center : center,
		    			radius: radius,
		    			strokeColor : 'red'
		      	  	}));
	    		} else {
	    			this.setCircle(null);
	    		}
	      } else {
	    	  self.setMarker(null);
	    	  Ext.Msg.alert("Failed to search!", "Address (" + address + ") Not Found!");
	      }
	    });		
	},
	
	refreshCircle : function(radius) {
		
		if(!this.marker)
			return;
		
		if(radius) {
			var map = this.map;
			var marker = this.marker;
			
			this.setCircle(new google.maps.Circle({
				map: map,
				center : marker.getPosition(),
				radius: radius,
				strokeColor : 'red'
	  	  	}));
			
			// North, West, South, East lat, lng를 구함
			var bounds = this.circle.getBounds();
			var northWest = bounds.getNorthEast();
			var southEast = bounds.getSouthWest();
			
			this.sub('form_lat_hi').setValue(northWest.lat());
			this.sub('form_lng_hi').setValue(northWest.lng());
			this.sub('form_lat_lo').setValue(southEast.lat());
			this.sub('form_lng_lo').setValue(southEast.lng());
			
		} else {
			this.setCircle(null);
		}
	},
	
	resetMap : function() {
		this.setCircle(null);
		this.setMarker(null);
	},
	
	radiusChanged : function(radius) {
		var address = this.sub('form_address').getValue();
		
		if(address) {
			this.refreshCircle(radius);
		} else {
			this.resetMap();
		}
	},
	
	search : function() {
		this.sub('grid').store.clearFilter();

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
				type : 'string',
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
				text : T('label.lattitude'),
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
				text : T('label.lattitude_min'),
				type : 'float'
			}, {
				dataIndex : 'lng_lo',
				text : T('label.longitude_min'),
				type : 'float'					
			}, {
				dataIndex : 'lat_hi',
				text : T('label.lattitude_max'),
				type : 'float'
			}, {
				dataIndex : 'lng_hi',
				text : T('label.longitude_max'),
				type : 'float'					
			}, {
				dataIndex : 'desc',
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
			tbar : [ T('label.location'), {
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
			} ]
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
				fieldLabel : T('label.name')
			}, {
                xtype: 'fieldcontainer',
                fieldLabel: T('label.address'),
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
                        	var radius = locationView.sub('form_radius').getValue();
                        	locationView.refreshMapByAddr(address, radius);                        	
                        }
                    }
                ]
			}, {
				itemId : 'form_lattitude',
				name : 'lat',
				xtype : 'textfield',
				fieldLabel : T('label.lattitude')
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
				name : 'desc',
				fieldLabel : T('label.desc')
			}, {
				itemId : 'form_lat_lo',
				name : 'lat_lo',
				fieldLabel : T('label.lattitude_min'),
			}, {
				itemId : 'form_lng_lo',
				name : 'lng_lo',
				fieldLabel : T('label.longitude_min'),
			}, {
				itemId : 'form_lat_hi',
				name : 'lat_hi',
				fieldLabel : T('label.lattitude_max'),
			}, {
				itemId : 'form_lng_hi',
				name : 'lng_hi',
				fieldLabel : T('label.longitude_max'),
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
						main.sub('grid').store.load(callback);
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