Ext.define('GreenFleet.view.management.VehicleGroup', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_vehicle_group',

	title : 'Vehicle Group',

	entityUrl : 'vehicle_group',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'vehicle_group/import',

	afterImport : function() {
		this.sub('grouplist').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;

		this.items = [ {
			html : '<div class="listTitle">Vehicle Group List</div>'
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.buildVehicleGroupList(this), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.buildForm(this), this.buildVehicleList(this) ]
			} ]
		} ],

		this.callParent(arguments);
		
		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
			grid.store.clearFilter(true);
			var vehicleGroup = self.sub('grouplist').store.first();
			
			if(vehicleGroup) {
				var vehicleGroupName = vehicleGroup.get('name');			
				grid.store.filter('vehicle_group', vehicleGroupName);
				self.sub('form').getForm().setValues({
					key : vehicleGroup.get('key'),
					name : vehicleGroupName,
					desc : vehicleGroup.get('desc'),
					exclusive : vehicleGroup.get('exclusive'),
					updated_at : vehicleGroup.get('updated_at'),
					created_at : vehicleGroup.get('created_at')
				});
			}
		});

		this.sub('grouplist').on('itemclick', function(grid, record) {
			self.sub('grid').store.clearFilter(true);
			self.sub('grid').store.filter('vehicle_group', record.get('name'));
			self.sub('grid').store.load();
			
			self.sub('form').getForm().reset();
			self.sub('form').getForm().setValues({
				key : record.get('key'),
				name : record.get('name'),
				desc : record.get('desc'),
				exclusive : record.get('exclusive'),
				updated_at : record.get('updated_at'),
				created_at : record.get('created_at')
			});			
		});
	},

	buildVehicleGroupList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grouplist',
			store : 'VehicleGroupStore',
			title : 'Vehicle Group',
			width : 320,
			columns : [ new Ext.grid.RowNumberer(), 
			{
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'name',
				text : 'Vehicle Group',
				width : 100
			}, {
				dataIndex : 'desc',
				text : 'Description',
				width : 220
			}, {
				dataIndex : 'exclusive',
				hidden : true
			}, {
				dataIndex : 'created_at',
				hidden : true
			}, {
				dataIndex : 'updated_at',
				hidden : true
			} ]
		}
	},

	buildVehicleList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'VehicleStore',
			title : 'Vehicle List',
			flex : 1,
			cls : 'hIndexbarZero',
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'Vehicle Id'
			}, {
				dataIndex : 'vehicle_group',
				text : 'Vehicle Group'
			}, {
				dataIndex : 'registration_number',
				text : 'Registration Number'
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
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Vehicle Group Details',
			height : 200,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Key',
				hidden : true
			}, {
				name : 'name',
				fieldLabel : 'Group Name',
			}, {
				xtype : 'checkbox',
				name : 'exclusive',
				fieldLabel : 'Exclusive',
				inputValue : 'true',
				uncheckedValue : 'false',
				anchor : '100%'
			}, {
				name : 'desc',
				fieldLabel : 'Description'
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
					fn : function(callback) {
						main.sub('grouplist').store.load(callback);
						main.sub('grid').store.load(callback);
					},
					scope : main
				}
			} ]
		}
	}
});