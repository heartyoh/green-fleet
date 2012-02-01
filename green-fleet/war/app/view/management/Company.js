Ext.define('GreenFleet.view.management.Company', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_company',

	title : 'Company',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
//	items: {
//		html : '<div class="listTitle">Company List</div>'
//	},

	initComponent : function() {
		Ext.applyIf(this, {
			items : [ this.buildList(this), this.buildForm(this) ],
		});

		this.callParent(arguments);
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			store : 'CompanyStore',
			flex : 3,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'ID'
			}, {
				dataIndex : 'name',
				text : 'Name'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime'),
				width : 120
			} ],
			viewConfig : {

			},
			listeners : {
				render : function(grid) {
					grid.store.load();
				},
				itemclick : function(grid, record) {
					var form = main.down('form');
					form.loadRecord(record);
				}
			},
			onSearch : function(grid) {
				var idFilter = grid.down('textfield[name=idFilter]');
				var nameFilter = grid.down('textfield[name=nameFilter]');
				grid.store.clearFilter();

				grid.store.filter([ {
					property : 'id',
					value : idFilter.getValue()
				}, {
					property : 'name',
					value : nameFilter.getValue()
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
			}, 'NAME', {
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
				tooltip : 'Find Company',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'reset',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onReset(grid);
				}
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'form',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : 'Company Details',
			flex : 2,
			items : [ {
				xtype : 'textfield',
				name : 'key',
				fieldLabel : 'Key',
				anchor : '100%',
				hidden : true
			}, {
				xtype : 'textfield',
				name : 'id',
				fieldLabel : 'ID',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'name',
				fieldLabel : 'Name',
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'updatedAt',
				disabled : true,
				fieldLabel : 'Updated At',
				format: F('datetime'),
				anchor : '100%'
			}, {
				xtype : 'datefield',
				name : 'createdAt',
				disabled : true,
				fieldLabel : 'Created At',
				format: F('datetime'),
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
				},{
					xtype : 'button',
					text : 'Save',
					handler : function() {
						var form = this.up('form').getForm();

						if (form.isValid()) {
							form.submit({
								url : 'company/save',
								success : function(form, action) {
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result.msg);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'Delete',
					handler : function() {
						var form = this.up('form').getForm();

						if (form.isValid()) {
							form.submit({
								url : 'company/delete',
								success : function(form, action) {
									main.down('gridpanel').store.load();
									form.reset();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result.msg);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'Reset',
					handler : function() {
						this.up('form').getForm().reset();
					}
				} ]
			} ]
		}
	}
});