<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreService" %>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreServiceFactory" %>

<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<% BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService(); %>

<html lang='en'>
	<head>
		<title>Green Fleet</title>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />

		<link rel="stylesheet" href="resources/css/ext-greenfleet.css"></link>
		<link rel="stylesheet" href="resources/css/greenfleet.css"></link>
		
		<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&region=KR"></script>
		<script src="lib/uploader/fileuploader.js"></script>
		
		<script>
		var login = {
			username : '<sec:authentication property="principal.nickname"/>',
			company : '<sec:authentication property="principal.company"/>'
		};
		
		var uploadUrl = '<%= blobstoreService.createUploadUrl("/upload") %>';
		</script>
		
		<script src="ext-all.js"></script>
		<script src="app-all.js"></script> 

	</head>
	<body>
	</body>
	<body>
	</body>
</html>
