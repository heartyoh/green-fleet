Ext.define('GreenFleet.view.management.Reservation', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_reservation',

	title : 'Reservation',

	entityUrl : 'reservation',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : '<div class="listTitle">Reservation List</div>'
	},

	initComponent : function() {
		var self = this;

		this.callParent(arguments);

		this.add(this.buildList(this));
		this.add(this.buildForm(this));

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
//			grid.store.load();
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
			self.search();
		});

		this.sub('reserved_date_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('reserved_date_filter').setValue('');
		});

		this.down('#search').on('click', function() {
//			self.sub('grid').store.load();
			self.sub('grid').search();
		});

	},

	search : function(callback) {
		this.sub('grid').store.load({
			filters : [ {
				property : 'vehicle_id',
				value : self.sub('vehicle_filter').getSubmitValue()
			}, {
				property : 'reserved_date',
				value : self.sub('reserved_date_filter').getSubmitValue()
			} ],
			callback : callback
		});
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'ReservationStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'ID',
				type : 'string'
			}, {
				dataIndex : 'reserved_date',
				text : 'Reserved Date',
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'driver_id',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'vehicle_id',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'vehicle_type',
				text : 'Vehicle Type',
				type : 'string'
			}, {
				dataIndex : 'delivery_place',
				text : 'Delivery Place',
				type : 'string'
			}, {
				dataIndex : 'destination',
				text : 'Destination',
				type : 'string'
			}, {
				dataIndex : 'purpose',
				text : 'Purpose',
				type : 'string'
			}, {
				dataIndex : 'status',
				text : 'Status',
				type : 'string'
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
			} ],
			viewConfig : {

			},
			tbar : [ 'Vehicle', {
				xtype : 'textfield',
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				hideLabel : true,
				width : 200
			}, 'Date', {
				xtype : 'datefield',
				name : 'reserved_date_filter',
				itemId : 'reserved_date_filter',
				hideLabel : true,
				width : 200
			}, {
				text : 'Search',
				itemId : 'search'
			}, {
				text : 'reset',
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
			title : 'Reservation Details',
			autoScroll : true,
			flex : 1,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Reservation ID',
				disabled : true
			}, {
				xtype : 'datefield',
				name : 'reserved_date',
				fieldLabel : 'Reserved Date',
				format : F('date')
			}, {
				name : 'vehicle_type',
				fieldLabel : 'Vehicle Type'
			}, {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode : 'local',
				store : 'VehicleStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode : 'local',
				store : 'DriverStore',
				displayField : 'name',
				valueField : 'id',
				fieldLabel : 'Driver'
			}, {
				name : 'status',
				fieldLabel : 'Status'
			}, {
				name : 'delivery_place',
				fieldLabel : 'Delivery Place'
			}, {
				name : 'destination',
				fieldLabel : 'Destination'
			}, {
				name : 'purpose',
				fieldLabel : 'Purpose'
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
				format : F('datetime')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
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