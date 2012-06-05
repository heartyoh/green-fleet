Ext.define('GreenFleet.view.management.Schedule', {
	extend : 'Ext.container.Container',

	alias : 'widget.management_schedule',

	title : T('titla.schedule'),

	entityUrl : 'task',

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
		eventStore.autoSync = true;
		eventStore.load();
		var calendar = Ext.create('Extensible.calendar.CalendarPanel', {
			calendarStore : calendarStore,
	        eventStore: eventStore,
	        flex : 1,
	        listeners: {
	            'eventadd': {
	                fn: function(cp, rec) {	                	
	                	//cp.store.load();
	                	//GreenFleet.msg(T('label.success'), "Start : " + cp.viewStart.toString());
	                	//GreenFleet.msg(T('label.success'), "End : " + cp.viewEnd.toString());
	                },
	                scope: this
	            },
	            'eventupdate': {
	                fn: function(cp, rec) {
	                	//cp.store.load();	                	
	                },
	                scope: this
	            },
	            'eventdelete': {
	                fn: function(cp, rec) {
	                	//cp.store.load();
	                },
	                scope: this
	            }
	        }	        
	    });		
		return calendar;
	}
});