Ext.define('GreenFleet.view.management.Vehicle', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle',

	title : T('title.vehicle'),

	entityUrl : 'vehicle',
	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'vehicle/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items: {
		html : "<div class='listTitle'>" + T('title.vehicle_list') + "</div>"
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

		this.sub('id_filter').on('change', function(field, value) {
			self.search(false);
		});

		this.sub('registration_number_filter').on('change', function(field, value) {
			self.search(false);
		});
		
		this.down('#search_reset').on('click', function() {
			self.sub('id_filter').setValue('');
			self.sub('registration_number_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search(true);
		});
		
		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgVehicle.png');
		})
		
	},

	search : function(searchRemote) {
		this.sub('grid').store.clearFilter(true);

		var id_filter_value = this.sub('id_filter').getValue();
		var registration_filter_value = this.sub('registration_number_filter').getValue();
		
		if(id_filter_value || registration_filter_value) {
			this.sub('grid').store.filter([ {
				property : 'id',
				value : id_filter_value
			}, {
				property : 'registration_number',
				value : registration_filter_value
			} ]);
		}
		
		if(searchRemote) {
			this.sub('grid').store.load();
		}
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'VehicleStore',
			autoScroll : true,
			flex : 1,
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
				text : T('label.x_type', {x: T('label.vehicle')}),
				type : 'string'
			}, {
				dataIndex : 'birth_year',
				text : T('label.birth_year'),
				type : 'string'
			}, {
				dataIndex : 'ownership_type',
				text : T('label.x_type', {x : T('label.ownership')}),
				type : 'string'
			}, {
				dataIndex : 'status',
				text : T('label.status'),
				type : 'string'
			}, {
				dataIndex : 'total_distance',
				text : T('label.total_x', {x : T('label.distance')}),
				type : 'string'
			}, {
				dataIndex : 'remaining_fuel',
				text : T('label.remaining_fuel'),
				type : 'string'
			}, {
				dataIndex : 'distance_since_new_oil',
				text : T('label.distance_since_new_oil'),
				type : 'string'
			}, {
				dataIndex : 'engine_oil_status',
				text : T('label.x_status', {x : T('label.engine_oil')}),
				type : 'string'
			}, {
				dataIndex : 'fuel_filter_status',
				text : T('label.x_status', {x : T('label.fuel_filter')}),
				type : 'string'
			}, {
				dataIndex : 'brake_oil_status',
				text : T('label.x_status', {x : T('label.brake_oil')}),
				type : 'string'
			}, {
				dataIndex : 'brake_pedal_status',
				text : T('label.x_status', {x : T('label.brake_pedal')}),
				type : 'string'
			}, {
				dataIndex : 'cooling_water_status',
				text : T('label.x_status', {x : T('label.cooling_water')}),
				type : 'string'
			}, {
				dataIndex : 'timing_belt_status',
				text : T('label.x_status', {x : T('label.timing_belt')}),
				type : 'string'
			}, {
				dataIndex : 'spark_plug_status',
				text : T('label.x_status', {x : T('label.spark_plug')}),
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
			tbar : [ T('label.id'), {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 133
			}, T('label.reg_no'), {
				xtype : 'textfield',
				name : 'registration_number_filter',
				itemId : 'registration_number_filter',
				hideLabel : true,
				width : 133
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
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.vehicle_details'),
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [ {
				xtype : 'form',
				itemId : 'form',
				flex : 1,
				autoScroll : true,
				defaults : {
					xtype : 'textfield',
					anchor : '100%'
				},
				items : [ {
					name : 'key',
					fieldLabel : 'Key',
					hidden : true
				}, {
					name : 'id',
					fieldLabel : T('label.id')
				}, {
					name : 'registration_number',
					fieldLabel : T('label.reg_no')
				}, {
					xtype : 'codecombo',
					name : 'manufacturer',
					group : 'V-Maker',
					fieldLabel : T('label.manufacturer')
				}, {
					xtype : 'codecombo',
					name : 'vehicle_type',
					group : 'V-Type1',
					fieldLabel : T('label.x_type', {x : T('label.vehicle')})
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : T('label.image_upload'),
					msgTarget : 'side',
					allowBlank : true,
					buttonText : T('button.file')
				}, {
					xtype : 'codecombo',
					name : 'birth_year',
					group : 'V-BirthYear',
					name : 'birth_year',
					fieldLabel : T('label.birth_year')
				}, {
					xtype : 'combo',
					name : 'ownership_type',
					queryMode : 'local',
					store : 'OwnershipStore',
					displayField : 'desc',
					valueField : 'name',
					fieldLabel : T('label.x_type', {x : T('label.ownership')})
				}, {
					xtype : 'combo',
					name : 'status',
					queryMode : 'local',
					store : 'VehicleStatusStore',
					displayField : 'desc',
					valueField : 'status',
					fieldLabel : T('label.status')
				}, {
					name : 'total_distance',
					fieldLabel : T('label.total_x', {x : T('label.distance')})
				}, {
					name : 'remaining_fuel',
					fieldLabel : T('label.remaining_fuel')
				}, {
					name : 'distance_since_new_oil',
					fieldLabel : T('label.distance_since_new_oil')
				}, {
					name : 'engine_oil_status',
					fieldLabel : T('label.x_status', {x : T('label.engine_oil')})
				}, {
					name : 'fuel_filter_status',
					fieldLabel : T('label.x_status', {x : T('label.fuel_filter')})
				}, {
					name : 'brake_oil_status',
					fieldLabel : T('label.x_status', {x : T('label.brake_oil')})
				}, {
					name : 'brake_pedal_status',
					fieldLabel : T('label.x_status', {x : T('label.brake_pedal')})
				}, {
					name : 'cooling_water_status',
					fieldLabel : T('label.x_status', {x : T('label.cooling_water')})
				}, {
					name : 'timing_belt_status',
					fieldLabel : T('label.x_status', {x : T('label.timing_belt')})
				}, {
					name : 'spark_plug_status',
					fieldLabel : T('label.x_status', {x : T('label.spark_plug')})
				}, {
					name : 'driver_id',
					fieldLabel : T('label.driver'),
					disabled : true
				}, {
					name : 'terminal_id',
					fieldLabel : T('label.terminal'),
					disabled : true
				}, {
					name : 'lattitude',
					fieldLabel : T('label.lattitude'),
					disabled : true
				}, {
					name : 'longitude',
					fieldLabel : T('label.longitude'),
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
				}, {
					xtype : 'displayfield',
					name : 'image_clip',
					itemId : 'image_clip',
					hidden : true
				} ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'vbox',
					align : 'stretch'	
				},
				cls : 'noImage paddingLeft10',
				items : [ {
					xtype : 'image',
					height : '100%',
					itemId : 'image'
				} ]
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : function(callback) {
						main.sub('grid').store.load(callback);
					},
					scope : main
				}
			} ]
		}
	}
});
