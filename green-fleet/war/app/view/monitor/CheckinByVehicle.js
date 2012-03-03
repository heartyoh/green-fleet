Ext.define('GreenFleet.view.monitor.CheckinByVehicle', {
	extend : 'Ext.grid.Panel',

	alias : 'widget.monitor_control_by_vehicle',

	title : 'Control By Vehicle',

	store : 'CheckinDataStore',
	autoScroll : true,

	listeners : {},

	initComponent : function() {
		this.columns = this.buildColumns();

		this.callParent();
	},

	onSearch : function(grid) {
		var vehicle_filter = grid.down('textfield[name=vehicle_filter]');
		var driver_filter = grid.down('textfield[name=driver_filter]');
		grid.store.load({
			filters : [ {
				property : 'vehicle_id',
				value : vehicle_filter.getValue()
			}, {
				property : 'driver_id',
				value : driver_filter.getValue()
			} ]
		});
	},

	onReset : function(grid) {
		grid.down('textfield[name=vehicle_filter]').setValue('');
		grid.down('textfield[name=driver_filter]').setValue('');
	},
	tbar : [ {
		xtype : 'combo',
		name : 'vehicle_filter',
		queryMode : 'local',
		store : 'VehicleBriefStore',
		displayField : 'id',
		valueField : 'id',
		fieldLabel : 'Vehicle',
		width : 200,
		listeners : {
			specialkey : function(field, e) {
				if (e.getKey() == e.ENTER) {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}
		}
	}, {
		xtype : 'combo',
		name : 'driver_filter',
		queryMode : 'local',
		store : 'DriverBriefStore',
		displayField : 'id',
		valueField : 'id',
		fieldLabel : 'Driver',
		width : 200,
		listeners : {
			specialkey : function(field, e) {
				if (e.getKey() == e.ENTER) {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}
		}
	}, {
		xtype : 'button',
		text : 'Search',
		tooltip : 'Find Checkin Data',
		handler : function() {
			var grid = this.up('gridpanel');
			grid.onSearch(grid);
		}
	}, {
		text : 'Reset',
		handler : function() {
			var grid = this.up('gridpanel');
			grid.onReset(grid);
		}
	} ],

	buildColumns : function() {
		return [ new Ext.grid.RowNumberer(), {
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
			text : 'Date',
			xtype : 'datecolumn',
			format : F('date')
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
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'engine_end_time',
			text : 'End Time',
			xtype : 'datecolumn',
			format : F('datetime'),
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
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'updated_at',
			text : 'Updated At',
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		} ]
	}

});
