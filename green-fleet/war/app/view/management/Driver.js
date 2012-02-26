Ext.define('GreenFleet.view.management.Driver', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_driver',

	title : 'Driver',
	
	entityUrl : 'driver',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'driver/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	items: {
		html : '<div class="listTitle">Driver List</div>'
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
			grid.store.load();
		});

		this.sub('id_filter').on('change', function(field, value) {
			self.search();
		});

		this.sub('name_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('id_filter').setValue('');
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
		});
		
		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgVehicle.png');
		})
		
	},

	search : function() {
		this.sub('grid').store.clearFilter();

		this.sub('grid').store.filter([ {
			property : 'id',
			value : this.sub('id_filter').getValue()
		}, {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'DriverStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'name',
				text : 'Name',
				type : 'string'
			}, {
				dataIndex : 'id',
				text : 'Employee Id',
				type : 'string'
			}, {
				dataIndex : 'division',
				text : 'Division',
				type : 'string'
			}, {
				dataIndex : 'title',
				text : 'Title',
				type : 'string'
			}, {
				dataIndex : 'social_id',
				text : 'Social Id.',
				type : 'string'
			}, {
				dataIndex : 'phone_no_1',
				text : 'Phone #1',
				type : 'string'
			}, {
				dataIndex : 'phone_no_2',
				text : 'Phone #2',
				type : 'string'
			}, {
				dataIndex : 'created_at',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ 'ID', {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, 'Name', {
				xtype : 'textfield',
				name : 'name_filter',
				itemId : 'name_filter',
				hideLabel : true,
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
			xtype : 'panel',
			itemId : 'details',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Driver Details',
			layout : {
				type : 'hbox',
				align : 'stretch'	
			},
			flex : 1,
			items : [ {
				xtype : 'form',
				itemId : 'form',
				autoScroll : true,
				flex : 1,
				defaults : {
					xtype : 'textfield',
					anchor : '100%'
				},
				items : [{
					name : 'key',
					fieldLabel : 'Key',
					hidden : true
				}, {
					name : 'name',
					fieldLabel : 'Name'
				}, {
					name : 'id',
					fieldLabel : 'Employee Id'
				}, {
					xtype : 'codecombo',
					name : 'division',
					group : 'Division',
					fieldLabel : 'Division'
				}, {
					xtype : 'codecombo',
					name : 'title',
					group : 'EmployeeTitle',
					fieldLabel : 'Title'
				}, {
					name : 'social_id',
					fieldLabel : 'Social Id.'
				}, {
					name : 'phone_no_1',
					fieldLabel : 'Phone #1'
				}, {
					name : 'phone_no_2',
					fieldLabel : 'Phone #2'
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : 'Image Upload',
					msgTarget : 'side',
					allowBlank : true,
					buttonText : 'file...'
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