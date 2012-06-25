Ext.define('GreenFleet.view.management.Driver', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_driver',

	title : T('title.driver'),
	
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
		html : "<div class='listTitle'>" + T('title.driver_list') + "</div>"
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
			flex : 2.5,
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
				dataIndex : 'name',
				text : T('label.name'),
				type : 'string'
			}, {
				dataIndex : 'division',
				text : T('label.division'),
				type : 'string'
			}, {
				dataIndex : 'title',
				text : T('label.title'),
				type : 'string'
			}, {
				dataIndex : 'social_id',
				text : T('label.social_id'),
				type : 'string'
			}, {
				dataIndex : 'phone_no_1',
				text : T('label.phone_x', {x : 1}),
				type : 'string'
			}, {
				dataIndex : 'phone_no_2',
				text : T('label.phone_x', {x : 2}),
				type : 'string'
			}, {
				dataIndex : 'total_distance',
				text : T('label.total_distance') + '(km)',
				xtype: 'numbercolumn',
				type : 'float'
			}, {
				dataIndex : 'total_run_time',
				text : T('label.total_run_time') + T('label.parentheses_min'),
				xtype: 'numbercolumn',
				type : 'int'
			}, {
				dataIndex : 'avg_effcc',
				text : T('label.avg_effcc'),
				xtype: 'numbercolumn',
				type : 'float'
			}, {
				dataIndex : 'eco_index',
				text : T('label.eco_index') + '(%)',
				xtype: 'numbercolumn',
				type : 'int'
			}, {
				dataIndex : 'eco_run_rate',
				text : T('label.eco_run_rate') + '(%)',
				xtype: 'numbercolumn',
				type : 'int'
			}, {
				dataIndex : 'created_at',
				text : T('label.created_at'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updated_at',
				text : T('label.updated_at'),
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			tbar : [ T('label.id'), {
				xtype : 'textfield',
				name : 'id_filter',
				itemId : 'id_filter',
				hideLabel : true,
				width : 200
			}, T('label.name'), {
				xtype : 'textfield',
				name : 'name_filter',
				itemId : 'name_filter',
				hideLabel : true,
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
			xtype : 'panel',
			itemId : 'details',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.driver_details'),
			layout : {
				type : 'hbox',
				align : 'stretch'	
			},
			flex : 1,
			items : [ 
				{
					xtype : 'container',
					flex : 1,
					layout : 'fit',
					cls : 'noImage',
					items : [ {
						xtype : 'image',
						itemId : 'image'
					} ]
				}, 			         
			    {
					xtype : 'form',
					itemId : 'form',
					autoScroll : true,
					bodyPadding : 10,
					flex : 8,
					defaults : {
						xtype : 'textfield',
						anchor : '100%'
					},
					items : [{
						name : 'key',
						fieldLabel : 'Key',
						hidden : true
					}, {
						name : 'id',
						fieldLabel : T('label.id')
					}, {
						name : 'name',
						fieldLabel : T('label.name')
					}, {
						xtype : 'codecombo',
						name : 'division',
						group : 'Division',
						fieldLabel : T('label.division')
					}, {
						xtype : 'codecombo',
						name : 'title',
						group : 'EmployeeTitle',
						fieldLabel : T('label.title')
					}, {
						name : 'social_id',
						fieldLabel : T('label.social_id')
					}, {
						name : 'phone_no_1',
						fieldLabel : T('label.phone_x', {x : 1})
					}, {
						name : 'phone_no_2',
						fieldLabel : T('label.phone_x', {x : 2})
					}, {
						name : 'total_distance',
						fieldLabel : T('label.total_distance')
					}, {
						name : 'total_run_time',
						fieldLabel : T('label.total_run_time')
					}, {
						name : 'avg_effcc',
						fieldLabel : T('label.avg_effcc')
					}, {
						name : 'eco_index',
						fieldLabel : T('label.eco_index')
					}, {
						name : 'eco_run_rate',
						fieldLabel : T('label.eco_run_rate')
					}, {
						xtype : 'filefield',
						name : 'image_file',
						fieldLabel : T('label.image_upload'),
						msgTarget : 'side',
						allowBlank : true,
						buttonText : T('button.file')
					}, {
						xtype : 'datefield',
						name : 'updated_at',
						disabled : true,
						fieldLabel : T('label.updated_at'),
						format: F('datetime')
					}, {
						xtype : 'datefield',
						name : 'created_at',
						disabled : true,
						fieldLabel : T('label.created_at'),
						format: F('datetime')
					}, {
						xtype : 'displayfield',
						name : 'image_clip',
						itemId : 'image_clip',
						hidden : true
					} ]
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