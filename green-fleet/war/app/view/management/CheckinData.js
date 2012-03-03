Ext.define('GreenFleet.view.management.CheckinData', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_checkin_data',

	entityUrl : 'checkin_data',
	
	title : 'CheckinData',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	items: {
		html : '<div class="listTitle">CheckinData List</div>'
	},
	
	initComponent : function() {
		var self = this;

		this.callParent();

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
//			grid.store.load();
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
//			self.search();
		});

		this.sub('driver_filter').on('change', function(field, value) {
//			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('driver_filter').setValue('');
		});

		this.down('#search').on('click', function() {
//			self.sub('grid').store.load();
			self.sub('grid').search();
		});
		
	},

	search : function(callback) {
//		self.sub('grid').store.clearFilter();
//
//		self.sub('grid').store.filter([ {
//			property : 'vehicle_filter',
//			value : self.sub('vehicle_filter').getValue()
//		}, {
//			property : 'driver_filter',
//			value : self.sub('driver_filter').getValue()
//		} ]);
		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle_id',
				value : this.sub('vehicle_filter').getValue()
			}, {
				property : 'driver_id',
				value : this.sub('driver_filter').getValue()
			}, {
				property : 'date',
				value : this.sub('date_filter').getSubmitValue()
			} ],
			callback : callback
		})
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
				text : 'Terminal'
			}, {
				dataIndex : 'vehicle_id',
				text : 'Vehicle'
			}, {
				dataIndex : 'driver_id',
				text : 'Driver'
			}, {
				dataIndex : 'datetime',
				text : 'Date/Time',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'distance',
				text : 'Distance'
			}, {
				dataIndex : 'running_time',
				text : 'Running Time'
			}, {
				dataIndex : 'less_than_10km',
				text : 'Less Than 10Km'
			}, {
				dataIndex : 'less_than_20km',
				text : 'Less Than 20Km'
			}, {
				dataIndex : 'less_than_30km',
				text : 'Less Than 30Km'
			}, {
				dataIndex : 'less_than_40km',
				text : 'Less Than 40Km'
			}, {
				dataIndex : 'less_than_50km',
				text : 'Less Than 50Km'
			}, {
				dataIndex : 'less_than_60km',
				text : 'Less Than 60Km'
			}, {
				dataIndex : 'less_than_70km',
				text : 'Less Than 70Km'
			}, {
				dataIndex : 'less_than_80km',
				text : 'Less Than 80Km'
			}, {
				dataIndex : 'less_than_90km',
				text : 'Less Than 90Km'
			}, {
				dataIndex : 'less_than_100km',
				text : 'Less Than 100Km'
			}, {
				dataIndex : 'less_than_110km',
				text : 'Less Than 110Km'
			}, {
				dataIndex : 'less_than_120km',
				text : 'Less Than 120Km'
			}, {
				dataIndex : 'less_than_130km',
				text : 'Less Than 130Km'
			}, {
				dataIndex : 'less_than_140km',
				text : 'Less Than 140Km'
			}, {
				dataIndex : 'less_than_150km',
				text : 'Less Than 150Km'
			}, {
				dataIndex : 'less_than_160km',
				text : 'Less Than 160Km'
			}, {
				dataIndex : 'engine_start_time',
				text : 'Start Time',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'engine_end_time',
				text : 'End Time',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'average_speed',
				text : 'Average Speed'
			}, {
				dataIndex : 'max_speed',
				text : 'Highest Speed'
			}, {
				dataIndex : 'fuel_consumption',
				text : 'Fuel Consumption'
			}, {
				dataIndex : 'fuel_efficiency',
				text : 'Fuel Efficiency'
			}, {
				dataIndex : 'sudden_accel_count',
				text : 'Sudden Accel Count'
			}, {
				dataIndex : 'sudden_brake_count',
				text : 'Sudden Brake Count'
			}, {
				dataIndex : 'idle_time',
				text : 'Idling Time'
			}, {
				dataIndex : 'eco_driving_time',
				text : 'Econo Driving Time'
			}, {
				dataIndex : 'over_speed_time',
				text : 'Over Speeding Time'
			}, {
				dataIndex : 'co2_emissions',
				text : 'CO2 Emissions'
			}, {
				dataIndex : 'max_cooling_water_temp',
				text : 'Max Cooling Water Temp'
			}, {
				dataIndex : 'avg_battery_volt',
				text : 'Average Battery Voltage'
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
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
				fieldLabel : 'Vehicle',
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
				fieldLabel : 'Driver',
				name : 'driver_filter',
				itemId : 'driver_filter',
				width : 200
			}, {
		        xtype: 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : 'Date',
				format: 'Y-m-d',
				submitFormat : 'U',
		        maxValue: new Date(),  // limited to the current date or prior
		        value : new Date(),
				width : 200
			}, {
				itemId : 'search',
				text : 'Search'
			}, {
				text : 'Reset',
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
			title : 'CheckinData Details',
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
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode: 'local',
				store : 'DriverBriefStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Driver'
			}, {
				xtype : 'combo',
				name : 'terminal_id',
				queryMode: 'local',
				store : 'TerminalStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Terminal'
			}, {
				xtype : 'datefield',
				name : 'datetime',
				fieldLabel : 'Date/Time',
				format: F('datetime')
			}, {
				name : 'distance',
				fieldLabel : 'Distance'
			}, {
				name : 'running_time',
				fieldLabel : 'Running Time'
			}, {
				name : 'less_than_10km',
				fieldLabel : 'Less Than 10Km'
			}, {
				name : 'less_than_20km',
				fieldLabel : 'Less Than 20Km'
			}, {
				name : 'less_than_30km',
				fieldLabel : 'Less Than 30Km'
			}, {
				name : 'less_than_40km',
				fieldLabel : 'Less Than 40Km'
			}, {
				name : 'less_than_50km',
				fieldLabel : 'Less Than 50Km'
			}, {
				name : 'less_than_60km',
				fieldLabel : 'Less Than 60Km'
			}, {
				name : 'less_than_70km',
				fieldLabel : 'Less Than 70Km'
			}, {
				name : 'less_than_80km',
				fieldLabel : 'Less Than 80Km'
			}, {
				name : 'less_than_90km',
				fieldLabel : 'Less Than 90Km'
			}, {
				name : 'less_than_100km',
				fieldLabel : 'Less Than 100Km'
			}, {
				name : 'less_than_110km',
				fieldLabel : 'Less Than 110Km'
			}, {
				name : 'less_than_120km',
				fieldLabel : 'Less Than 120Km'
			}, {
				name : 'less_than_130km',
				fieldLabel : 'Less Than 130Km'
			}, {
				name : 'less_than_140km',
				fieldLabel : 'Less Than 140Km'
			}, {
				name : 'less_than_150km',
				fieldLabel : 'Less Than 150Km'
			}, {
				name : 'less_than_160km',
				fieldLabel : 'Less Than 160Km'
			}, {
				xtype : 'datefield',
				name : 'engine_start_time',
				fieldLabel : 'Start Time',
				format: F('datetime')
			}, {
				xtype : 'datefield',
				name : 'engine_end_time',
				fieldLabel : 'End Time',
				format: F('datetime')
			}, {
				name : 'average_speed',
				fieldLabel : 'Average Speed'
			}, {
				name : 'max_speed',
				fieldLabel : 'Highest Speed'
			}, {
				name : 'fuel_consumption',
				fieldLabel : 'Fuel Consumption'
			}, {
				name : 'fuel_efficiency',
				fieldLabel : 'Fuel Efficiency'
			}, {
				name : 'sudden_accel_count',
				fieldLabel : 'Sudden Accel Count'
			}, {
				name : 'sudden_brake_count',
				fieldLabel : 'Sudden Brake Count'
			}, {
				name : 'idle_time',
				fieldLabel : 'Idling Time'
			}, {
				name : 'eco_driving_time',
				fieldLabel : 'Eco-Driving Time'
			}, {
				name : 'over_speed_time',
				fieldLabel : 'Over Speeding Time'
			}, {
				name : 'co2_emissions',
				fieldLabel : 'CO2 Emissions'
			}, {
				name : 'max_cooling_water_temp',
				fieldLabel : 'Max Cooling Water Temp.'
			}, {
				name : 'avg_battery_volt',
				fieldLabel : 'Average Bettery Voltage'
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
				format: F('datetime')
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
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