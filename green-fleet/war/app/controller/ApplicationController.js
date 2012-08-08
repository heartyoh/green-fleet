Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller', 

	requires : [ 'GreenFleet.store.IncidentLogChartStore', 'GreenFleet.view.management.Profile', 'GreenFleet.view.common.ImportPopup' ],

	stores : [ 'CompanyStore', 'UserStore', 'CodeGroupStore', 'CodeStore', 'VehicleStore', 'VehicleMapStore', 
	           'VehicleFilteredStore', 'VehicleInfoStore', 'VehicleBriefStore', 'DriverStore', 'DriverBriefStore', 
	           'ReservationStore', 'IncidentStore', 'IncidentByVehicleStore', 'IncidentViewStore', 'IncidentLogStore', 
	           'TrackStore', 'VehicleTypeStore', 'OwnershipStore', 'VehicleStatusStore', 'CheckinDataStore', 
	           'TrackByVehicleStore', 'RecentIncidentStore', 'TerminalStore', 'TerminalBriefStore', 'TimeZoneStore', 
	           'LanguageCodeStore', 'VehicleGroupStore', 'VehicleByGroupStore', 'VehicleImageBriefStore', 
	           'ConsumableCodeStore', 'VehicleConsumableStore', 'ConsumableHistoryStore', 'RepairStore', 
	           'VehicleByHealthStore', 'DashboardConsumableStore', 'DashboardVehicleStore', 'LocationStore', 'AlarmStore', 
	           'VehicleRunStore', 'DriverRunStore', 'DriverSpeedStore', 'YearStore', 'MonthStore', 'DriverGroupStore', 
	           'DriverByGroupStore', 'VehicleGroupCountStore', 'CalendarStore', 'EventStore', 'ReportStore', 'VehicleSpeedStore' ],

	models : [ 'Code' ],

	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'viewport.East', 'Brand', 'MainMenu', 'SideMenu',
	          'common.CodeCombo', 'form.TimeZoneCombo', 'form.DateTimeField', 'common.EntityFormButtons', 
	          'common.ProgressColumn', 'common.MultiSelect', 'common.ItemSelector', 'common.UserSelector',
	          'form.SearchField', 'form.RepairForm', 'overview.Overview', 'pm.Consumable', 'pm.Maintenance',
	          'monitor.Map', 'monitor.InfoByVehicle', 'monitor.Information', 'monitor.IncidentView', 	          
	          'management.Company', 'management.User', 'management.Code', 'management.ConsumableCode', 'management.VehicleGroup',  
	          'management.DriverGroup', 'management.Location', 'management.Alarm', 'management.Report', 
	          'management.Vehicle', 'management.VehicleOverview', 'management.VehicleDetail', 'management.VehicleConsumables', 
	          'management.VehicleIncident', 'management.VehicleTrack', 'management.VehicleCheckin', 
	          'management.VehicleRunStatus', 'management.VehicleSpeedSection', 
	          'management.Driver',  'management.DriverDetail', 'management.DriverRunStatus', 'management.DriverSpeedSection',  
	          'management.Terminal', 'management.Reservation', 'management.Schedule',
	          'dashboard.Reports', 'dashboard.VehicleHealth', 'dashboard.ConsumableHealth', 
	          'dashboard.VehicleRunningSummary', 'dashboard.DriverRunningSummary', 'dashboard.Mttr', 'dashboard.Mtbf', 
	          'dashboard.EfficiencyTrend', 'dashboard.MaintTrend', 'dashboard.EcoDrivingTrend', 'dashboard.DrivingTrend', 
	          'dashboard.Co2emssEcoindex', 'dashboard.EffccConsumption', 'dashboard.ConsumptionEcoindex', 'dashboard.HabitEcoindex',  
	          'portlet.Portlet', 'portlet.PortalPanel', 'portlet.PortalColumn', 'portlet.PortalDropZone', 'portlet.GridI1Portlet', 
	          'portlet.GridVG1Portlet', 'portlet.GridDG1Portlet', 'portlet.ChartV1Portlet', 'portlet.CalendarPortlet', 
	          'portlet.GridC1Portlet',  'portlet.GridM1Portlet', 'portlet.ChartF1Portlet' ],

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
