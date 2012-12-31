Ext.define('GreenFleet.view.management.ConsumableCode', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_consumable_code',

	title : T('titla.consumable_code'),

	entityUrl : 'consumable_code',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'consumable_code/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : "<div class='listTitle'>" + T('title.consumable_code_list') + "</div>"
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
			// grid.store.load();
		});

		this.sub('name_filter').on('change', function(field, value) {
			self.search(false);
		});

		this.down('#search_reset').on('click', function() {
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.search(true); 
		});
	},

	search : function(remote) {
		this.sub('grid').store.remoteFilter = remote; //
		this.sub('grid').store.clearFilter(true); //

		this.sub('grid').store.filter([ {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'ConsumableCodeStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'name',
				text : T('label.code'),
				type : 'string'
			}, {
				dataIndex : 'repl_unit',
				text : T('label.repl_unit'),
				type : 'string'
			}, {
				xtype: 'numbercolumn',
				dataIndex : 'fst_repl_mileage',
				text : T('label.fst_repl_mileage'),
				type : 'int'
			}, {
				dataIndex : 'fst_repl_time',
				text : T('label.fst_repl_time'),
				type : 'int'					
			}, {
				xtype: 'numbercolumn',
				dataIndex : 'repl_mileage',
				text : T('label.repl_mileage'),
				type : 'int'
			}, {
				dataIndex : 'repl_time',
				text : T('label.repl_time'),
				type : 'int'
			}, {
				dataIndex : 'desc',
				text : T('label.desc'),
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
			tbar : [ T('label.code'), {
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
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.consumable_code_details'),
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
				name : 'name',
				fieldLabel : T('label.code'),
				allowBlank: false,
				afterLabelTextTpl: required
			}, {
				name : 'repl_unit',
				xtype : 'codecombo',
				group : 'ReplacementUnit',				
				fieldLabel : T('label.repl_unit'),
				allowBlank: false,
				afterLabelTextTpl: required
			}, {
				name : 'fst_repl_mileage',
				xtype : 'numberfield',
				minValue : 0,
				maxValue : 500000,
				fieldLabel : T('label.fst_repl_mileage') + " (km)"
			}, {
				name : 'fst_repl_time',
				xtype : 'numberfield',
				minValue : 0,
				maxValue : 300,
				fieldLabel : T('label.fst_repl_time') + "(month)"				
			}, {
				name : 'repl_mileage',
				xtype : 'numberfield',
				minValue : 0,
				maxValue : 500000,				
				fieldLabel : T('label.repl_mileage') + " (km)",
				afterLabelTextTpl: required
			}, {
				name : 'repl_time',
				xtype : 'numberfield',
				minValue : 0,
				maxValue : 300,				
				fieldLabel : T('label.repl_time') + "(month)",
				afterLabelTextTpl: required
			}, {
				name : 'desc',
				fieldLabel : T('label.desc')
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
				loader : {
					fn : function(callback) {
						//main.sub('grid').store.load(callback);
						main.sub('name_filter').setValue('');
						main.search(true);
					},
					scope : main
				}
			} ]
		}
	}
});