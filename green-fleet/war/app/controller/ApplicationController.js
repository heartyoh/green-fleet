Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller',

	requires : [ 'GreenFleet.store.IncidentLogChartStore', 'GreenFleet.view.management.Profile', 'GreenFleet.view.common.ImportPopup' ],

	stores : [ 'CompanyStore', 'UserStore', 'CodeGroupStore', 'CodeStore', 'VehicleStore', 'VehicleMapStore', 
	           'VehicleFilteredStore', 'VehicleInfoStore', 'VehicleBriefStore', 'DriverStore', 'DriverBriefStore', 
	           'ReservationStore', 'IncidentStore', 'IncidentByVehicleStore', 'IncidentViewStore', 'IncidentLogStore', 
	           'TrackStore', 'VehicleTypeStore', 'OwnershipStore', 'VehicleStatusStore', 'CheckinDataStore', 
	           'TrackByVehicleStore', 'RecentIncidentStore', 'TerminalStore', 'TerminalBriefStore', 'TimeZoneStore', 
	           'LanguageCodeStore', 'VehicleGroupStore', 'VehicleRelationStore', 'VehicleByGroupStore', 
	           'VehicleImageBriefStore', 'ConsumableCodeStore', 'VehicleConsumableStore', 'ConsumableHistoryStore', 
	           'RepairStore', 'VehicleByHealthStore', 'DashboardConsumableStore', 'DashboardVehicleStore', 
	           'LocationStore', 'AlarmStore', 'VehicleRunStore', 'DriverRunStore', 'DriverSpeedStore' ],

	models : [ 'Code' ],

	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 
	          'SideMenu', 'management.Company', 'management.User', 'management.Code', 'management.VehicleGroup', 
	          'management.ConsumableCode', 'management.Vehicle', 'management.Terminal', 'management.Reservation', 
	          'management.Incident', 'management.Driver', 'management.Track', 'management.CheckinData', 
	          'monitor.Map', 'monitor.CheckinByVehicle', 'monitor.InfoByVehicle', 'monitor.Information', 
	          'monitor.IncidentView', 'common.CodeCombo', 'form.TimeZoneCombo', 'form.DateTimeField', 
	          'form.SearchField', 'common.EntityFormButtons', 'dashboard.VehicleHealth', 'dashboard.ConsumableHealth', 
	          'pm.Consumable', 'common.ProgressColumn', 'management.VehicleConsumableGrid', 'form.RepairForm', 
	          'management.Location', 'management.Alarm', 'management.VehicleRunStatus', 'management.DriverRunStatus',
	          'management.DriverSpeedSection' ],

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
