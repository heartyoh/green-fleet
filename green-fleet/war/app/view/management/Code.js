Ext.define('GreenFleet.view.management.Code', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_code',

	title : T('title.code'),

	entityUrl : 'code',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'code/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;

		this.items = [ {
			html : "<div class='listTitle'>" + T('title.code_list') + "</div>"
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.buildGroupList(this), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.buildCodeList(this), this.buildForm(this) ]
			} ]
		} ],

		this.callParent(arguments);

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('grid').on('render', function(grid) {
			grid.store.clearFilter(true);
			var group = self.sub('grouplist').store.first().get('group');
			grid.store.filter('group', group);
			self.sub('form').getForm().setValues({
				group : group
			});
		});

		this.sub('grouplist').on('itemclick', function(grid, record) {
			self.sub('grid').store.clearFilter(true);
			self.sub('grid').store.filter('group', record.get('group'));
			self.sub('form').getForm().reset();
			self.sub('form').getForm().setValues({
				group : record.get('group')
			});
		});
	},

	buildGroupList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grouplist',
			store : 'CodeGroupStore',
			title : T('title.code_group'),
			width : 320,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'group',
				text : T('label.group'),
				width : 100
			}, {
				dataIndex : 'desc',
				text : T('label.desc'),
				width : 220
			} ]
		}
	},

	buildCodeList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'CodeStore',
			title : T('title.code_list'),
			flex : 1,
			cls : 'hIndexbarZero',
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'group',
				text : T('label.group')
			}, {
				dataIndex : 'code',
				text : T('label.code')
			}, {
				dataIndex : 'desc',
				text : T('label.desc')
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
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			itemId : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.code_details'),
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
				xtype : 'combo',
				name : 'group',
				fieldLabel : T('label.group'),
				queryMode : 'local',
				store : 'CodeGroupStore',
				displayField : 'group',
				valueField : 'group',
				allowBlank: false,
				afterLabelTextTpl: required
			}, {
				name : 'code',
				fieldLabel : T('label.code'),
				allowBlank: false,
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
						main.sub('grid').store.load(callback);
					},
					scope : main
				}
			} ]
		}
	}
});