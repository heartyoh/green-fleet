<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<link rel="stylesheet" href="/static/css/gae.css" type="text/css" />
<title>Registration</title>
</head>
<body>
<div id="content">
<p>
Welcome to the GreenFleet application, <sec:authentication property="principal.name" />.
Please enter your registration details following.
</p>

<form id="register" method="post">
  	<fieldset>
  		<label>Company :</label>
  		<input name="company" /> <br />

  		<label>Name :</label>
  		<input name="name" /> <br />

  		<label>Language :</label>
		<select name="language">
			<option value="en" selected="selected">English</option> 
			<option value="ko">Korean</option> 
		</select> 

	</fieldset>
	<input type="submit" value="Register">
</form>
</body>
</div>
</html>
