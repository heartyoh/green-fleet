Ext.define('GreenFleet.view.portlet.CalendarPortlet', {
	
	extend : 'Ext.panel.Panel',

	alias : 'widget.calendar_portlet',

	layout : {
		align : 'stretch',
		type : 'vbox'
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
	        flex : 1,
	        readOnly : true,
			showDayView : false,
			showMultiDayView : false,
			showMonthView : false,
			showMultiWeekView : false
	    });		
		return calendar;
	}
});