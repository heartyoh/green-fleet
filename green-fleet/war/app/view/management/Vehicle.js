Ext.define('GreenFleet.view.management.Vehicle', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle',

	title : T('title.vehicle'),

	entityUrl : 'vehicle',
	
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
			var store = self.sub('edit_consumables_grid').store; 
			store.getProxy().extraParams.vehicle_id = record.get('id');
			store.load();
		});

		this.sub('grid').on('render', function(grid) {
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
		});
		
	},

	search : function(searchRemote) {
		
		var id_filter_value = this.sub('id_filter').getValue();
		var registration_filter_value = this.sub('registration_number_filter').getValue();
		this.sub('grid').store.clearFilter(true);
		
		this.sub('grid').store.filter([ {
			property : 'id',
			value : id_filter_value
		}, {
			property : 'registration_number',
			value : registration_filter_value
		} ]);
		
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
				dataIndex : 'vehicle_model',
				text : T('label.vehicle_model'),
				type : 'string'
			}, {
				dataIndex : 'fuel_type',
				text : T('label.fuel_type'),
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
				dataIndex : 'health_status',
				text : T('label.health'),
				type : 'string'
			}, {
				xtype: 'numbercolumn',
				dataIndex : 'total_distance',
				text : T('label.total_x', {x : T('label.distance')}) + '(km)',
				type : 'string'
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
			items : [
			    {
			    	xtype : 'form',
			    	itemId : 'form',
			    	flex : 3.5,
			    	autoScroll : true,
			    	defaults : {
			    		xtype : 'textfield',
			    		anchor : '100%'
			    	},
			    	items : [ 
			    	    {
			    	    	xtype : 'image',
			    	    	anchor : '25%',
			    	    	height : '150',
			    	    	itemId : 'image',
			    	    	cls : 'paddingBottom10'
			    	    },			    	         
				    	{
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
							name : 'vehicle_model',
							fieldLabel : T('label.vehicle_model')
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
							xtype : 'codecombo',
							name : 'fuel_type',
							group : 'V-Fuel',
							fieldLabel : T('label.fuel_type')
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
							name : 'health_status',
							fieldLabel : T('label.health')							
						}, {
							name : 'total_distance',
							fieldLabel : T('label.total_x', {x : T('label.distance')})
						}, {
							name : 'remaining_fuel',
							fieldLabel : T('label.remaining_fuel')
						}, {
							xtype : 'combo',
							name : 'driver_id',
							queryMode : 'local',
							store : 'DriverBriefStore',
							displayField : 'id',
							valueField : 'id',
							fieldLabel : T('label.driver')
						}, {
							name : 'terminal_id',
							fieldLabel : T('label.terminal'),
							disabled : true
						}, {
							name : 'lat',
							fieldLabel : T('label.latitude'),
							disabled : true
						}, {
							name : 'lng',
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
						} 
					]
				}, {
					xtype : 'management_vehicle_consumable_grid',
					itemId : 'editable_grid',
					flex : 6.5,
					cls : 'paddingLeft10'
				}
			],
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
