Ext.define('GreenFleet.mixin.Authority', function() {
	
	// 일반형 ==> tracking, 동영상
	var prohibitedViewsA = [
	  'management_vehicle_checkin', 
	  'management_vehicle_runstatus', 
	  'management_vehicle_speed', 
	  'management_driver_runstatus', 
	  'management_driver_speed', 
	  'dashboard_report', 
	  'reverseControl'
	];  
	
	// 표준형 ==> OBD 및 차트 
	var prohibitedViewsB = ['reverseControl']; 
	
	// 고급형 ==> 역관제
	var prohibitedViewsC = [];  
		
	function checkDisabled(xtype) {
		var views = null;
		var grade = GreenFleet.login.grade;
		
		if('A' == grade) {
			views = prohibitedViewsA;
		} else if('B' == grade) {
			views = prohibitedViewsB;
		} else if('C' == grade) {
			views = prohibitedViewsC;
		} else {
			views = null;
		}
		
		if(views == null)
			return true;
		else if(views.length == 0)
			return false;
		else
			return Ext.Array.contains(views, xtype);
	}

	return {
		checkDisabled : checkDisabled
	};
}());