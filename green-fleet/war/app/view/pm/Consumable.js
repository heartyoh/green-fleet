Ext.define('GreenFleet.view.pm.Consumable', {
	extend : 'Ext.Container',

	alias : 'widget.pm_consumable',

	title : 'Consumables',

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
			html : '<div class="listTitle">Consumables Management</div>'
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
			title : 'Vehicle List',
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
				text : 'Id',
				width : 100
			}, {
				dataIndex : 'registration_number',
				text : 'Reg. Number',
				width : 160
			} ]
		}
	},

	zvehicleinfo : {
		xtype : 'form',
		itemId : 'form',
		cls : 'hIndexbarZero',
		bodyCls : 'paddingAll10',
		title : 'Vehicle Information',
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
				fieldLabel : 'ID',
				name : 'id'
			}, {
				fieldLabel : 'Reg. Number',
				name : 'registration_number'
			}, {
				fieldLabel : 'Manufacturer',
				name : 'manufacturer'
			} ]
		}, {
			xtype : 'panel',
			flex : 1,
			defaultType : 'textfield',
			items : [ {
				fieldLabel : 'Type',
				name : 'vehicle_type'
			}, {
				fieldLabel : 'Total Dist.',
				name : 'total_distance'
			}, {
				fieldLabel : 'Birth Year',
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
			header : 'Item',
			dataIndex : 'item'
		}, {
			header : 'Recent Replacement',
			dataIndex : 'recent_date'
		}, {
			header : 'Running Dist.',
			dataIndex : 'running_qty'
		}, {
			header : 'Replacement Dist.',
			dataIndex : 'threshold'
		}, {
			header : 'Health Rate',
			dataIndex : 'healthy',
			xtype : 'progresscolumn'
		}, {
			header : 'state',
			dataIndex : 'status'
		}, {
			header : 'Description',
			dataIndex : 'desc',
			flex : 1
		} ]
	},

	zmainthistory : {
		xtype : 'panel',
		autoScroll:true,
		title : 'Maint. History',
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