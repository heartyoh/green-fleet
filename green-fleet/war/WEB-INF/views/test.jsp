<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ page import="com.google.appengine.api.blobstore.BlobstoreService" %>
<%@ page import="com.google.appengine.api.blobstore.BlobstoreServiceFactory" %>

<% BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService(); %>

<html lang='en'>
	<head>
		<title>Green Fleet</title>
		<link rel="stylesheet" href="resources/css/ext-all.css"></link>
		
		<script src="lib/uploader/fileuploader.js"></script>
		
		<script>
		var login = {
			username : 'ADMIN'
		};
		
		var uploadUrl = '<%= blobstoreService.createUploadUrl("/upload") %>';
		</script>
		
		<script src="ext-all-dev.js"></script>

		<script src="app/application.js"></script>

	</head>
	<body>
	</body>
	<body>
	</body>
</html>
