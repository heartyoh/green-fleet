Ext.define('GreenFleet.view.management.User', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_user',

	title : T('title.user'),
	
	entityUrl : 'user',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;
		
		this.items = [ {
			html : "<div class='listTitle'>" + T('title.user_list') + "</div>"
		}, this.buildList(this), this.buildForm(this) ],

		this.callParent(arguments);
		
		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});
		
		this.sub('grid').on('render', function(grid) {
			grid.store.load();
		});
		
		this.sub('email_filter').on('change', function(field, value) {
			self.search(false);
		});
		
		this.sub('name_filter').on('change', function(field, value) {
			self.search(false);
		});
		
		this.down('#search_reset').on('click', function() {
			self.sub('email_filter').setValue('');
			self.sub('name_filter').setValue('');
		});
		
		this.down('#search').on('click', function() {
			self.search(true);
		});
		
		this.down('#image_clip').on('change', function(field, value) {
			var image = self.sub('image');
			
			if(value != null && value.length > 0)
				image.setSrc('download?blob-key=' + value);
			else
				image.setSrc('resources/image/bgDriver.png');
		});	
		
	},

	search : function(remote) {
		this.sub('grid').store.remoteFilter = remote;
		this.sub('grid').store.clearFilter(true);

		this.sub('grid').store.filter([ {
			property : 'email',
			value : this.sub('email_filter').getValue()
		}, {
			property : 'name',
			value : this.sub('name_filter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'UserStore',
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'email',
				text : T('label.email')
			}, {
				dataIndex : 'name',
				text : T('label.name')
			}, {
				dataIndex : 'enabled',
				text : T('label.enabled')
			}, {
				dataIndex : 'admin',
				text : T('label.admin')
			}, {
				dataIndex : 'company',
				text : T('label.company')
			}, {
				dataIndex : 'grade',
				text : T('label.grade')				
			}, {
				dataIndex : 'language',
				text : T('label.language')				
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
			tbar : [ T('label.email'), {
				xtype : 'textfield',
				itemId : 'email_filter',
				name : 'email_filter',
				hideLabel : true,
				width : 200
			}, T('label.name'), {
				xtype : 'textfield',
				itemId : 'name_filter',
				name : 'name_filter',
				hideLabel : true,
				width : 200
			}, {
				xtype : 'button',
				itemId : 'search',
				text : T('button.search'),
				tooltip : 'Find User'
			}, {
				text : T('button.reset'),
				itemId : 'search_reset'
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'UserStore',
	            cls : 'pagingtoolbar',
	            displayInfo: true,
	            displayMsg: 'Displaying users {0} - {1} of {2}',
	            emptyMsg: "No users to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.user_details'),
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			height : 380,
			items : [ 
				{
					xtype : 'container',
					width : 300,
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
					bodyPadding : 10,
					flex : 1,
					autoScroll : true,
					defaults : {
						xtype : 'textfield',
						anchor : '100%'
					},					
					items : [ 
					    {
							name : 'key',
							fieldLabel : 'Key',
							hidden : true
						}, {
							name : 'email',
							fieldLabel : T('label.email'),
							allowBlank: false,
							afterLabelTextTpl: required
						}, {
							name : 'name',
							fieldLabel : T('label.name'),
							allowBlank: false,
							afterLabelTextTpl: required
						}, {
							xtype : 'checkbox',
							name : 'enabled',
							fieldLabel : T('label.enabled'),
							uncheckedValue : 'off'
						}, {
							xtype : 'checkbox',
							name : 'admin',
							fieldLabel : T('label.admin'),
							uncheckedValue : 'off'
						}, {
							name : 'company',
							fieldLabel : T('label.company'),
							disable : true,
							allowBlank: false,
							afterLabelTextTpl: required
						}, {
							xtype : 'codecombo',
							name : 'grade',
							group : 'UserGradeType',
				            fieldLabel: T('label.grade'),
				            allowBlank : false,
							afterLabelTextTpl: required
						}, {
							xtype : 'combo',
							name : 'language',
						    store: 'LanguageCodeStore',
						    queryMode: 'local',
						    displayField: 'display',
						    valueField: 'value',
							fieldLabel : T('label.language')
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
							format : F('datetime')
						}, {
							xtype : 'datefield',
							name : 'created_at',
							disabled : true,
							fieldLabel : T('label.created_at'),
							format : F('datetime')
						}, {
							xtype : 'displayfield',
							name : 'image_clip',
							itemId : 'image_clip',
							hidden : true
						}
					]
			    }
			],
			
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : function(callback) {
						main.sub('email_filter').setValue('');
						main.sub('name_filter').setValue('');
						main.search(true);
					},
					scope : main
				}
			} ]
		}
	}
});