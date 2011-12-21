Ext.define('GreenFleet.view.file.FileUploader', {
	extend : 'Ext.form.Panel',

	items : [ {
		xtype : 'filefield',
		name : 'fileName',
		fieldLabel : 'file Upload',
		labelWidth : 50,
		msgTarget : 'side',
		allowBlank : false,
		anchor : '100%',
		buttonText : 'file...'
	} ],
	
    buttons: [{
        text: 'Upload',
        handler: function() {
            var form = this.up('form').getForm();
            if(form.isValid()){
                form.submit({
                    url: uploadUrl,
                    waitMsg: 'Uploading your file...',
                    success: function(form, result) {
                    	Ext.getStore('GreenFleet.store.FileStore').load();
//                        GreenFleet.msg('Success', 'Your file "' + result + '" has been uploaded.');
                    }
                });
            }
        }
    }]
});