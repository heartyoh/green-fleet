Ext.define('GreenFleet.view.common.UserSelector', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.user_selector',
	
	selector_label : 'Select User',

	layout : {
		align : 'stretch',
		type : 'vbox'
	},
	
	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		var store = Ext.getStore('UserStore');
		this.add({
            xtype: 'itemselector',
            name: 'itemselector',
            id: 'itemselector-field',
            anchor: '100%',
            fieldLabel: this.selector_label,
            store: store,
            displayField: 'name',
            valueField: 'email',
            allowBlank: false,
            msgTarget: 'side'
        });
		store.load();
	}
});
