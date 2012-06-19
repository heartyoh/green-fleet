Ext.define('GreenFleet.view.monitor.InfoByVehicle', {
	extend : 'Ext.grid.Panel',
	
	alias : 'widget.monitor_info_by_vehicle',
	
	title : T('tab.info_by_vehicle'),

	store : 'VehicleInfoStore',

	autoScroll : true,

	columns : [ new Ext.grid.RowNumberer(), {
		dataIndex : 'key',
		text : 'Key',
		type : 'string',
		hidden : true
	}, {
		dataIndex : 'id',
		text : T('label.id'),
		type : 'string'
	}, {
		dataIndex : 'registration_number',
		text : T('label.reg_no'),
		type : 'string'
	}, {
		dataIndex : 'manufacturer',
		text : T('label.manufacturer'),
		type : 'string'
	}, {
		dataIndex : 'vehicle_model',
		text : T('label.vehicle_model'),
		type : 'string'
	}, /*{
		dataIndex : 'vehicle_type',
		text : T('label.vehicle_type'),
		type : 'string'
	}, {
		dataIndex : 'ownership_type',
		text : T('label.ownership_type'),
		type : 'string'
	},*/ {
		dataIndex : 'birth_year',
		text : T('label.birth_year'),
		type : 'string'		
	}, {
		dataIndex : 'status',
		text : T('label.status'),
		type : 'string'
	}, {
		dataIndex : 'health_status',
		text : T('label.health'),
		type : 'string'
	}, {
		dataIndex : 'total_distance',
		text : T('label.total_distance'),
		type : 'string'
	}, {
		dataIndex : 'official_effcc',
		text : T('label.official_effcc'),
		type : 'float'
	}, {
		dataIndex : 'avg_effcc',
		text : T('label.avg_effcc'),
		type : 'float'
	}, {
		dataIndex : 'eco_index',
		text : T('label.eco_index') + '(%)',
		type : 'int'			
	}, {
		dataIndex : 'remaining_fuel',
		text : T('label.remaining_fuel'),
		type : 'string'
	}, {
		dataIndex : 'lat',
		text : T('label.latitude')
	}, {
		dataIndex : 'lng',
		text : T('label.longitude')
	} ],
	viewConfig : {

	},
	listeners : {
		render : function(grid) {
			grid.store.load();
		},
		itemclick : function(grid, record) {
			var form = grid.up('monitor_information').down('form');
			form.loadRecord(record);
		}
	},
	onSearch : function(grid) {
		var id_filter = grid.down('textfield[name=id_filter]');
		var namefilter = grid.down('textfield[name=registration_number_field]');
		grid.store.clearFilter();

		grid.store.filter([ {
			property : 'id',
			value : id_filter.getValue()
		}, {
			property : 'registration_number',
			value : namefilter.getValue()
		} ]);
	},
	onReset : function(grid) {
		grid.down('textfield[name=id_filter]').setValue('');
		grid.down('textfield[name=registration_number_field]').setValue('');
	},
	tbar : [ T('label.id'), {
		xtype : 'textfield',
		name : 'id_filter',
		hideLabel : true,
		width : 200,
		listeners : {
			specialkey : function(field, e) {
				if (e.getKey() == e.ENTER) {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}
		}
	}, T('label.reg_no'), {
		xtype : 'textfield',
		name : 'registration_number_field',
		hideLabel : true,
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
		tooltip : 'Find Vehicle',
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
	} ]

});