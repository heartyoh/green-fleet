Ext.define('GreenFleet.view.common.ImportPopup', {
	extend : 'Ext.window.Window',
	
	modal : true,
	
	width : 300,
	height : 200,
	
	items : [{
		xtype : 'form',
		items : [ {
			xtype : 'filefield',
			name : 'file',
			fieldLabel : 'Import(CSV)',
			msgTarget : 'side',
			buttonText : 'file...'
		} ]
	}, {
		xtype : 'button',
		text : 'Import',
		itemId : 'import'
	}],

	initComponent : function() {

		this.callParent(arguments);
		
		var self = this;
		var xform = this.down('form');
		this.down('button').on('click', function(button) {
			var form = xform.getForm();

			if (form.isValid()) {
				form.submit({
					url : self.importUrl,
					success : function(form, action) {
						if (self.client.afterImport instanceof Function)
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
