Ext.define('GreenFleet.view.management.Vehicle', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle',

	title : 'Vehicle',

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
		html : '<div class="listTitle">Vehicle List</div>'
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
				text : 'Vehicle Id',
				type : 'string'
			}, {
				dataIndex : 'registration_number',
				text : 'RegistrationNumber',
				type : 'string'
			}, {
				dataIndex : 'manufacturer',
				text : 'Manufacturer',
				type : 'string'
			}, {
				dataIndex : 'vehicle_type',
				text : 'VehicleType',
				type : 'string'
			}, {
				dataIndex : 'birth_year',
				text : 'BirthYear',
				type : 'string'
			}, {
				dataIndex : 'ownership_type',
				text : 'OwnershipType',
				type : 'string'
			}, {
				dataIndex : 'status',
				text : 'Status',
				type : 'string'
			}, {
				dataIndex : 'total_distance',
				text : 'TotalDistance',
				type : 'string'
			}, {
				dataIndex : 'remaining_fuel',
				text : 'RemainingFuel',
				type : 'string'
			}, {
				dataIndex : 'distance_since_new_oil',
				text : 'DistanceSinceNewOil',
				type : 'string'
			}, {
				dataIndex : 'engine_oil_status',
				text : 'EngineOilStatus',
				type : 'string'
			}, {
				dataIndex : 'fuel_filter_status',
				text : 'FuelFilterStatus',
				type : 'string'
			}, {
				dataIndex : 'brake_oil_status',
				text : 'BrakeOilStatus',
				type : 'string'
			}, {
				dataIndex : 'brake_pedal_status',
				text : 'BrakePedalStatus',
				type : 'string'
			}, {
				dataIndex : 'cooling_water_status',
				text : 'CoolingWaterStatus',
				type : 'string'
			}, {
				dataIndex : 'timing_belt_status',
				text : 'TimingBeltStatus',
				type : 'string'
			}, {
				dataIndex : 'spark_plug_status',
				text : 'SparkPlugStatus',
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude'
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
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 133
			}, 'Registeration Number', {
				xtype : 'textfield',
				name : 'registration_number_filter',
				itemId : 'registration_number_filter',
				hideLabel : true,
				width : 133
			}, {
				text : 'Search',
				itemId : 'search'
			}, {
				text : 'Reset',
				itemId : 'search_reset'
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Vehicle Details',
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
					fieldLabel : 'Vehicle Id'
				}, {
					name : 'registration_number',
					fieldLabel : 'Registration Number'
				}, {
					xtype : 'codecombo',
					name : 'manufacturer',
					group : 'V-Maker',
					fieldLabel : 'Manufacturer'
				}, {
					xtype : 'codecombo',
					name : 'vehicle_type',
					group : 'V-Type1',
					fieldLabel : 'Vehicle Type'
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : 'Image Upload',
					msgTarget : 'side',
					allowBlank : true,
					buttonText : 'file...'
				}, {
					xtype : 'codecombo',
					name : 'birth_year',
					group : 'V-BirthYear',
					name : 'birth_year',
					fieldLabel : 'BirthYear'
				}, {
					xtype : 'combo',
					name : 'ownership_type',
					queryMode : 'local',
					store : 'OwnershipStore',
					displayField : 'desc',
					valueField : 'name',
					fieldLabel : 'Ownership Type'
				}, {
					xtype : 'combo',
					name : 'status',
					queryMode : 'local',
					store : 'VehicleStatusStore',
					displayField : 'desc',
					valueField : 'status',
					fieldLabel : 'Status'
				}, {
					name : 'total_distance',
					fieldLabel : 'Total Distance'
				}, {
					name : 'remaining_fuel',
					fieldLabel : 'Remaining Fuel'
				}, {
					name : 'distance_since_new_oil',
					fieldLabel : 'Distance Since NewOil'
				}, {
					name : 'engine_oil_status',
					fieldLabel : 'EngineOil Status'
				}, {
					name : 'fuel_filter_status',
					fieldLabel : 'FuelFilter Status'
				}, {
					name : 'brake_oil_status',
					fieldLabel : 'BrakeOil Status'
				}, {
					name : 'brake_pedal_status',
					fieldLabel : 'BrakePedal Status'
				}, {
					name : 'cooling_water_status',
					fieldLabel : 'CoolingWater Status'
				}, {
					name : 'timing_belt_status',
					fieldLabel : 'TimingBeltStatus'
				}, {
					name : 'spark_plug_status',
					fieldLabel : 'SparkPlugStatus'
				}, {
					name : 'driver_id',
					fieldLabel : 'Driver',
					disabled : true
				}, {
					name : 'terminal_id',
					fieldLabel : 'Terminal',
					disabled : true
				}, {
					name : 'lattitude',
					fieldLabel : 'Lattitude',
					disabled : true
				}, {
					name : 'longitude',
					fieldLabel : 'Longitude',
					disabled : true
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
