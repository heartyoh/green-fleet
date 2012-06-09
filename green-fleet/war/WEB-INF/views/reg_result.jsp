<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<link rel="stylesheet" href="/static/css/gae.css" type="text/css" />
<title>Registration Completed!</title>
</head>
<body>
<h1 align="center"><%= "true".equalsIgnoreCase(request.getParameter("error")) ? "Failed" : "Succeeded" %> to register</h1>
<div id="content">
<p>
<% if("true".equalsIgnoreCase(request.getParameter("error"))) { %>
An error occurred during processing! <br/>
<%= "company_not_exit".equalsIgnoreCase(request.getParameter("message")) ? "Company [" + request.getParameter("company") + "] not exit! please check company id that you input!" : "" %>
<%= "user_already_exit".equalsIgnoreCase(request.getParameter("message")) ? "User [" + request.getParameter("email") + "] already exist!" : "" %>
<% } else { %>
When processing is complete, e-mail is sent back to <%= request.getParameter("email") %>. <br/>
Thank you.
<% } %>
</p>
</div>
</body>
</html>
