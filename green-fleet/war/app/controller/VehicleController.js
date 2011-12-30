Ext.define('GreenFleet.controller.VehicleController', {
	extend : 'Ext.app.Controller',

	stores : [ 'ManufacturerStore', 'VehicleTypeStore' , 'OwnershipStore'],
	models : [],
	views : [ 'vehicle.OBDCollector' ],

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