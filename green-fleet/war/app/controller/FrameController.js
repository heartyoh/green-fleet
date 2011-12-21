Ext.define('GreenFleet.controller.FrameController', {
	extend : 'Ext.app.Controller',

	stores : [],
	models : [],
	views : [ 'viewport.Center', 'viewport.North', 'viewport.West', 'Brand', 'MainMenu', 'SystemMenu' ],

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