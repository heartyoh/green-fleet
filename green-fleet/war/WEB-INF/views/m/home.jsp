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

		<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&region=KR&language=KO"></script>
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
		
		<script src="resources/text/en.js"></script>
	    <script type="text/javascript">(function(h){function f(c,d){document.write('<meta name="'+c+'" content="'+d+'">')}if("undefined"===typeof g)var g=h.Ext={};g.blink=function(c){var d=c.js||[],c=c.css||[],b,e,a;f("viewport","width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no");f("apple-mobile-web-app-capable","yes");f("apple-touch-fullscreen","yes");for(b=0,e=c.length;b<e;b++)a=c[b],"string"!=typeof a&&(a=a.path),document.write('<link rel="stylesheet" href="'+a+'">');for(b=0,e=d.length;b<
e;b++)a=d[b],"string"!=typeof a&&(a=a.path),document.write('<script src="'+a+'"><\/script>')}})(this);
;Ext.blink({"id":"dd271e20-7992-11e1-937c-837dc7358984","js":[{"path":"sdk/sencha-touch-all.js","type":"js"},{"path":"sdk/touch-charts.js","type":"js"},{"path":"app.js","update":"delta","type":"js"}],"css":[{"path":"resources/css/app.css","update":"delta","type":"css"},{"path":"resources/css/HatioBB.css","update":"delta","type":"css"},{"path":"resources/css/touch-charts.css","update":"delta","type":"css"}]})</script>
	</head>
	<body>
	    <div id="appLoadingIndicator">
	        <div></div>
	        <div></div>
	        <div></div>
	    </div>
	</body>
</html>
