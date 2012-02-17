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
		
		this.items = [ {
			html : '<div class="listTitle">Consumables Management</div>'
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ this.zvehiclelist, {
				xtype : 'container',
				flex : 1,
				cls : 'borderRightGray',
				layout : {
					align : 'stretch',
					type : 'vbox'
				},
				items : [ this.zvehicleinfo, this.zconsumables, this.mainthistory ]
			} ]
		} ],
		
		this.callParent();
		
		
	},
	
	zvehiclelist : {
		xtype : 'gridpanel',
		itemId : 'vehicle_info',
		store : 'VehicleStore',
		title : 'Vehicle List',
		cls : 'hIndexbarZero',
		width : 320,
		tbar : [{
			xtype : 'combo'
		}, {
			xtype : 'fieldcontainer',
			defaultType : 'checkboxfield',
			items : [{
				boxLabel : 'Healthy',
                name : 'healthy',
                inputValue : '1',
                itemId : 'check_healthy'
			}, {
				boxLabel : 'Normal',
                name : 'normal',
                inputValue : '1',
                itemId : 'check_normal'
			}, {
				boxLabel : 'Impending',
                name : 'impending',
                inputValue : '1',
                itemId : 'check_impending'
			},{
				boxLabel : 'Overdue',
                name : 'overdue',
                inputValue : '1',
                itemId : 'check_overdue'
			}]
		}],
		columns : [ {
			dataIndex : 'healthy',
			width : 20
		}, {
			dataIndex : 'id',
			text : 'Id',
			width : 100
		}, {
			dataIndex : 'registration_number',
			text : 'Reg. Number',
			width : 220
		} ]
	},
	
	zvehicleinfo : {
		xtype : 'form',
		cls : 'hIndexbar',
		title : 'Vehicle Information',
		defaultType : 'textfield',
		items : [{
			fieldLabel : 'ID'
		}, {
			fieldLabel : 'Reg. Number'
		}, {
			fieldLabel : 'Driving Distance'
		}]
	},
	
	zconsumables : {
		title : 'Consumables',
		cls : 'hIndexbar',
		html : 'Consumables'
	},
	
	mainthistory : {
		title : 'Maint. History',
		cls : 'hIndexbar',
		html : 'Maint. History'
	}
});