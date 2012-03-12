Ext.define('GreenFleet.view.pm.Consumable', {
	extend : 'Ext.Container',

	alias : 'widget.pm_consumable',

	title : T('title.consumables'),

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	initComponent : function() {
		var self = this;

		var consumables = Ext.create('Ext.data.Store', {
			fields : [ 'name', 'value' ],
			data : [ {
				name : 'Engine Oil',
				value : 'EngineOil'
			}, {
				name : 'Timing Belt',
				value : 'TimingBelt'
			}, {
				name : 'Spark Plug',
				value : 'SparkPlug'
			}, {
				name : 'Cooling Water',
				value : 'CoolingWater'
			}, {
				name : 'Brake Oil',
				value : 'BrakeOil'
			}, {
				name : 'Fuel Filter',
				value : 'FuelFilter'
			} ]
		});

		this.items = [ {
			html : "<div class='listTitle'>" + T('title.consumables_management') + "</div>"
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.zvehiclelist(self, consumables), {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.zvehicleinfo, this.zconsumables, this.zmainthistory ]
			} ]
		} ],

		this.callParent();

		this.sub('vehicle_info').on('itemclick', function(grid, record) {
			self.sub('form').loadRecord(record);
		});
	},

	zvehiclelist : function(self, consumables) {
		return {
			xtype : 'gridpanel',
			itemId : 'vehicle_info',
			store : 'VehicleStore',
			title : T('title.vehicle_list'),
			width : 300,
			tbar : [ {
				xtype : 'combo',
				itemId : 'consumables_combo',
				store : consumables,
				queryMode : 'local',
				displayField : 'name',
				valueField : 'value'
			}, {
				xtype : 'fieldcontainer',
				defaultType : 'checkboxfield',
				cls :'paddingLeft5',
				items : [ {
					cls : 'iconHealthH floatLeft',
					name : 'healthy',
					inputValue : '1',
					itemId : 'check_healthy',
					width:45
				}, {
//					boxLabel : 'Impending',
					cls : 'iconHealthI floatLeft',
					name : 'impending',
					inputValue : '1',
					itemId : 'check_impending',
					width:45
				}, {
//					boxLabel : 'Overdue',
					cls : 'iconHealthO floatLeft',
					name : 'overdue',
					inputValue : '1',
					itemId : 'check_overdue',
					width:45
				} ]
			} ],
			
			/*
			 * iconHealthH
			 * iconHealthI
			 * iconHealthO
			 */
			columns : [ {
				xtype:'templatecolumn',
				tpl:'<div class="iconHealthH" style="width:20px;height:20px;background-position:5px 3px"></div>',
				width : 35
			}, {
				dataIndex : 'id',
				text : T('label.id'),
				width : 100
			}, {
				dataIndex : 'registration_number',
				text : T('label.reg_no'),
				width : 160
			} ]
		}
	},

	zvehicleinfo : {
		xtype : 'form',
		itemId : 'form',
		cls : 'hIndexbarZero',
		bodyCls : 'paddingAll10',
		title : 'Consumable Parts',
		height : 122,
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		items : [ {
			xtype : 'panel',
			flex : 1,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : T('label.id'),
				name : 'id'
			}, {
				fieldLabel : T('label.reg_no'),
				name : 'registration_number'
			}, {
				fieldLabel : T('label.manufacturer'),
				name : 'manufacturer'
			} ]
		}, {
			xtype : 'panel',
			flex : 1,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : T('label.type'),
				name : 'vehicle_type'
			}, {
				fieldLabel : T('label.total_x', {x : T('label.dist')}),
				name : 'total_distance'
			}, {
				fieldLabel : T('label.birth_year'),
				name : 'birth_year'
			} ]
		} ]
	},

	zconsumables : {
		xtype : 'grid',
		store : 'ConsumableStore',
		cls : 'hIndexbar',
		flex : 1,
		columns : [ {
			header : T('label.item'),
			dataIndex : 'item'
		}, {
			header : T('label.recent_replacement'),
			dataIndex : 'recent_date'
		}, {
			header : T('label.running') + ' ' + T('label.dist'),
			dataIndex : 'running_qty'
		}, {
			header : T('label.replacement') + ' ' + T('label.dist'),
			dataIndex : 'threshold'
		}, {
			header : T('label.health_rate'),
			dataIndex : 'healthy',
			xtype : 'progresscolumn'
		}, {
			header : T('label.status'),
			dataIndex : 'status'
		}, {
			header : T('label.desc'),
			dataIndex : 'desc',
			flex : 1
		} ]
	},

	zmainthistory : {
		xtype : 'panel',
		autoScroll:true,
		title : T('title.maintenence_history'),
		flex : 1,
		cls : 'hIndexbar',
		layout : 'fit',
		html : '<div class="maintCell"><span>2011-11-16</span>Replaced Temperature Sensor</div>' 
			+ '<div class="maintCell"><span>2011-11-28</span>Replaced Timing Belt, Engine Oil, Spark Plug, Cooling Water, Brake Oil, Fuel Filter</div>'
//		items : [{
//			xtype : 'textarea',
//			value : '2011-11-16 Replaced Temperature Sensor\n' +
//			'2011-12-28 Replaced Timing Belt, Engine Oil, Spark Plug, Cooling Water, Brake Oil, Fuel Filter\n'
//		}]
	}
});
