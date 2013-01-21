Ext.define('GreenFleet.view.common.EntityFormButtons', {
	extend : 'Ext.toolbar.Toolbar',
	
	alias : 'widget.entity_form_buttons',
	
	dock : 'bottom',
	
	layout : {
		align : 'middle',
		type : 'hbox'
	},
	
	items : [ {
		xtype : 'tbfill'
	}, {
		text : T('button.save'),
		itemId : 'save'
	}, {
		text : T('button.del'),
		itemId : 'delete'
	}, {
		text : T('button.reset'),
		itemId : 'reset'
	} ],
	
	confirmMsgSave : T('msg.confirm_save'),
	
	confirmMsgDelete : T('msg.confirm_delete'),
	
	initComponent : function() {
		this.callParent();
		
		var self = this;
		
		this.down('#save').on('click', function() {
			
			var client = self.up('[entityUrl]');
			var url = client.entityUrl;						
			var form = client.sub('form').getForm();
			
			if(form.isValid()) {
				Ext.MessageBox.show({
					title : T('title.confirmation'),
					buttons : Ext.MessageBox.YESNO,
					msg : self.confirmMsgSave,
					modal : true,
					fn : function(btn) {
					
						if(btn != 'yes') 
							return;

						if (form.isValid()) {
							form.submit({
								url : url + '/save',
								success : function(form, action) {
									if(self.loader && typeof(self.loader.fn) === 'function') {
										self.loader.fn.call(self.loader.scope || client, function(records) {
											var listGrid = client.sub('grid');
											if(listGrid && action.result.key) {
												var store = listGrid.store;
												form.loadRecord(store.findRecord('key', action.result.key));											
											}
										});
									}
								
									if(action.result.success)
										GreenFleet.msg(T('label.success'), T('msg.processed_successfully'));
									else
										Ext.Msg.alert(T('msg.failed_to_save'), action.result.msg);
								},
								failure : function(form, action) {
									Ext.Msg.alert(T('msg.failed_to_save'), action.result.msg);
								}
							});
						}					
					}
				});
			}else {
				Ext.Msg.alert(T('title.information'), T('msg.no_matching_data_found'));
			}
			
			
		});

		this.down('#delete').on('click', function() {
			
			var client = self.up('[entityUrl]');
			var url = client.entityUrl;				
			var form = client.sub('form').getForm();
			
			if(form.isValid()) {
				Ext.MessageBox.show({
					title : T('title.confirmation'),
					buttons : Ext.MessageBox.YESNO,
					msg : self.confirmMsgDelete,
					modal : true,
					fn : function(btn) {
					
						if(btn != 'yes') 
							return;
					
						if (form.isValid()) {
							form.submit({
								url : url + '/delete',
								success : function(form, action) {
									//client.sub('grid').store.load();
									if(self.loader && typeof(self.loader.fn) === 'function') {
										self.loader.fn.call(self.loader.scope || client, null);
									}
									form.reset();
								},
								failure : function(form, action) {
									Ext.Msg.alert(T('msg.failed_to_delete'), action.result.msg);
								}
							});
						}					
					}
				});
			}else {
				Ext.Msg.alert(T('title.information'), T('msg.none_selected'));
			}
						
		});

		this.down('#reset').on('click', function() {
			var client = self.up('[entityUrl]');
			client.sub('form').getForm().reset();
			if(self.loader && typeof(self.loader.resetFn) === 'function') {
				self.loader.resetFn.call(self.loader.scope || client, null);
			}
		});

	}
});