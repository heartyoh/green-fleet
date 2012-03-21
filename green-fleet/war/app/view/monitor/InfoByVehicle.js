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
		dataIndex : 'vehicle_type',
		text : T('label.x_type', { x : T('label.vehicle') }),
		type : 'string'
	}, {
		dataIndex : 'birth_year',
		text : T('label.birth_year'),
		type : 'string'
	}, {
		dataIndex : 'ownership_type',
		text : T('label.x_type', { x : T('label.ownership') }),
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
		text : T('label.total_x', { x : T('label.distance')}),
		type : 'string'
	}, {
		dataIndex : 'remaining_fuel',
		text : T('label.remaining_fuel'),
		type : 'string'
	}, {
		dataIndex : 'lattitude',
		text : T('label.lattitude')
	}, {
		dataIndex : 'longitude',
		text : T('label.longitude')
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
	tbar : [ 'ID', {
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
	}, 'Registeration Number', {
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