Ext.define('GreenFleet.view.management.VehicleConsumables', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_consumables',

	title : T('title.vehicle_consumables'),
	
	layout : {
		align : 'stretch',
		type : 'vbox'
	},	
	
	initComponent : function() {
		var self = this;		
		this.callParent(arguments);
		this.add(this.consumablegrid);
		this.sub('edit_consumables_grid').on('edit', function(editor, e) {
			var record = e.record.data;
			self.save(record);
		});		
	},	
	
	/**
	 * 차량 소모품 기준 정보 페이지 리프레쉬  
	 */
	refresh : function(vehicleId, regNo) {
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
		
		this.vehicle = vehicleId;
		this.setPanelTitle(regNo);
		var store = this.sub('edit_consumables_grid').store; 
		store.getProxy().extraParams.vehicle_id = vehicleId;
		store.load();		
	},
	
	/**
	 * panel title을 설정 
	 */
	setPanelTitle : function(name) {
		var title = T('title.vehicle_consumables') + ' (' + name + ')';
		this.sub('edit_consumables_grid').setTitle(title);
	},	
	
	save : function(record) {
		Ext.Ajax.request({
		    url: '/vehicle_consumable/save',
		    method : 'POST',
		    params: {
		    	key : record.key,
		        vehicle_id : record.vehicle_id,
		        consumable_item : record.consumable_item,
		        repl_unit : record.repl_unit,
		        repl_mileage : record.repl_mileage,
		        repl_time : record.repl_time,
		        last_repl_date : record.last_repl_date,
		        miles_last_repl : record.miles_last_repl,
		        next_repl_mileage : record.next_repl_mileage,
		        next_repl_date : record.next_repl_date,			        	
		        mode : 'updateMaster'
		    },
		    success: function(response) {
		        var resultObj = Ext.JSON.decode(response.responseText);
		        if(resultObj.success) {
			        GreenFleet.msg(T('label.success'), resultObj.key);
		        } else {
		        	Ext.MessageBox.alert(T('label.failure'), resultObj.msg);
		        }
		    },
		    failure: function(response) {
		    	Ext.MessageBox.alert(T('label.failure'), response.responseText);
		    }
		});	
	},
	
	consumablegrid : {
		xtype : 'gridpanel',
		bodyPadding : 10,
		cls : 'hIndexbar',
		flex : 1,
    	itemId : 'edit_consumables_grid',		
        title: T('title.vehicle_consumables'),	        
        store: 'VehicleConsumableStore',
        plugins: [ Ext.create('Ext.grid.plugin.RowEditing', {
	        clicksToMoveEditor: 1,
	        autoCancel: true
	    }) ],
        vehicleId : '',
        columns: [{
        	header : 'Key',
        	dataIndex : 'key',
        	hidden : true
        }, {
        	header : 'Vehicle',
        	dataIndex : 'vehicle_id',
        	hidden : true
        }, {
        	header: T('label.consumable_item'),
        	dataIndex: 'consumable_item'	
        }, {
        	header: T('label.repl_unit'),
        	dataIndex: 'repl_unit',
        	width: 100,
        	editor: {
        		xtype : 'codecombo',
        		allowBlank: false,
        		name : 'repl_unit',
        		group : 'ReplacementUnit'
        	}
        }, {
        	xtype: 'numbercolumn',
        	header: T('label.repl_mileage') + '(km)',
        	dataIndex: 'repl_mileage',
        	width: 105,
        	editor: {
                xtype: 'numberfield',
                allowBlank: false,
                minValue: 0,
                maxValue: 500000,
                step : 1000
            }	        	
        }, {
            xtype: 'numbercolumn',
            header: T('label.repl_time') + T('label.parentheses_month'),
            dataIndex: 'repl_time',
            width: 105,
            editor: {
                xtype: 'numberfield',
                allowBlank: false,
                minValue: 0,
                maxValue: 120
            }
        }]
	}
});