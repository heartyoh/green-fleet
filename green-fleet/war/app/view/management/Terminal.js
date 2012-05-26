Ext.define('GreenFleet.view.management.Terminal', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_terminal',

	title : T('title.terminal'),

	entityUrl : 'terminal',
	/*
	 * importUrl, afterImport config properties for Import util function
	 */ 
	importUrl : 'terminal/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	items: {
		html : "<div class='listTitle'>" + T('title.terminal_list') + "</div>"
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

		this.sub('serial_no_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('id_filter').setValue('');
			self.sub('serial_no_filter').setValue('');
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
			property : 'serial_no',
			value : this.sub('serial_no_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'TerminalStore',
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
				dataIndex : 'serial_no',
				text : T('label.x_no', {x : T('label.serial')}),
				type : 'string'
			}, {
				dataIndex : 'buying_date',
				text : T('label.x_date', {x : T('label.buying')}),
				//xtype : 'datecolumn',
				//format : F('date'),
				width : 120
			}, {
				dataIndex : 'comment',
				text : T('label.comment'),
				type : 'string',
				width : 160
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
			}, T('label.x_no', {x : T('label.serial')}), {
				xtype : 'textfield',
				name : 'serial_no_filter',
				itemId : 'serial_no_filter',
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
			title : T('title.terminal_details'),
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
					name : 'id',
					fieldLabel : T('label.id')
				}, {
					name : 'serial_no',
					fieldLabel : T('label.x_no', {x : T('label.serial')})
				}, {
					xtype : 'datefield',
					name : 'buying_date',
					fieldLabel : T('label.x_date', {x : T('label.buying')}),
					format : F('date')
				}, {
					xtype : 'textarea',
					name : 'comment',
					fieldLabel : T('label.comment')
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
			}, {
				xtype : 'container',
				flex : 1,
				layout : 'fit',
				cls : 'noImage paddingLeft10',
				items : [ {
					xtype : 'image',
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