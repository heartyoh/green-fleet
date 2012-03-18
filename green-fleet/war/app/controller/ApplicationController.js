Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller',

	requires : [ 'GreenFleet.store.IncidentLogChartStore' ],

	stores : [ 'CompanyStore', 'UserStore', 'CodeGroupStore', 'CodeStore', 'VehicleStore', 'VehicleMapStore', 'VehicleFilteredStore',
			'VehicleInfoStore', 'VehicleBriefStore', 'DriverStore', 'DriverBriefStore', 'ReservationStore', 'IncidentStore',
			'IncidentByVehicleStore', 'IncidentViewStore', 'IncidentLogStore', 'TrackStore', 'VehicleTypeStore', 'OwnershipStore',
			'VehicleStatusStore', 'CheckinDataStore', 'TrackByVehicleStore', 'RecentIncidentStore', 'TerminalStore', 'TerminalBriefStore',
			'TimeZoneStore', 'ConsumableStore', 'LanguageCodeStore', 'VehicleGroupStore', 'VehicleRelationStore', 'VehicleByGroupStore',
			'VehicleImageBriefStore', /* 'LocaleStore', */'ConsumableCodeStore', 'VehicleConsumableStore', 'ConsumableChangeStore',
			'RepairStore' ],

	models : [ 'Code' ],

	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 'SideMenu', 'management.Company',
			'management.User', 'management.Code', 'management.VehicleGroup', 'management.ConsumableCode', 'management.Vehicle',
			'management.Terminal', 'management.Reservation', 'management.Incident', 'management.Driver', 'management.Track',
			'management.CheckinData', 'monitor.Map', 'monitor.CheckinByVehicle', 'monitor.InfoByVehicle', 'monitor.Information',
			'monitor.IncidentView', 'common.CodeCombo', 'form.TimeZoneCombo', 'form.DateTimeField', 'form.SearchField',
			'common.EntityFormButtons', 'dashboard.VehicleHealth', 'pm.Consumable', 'common.ProgressColumn',
			'management.VehicleConsumableGrid', 'management.Consumable', 'form.RepairForm' ],

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
