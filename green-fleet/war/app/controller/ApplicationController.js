Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller',

	stores : [ 'CompanyStore', 'VehicleStore', 'DriverStore', 'ReservationStore', 'IncidentStore', 'TrackStore',
			'ManufacturerStore', 'VehicleTypeStore', 'OwnershipStore', 'VehicleStatusStore', 'ControlDataStore',
			'TrackByVehicleStore', 'RecentIncidentStore', 'TerminalStore' ],
	models : [],
	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 'SideMenu',
			'management.Company', 'management.Vehicle', 'management.Terminal', 'management.Reservation', 'management.Incident',
			'management.Driver', 'management.Track', 'management.ControlData', 'monitor.Map',
			'monitor.ControlByVehicle', 'monitor.InfoByVehicle', 'monitor.Information', 'monitor.IncidentView' ],

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