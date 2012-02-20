Ext.define('GreenFleet.view.form.TimeZoneCombo', {
	extend : 'Ext.form.field.ComboBox',
	
	alias : 'widget.tzcombo',
	
	fieldLabel: 'Choose TimeZone',
	
    store: 'TimeZoneStore',
    
    queryMode: 'local',
    
    displayField: 'display',
    
    valueField: 'value'
});