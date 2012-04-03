Ext.define('GreenFleet.view.management.Alarm', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_alarm',

	title : T('titla.alarm'),

	entityUrl : 'alarm',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'alarm/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : "<div class='listTitle'>" + T('title.alarm_list') + "</div>"
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
			self.sub('location_field').store.load();
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
		} ]);
	},
	
	buildList : function(main) {
		return {
			xtype : 'gridpanel',
			itemId : 'grid',
			store : 'AlarmStore',
			autoScroll : true,
			flex : 1,
			columns : [ new Ext.grid.RowNumberer(), {
				dataIndex : 'key',
				text : 'Key',
				type : 'string',
				hidden : true
			}, {
				dataIndex : 'name',
				text : T('label.name'),
				type : 'string'
			}, {
				dataIndex : 'evt_type',
				text : T('label.event_type'),
				type : 'string'
			}, {
				dataIndex : 'loc',
				text : T('label.location'),
				type : 'string'
			}, {
				dataIndex : 'rad',
				text : T('label.location_radius') + " (km)",
				type : 'float'					
			}, {
				dataIndex : 'evt_trg',
				text : T('label.event_trigger'),
				type : 'string'
			}, {
				dataIndex : 'dest',
				text : T('label.destination'),
				type : 'string'
			}, {
				dataIndex : 'type',
				text : T('label.type'),
				type : 'string'	
			}, {
				dataIndex : 'from_date',
				text : T('label.from_date'),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120
			}, {
				dataIndex : 'to_date',
				text : T('label.to_date'),
				xtype : 'datecolumn',
				format : F('date'),
				width : 120				
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
			title : T('title.alarm_details'),
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
				fieldLabel : T('label.name'),
				allowBlank : false
			},
			{
				xtype : 'codecombo',
				name : 'evt_type',
				group : 'AlarmEventType',
	            fieldLabel: T('label.event_type'),
				listeners : {
					change : function(combo, currentValue, beforeValue) {
						combo.up('form').down('fieldset').setVisible(currentValue == 'location');
					}
				}
	        },			
			{
	            xtype:'fieldset',
	            title: T('label.location'),
	            hidden : true,
	            layout: 'anchor',
	            defaults: {
	                anchor: '100%'
	            },
	            items :[{
	            	itemId : 'location_field',
					name : 'loc',
					fieldLabel : T('label.location'),
					xtype : 'combo',
					queryMode : 'local',
					store : 'LocationStore',
					displayField : 'name',
					valueField : 'name',
					allowBlank : false
	            },{
					name : 'rad',
					fieldLabel : T('label.location_radius') + " (km)",
					xtype : 'numberfield',
					minValue : 0,
					maxValue : 100,
					step : 0.5,
					allowBlank : false
	            }, {
					name : 'evt_trg',
					fieldLabel : T('label.event_trigger'),				
					xtype: 'radiogroup',
		            items: [
		                { boxLabel: 'In', name: 'evt_trg', inputValue: 'In' },
		                { boxLabel: 'Out', name: 'evt_trg', inputValue: 'Out' },
		                { boxLabel: 'In/Out', name: 'evt_trg', inputValue: 'In-Out' },
		            ],
		            allowBlank : false
	            }]
	        },			
	        {
				name : 'dest',
				fieldLabel : T('label.destination'),
				emptyText : T('msg.select_users'),
				allowBlank : false
			}, {
				xtype : 'codecombo',
				name : 'type',
				group : 'AlarmType',
	            fieldLabel: T('label.type'),
	            allowBlank : false
			},
			{
                xtype: 'container',
                layout: 'hbox',
                items: [{
    				name : 'period_always',
    				fieldLabel : T('label.period_always'),
    				xtype : 'checkboxfield',
    				flex : 1,
					checked : true,
					handler : function(checkbox, value) {
						var alarmView = checkbox.up('management_alarm');
						var alarmFromDate = alarmView.sub('alarm_from_date');
						var alarmToDate = alarmView.sub('alarm_to_date');
						alarmFromDate.setVisible(!value);
						alarmToDate.setVisible(!value);
					}
                },
                {
                	itemId : 'alarm_from_date',
    				name : 'from_date',
    				fieldLabel : T('label.from_date'),
    				xtype : 'datefield',
    				margin : '0 30 0 0',
    				flex : 1,
    				hidden : true
                }, {
                	itemId : 'alarm_to_date',
    				name : 'to_date',
    				fieldLabel : T('label.to_date'),
    				xtype : 'datefield',
    				flex : 1,
    				hidden : true
                }]
            },
            {
				xtype: 'htmleditor',
	            name: 'msg',
	            fieldLabel: T('label.message'),
	            height: 200,
				allowBlank : false
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