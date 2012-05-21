<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreService" %>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreServiceFactory" %>

<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> 
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		<title>Green Fleet</title>

		<link rel="stylesheet" href="resources/css/ext-greenfleet.css"></link>
		<link rel="stylesheet" href="resources/css/greenfleet.css"/>
    	<link rel="stylesheet" href="resources/css/calendar-all.css" />
    	<link rel="stylesheet" href="resources/css/greenfleet-portal.css" />
		
		<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&region=KR&language=KO"></script>
		<script src="lib/label/label.js"></script>
		<script src="lib/locale/locale.js"></script>
		<!-- GAE Channel을 이용하려면 아래 주석 해제 -->
		<!--script src='/_ah/channel/jsapi'></script-->
		
		<script>
		var login = {
			key : '<sec:authentication property="principal.key"/>',
			email : '<sec:authentication property="principal.email"/>',
			username : '<sec:authentication property="principal.name"/>',
			company : '<sec:authentication property="principal.company"/>',
			locale : '<sec:authentication property="principal.language"/>'
		};
		
		var System = System || {};
		System.props = {
			lattitude : 37.55,
			longitude : 126.97
		};

		initLocalization(this);
		</script>
		
		<script src="resources/text/<sec:authentication property="principal.language"/>.js"></script>
		
		<script src="ext-all.js"></script>
		
		<script src="calendar-all.js"></script>

		<script src="app-all.js"></script>

	</head>
	<body>
	</body>
</html>
