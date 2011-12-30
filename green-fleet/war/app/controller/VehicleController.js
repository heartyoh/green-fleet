Ext.define('GreenFleet.controller.VehicleController', {
	extend : 'Ext.app.Controller',

	stores : [ 'ManufacturerStore', 'VehicleTypeStore' , 'OwnershipStore', 'VehicleStatusStore', 'ControlDataStore'],
	models : [],
	views : [ 'vehicle.VehiclePopup' ],

	init : function() {
		this.control({
			'viewport' : {
				afterrender : this.onViewportRendered
			}
		});

		// GreenFleet.mixin('GreenFleet.mixin.Selector');
	},

	onViewportRendered : function() {
	}

});