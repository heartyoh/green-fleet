<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@page session="false" %>
<%@page import="com.google.appengine.api.users.UserServiceFactory" %>

<html>
  <head>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<link rel="stylesheet" href="/static/css/gae.css" type="text/css" />
	<link rel="stylesheet" href="resources/css/greenfleet.css" type="text/css" />
	<title>Disabled Account</title>
  </head>
  <body class="userRegistration">
  	<div id="content" class="content">
  		<p><span>GreenFleet User : <%= UserServiceFactory.getUserService().getCurrentUser().getEmail() %></span>
  		To login click on below link<br/>  		
  		</p>
  		
  		<label><br/><br/></label>
  		<div><a href="<%= UserServiceFactory.getUserService().createLoginURL("/") %>">Please log in to proceed</a></div><br/>
  		<div></div><br/>
  		<label><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/></label>
  	</div>
  </body>

</html>