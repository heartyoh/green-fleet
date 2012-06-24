<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@ page import="java.util.List" %>
<%@ page import="com.google.appengine.api.datastore.Entity" %>
<%@ page import="java.util.Date" %>
<%@ page import="com.heartyoh.util.GreenFleetConstant" %>
<%@ page import="com.heartyoh.util.DataUtils" %>
<%@ page import="com.google.appengine.api.datastore.KeyFactory" %>

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> 
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		<title>Green Fleet Administrator</title>

		<link rel="stylesheet" href="resources/css/ext-greenfleet.css"/>
		<link rel="stylesheet" href="resources/css/greenfleet.css"/>
		
		<script src="lib/locale/locale.js"></script>
		
		<script>
		var login = {
			key : '<sec:authentication property="principal.key"/>',
			email : '<sec:authentication property="principal.email"/>',
			username : '<sec:authentication property="principal.name"/>',
			company : '<sec:authentication property="principal.company"/>',
			language : '<sec:authentication property="principal.language"/>'
		};
		
	 	function onCompanySelected(row) {
	 		var form = document.forms[0];
	 		form.key.value = row.id;
	 		form.id.value = row.cells[0].innerText;
	 		form.name.value = row.cells[1].innerText;
	 		form.desc.value = row.cells[2].innerText;
	 		form.timezone.value = row.cells[3].innerText;
	 		form.language.value = row.cells[4].innerText;
	 		form.lat.value = row.cells[5].innerText;
	 		form.lng.value = row.cells[6].innerText;
	 	}
	 	
	 	function onNewClicked() {
	 		var form = document.forms[0];
	 		form.id.value = "";
	 		form.name.value = "";
	 		form.desc.value = "";
	 		form.timezone.value = "0";
	 		form.language.value = "en";
	 		form.lat.value = "";
	 		form.lng.value = "";	 		
	 	}
	 	
		var System = System || {};
		System.props = {
			lat : 37.55,
			lng : 126.97
		};

		initLocalization(this);	 	
		</script>

		<script src="resources/text/<sec:authentication property="principal.language"/>.js"></script>		
	</head>
	
	<body>
		<h1 align="center">Green Fleet Administrator</h1>
		<br/>
		<% List<Entity> companies = (List<Entity>)request.getAttribute("companies"); %>
		<h4>Company List (total <%= companies.size() %>)</h4>
		<table border="1" id="">
			<tr>
				<td>Id</td>
				<td>Name</td>
				<td>Description</td>
				<td>Timezone</td>
				<td>Language</td>
				<td>Lat</td>
				<td>Lng</td>
				<td>Created At</td>
				<td>Updated At</td>
			</tr>
			<% for(Entity company : companies) { %>
			<tr id="<%= KeyFactory.keyToString(company.getKey()) %>" onClick="onCompanySelected(this)">
				<td><%= company.getProperty("id") %></td>
				<td><%= company.getProperty("name") %></td>
				<td><%= company.getProperty("desc") %></td>
				<td><%= company.getProperty("timezone") %></td>
				<td><%= company.getProperty("language") %></td>
				<td><%= company.getProperty("lat") %></td>
				<td><%= company.getProperty("lng") %></td>
				<td><%= DataUtils.dateToString((Date)company.getProperty("created_at"), GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT) %></td>
				<td><%= DataUtils.dateToString((Date)company.getProperty("updated_at"), GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT) %></td>
			</tr>
			<% } %>
		</table>
		
		<br/>
		
		<h4>Company</h4>
		<form id="company" method="post">			
  			<table id="companyForm">
  				<input name="key" type="hidden" />
  				<tr>
  					<td>ID</td>
  					<td><input name="id" type="text" /></td>
  				</tr>
  				
  				<tr>
  					<td>Name</td>
  					<td><input name="name" type="text" /></td>
  				</tr>
  				
  				<tr>
  					<td>Description</td>
  					<td><input name="desc" type="text" /></td>
  				</tr>
  				
  				<tr>
  					<td>Timezone</td>
  					<td>
  						<select name="timezone">							
							<option value="-12">(GMT -12:00) Eniwetok, Kwajalein</option> 
							<option value="-11">(GMT -11:00) Midway Island, Samoa</option>
							<option value="-10">(GMT -10:00) Hawaii</option>							
							<option value="-9">(GMT -9:00) Alaska</option>
							<option value="-8">(GMT -8:00) Pacific Time (US &amp; Canada)</option>
							<option value="-7">(GMT -7:00) Mountain Time (US &amp; Canada)</option>
							<option value="-6">(GMT -6:00) Central Time (US &amp; Canada), Mexico City</option>
							<option value="-5">(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima</option>
							<option value="-4">(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz</option>
							<option value="-3.5">(GMT -3:30) Newfoundland</option>
							<option value="-3">(GMT -3:00) Brazil, Buenos Aires, Georgetown</option>
							<option value="-2">(GMT -2:00) Mid-Atlantic</option>
							<option value="-1">(GMT -1:00) Azores, Cape Verde Islands</option>							
							<option value="0">(GMT) Western Europe Time, London, Lisbon, Casablanca</option>							
							<option value="1">(GMT +1:00) Brussels, Copenhagen, Madrid, Paris</option>
							<option value="2">(GMT +2:00) Kaliningrad, South Africa</option>
							<option value="3">(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg</option>
							<option value="3.5">(GMT +3:30) Tehran</option>
							<option value="4">(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi</option>
							<option value="4.5">(GMT +4:30) Kabul</option>
							<option value="5">(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent</option>
							<option value="5.5">(GMT +5:30) Bombay, Calcutta, Madras, New Delhi</option>
							<option value="5.75">(GMT +5:45) Kathmandu</option>
							<option value="6">(GMT +6:00) Almaty, Dhaka, Colombo</option>
							<option value="7">(GMT +7:00) Bangkok, Hanoi, Jakarta</option>
							<option value="8">(GMT +8:00) Beijing, Perth, Singapore, Hong Kong</option>														
							<option value="9" selected="selected">(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk</option>							
							<option value="9.5">(GMT +9:30) Adelaide, Darwin</option>
							<option value="10">(GMT +10:00) Eastern Australia, Guam, Vladivostok</option>
							<option value="11">(GMT +11:00) Magadan, Solomon Islands, New Caledonia</option>
							<option value="12">(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka</option>							
						</select>
  					</td>
  				</tr>
  				
  				<tr>
  					<td>Language</td>
  					<td>
  						<select name="language">
							<option value="en" selected="selected">English</option> 
							<option value="ko">Korean</option>
							<option value="cn">Chinese</option> 
						</select>
					</td>
  				</tr>
  				
  				<tr>
  					<td>Latitude</td>
  					<td><input name="lat"  type="text"/></td>
  				</tr>
  				
  				<tr>
  					<td>Longitude</td>
  					<td><input name="lng"  type="text"/></td>
  				</tr>  			
			</table>
			<br/>
			<input type="button" value="new" onClick="onNewClicked();">
			<input type="submit" value="save">
		</form>		
	</body>
</html>
