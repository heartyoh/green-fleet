<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> 
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		<title>Green Fleet</title>

		<link rel="stylesheet" href="resources/css/ext-greenfleet.css"/>
		<link rel="stylesheet" href="resources/css/greenfleet.css"/>
		<link rel="stylesheet" href="resources/css/calendar-all.css" />
		<link rel="stylesheet" href="resources/css/greenfleet-portal.css" />
		
		<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&region=KR&language=KO"></script>
		<script src="lib/locale/locale.js"></script>
		<!-- GAE Channel을 이용하려면 아래 주석 해제 -->
		<!--script src='/_ah/channel/jsapi'></script-->
		
		<script>
		var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
		
		var login = {
			key : '<sec:authentication property="principal.key"/>',
			email : '<sec:authentication property="principal.email"/>',
			username : '<sec:authentication property="principal.name"/>',
			company : '<sec:authentication property="principal.company"/>',
			language : '<sec:authentication property="principal.language"/>',
			grade : '<sec:authentication property="principal.grade"/>'
		};
				
		var System = System || {};
		System.props = {
			lat : 37.55,
			lng : 126.97
		};

		initLocalization(this);
		</script>

		<script src="resources/text/<sec:authentication property="principal.language"/>.js"></script>
		
		<script src="ext-all-dev.js"></script>
		
		<script src="calendar-all-debug.js"></script>

		<script src="app/application.js"></script>

	</head>
	<body>
	</body>
</html>
