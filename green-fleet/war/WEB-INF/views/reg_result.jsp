<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<link rel="stylesheet" href="/static/css/gae.css" type="text/css" />
	<link rel="stylesheet" href="resources/css/greenfleet.css" type="text/css" />
	<title>Registration Completed!</title>
</head>
<body class="userRegistration">

<%
	String title = "true".equalsIgnoreCase(request.getParameter("error")) ? "Failed to register!" : "Registration Completed!";
	String error = request.getParameter("error");
	String msg = request.getParameter("message");
	
	if("true".equalsIgnoreCase(error)) {
		if("company_not_exit".equalsIgnoreCase(msg)) {
			msg = "Company [" + request.getParameter("company") + "] not exit!<br/><br/> please check company id that you input!";
		} else if("user_already_exit".equalsIgnoreCase(msg)) {
			msg = "User [" + request.getParameter("email") + "] already exist!";
		} else if("user_already_registered".equalsIgnoreCase(msg)) {
			msg = "User [" + request.getParameter("email") + "] already registered <br/><br/> Your account will be available after approval!";
		}
	} else {
		msg = "Registration has been received.<br/><br/>";
		msg += "When processing is complete, e-mail is sent back to " + request.getParameter("email") + ". <br/><br/>";
		msg += "Thank you!";
	}
%>

	<div id="content" class="content">
		<p><span><%= title %></span></p>
		
		<label><br/><br/></label>
		
		<div><br/><%= msg %></div>
		
		<label><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/></label>
	</div>
</body>
</html>
