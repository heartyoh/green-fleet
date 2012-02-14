Ext.define('GreenFleet.mixin.Import', function() {
	function importFile() {
		var contentContainer = Ext.getCmp('content');
		var view = contentContainer.getLayout().getActiveItem();
		if (view.importUrl) {
			Ext.create('GreenFleet.view.common.ImportPopup', {
				importUrl : view.importUrl,
				client : view,
				title : 'Import'
			}).show();
		}
	}
	
	function uploadIncidentLog() {
		Ext.create('GreenFleet.view.common.ImportPopup', {
			importUrl : 'incident/upload_log',
			title : 'Upload Incident Log'
		}).show();
	}

	function uploadIncidentVideo() {
		Ext.create('GreenFleet.view.common.ImportPopup', {
			importUrl : 'incident/upload_video',
			title : 'Upload Incident Video'
		}).show();
	}

	return {
		importData : importFile,
		uploadIncidentLog : uploadIncidentLog,
		uploadIncidentVideo : uploadIncidentVideo
	};
}());