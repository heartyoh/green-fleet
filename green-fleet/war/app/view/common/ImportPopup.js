Ext.define('GreenFleet.view.common.ImportPopup', {
	extend : 'Ext.window.Window',
	
	modal : true,
	
	width : 350,
	height : 150,
	
	items : [{
		xtype : 'form',
		cls : 'paddingAll10',
		items : [ {
			xtype : 'filefield',
			name : 'file',
			fieldLabel : 'Import(CSV)',
			msgTarget : 'side',
			buttonText : 'file...'
		} ]
	}],
	
	buttons : [{
		text : 'Import',
		itemId : 'import'
	}, {
		text : 'Close',
		itemId : 'close'
	}],

	initComponent : function() {

		this.callParent(arguments);
		
		var self = this;
		
		this.down('[itemId=close]').on('click', function(button) {
			self.close();
		});
		
		this.down('[itemId=import]').on('click', function(button) {
			var form = self.down('form').getForm();

			if (form.isValid()) {
				form.submit({
					url : self.importUrl,
					success : function(form, action) {
						if (self.client && self.client.afterImport instanceof Function)
							self.client.afterImport();
						self.close();
					},
					failure : function(form, action) {
						GreenFleet.msg('Failed', action.result);
					}
				});
			}
		});
	}
});
