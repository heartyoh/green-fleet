Ext.define('GreenFleet.view.monitor.CheckinByVehicle', {
	extend : 'Ext.grid.Panel',

	alias : 'widget.monitor_control_by_vehicle',

	title : T('tab.ctrl_by_vehicle'),

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
		fieldLabel : T('label.vehicle'),
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
		fieldLabel : T('label.driver'),
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
		text : T('button.search'),
		tooltip : 'Find Checkin Data',
		handler : function() {
			var grid = this.up('gridpanel');
			grid.onSearch(grid);
		}
	}, {
		text : T('button.reset'),
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
			text : T('label.terminal')
		}, {
			dataIndex : 'vehicle_id',
			text : T('label.vehicle')
		}, {
			dataIndex : 'driver_id',
			text : T('label.driver')
		}, {
			dataIndex : 'datetime',
			text : T('label.date'),
			xtype : 'datecolumn',
			format : F('date')
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
			xtype : 'datecolumn',
			format : F('datetime'),
			width : 120
		}, {
			dataIndex : 'engine_end_time',
			text : T('label.x_time', {x : T('label.end')}),
			xtype : 'datecolumn',
			format : F('datetime'),
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
			text : T('label.x_count', {x : T('label.sudden_accel')}),
		}, {
			dataIndex : 'sudden_brake_count',
			text : T('label.x_count', {x : T('label.sudden_brake')}),
		}, {
			dataIndex : 'idle_time',
			text : T('label.x_time', {x : T('label.idling')}),
		}, {
			dataIndex : 'eco_driving_time',
			text : T('label.x_time', {x : T('label.eco_driving')}),
		}, {
			dataIndex : 'over_speed_time',
			text : T('label.x_time', {x : T('label.over_speeding')}),
		}, {
			dataIndex : 'co2_emissions',
			text : T('label.co2_emissions')
		}, {
			dataIndex : 'max_cooling_water_temp',
			text : T('label.max_cooling_water_temp')
		}, {
			dataIndex : 'avg_battery_volt',
			text : T('label.average_battery_voltage')
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
		} ]
	}

});
