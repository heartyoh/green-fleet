Ext.define('GreenFleet.view.management.Reservation', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_reservation',

	title : T('title.reservation'),

	entityUrl : 'reservation',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : "<div class='listTitle'>" + T('title.reservation_list') + "</div>"
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
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
			self.search(false);
		});

		this.sub('datetime_filter').on('change', function(field, value) {
			self.search(false);
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('datetime_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search(true);
		});

	},

	search : function(callback) {
		this.sub('grid').store.remoteFilter = remote;
		this.sub('grid').store.clearFilter(true);
		
		this.sub('grid').store.filter([ {
			property : 'vehicle_id',
			value : this.sub('vehicle_filter').getValue()
		}, {
			property : 'datetime',
			value : this.sub('datetime_filter').getValue()
		} ]);
		
//		this.sub('grid').store.load({
//			filters : [ {
//				property : 'vehicle_id',
//				value : this.sub('vehicle_filter').getSubmitValue()
//			}, {
//				property : 'datetime',
//				value : this.sub('datetime_filter').getSubmitValue()
//			} ],
//			callback : callback
//		});
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'ReservationStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'id',
				text : T('label.id'),
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'vehicle_id',
				text : T('label.vehicle'),
				type : 'string'
			}, {
				dataIndex : 'driver_id',
				text : T('label.driver'),
				type : 'string'
			}, {
				dataIndex : 'start_date',
				text : T('label.from_date'),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'end_date',
				text : T('label.to_date'),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'vehicle_type',
				text : T('label.x_type', {x : T('label.vehicle')}),
				type : 'string'
			}, {
				dataIndex : 'delivery_place',
				text : T('label.delivery_place'),
				type : 'string'
			}, {
				dataIndex : 'destination',
				text : T('label.destination'),
				type : 'string'
			}, {
				dataIndex : 'purpose',
				text : T('label.purpose'),
				type : 'string'
			}, {
				dataIndex : 'status',
				text : T('label.status'),
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
			tbar : [ T('label.vehicle'), {
				xtype : 'textfield',
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				hideLabel : true,
				width : 200
			}, T('label.date'), {
				xtype : 'datefield',
				name : 'datetime_filter',
				itemId : 'datetime_filter',
				hideLabel : true,
				format : 'Y-m-d',
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
			title : T('title.reservation_details'),
			autoScroll : true,
			flex : 1,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'id',
				fieldLabel : T('label.id'),
				hidden : true
			}, {
				xtype : 'datefield',
				name : 'start_date',
				fieldLabel : T('label.from_date'),
				format : F('date'),
				allowBlank : false,
				afterLabelTextTpl: required
			}, {
				xtype : 'datefield',
				name : 'end_date',
				fieldLabel : T('label.to_date'),
				format : F('date'),
				allowBlank : false,
				afterLabelTextTpl: required
			}, {
				xtype : 'codecombo',
				name : 'vehicle_type',
				group : 'V-Type1',
				fieldLabel : T('label.vehicle_type'),
				allowBlank : false,
				afterLabelTextTpl: required
//				name : 'vehicle_type',
//				fieldLabel : T('label.x_type', {x : T('label.vehicle')})
			}, {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode : 'local',
				store : 'VehicleBriefStore',
				displayField : 'id',
				valueField : 'id',
				fieldLabel : T('label.vehicle'),
				allowBlank : false,
				afterLabelTextTpl: required
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode : 'local',
				store : 'DriverBriefStore',
				displayField : 'name',
				valueField : 'id',
				fieldLabel : T('label.driver'),
				allowBlank : false,
				afterLabelTextTpl: required
			}, {
				name : 'status',
				fieldLabel : T('label.status')
			}, {
				name : 'delivery_place',
				fieldLabel : T('label.delivery_place')
			}, {
				name : 'destination',
				fieldLabel : T('label.destination')
			}, {
				name : 'purpose',
				fieldLabel : T('label.purpose')
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
//				loader : {
//					fn : main.search,
//					scope : main
//				}
				loader : {
					fn : function(callback) {
						main.sub('vehicle_filter').setValue('');
						main.sub('datetime_filter').setValue('');
						main.search(true);
					},
					scope : main
				}
			} ]
		}
	}
});