Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller',

	stores : [ 'CompanyStore', 'UserStore', 'CodeGroupStore', 'CodeStore', 'VehicleStore', 'VehicleMapStore', 'VehicleFilteredStore',
			'DriverStore', 'ReservationStore', 'IncidentStore', 'IncidentLogStore', 'TrackStore', 'VehicleTypeStore', 'OwnershipStore',
			'VehicleStatusStore', 'CheckinDataStore', 'TrackByVehicleStore', 'RecentIncidentStore', 'TerminalStore', 'TimeZoneStore', 'ConsumableStore' ],
	models : [ 'Code' ],
	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 'SideMenu', 'management.Company',
			'management.User', 'management.Code', 'management.Vehicle', 'management.Terminal', 'management.Reservation',
			'management.Incident', 'management.Driver', 'management.Track', 'management.CheckinData', 'monitor.Map',
			'monitor.CheckinByVehicle', 'monitor.InfoByVehicle', 'monitor.Information', 'monitor.IncidentView', 'common.CodeCombo',
			'form.TimeZoneCombo', 'form.DateTimeField', 'form.SearchField', 'common.EntityFormButtons', 'dashboard.VehicleHealth',
			'pm.Consumable' ],

	init : function() {
		this.control({
			'viewport' : {
				afterrender : this.onViewportRendered
			}
		});
	},

	onViewportRendered : function() {
	}
});
