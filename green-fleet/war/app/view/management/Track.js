Ext.define('GreenFleet.view.management.Track', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_track',

	title : 'Track',

	entityUrl : 'track',
	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'track/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items: {
		html : '<div class="listTitle">Tracking List</div>'
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
			//grid.store.load();
		});

		this.sub('vehicle_filter').on('change', function(field, value) {
			//self.search(self);
		});

		this.sub('date_filter').on('change', function(field, value) {
			//self.search(self);
		});

		this.down('#search_reset').on('click', function() {
			self.sub('vehicle_filter').setValue('');
			self.sub('date_filter').setValue(new Date());
		});

		this.down('#search').on('click', function() {
			self.search(self);
		});
		
	},
	
	search : function(self) {
		if(!self.sub('vehicle_filter').getValue() || !self.sub('date_filter').getSubmitValue()) {
			Ext.Msg.alert('Condition', 'Please select conditions!');
			return;
		}
		
		self.sub('grid').store.load({
			filters : [ {
				property : 'vehicle_id',
				value : self.sub('vehicle_filter').getValue()
			}, {
				property : 'date',
				value : self.sub('date_filter').getSubmitValue()
			} ]
		});
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'TrackStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'terminal_id',
				text : 'Terminal',
				type : 'string'
			}, {
				dataIndex : 'vehicle_id',
				text : 'Vehicle',
				type : 'string'
			}, {
				dataIndex : 'driver_id',
				text : 'Driver',
				type : 'string'
			}, {
				dataIndex : 'datetime',
				text : 'DateTime',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'lattitude',
				text : 'Lattitude',
				type : 'number'
			}, {
				dataIndex : 'longitude',
				text : 'Longitude',
				type : 'number'
			}, {
				dataIndex : 'velocity',
				text : 'Velocity',
				type : 'number'
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ {
				xtype : 'combo',
				name : 'vehicle_filter',
				itemId : 'vehicle_filter',
				queryMode: 'local',
				store : 'VehicleStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Vehicle',
				width : 200
			}, {
		        xtype: 'datefield',
				name : 'date_filter',
				itemId : 'date_filter',
				fieldLabel : 'Date',
				format: 'Y-m-d',
				submitFormat : 'U',
		        maxValue: new Date(),  // limited to the current date or prior
		        value : new Date(),
				width : 200
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
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Tracking Details',
			autoScroll : true,
			flex : 1,
			defaults : {
				xtype : 'textfield',
				anchor : '100%'
			},
			items : [ {
				name : 'key',
				fieldLabel : 'Key',
				hidden : true
			}, {
				xtype : 'combo',
				name : 'terminal_id',
				queryMode: 'local',
				store : 'TerminalStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Terminal'
			}, {
				xtype : 'combo',
				name : 'vehicle_id',
				queryMode: 'local',
				store : 'VehicleStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Vehicle'
			}, {
				xtype : 'combo',
				name : 'driver_id',
				queryMode: 'local',
				store : 'DriverStore',
				displayField: 'id',
			    valueField: 'id',
				fieldLabel : 'Driver'
			}, {
				xtype : 'datefield',
				name : 'datetime',
				fieldLabel : 'DateTime',
				format: F('datetime')
			}, {
				name : 'lattitude',
				fieldLabel : 'Lattitude'
			}, {
				name : 'longitude',
				fieldLabel : 'Longitude'
			}, {
				name : 'velocity',
				fieldLabel : 'Velocity'
			}, {
				xtype : 'datefield',
				name : 'updated_at',
				disabled : true,
				fieldLabel : 'Updated At',
				format: F('datetime')
			}, {
				xtype : 'datefield',
				name : 'created_at',
				disabled : true,
				fieldLabel : 'Created At',
				format: F('datetime')
			} ],
			dockedItems : [ {
				xtype : 'entity_form_buttons'
			} ]
		}
	}
});