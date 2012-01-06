Ext.define('GreenFleet.view.MainMenu', {
	extend : 'Ext.toolbar.Toolbar',
	cls : 'appMenu',
	alias : 'widget.main_menu',
	
	items : [{
		text : 'Vehicle'
	}, {
		text : 'Employees'
	}, {
		text : 'Allocation'
	}, {
		text : 'Incidents'
	}, {
		text : 'Maintenance'
	}, {
		text : 'Risk Assessment'
	}, {
		text : 'Purchase Order'
	}]
});