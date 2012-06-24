Ext.define('GreenFleet.view.management.Report', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_report',

	title : T('title.report'),

	entityUrl : 'report',
	
	importUrl : 'report/import',
	
	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	items : {
		html : "<div class='listTitle'>" + T('title.report_list') + "</div>"
	},
	
	initComponent : function() {
		var self = this;
		
		this.callParent(arguments);
		
		item = {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : { align : 'stretch', type : 'hbox' },
				items : [ this.buildList(this), this.buildForm(this) ]
			} ]
		};
		
		this.add(item);

		this.sub('grid').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});

		this.sub('name_filter').on('change', function(field, value) {
			self.search();
		});

		this.down('#search_reset').on('click', function() {
			self.sub('name_filter').setValue('');
		});

		this.down('#search').on('click', function() {
			self.sub('grid').store.load();
		});		
	},

	search : function() {
		this.sub('grid').store.clearFilter();

		this.sub('grid').store.filter([ {
			property : 'name',
			value : this.sub('name_filter').getValue()
		}]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'ReportStore',
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
				dataIndex : 'name',
				text : T('label.name'),
				type : 'string'
			}, {
				dataIndex : 'daily',
				text : T('label.daily'),
				type : 'boolean'
			}, {
				dataIndex : 'weekly',
				text : T('label.weekly'),
				type : 'boolean'
			}, {
				dataIndex : 'monthly',
				text : T('label.monthly'),
				type : 'boolean'
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
			tbar : [ T('label.name'), {
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
			} ],
			bbar: {
				xtype : 'pagingtoolbar',
				itemId : 'pagingtoolbar',
	            store: 'ReportStore',
	            cls : 'pagingtoolbar',
	            displayInfo: true,
	            displayMsg: 'Displaying report {0} - {1} of {2}',
	            emptyMsg: "No reports to display"
	        }
		}
	},

	buildForm : function(main) {
		return {
			xtype : 'panel',
			itemId : 'details',
			bodyPadding : 10,
			cls : 'hIndexbar',
			title : T('title.report_details'),
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
					fieldLabel : T('label.id'),
					xtype : 'codecombo',
					group : 'ReportType'						
				}, {
					name : 'name',
					fieldLabel : T('label.name')
				}, {					
					name : 'cycle',
					xtype: 'checkboxgroup',
		            fieldLabel: T('label.cycle'),
		            columns: 1,
		            items: [
		                { boxLabel: T('label.daily'), name: 'daily' },
		                { boxLabel: T('label.weekly'), name: 'weekly' },
		                { boxLabel: T('label.monthly'), name: 'monthly' }
		            ]
				}, {
					name : 'send_to',
					xtype : 'textarea',
					rows : 6,
					fieldLabel: T('label.send_to')
					//xtype : 'user_selector',
					//selector_label : T('label.send_to')
				}, {
					xtype : 'textarea',
					name : 'expl',
					rows : 8,
					fieldLabel : T('label.desc')
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