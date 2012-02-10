Ext.define('GreenFleet.view.management.User', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_user',

	title : 'User',
	
	entityUrl : 'user',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;
		
		this.items = [ {
			html : '<div class="listTitle">User List</div>'
		}, this.buildList(this), this.buildForm(this) ],

		this.callParent(arguments);
		
		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});
		
		this.sub('grid').on('render', function(grid) {
			grid.store.load();
		});
		
		this.sub('emailFilter').on('change', function(field, value) {
			self.search(self);
		});
		
		this.sub('nameFilter').on('change', function(field, value) {
			self.search(self);
		});
		
		this.down('#search_reset').on('click', function() {
			self.sub('emailFilter').setValue('');
			self.sub('nameFilter').setValue('');
		});
		
		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
		});
		
	},

	search : function(self) {
		self.sub('grid').store.clearFilter();

		self.sub('grid').store.filter([ {
			property : 'email',
			value : self.sub('emailFilter').getValue()
		}, {
			property : 'surname',
			value : self.sub('nameFilter').getValue()
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'UserStore',
			flex : 3,
			columns : [ {
				dataIndex : 'key',
				text : 'Key',
				hidden : true
			}, {
				dataIndex : 'email',
				text : 'email'
			}, {
				dataIndex : 'surname',
				text : 'Sur Name'
			}, {
				dataIndex : 'nickname',
				text : 'Nick Name'
			}, {
				dataIndex : 'forename',
				text : 'For Name'
			}, {
				dataIndex : 'enabled',
				text : 'Enabled'
			}, {
				dataIndex : 'admin',
				text : 'Admin'
			}, {
				dataIndex : 'company',
				text : 'Company'
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
			} ],
			viewConfig : {

			},
			tbar : [ 'e-mail', {
				xtype : 'textfield',
				itemId : 'emailFilter',
				name : 'emailFilter',
				hideLabel : true,
				width : 200
			}, 'NAME', {
				xtype : 'textfield',
				itemId : 'nameFilter',
				name : 'nameFilter',
				hideLabel : true,
				width : 200
			}, {
				xtype : 'button',
				itemId : 'search',
				text : 'Search',
				tooltip : 'Find User'
			}, {
				text : 'reset',
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
			title : 'User Details',
			flex : 2,
			autoScroll : true,
			items : [ {
				xtype : 'textfield',
				name : 'key',
				fieldLabel : 'Key',
				anchor : '100%',
				hidden : true
			}, {
				xtype : 'textfield',
				name : 'email',
				fieldLabel : 'e-mail',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'surname',
				fieldLabel : 'Sur Name',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'nickname',
				fieldLabel : 'Nick Name',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'forename',
				fieldLabel : 'Fore Name',
				anchor : '100%'
			}, {
				xtype : 'checkbox',
				name : 'enabled',
				fieldLabel : 'Enabled',
				anchor : '100%'
			}, {
				xtype : 'checkbox',
				name : 'admin',
				fieldLabel : 'Admin',
				anchor : '100%'
			}, {
				xtype : 'textfield',
				name : 'company',
				fieldLabel : 'Company',
				disable : true,
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
				xtype : 'entity_form_buttons',
			} ]
		}
	}
});