Ext.define('GreenFleet.store.CompanyStore', {
    extend: 'Ext.data.Store',
    
    autoLoad: false,

    constructor: function(cfg) {
        var me = this;
        
        cfg = cfg || {};

        me.callParent([Ext.apply({
            proxy: {
                type: 'ajax',
                url: 'company',
                reader: {
                    type: 'json'
                }
            },
            fields: [
                {
                    name: 'id',
                    type: 'string'
                },
                {
                    name: 'name',
                    type: 'string'
                },
                {
                    dateFormat: 'YYYY-MM-DD',
                    name: 'createdAt',
                    type: 'date'
                },
                {
                    dateFormat: 'YYYY-MM-DD',
                    name: 'updaatedAt',
                    type: 'date'
                }
            ]
        }, cfg)]);
    }
});