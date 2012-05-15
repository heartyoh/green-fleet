Ext.define('GreenFleet.store.CalendarStore', {
	extend : 'Extensible.calendar.data.MemoryCalendarStore',

	storeId : 'calendar_store',
	
	autoLoad: true,
	
	data : {
        "calendars" : [{
            "id"    : 1,
            "title" : "Maintenence",
            "color" : 2
        },{
            "id"    : 2,
            "title" : "Consumables",
            "color" : 22
        },{
            "id"    : 3,
            "title" : "Reservation",
            "color" : 7
        },{
            "id"    : 4,
            "title" : "Task",
            "color" : 26
        }]
    }

});