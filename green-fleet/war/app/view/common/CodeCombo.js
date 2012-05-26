Ext.define('GreenFleet.view.common.CodeCombo', {
	extend : 'Ext.form.field.ComboBox',

	alias : 'widget.codecombo',
	
	queryMode : 'local',
	
	displayField: 'code',
	
	matchFieldWidth : false,

    typeAhead: true,
    
    emptyText : 'Alt+Q',
    
	group : 'V-Maker',
	
    initComponent : function() {
    	this.store = Ext.getStore('CodeStore').substore(this.group);
    	this.emptyText = this.fieldLabel;
    	this.callParent();
    },
	
	listConfig : {
		getInnerTpl : function() {
			return '<div class="codelist"><span class="code">{code}</span> ({desc})</div>'; 
		}, 
		minWidth : 200
	}
});
