Ext.define('GreenFleet.view.management.Schedule', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_schedule',

	title : T('titla.alarm'),

	entityUrl : 'task',

	/*
	 * importUrl, afterImport config properties for Import util function
	 */
	importUrl : 'task/import',

	afterImport : function() {
		this.sub('grid').store.load();
		this.sub('form').getForm().reset();
	},

	layout : {
		align : 'stretch',
		type : 'vbox'
	},

	items : {
		html : "<div class='listTitle'>" + T('title.schedule') + "</div>"
	},

	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		var calendarPanel = this.buildCalendar(self);
		this.add(calendarPanel);
	},
	
	buildCalendar : function(main) {
		var calendarStore = Ext.getStore('CalendarStore');
		var eventStore = Ext.getStore('EventStore');
		eventStore.load();
		var calendar = Ext.create('Extensible.calendar.CalendarPanel', {
			calendarStore : calendarStore,
	        eventStore: eventStore,
	        width: 700,
	        height: 500
	    });				
		return calendar;
	}
});