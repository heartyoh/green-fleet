Ext.define('GreenFleet.view.management.Code', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_code',

	title : 'Code Mgmt.',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		Ext.applyIf(this, {
			items : [],
		});
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
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.zcodelist, this.zform ]
			} ]
		} ],

		this.callParent(arguments);
		
		var self = this;
		
		this.down('[itemId=save]').on('click', function() {
			var form = self.sub('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : 'code/save',
					success : function(form, action) {
						var store = self.sub('codelist').store;
						store.load(function() {
							form.loadRecord(store.findRecord('key', action.result.key));
						});
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result.msg);
					}
				});
			}
		});
		
		this.down('[itemId=delete]').on('click', function() {
			var form = self.sub('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : 'code/delete',
					success : function(form, action) {
						self.sub('codelist').store.load();
						form.reset();
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result.msg);
					}
				});
			}
		});
		
		this.down('[itemId=reset]').on('click', function() {
			self.sub('form').getForm().reset();
		});
		
		this.sub('codelist').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});
	},

	zgrouplist : {
		xtype : 'gridpanel',
		store : 'CodeGroupStore',
		itemId : 'grouplist',
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
		store : 'CodeStore',
		itemId : 'codelist',
		title : 'Code List',
		flex : 1,
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
			dataIndex : 'value',
			text : 'Value'
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
		} ]
	},

	zform : {
		xtype : 'form',
		bodyPadding : 10,
		cls : 'hIndexbar',
		title : 'Code Details',
		itemId : 'form',
		height : 200,
		items : [ {
			xtype : 'textfield',
			name : 'key',
			fieldLabel : 'Key',
			anchor : '100%',
			hidden : true
		}, {
			xtype : 'combo',
			name : 'group',
			fieldLabel : 'Group',
			queryMode : 'local',
			store : 'CodeGroupStore',
			displayField : 'group',
			valueField : 'group',
			anchor : '100%'
		}, {
			xtype : 'textfield',
			name : 'code',
			fieldLabel : 'Code',
			anchor : '100%'
		}, {
			xtype : 'textfield',
			name : 'value',
			fieldLabel : 'Value',
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
		} ],
		dockedItems : [ {
			xtype : 'toolbar',
			dock : 'bottom',
			layout : {
				align : 'middle',
				type : 'hbox'
			},
			items : [ {
				xtype : 'tbfill'
			}, {
				xtype : 'button',
				itemId : 'save',
				text : 'Save'
			}, {
				xtype : 'button',
				itemId : 'delete',
				text : 'Delete'
			}, {
				xtype : 'button',
				itemId : 'reset',
				text : 'Reset'
			} ]
		} ]
	}
});