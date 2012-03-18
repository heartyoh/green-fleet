<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreService" %>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreServiceFactory" %>

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> 
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		<title>Green Fleet</title>

		<link rel="stylesheet" href="resources/css/ext-greenfleet.css"></link>
		<link rel="stylesheet" href="resources/css/greenfleet.css"></link>
		
		<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&region=KR&language=KO"></script>
		<script src="lib/label/label.js"></script>
		<script src="lib/locale/locale.js"></script>
		
		<script>
		var login = {
			username : '<sec:authentication property="principal.email"/>',
			company : '<sec:authentication property="principal.company"/>',
			language : '<sec:authentication property="principal.language"/>'
		};
		
		var System = System || {};
		System.props = {
			lattitude : 37.55,
			longitude : 126.97
		};

		initLocalization(this);
		</script>

		<script src="resources/text/<sec:authentication property="principal.language"/>.js"></script>
		
		<script src="ext-all-dev.js"></script>

		<script src="app/application.js"></script>

	</head>
	<body>
	</body>
	<body>
	</body>
</html>
