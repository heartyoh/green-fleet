Ext.define('GreenFleet.view.management.Vehicle', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle',

	title : 'Vehicle',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		this.callParent(arguments);

		this.list = this.add(this.buildList(this));
		var detail = this.add(this.buildForm(this));
		this.form = detail.down('form'); 
	},

	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'vehicle/import',
	
	afterImport : function() {
		this.down('gridpanel').store.load();
		this.form.getForm().reset();
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			title : 'Vehicle List',
			store : 'VehicleStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'Vehicle Id',
				type : 'string'
			}, {
				dataIndex : 'registrationNumber',
				text : 'RegistrationNumber',
				type : 'string'
			}, {
				dataIndex : 'manufacturer',
				text : 'Manufacturer',
				type : 'string'
			}, {
				dataIndex : 'vehicleType',
				text : 'VehicleType',
				type : 'string'
			}, {
				dataIndex : 'birthYear',
				text : 'BirthYear',
				type : 'string'
			}, {
				dataIndex : 'ownershipType',
				text : 'OwnershipType',
				type : 'string'
			}, {
				dataIndex : 'status',
				text : 'Status',
				type : 'string'
			}, {
				dataIndex : 'totalDistance',
				text : 'TotalDistance',
				type : 'string'
			}, {
				dataIndex : 'remainingFuel',
				text : 'RemainingFuel',
				type : 'string'
			}, {
				dataIndex : 'distanceSinceNewOil',
				text : 'DistanceSinceNewOil',
				type : 'string'
			}, {
				dataIndex : 'engineOilStatus',
				text : 'EngineOilStatus',
				type : 'string'
			}, {
				dataIndex : 'fuelFilterStatus',
				text : 'FuelFilterStatus',
				type : 'string'
			}, {
				dataIndex : 'brakeOilStatus',
				text : 'BrakeOilStatus',
				type : 'string'
			}, {
				dataIndex : 'brakePedalStatus',
				text : 'BrakePedalStatus',
				type : 'string'
			}, {
				dataIndex : 'coolingWaterStatus',
				text : 'CoolingWaterStatus',
				type : 'string'
			}, {
				dataIndex : 'timingBeltStatus',
				text : 'TimingBeltStatus',
				type : 'string'
			}, {
				dataIndex : 'sparkPlugStatus',
				text : 'SparkPlugStatus',
				type : 'string'
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype : 'datecolumn',
				format : F('datetime'),
				width : 120
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
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
					var form = main.form;
					form.loadRecord(record);
				}
			},
			onSearch : function(grid) {
				var idFilter = grid.down('textfield[name=idFilter]');
				var namefilter = grid.down('textfield[name=nameFilter]');
				grid.store.clearFilter();

				grid.store.filter([ {
					property : 'id',
					value : idFilter.getValue()
				}, {
					property : 'registrationNumber',
					value : namefilter.getValue()
				} ]);
			},
			onReset : function(grid) {
				grid.down('textfield[name=idFilter]').setValue('');
				grid.down('textfield[name=nameFilter]').setValue('');
			},
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'idFilter',
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
				name : 'nameFilter',
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
				text : 'Search',
				tooltip : 'Find Vehicle',
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
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			title : 'Vehicle Details',
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			flex : 1,
			items : [ {
				xtype : 'form',
				flex : 1,
				autoScroll : true,
				defaults : {
					anchor : '100%',
				},
				items : [ {
					xtype : 'textfield',
					name : 'key',
					fieldLabel : 'Key',
					hidden : true
				}, {
					xtype : 'textfield',
					name : 'id',
					fieldLabel : 'Vehicle Id',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'registrationNumber',
					fieldLabel : 'Registration Number',
					anchor : '100%'
				}, {
					xtype : 'combo',
					name : 'manufacturer',
					queryMode : 'local',
					store : 'ManufacturerStore',
					displayField : 'name',
					valueField : 'name',
					fieldLabel : 'Manufacturer',
					anchor : '100%'
				}, {
					xtype : 'combo',
					name : 'vehicleType',
					queryMode : 'local',
					store : 'VehicleTypeStore',
					displayField : 'desc',
					valueField : 'name',
					fieldLabel : 'Vehicle Type',
					anchor : '100%'
				}, {
					xtype : 'filefield',
					name : 'imageFile',
					fieldLabel : 'Image Upload',
					msgTarget : 'side',
					allowBlank : true,
					anchor : '100%',
					buttonText : 'file...'
				}, {
					xtype : 'textfield',
					name : 'birthYear',
					fieldLabel : 'BirthYear',
					anchor : '100%'
				}, {
					xtype : 'combo',
					name : 'ownershipType',
					queryMode : 'local',
					store : 'OwnershipStore',
					displayField : 'desc',
					valueField : 'name',
					fieldLabel : 'Ownership Type',
					anchor : '100%'
				}, {
					xtype : 'combo',
					name : 'status',
					queryMode : 'local',
					store : 'VehicleStatusStore',
					displayField : 'desc',
					valueField : 'status',
					fieldLabel : 'Status',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'totalDistance',
					fieldLabel : 'Total Distance',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'remainingFuel',
					fieldLabel : 'Remaining Fuel',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'distanceSinceNewOil',
					fieldLabel : 'Distance Since NewOil',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'engineOilStatus',
					fieldLabel : 'EngineOil Status',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'fuelFilterStatus',
					fieldLabel : 'FuelFilter Status',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'brakeOilStatus',
					fieldLabel : 'BrakeOil Status',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'brakePedalStatus',
					fieldLabel : 'BrakePedal Status',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'coolingWaterStatus',
					fieldLabel : 'CoolingWater Status',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'timingBeltStatus',
					fieldLabel : 'TimingBeltStatus',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'sparkPlugStatus',
					fieldLabel : 'SparkPlugStatus',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'lattitude',
					fieldLabel : 'Lattitude',
					disabled : true,
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'longitude',
					fieldLabel : 'Longitude',
					disabled : true,
					anchor : '100%'
				}, {
					xtype : 'datefield',
					name : 'updatedAt',
					disabled : true,
					fieldLabel : 'Updated At',
					format : F('datetime'),
					anchor : '100%'
				}, {
					xtype : 'datefield',
					name : 'createdAt',
					disabled : true,
					fieldLabel : 'Created At',
					format : F('datetime'),
					anchor : '100%'
				}, {
					xtype : 'displayfield',
					name : 'imageClip',
					hidden : true,
					listeners : {
						change : function(field, value) {
							var img = main.form.nextSibling('container').down('image');
							if(value != null && value.length > 0)
								img.setSrc('download?blob-key=' + value);
							else
								img.setSrc('resources/image/bgVehicle.png');
						}
					}
				} ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'vbox',
					align : 'stretch'	
				},
				items : [ {
					xtype : 'image',
					height : 200,
					itemId : 'image'
				} ]
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				layout : {
					align : 'middle',
					type : 'hbox'
				},
				items : [ {
					xtype : 'button',
					text : 'Save',
					handler : function() {
						var form = main.form.getForm();

						if (form.isValid()) {
							form.submit({
								url : 'vehicle/save',
								success : function(form, action) {
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'Delete',
					handler : function() {
						var form = main.form.getForm();

						if (form.isValid()) {
							form.submit({
								url : 'vehicle/delete',
								success : function(form, action) {
									main.down('gridpanel').store.load();
									form.reset();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'New',
					handler : function() {
						main.form.getForm().reset();
					}
				} ]
			} ]
		}
	}
});