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
		text : 'Save',
		itemId : 'save'
	}, {
		text : 'Delete',
		itemId : 'delete'
	}, {
		text : 'Reset',
		itemId : 'reset'
	} ],
	
	initComponent : function() {
		this.callParent();
		
		var self = this;
		
		this.down('#save').on('click', function() {
			var client = self.up('[entityUrl]');
			var url = client.entityUrl;
				
			var form = client.sub('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : url + '/save',
					success : function(form, action) {
						var store = client.sub('grid').store;
						store.load(function() {
							form.loadRecord(store.findRecord('key', action.result.key));
						});
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result.msg);
					}
				});
			}
		});

		this.down('#delete').on('click', function() {
			var client = self.up('[entityUrl]');
			var url = client.entity_url;
				
			var form = client.sub('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : url + '/delete',
					success : function(form, action) {
						client.sub('grid').store.load();
						form.reset();
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result.msg);
					}
				});
			}
		});

		this.down('#reset').on('click', function() {
			var client = self.up('[entityUrl]');

			client.sub('form').getForm().reset();
		});

	}
});