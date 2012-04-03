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
	
	refreshMapByLoc : function(locRecord) {
		
		this.setMarker(null);
		var location = locRecord ? new google.maps.LatLng(locRecord.data.lattitude, locRecord.data.longitude) : new google.maps.LatLng(System.props.lattitude, System.props.longitude);
		
		if (!location)
			return;
		
		this.getMap().setCenter(location);
		this.setMarker(new google.maps.Marker({
			position : location,
			map : this.getMap()
		}));
	},
	
	refreshMapByAddr : function(address) {
		var self = this;
		var map = this.getMap();

		// 주소로 검색
	    this.geocoder.geocode( {'address': address}, function(results, status) {
	      if (status == google.maps.GeocoderStatus.OK) {	    	  
	    	  var findLoc = results[0].geometry.location;
	    	  map.setCenter(findLoc);
	        
	    	  // 폼 위도, 경도에 추가
	    	  self.sub('form_lattitude').setValue(findLoc.Ta);
	    	  self.sub('form_longitude').setValue(findLoc.Ua);	        
	    	  // 마커 리셋
	    	  self.setMarker(null);	    	
	    	  var marker = new google.maps.Marker({
	    		  map: map,
	    		  position: results[0].geometry.location
	    	  });
	      } else {
	    	  Ext.Msg.alert("Failed to search!", "Geocode was not successful for the following reason: " + status);
	      }
	    });		
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
				dataIndex : 'address',
				text : T('label.address'),
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : T('label.lattitude'),
				type : 'float'
			}, {
				dataIndex : 'longitude',
				text : T('label.longitude'),
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
			height : 265,
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
                        xtype : 'textfield',
                        name : 'address',
                        fieldLabel : T('label.address'),
                        flex : 1
                    },
                    {
                        xtype : 'button',
                        text : T('button.search'),
                        margin : '0 0 0 5',
                        handler : function(btn, event) {
                        	var address = btn.up('fieldcontainer').down('textfield').getValue();
                        	btn.up('management_location').refreshMapByAddr(address);
                        }
                    }
                ]
			}, {
				itemId : 'form_lattitude',
				name : 'lattitude',
				xtype : 'numberfield',
				fieldLabel : T('label.lattitude'),
				minValue : 0,
				step : 0.1
			}, {
				itemId : 'form_longitude',
				name : 'longitude',
				xtype : 'numberfield',
				fieldLabel : T('label.longitude'),
				minValue : 0,
				step : 0.1				
			}, {
				name : 'desc',
				fieldLabel : T('label.desc')
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