Ext.Loader.setConfig({
	enabled : true,
	paths : {
		'GreenFleet' : 'app'
	}
});

Ext.define('GreenFleet', {
	singleton : true,
	mixins : {
		msg : 'GreenFleet.mixin.Msg',
		user : 'GreenFleet.mixin.User',
		mixin : 'GreenFleet.mixin.Mixin',
		ui : 'GreenFleet.mixin.UI',
		state : 'GreenFleet.mixin.State',
		subitem : 'GreenFleet.mixin.SubItem',
		util : 'GreenFleet.mixin.Import'
	}
});

var console = console || {
	log : function() {
	},
	trace : function() {
	}
};

Ext.require('GreenFleet.view.Viewport');

Ext.onReady(function() {
	Ext.application({
		name : 'GreenFleet',
		autoCreateViewport : false,

		controllers : [ 'GreenFleet.controller.ApplicationController', 'GreenFleet.controller.FileController' ],

		launch : function() {
			Ext.create('GreenFleet.view.Viewport').show();
		}
	});
});
