/*
Copyright(c) 2011 HeartyOh.com
*/
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
		util : 'GreenFleet.mixin.Import',
		setting : 'GreenFleet.mixin.Setting'
	}
});

var console = console || {
	log : function() {
	},
	trace : function() {
	}
};

Ext.require(['GreenFleet.view.Viewport',
             'GreenFleet.controller.ApplicationController', 
             'GreenFleet.controller.MainController', 
             'GreenFleet.controller.FileController']);

Ext.onReady(function() {
	Ext.application({
		name : 'GreenFleet',
		autoCreateViewport : false,

		controllers : [ 
		'GreenFleet.controller.ApplicationController', 
		'GreenFleet.controller.FileController',
		'GreenFleet.controller.MainController'
		],

		launch : function() {
			Ext.create('GreenFleet.view.Viewport').show();
		}
	});
});



