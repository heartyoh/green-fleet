Ext.define('GreenFleet.mixin.User', function() {
	return {
		login : {
			key : login.key,
			email : login.email,
			id : login.username,
			name : login.username,
			language : login.language
		}
	};
}());