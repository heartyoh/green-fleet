<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<link rel="stylesheet" href="/static/css/gae.css" type="text/css" />
<link rel="stylesheet" href="resources/css/greenfleet.css" type="text/css" />
<title>Registration</title>
</head>
<body class="userRegistration">
<div id="content" class="content">
<p>
<span>GreenFleet</span>Welcome to the GreenFleet application, <b><sec:authentication property="principal.name" /></b>.<br/>
Please enter your user registration details following.
</p>

<form id="register" method="post">
  	<fieldset>
  		<label>Company </label>
  		<input name="company" type="text"/> <br />

  		<label>Name </label>
  		<input name="name"  type="text"/> <br />
  		
  		<label>Email </label>
  		<input name="email" disabled = "disabled" type="text" value="<%= request.getAttribute("email") %>"/> <br />
  		
  		<label>Phone </label>
  		<input name="phoneNo"  type="text"/> <br />  		

  		<label>Admin </label>
  		<input type="checkbox" name="admin"/> <br />
  		
  		<input type="hidden" name="prodEnv" value="<%= request.getAttribute("prodEnv") %>"/> <br />
  		
  		<label>Language </label>
		<select name="language">
			<option value="en" selected="selected">English</option> 
			<option value="ko">Korean</option> 
		</select>
	</fieldset>
	<input type="submit" value="Register" class="btnRegister">
</form>
</div>
</body>
</html>
