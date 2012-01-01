Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller',

	stores : [ 'CompanyStore', 'VehicleStore', 'DriverStore', 'ReservationStore', 'IncidentStore', 'TrackStore' ],
	models : [],
	views : [ 'company.Company', 'vehicle.Vehicle', 'vehicle.Reservation', 'vehicle.Incident', 'driver.Driver',
			'map.Map', 'vehicle.Track', 'vehicle.ControlData', 'vehicle.ControlByVehicle', 'vehicle.InfoByVehicle', 'vehicle.Information' ],

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