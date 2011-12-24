Ext.define('GreenFleet.controller.ApplicationController', {
	extend : 'Ext.app.Controller',

	stores : [ 'CompanyStore', 'VehicleStore' ],
	models : [],
	views : [ 'company.Company', 'vehicle.Vehicle', 'map.Map' ],

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