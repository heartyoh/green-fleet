Ext.define('GreenFleet.view.management.VehicleTrack', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_track',

	title : T('menu.track'),

	entityUrl : 'track',

	importUrl : 'track/import',

	afterImport : function() {
		this.search();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {
		var self = this;		
		this.items = [ this.buildList(this), this.buildForm(this) ];		
		this.callParent(arguments);

		/**
		 * track list에서 하나 선택시 
		 */
		this.sub('grid').on('itemclick', function(grid, record) {
    		// lat, lng 정보로 부터 위치 정보 얻어옴 
			if(record.data.lat !== undefined && record.data.lng !== undefined) {
    			var latlng = new google.maps.LatLng(record.data.lat, record.data.lng);
    			geocoder = new google.maps.Geocoder();
    			geocoder.geocode({
    				'latLng' : latlng
    			}, function(results, status) {
    				if (status == google.maps.GeocoderStatus.OK) {
    					if (results[0]) {
    						var address = results[0].formatted_address;
    						record.data.location = address;
    						self.sub('form').loadRecord(record);
    					}
    				} else {
    					console.log("Geocoder failed due to: " + status);
    				}
        		});    			
    		}    					
		});

		/**
		 * track grid의 store load 전 
		 */
		this.down('#grid').store.on('beforeload', function(store, operation, opt) {
			var filters = self.getFilter();
			if(filters && filters.length > 0) {
				operation.params = operation.params || {};
				operation.params['filter'] = Ext.JSON.encode(filters);
			}
		});
		
		/**
		 * 초기화 버튼 선택시 
		 */
		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('driver_filter').setValue('');
			self.sub('date_filter').setValue(new Date());
		});

		/**
		 * 검색 버튼 선택시 
		 */
		this.down('#search').on('click', function() {
			self.search();
		});
	},
	
	getFilter : function() {
		
		if(!this.sub('vehicle_filter') || !this.sub('driver_filter') || !this.sub('date_filter'))
			return null;
		
		if(!this.sub('vehicle_filter').getSubmitValue() && !this.sub('driver_filter').getSubmitValue() && !this.sub('date_filter').getSubmitValue())
			return null;
		
		var filters = [];
		
		if(this.sub('vehicle_filter').getSubmitValue()) {
			filters.push({"property" : "vehicle_id", "value" : this.sub('vehicle_filter').getSubmitValue()});
		}
		
		if(this.sub('date_filter').getSubmitValue()) {
			filters.push({"property" : "date", "value" : this.sub('date_filter').getSubmitValue()});
		}
				
		if(this.sub('driver_filter').getSubmitValue()) {
			filters.push({"property" : "driver_id", "value" : this.sub('driver_filter').getSubmitValue()});
		}		
		
		return filters;
	},	

	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		this.sub('vehicle_filter').setValue(this.vehicle);
		this.search();
	},
	
	search : function() {
		this.sub('pagingtoolbar').moveFirst();
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'TrackStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'datetime',
				text : T('label.datetime'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'vehicle_id',
				text : T('label.vehicle'),
				type : 'string'
			}, {
				dataIndex : 'terminal_id',
				text : T('label.terminal'),
				type : 'string'
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver'),
				type : 'string'
			}, {
				dataIndex : 'velocity',
				text : T('label.velocity'),
				type : 'number'
			}, {
				dataIndex : 'lat',
				text : T('label.latitude'),
				type : 'number'
			}, {
				dataIndex : 'lng',
				text : T('label.longitude'),
				type : 'number'
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ {
				xtype : 'combo',
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				queryMode : 'local',
				store : 'VehicleBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.vehicle'),
				width : 200
			}, {
				xtype : 'combo',
				name : 'driver_filter',
				itemId : 'driver_filter',
				queryMode : 'local',
				store : 'DriverBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.driver'),
				width : 200
			}, {
				xtype : 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : T('label.date'),
				format : 'Y-m-d',
				submitFormat : 'U',
				maxValue : new Date(),
				value : new Date(),
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
	            store: 'TrackStore',
	            displayInfo: true,
	            cls : 'pagingtoolbar',
	            displayMsg: 'Displaying tracks {0} - {1} of {2}',
	            emptyMsg: "No tracks to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.tracking_details'),
			autoScroll : true,
			flex : 1,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Key',
				hidden : true
			}, {
				xtype : 'combo',
				name : 'terminal_id',
				queryMode : 'local',
				store : 'TerminalStore',
				displayField : T('label.id'),
				valueField : 'id',
				fieldLabel : T('label.terminal')
			}, {
				name : 'vehicle_id',
				fieldLabel : T('label.vehicle')
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode : 'local',
				store : 'DriverBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.driver')
			}, {
				xtype : 'datefield',
				name : 'datetime',
				fieldLabel : T('label.datetime'),
				format : F('datetime')
			}, {
				name : 'velocity',
				fieldLabel : T('label.velocity')
			}, {
				name : 'lat',
				fieldLabel : T('label.latitude')
			}, {
				name : 'lng',
				fieldLabel : T('label.longitude')
			}, {
				name : 'location',
				fieldLabel : T('label.location'),
				disabled : true
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
					fn : main.search,
					scope : main
				}
			} ]
		}
	}
});