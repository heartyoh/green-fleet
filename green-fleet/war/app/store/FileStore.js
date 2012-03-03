Ext.define('GreenFleet.store.FileStore', {
	extend : 'Ext.data.Store',
	
	storeId : 'filestore',
	
	model: 'GreenFleet.model.File',
    
	proxy: {
        type: 'ajax',
        url : '/data/files.json',
        reader: {
			type : 'json',
			root : 'items',
			totalProperty : 'total'
        }
    },
    
    autoLoad: false
});