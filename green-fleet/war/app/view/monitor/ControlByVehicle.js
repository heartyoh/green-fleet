Ext.define('GreenFleet.view.monitor.ControlByVehicle', {			
	extend : 'Ext.grid.Panel',

	alias : 'widget.monitor_control_by_vehicle',
	
	title : 'Control By Vehicle',
	
	store : 'ControlDataStore',
	autoScroll : true,
	
	listeners : {
	},
	
	onSearch : function(grid) {
		var vehicleFilter = grid.down('textfield[name=vehicleFilter]');
		var driverFilter = grid.down('textfield[name=driverFilter]');
		grid.store.load({
			filters : [ {
				property : 'vehicle',
				value : vehicleFilter.getValue()
			},{
				property : 'driver',
				value : driverFilter.getValue()
			} ]
		});
	},

	onReset : function(grid) {
		grid.down('textfield[name=vehicleFilter]').setValue('');
		grid.down('textfield[name=driverFilter]').setValue('');
	},
	tbar : [ {
		xtype : 'combo',
		name : 'vehicle',
		queryMode: 'local',
		store : 'VehicleStore',
		displayField: 'id',
	    valueField: 'id',
		fieldLabel : 'Vehicle',
		name : 'vehicleFilter',
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
		name : 'driver',
		queryMode: 'local',
		store : 'DriverStore',
		displayField: 'id',
	    valueField: 'id',
		fieldLabel : 'Driver',
		name : 'driverFilter',
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
		tooltip : 'Find ControlData',
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

	columns : [ {
		dataIndex : 'key',
		text : 'Key',
		hidden : true
	}, {
		dataIndex : 'vehicle',
		text : 'Vehicle',
	}, {
		dataIndex : 'driver',
		text : 'Driver',
	}, {
		dataIndex : 'date',
		text : 'Date',
		xtype:'datecolumn',
		format:'d-m-Y'
	}, {
		dataIndex : 'startTime',
		text : 'Start Time',
		xtype:'datecolumn',
		format:'d-m-Y H:i:s'
	}, {
		dataIndex : 'endTime',
		text : 'End Time',
		xtype:'datecolumn',
		format:'d-m-Y H:i:s'
	}, {
		dataIndex : 'distance',
		text : 'Distance',
	}, {
		dataIndex : 'runningTime',
		text : 'Running Time',
	}, {
		dataIndex : 'averageSpeed',
		text : 'Average Speed',
	}, {
		dataIndex : 'highestSpeed',
		text : 'Highest Speed',
	}, {
		dataIndex : 'suddenAccelCount',
		text : 'Sudden Accel Count',
	}, {
		dataIndex : 'suddenBrakeCount',
		text : 'Sudden Brake Count',
	}, {
		dataIndex : 'econoDrivingRatio',
		text : 'Econo Driving Ratio',
	}, {
		dataIndex : 'fuelEfficiency',
		text : 'Fuel Efficiency',
	}, {
		dataIndex : 'longitude',
		text : 'Longitude',
	}, {
		dataIndex : 'createdAt',
		text : 'Created At',
		xtype:'datecolumn',
		format : F('datetime'),
		width : 120
	}, {
		dataIndex : 'updatedAt',
		text : 'Updated At',
		xtype:'datecolumn',
		format : F('datetime'),
		width : 120
	} ]

});
