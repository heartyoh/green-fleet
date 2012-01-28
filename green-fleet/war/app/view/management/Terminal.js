Ext.define('GreenFleet.view.management.Terminal', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_terminal',

	title : 'Terminal',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		this.callParent(arguments);

		this.list = this.add(this.buildList(this));
		var detail = this.add(this.buildForm(this));
		this.form = detail.down('form');
	},

	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			title : 'Terminal List',
			store : 'TerminalStore',
			autoScroll : true,
			flex : 1,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'id',
				text : 'Employee Id',
				type : 'string'
			}, {
				dataIndex : 'serialNo',
				text : 'Serial No.',
				type : 'string'
			}, {
				dataIndex : 'buyingDate',
				text : 'Buying Date',
				xtype : 'datecolumn',
				format : F('date')
			}, {
				dataIndex : 'comment',
				text : 'Comment',
				type : 'string'
			}, {
				dataIndex : 'createdAt',
				text : 'Created At',
				xtype:'datecolumn',
				format:F('datetime')
			}, {
				dataIndex : 'updatedAt',
				text : 'Updated At',
				xtype:'datecolumn',
				format:F('datetime')
			} ],
			viewConfig : {

			},
			listeners : {
				render : function(grid) {
					grid.store.load();
				},
				itemclick : function(grid, record) {
					var form = main.form;
					form.loadRecord(record);
				}
			},
			onSearch : function(grid) {
				var idFilter = grid.down('textfield[name=idFilter]');
				var serialNoFilter = grid.down('textfield[name=serialNoFilter]');
				grid.store.clearFilter();
				
				grid.store.filter([ {
					property : 'id',
					value : idFilter.getValue()
				}, {
					property : 'serialNo',
					value : serialNoFilter.getValue()
				} ]);
			},
			onReset : function(grid) {
				grid.down('textfield[name=idFilter]').setValue('');
				grid.down('textfield[name=serialNoFilter]').setValue('');
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
			}, 'Name', {
				xtype : 'textfield',
				name : 'serialNoFilter',
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
				tooltip : 'Find Terminal',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onSearch(grid);
				}
			}, {
				text : 'Reset',
				handler : function() {
					var grid = this.up('gridpanel');
					grid.onReset(grid);
				}
			} ],
			rbar : [{
				xtype : 'form',
				items : [{
					xtype : 'filefield',
					name : 'file',
					fieldLabel : 'Import(CSV)',
					msgTarget : 'side',
					labelAlign : 'top',
					allowBlank : true,
					buttonText : 'file...' 
				},{
					xtype : 'button',
					text : 'Import',
					handler : function(button) {
						var form = button.up('form').getForm();

						if (form.isValid()) {
							form.submit({
								url : 'terminal/import',
								success : function(form, action) {
									main.down('gridpanel').store.load();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				}]
			} ]
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			itemId : 'details',
			bodyPadding : 10,
			title : 'Terminal Details',
			autoScroll : true,
			layout : {
				type : 'hbox',
				align : 'stretch'	
			},
			flex : 1,
			items : [ {
				xtype : 'form',
				flex : 1,
				items : [{
					xtype : 'textfield',
					name : 'key',
					fieldLabel : 'Key',
					anchor : '100%',
					hidden : true
				}, {
					xtype : 'textfield',
					name : 'id',
					fieldLabel : 'Terminal Id',
					anchor : '100%'
				}, {
					xtype : 'textfield',
					name : 'serialNo',
					fieldLabel : 'Serial No.',
					anchor : '100%'
				}, {
					xtype : 'datefield',
					name : 'buyingDate',
					fieldLabel : 'Buying Date',
					anchor : '100%',
					format : F('date'),
					submitFormat : 'U'
				}, {
					xtype : 'textarea',
					name : 'comment',
					fieldLabel : 'Comment',
					anchor : '100%'
				}, {
					xtype : 'filefield',
					name : 'imageFile',
					fieldLabel : 'Image Upload',
					msgTarget : 'side',
					allowBlank : true,
					anchor : '100%',
					buttonText : 'file...'
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
				}, {
					xtype : 'displayfield',
					name : 'imageClip',
					hidden : true,
					listeners : {
						change : function(field, value) {
							var img = main.form.nextSibling('container').down('image');
							if(value != null && value.length > 0)
								img.setSrc('download?blob-key=' + value);
							else
								img.setSrc('resources/image/bgTerminal.png');
						}
					}
				} ]
			}, {
				xtype : 'container',
				flex : 1,
				layout : {
					type : 'vbox',
					align : 'stretch'	
				},
				items : [ {
					xtype : 'image',
					height : 200,
					itemId : 'image'
				} ]
			} ],
			dockedItems : [ {
				xtype : 'toolbar',
				dock : 'bottom',
				layout : {
					align : 'middle',
					type : 'hbox'
				},
				items : [ {
					xtype : 'button',
					text : 'Save',
					handler : function() {
						var form = main.form.getForm();

						if (form.isValid()) {
							form.submit({
								url : 'terminal/save',
								headers: {'Content-Type':'multipart/form-data; charset=UTF-8'},
								success : function(form, action) {
									var store = main.down('gridpanel').store;
									store.load(function() {
										form.loadRecord(store.findRecord('key', action.result.key));
									});
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'Delete',
					handler : function() {
						var form = main.form.getForm();

						if (form.isValid()) {
							form.submit({
								url : 'terminal/delete',
								success : function(form, action) {
									main.down('gridpanel').store.load();
									form.reset();
								},
								failure : function(form, action) {
									GreenFleet.msg('Failed', action.result);
								}
							});
						}
					}
				}, {
					xtype : 'button',
					text : 'New',
					handler : function() {
						main.form.getForm().reset();
					}
				} ]
			} ]
		}
	}
});