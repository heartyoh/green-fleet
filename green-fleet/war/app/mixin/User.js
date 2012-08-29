Ext.define('GreenFleet.mixin.User', function() {
	return {
		login : {
			key : login.key,
			company : login.company,
			email : login.email,
			id : login.username,
			name : login.username,
			language : login.language,
			grade : login.grade
		}
	};
}());