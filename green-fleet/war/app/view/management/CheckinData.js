Ext.define('GreenFleet.view.management.CheckinData', {
	
	// deprecated
	extend : 'Ext.container.Container',

	alias : 'widget.management_checkin_data',

	entityUrl : 'checkin_data',
	
	title : T('menu.checkin_data'),
	
	importUrl : 'checkin_data/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},	

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	items: {
		html : "<div class='listTitle'>" + T('title.checkin_data_list') + "</div>"
	},
	
	initComponent : function() {
		var self = this;

		this.callParent();

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('driver_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search();
		});
		
		this.down('#grid').store.on('beforeload', function(store, operation, opt) {
			var filters = self.getFilter();
			if(filters && filters.length > 0) {
				operation.params = operation.params || {};
				operation.params['filter'] = Ext.JSON.encode(filters);
			}			
		});		
		
	},
	
	getFilter : function() {
		
		if(!this.sub('vehicle_filter').getSubmitValue() && 
		   !this.sub('driver_filter').getSubmitValue() &&
		   !this.sub('date_filter').getSubmitValue()) {
			return null;
		}
		
		var filters = [];
		
		if(this.sub('date_filter').getSubmitValue()) {
			filters.push({"property" : "date", "value" : this.sub('date_filter').getSubmitValue()});
		}
		
		if(this.sub('vehicle_filter').getSubmitValue()) {
			filters.push({"property" : "vehicle_id", "value" : this.sub('vehicle_filter').getSubmitValue()});
		}
		
		if(this.sub('driver_filter').getSubmitValue()) {
			filters.push({"property" : "driver_id", "value" : this.sub('driver_filter').getSubmitValue()});
		}		
		
		return filters;
	},

	search : function(callback) {
		this.sub('pagingtoolbar').moveFirst({callback : callback});
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'CheckinDataStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'terminal_id',
				text : T('label.terminal')
			}, {
				dataIndex : 'vehicle_id',
				text : T('label.vehicle')
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver')
			}, {
				dataIndex : 'datetime',
				text : T('label.datetime'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'distance',
				text : T('label.x_distance', {x : T('label.running')})
			}, {
				dataIndex : 'running_time',
				text : T('label.x_time', {x : T('label.running')})
			}, {
				dataIndex : 'less_than_10km',
				text : T('label.lessthan_km', {km : 10})
			}, {
				dataIndex : 'less_than_20km',
				text : T('label.lessthan_km', {km : 20})
			}, {
				dataIndex : 'less_than_30km',
				text : T('label.lessthan_km', {km : 30})
			}, {
				dataIndex : 'less_than_40km',
				text : T('label.lessthan_km', {km : 40})
			}, {
				dataIndex : 'less_than_50km',
				text : T('label.lessthan_km', {km : 50})
			}, {
				dataIndex : 'less_than_60km',
				text : T('label.lessthan_km', {km : 60})
			}, {
				dataIndex : 'less_than_70km',
				text : T('label.lessthan_km', {km : 70})
			}, {
				dataIndex : 'less_than_80km',
				text : T('label.lessthan_km', {km : 80})
			}, {
				dataIndex : 'less_than_90km',
				text : T('label.lessthan_km', {km : 90})
			}, {
				dataIndex : 'less_than_100km',
				text : T('label.lessthan_km', {km : 100})
			}, {
				dataIndex : 'less_than_110km',
				text : T('label.lessthan_km', {km : 110})
			}, {
				dataIndex : 'less_than_120km',
				text : T('label.lessthan_km', {km : 120})
			}, {
				dataIndex : 'less_than_130km',
				text : T('label.lessthan_km', {km : 130})
			}, {
				dataIndex : 'less_than_140km',
				text : T('label.lessthan_km', {km : 140})
			}, {
				dataIndex : 'less_than_150km',
				text : T('label.lessthan_km', {km : 150})
			}, {
				dataIndex : 'less_than_160km',
				text : T('label.lessthan_km', {km : 160})
			}, {
				dataIndex : 'engine_start_time',
				text : T('label.x_time', {x : T('label.start')}),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'engine_end_time',
				text : T('label.x_time', {x : T('label.end')}),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'average_speed',
				text : T('label.average_speed')
			}, {
				dataIndex : 'max_speed',
				text : T('label.highest_speed')
			}, {
				dataIndex : 'fuel_consumption',
				text : T('label.fuel_consumption')
			}, {
				dataIndex : 'fuel_efficiency',
				text : T('label.fuel_efficiency')
			}, {
				dataIndex : 'sudden_accel_count',
				text : T('label.x_count', {x : T('label.sudden_accel')})
			}, {
				dataIndex : 'sudden_brake_count',
				text : T('label.x_count', {x : T('label.sudden_brake')})
			}, {
				dataIndex : 'idle_time',
				text : T('label.x_time', {x : T('label.idling')})
			}, {
				dataIndex : 'eco_driving_time',
				text : T('label.x_time', {x : T('label.eco_driving')})
			}, {
				dataIndex : 'over_speed_time',
				text : T('label.x_time', {x : T('label.over_speeding')})
			}, {
				dataIndex : 'co2_emissions',
				text : T('label.co2_emissions')
			}, {
				dataIndex : 'max_cooling_water_temp',
				text : T('label.max_cooling_water_temp')
			}, {
				dataIndex : 'avg_battery_volt',
				text :  T('label.average_battery_voltage')
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode: 'local',
				store : 'VehicleBriefStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.vehicle'),
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				width : 200
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode: 'local',
				store : 'DriverBriefStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.driver'),
				name : 'driver_filter',
				itemId : 'driver_filter',
				width : 200
			}, {
		        xtype: 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : T('label.date'),
				format: 'Y-m-d',
				submitFormat : 'U',
		        maxValue: new Date(),
		        value : new Date(),
				width : 200
			}, {
				itemId : 'search',
				text : T('button.search')
			}, {
				text : T('button.reset'),
				itemId : 'search_reset'
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'CheckinDataStore',
	            displayInfo: true,
	            cls : 'pagingtoolbar',
	            displayMsg: 'Displaying checkin data {0} - {1} of {2}',
	            emptyMsg: "No checkin data to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.checkin_data_details'),
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
				name : 'vehicle_id',
				queryMode: 'local',
				store : 'VehicleBriefStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.vehicle')
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode: 'local',
				store : 'DriverBriefStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.driver')
			}, {
				xtype : 'combo',
				name : 'terminal_id',
				queryMode: 'local',
				store : 'TerminalStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : T('label.terminal')
			}, {
				xtype : 'datefield',
				name : 'datetime',
				fieldLabel : T('label.datetime'),
				format: F('datetime')
			}, {
				name : 'distance',
				fieldLabel : T('label.x_distance', {x : T('label.running')})
			}, {
				name : 'running_time',
				fieldLabel : T('label.x_time', {x : T('label.running')})
			}, {
				name : 'less_than_10km',
				fieldLabel : T('label.lessthan_km', {km : 10})
			}, {
				name : 'less_than_20km',
				fieldLabel : T('label.lessthan_km', {km : 20})
			}, {
				name : 'less_than_30km',
				fieldLabel : T('label.lessthan_km', {km : 30})
			}, {
				name : 'less_than_40km',
				fieldLabel : T('label.lessthan_km', {km : 40})
			}, {
				name : 'less_than_50km',
				fieldLabel : T('label.lessthan_km', {km : 50})
			}, {
				name : 'less_than_60km',
				fieldLabel : T('label.lessthan_km', {km : 60})
			}, {
				name : 'less_than_70km',
				fieldLabel : T('label.lessthan_km', {km : 70})
			}, {
				name : 'less_than_80km',
				fieldLabel : T('label.lessthan_km', {km : 80})
			}, {
				name : 'less_than_90km',
				fieldLabel : T('label.lessthan_km', {km : 90})
			}, {
				name : 'less_than_100km',
				fieldLabel : T('label.lessthan_km', {km : 100})
			}, {
				name : 'less_than_110km',
				fieldLabel : T('label.lessthan_km', {km : 110})
			}, {
				name : 'less_than_120km',
				fieldLabel : T('label.lessthan_km', {km : 120})
			}, {
				name : 'less_than_130km',
				fieldLabel : T('label.lessthan_km', {km : 130})
			}, {
				name : 'less_than_140km',
				fieldLabel : T('label.lessthan_km', {km : 140})
			}, {
				name : 'less_than_150km',
				fieldLabel : T('label.lessthan_km', {km : 150})
			}, {
				name : 'less_than_160km',
				fieldLabel : T('label.lessthan_km', {km : 160})
			}, {
				xtype : 'datefield',
				name : 'engine_start_time',
				fieldLabel : T('label.x_time', {x : T('label.start')}),
				format: F('datetime')
			}, {
				xtype : 'datefield',
				name : 'engine_end_time',
				fieldLabel : T('label.x_time', {x : T('label.end')}),
				format: F('datetime')
			}, {
				name : 'average_speed',
				fieldLabel : T('label.average_speed')
			}, {
				name : 'max_speed',
				fieldLabel : T('label.highest_speed')
			}, {
				name : 'fuel_consumption',
				fieldLabel : T('label.fuel_consumption')
			}, {
				name : 'fuel_efficiency',
				fieldLabel : T('label.fuel_efficiency')
			}, {
				name : 'sudden_accel_count',
				fieldLabel : T('label.x_count', {x : T('label.sudden_accel')})
			}, {
				name : 'sudden_brake_count',
				fieldLabel : T('label.x_count', {x : T('label.sudden_brake')})
			}, {
				name : 'idle_time',
				fieldLabel : T('label.x_time', {x : T('label.idling')})
			}, {
				name : 'eco_driving_time',
				fieldLabel : T('label.x_time', {x : T('label.eco_driving')})
			}, {
				name : 'over_speed_time',
				fieldLabel : T('label.x_time', {x : T('label.over_speeding')})
			}, {
				name : 'co2_emissions',
				fieldLabel : T('label.co2_emissions')
			}, {
				name : 'max_cooling_water_temp',
				fieldLabel : T('label.max_cooling_water_temp')
			}, {
				name : 'avg_battery_volt',
				fieldLabel : T('label.average_battery_voltage')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : T('label.created_at'),
				format: F('datetime')
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : T('label.updated_at'),
				format: F('datetime')
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