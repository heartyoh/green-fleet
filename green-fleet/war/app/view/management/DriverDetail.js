Ext.define('GreenFleet.view.management.DriverDetail', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_driver_detail',

	title : T('title.driver_details'),

	layout : {
		align : 'stretch',
		type : 'vbox'
	},	
	
	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		this.add(this.driverForm());		
	},
	
	/**
	 * 운전자 상세 페이지 리프레쉬 
	 */	
	refresh : function(driverId, driverName) {
		// driverId 값이 없거나 이전에 선택한 driverId와 현재 선택된 driverId가 같다면 skip 
		if(!driverId || driverId == '' || driverId == this.driver)
			return;
		
		var self = this;
		this.driver = driverId;		
		this.formSetReadOnly(true);
		
		Ext.Ajax.request({
			url : 'driver/find',
			method : 'GET',
			params : {
				id : driverId
			},
			success : function(response, opts) {
				var record = Ext.JSON.decode(response.responseText);
				var newRecord = {};
				newRecord.data = {};
				newRecord.data = record;
				self.sub('form').loadRecord(newRecord);
			},
			failure : function(response, opts) {
				Ext.Msg.alert(T('label.failure'), response.responseText);
			}
		});		
	},
	
	driverForm : function() {
		return {
		xtype : 'panel',
		itemId : 'details',
		bodyPadding : 10,
		cls : 'hIndexbar',
		title : T('title.driver_details'),
		layout : {
			type : 'hbox',
			align : 'stretch'	
		},
		flex : 1,
		items : [ {
			xtype : 'form',
			itemId : 'form',
			autoScroll : true,
			bodyPadding : 10,
			flex : 8,
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
				itemId : 'driver_id',
				fieldLabel : T('label.id'),
				allowBlank: false,
				afterLabelTextTpl: window.required
			}, {
				name : 'name',
				fieldLabel : T('label.name'),
				allowBlank: false,
				afterLabelTextTpl: window.required
			}, {
				xtype : 'codecombo',
				name : 'division',
				group : 'Division',
				fieldLabel : T('label.division')
			}, {
				xtype : 'codecombo',
				name : 'title',
				group : 'EmployeeTitle',
				fieldLabel : T('label.title')
			}, {
				name : 'social_id',
				fieldLabel : T('label.social_id')
			}, {
				name : 'phone_no_1',
				fieldLabel : T('label.phone_x', {x : 1})
			}, {
				name : 'phone_no_2',
				fieldLabel : T('label.phone_x', {x : 2})
			}, {
				name : 'total_distance',
				itemId : 'driver_total_distance',
				fieldLabel : T('label.total_distance'),
				readOnly : true
			}, {
				name : 'total_run_time',
				itemId : 'driver_total_runtime',
				fieldLabel : T('label.total_run_time'),
				readOnly : true
			}, {
				name : 'avg_effcc',
				itemId : 'driver_avg_effcc',
				fieldLabel : T('label.avg_effcc'),
				readOnly : true
			}, {
				name : 'eco_index',
				itemId : 'driver_eco_index',
				fieldLabel : T('label.eco_index'),
				readOnly : true
			}, {
				name : 'eco_run_rate',
				itemId : 'driver_eco_run_rate',
				fieldLabel : T('label.eco_run_rate'),
				readOnly : true
			}, {
				xtype : 'filefield',
				name : 'image_file',
				fieldLabel : T('label.image_upload'),
				msgTarget : 'side',
				allowBlank : true,
				buttonText : T('button.file')
			}, {
				xtype : 'displayfield',
				name : 'image_clip',
				itemId : 'image_clip',
				hidden : true
			} ]
		} ],
		
		dockedItems : [ {
			xtype : 'entity_form_buttons',
			loader : {
				fn : function(callback) {
					var driverStore = Ext.getStore('DriverBriefStore');
					driverStore.load(callback);
				},
				resetFn : function(callback) {
					this.formSetReadOnly(false);
				},
				scope : this
			}
		} ]
		}
	},
	
	formSetReadOnly : function(mode) {
		this.sub('driver_id').setReadOnly(mode);
	}
});