Ext.create('Ext.data.Store', {
    id:'menustore',

    fields : [{
    	name : 'text'
    }],

	data : [ {
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
	} ],

});

//Ext.define('GreenFleet.view.MainMenu', {
//	extend : 'Ext.view.View',
//
//	alias : 'widget.main_menu',
//	
//	store : Ext.data.StoreManager.lookup('menustore'),
//
//	itemSelector : 'div.mainmenu',
//	
//	tpl : '<tpl for="."><div class="mainmenu"><span>{text}</span></div></tpl>'
//
//});

Ext.define('GreenFleet.view.MainMenu', {
	extend : 'Ext.toolbar.Toolbar',

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