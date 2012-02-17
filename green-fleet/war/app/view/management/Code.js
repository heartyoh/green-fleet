Ext.define('GreenFleet.view.management.Code', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_code',

	title : 'Code Mgmt.',

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
			html : '<div class="listTitle">Code List</div>'
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.zgrouplist, {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.zcodelist, this.zform ]
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

	zgrouplist : {
		xtype : 'gridpanel',
		itemId : 'grouplist',
		store : 'CodeGroupStore',
		title : 'Code Group',
		width : 320,
		columns : [ {
			dataIndex : 'group',
			text : 'Group',
			width : 100
		}, {
			dataIndex : 'desc',
			text : 'Description',
			width : 220
		} ]
	},

	zcodelist : {
		xtype : 'gridpanel',
		itemId : 'grid',
		store : 'CodeStore',
		title : 'Code List',
		flex : 1,
		cls : 'hIndexbarZero',
		columns : [ {
			dataIndex : 'key',
			text : 'Key',
			hidden : true
		}, {
			dataIndex : 'group',
			text : 'Group'
		}, {
			dataIndex : 'code',
			text : 'Code'
		}, {
			dataIndex : 'desc',
			text : 'Description'
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
	},

	zform : {
		xtype : 'form',
		itemId : 'form',
		bodyPadding : 10,
		cls : 'hIndexbar',
		title : 'Code Details',
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
			fieldLabel : 'Group',
			queryMode : 'local',
			store : 'CodeGroupStore',
			displayField : 'group',
			valueField : 'group'
		}, {
			name : 'code',
			fieldLabel : 'Code'
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
			xtype : 'entity_form_buttons'
		} ]
	}
});