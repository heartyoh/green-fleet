package com.heartyoh.util;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.CustomUser;

public class SessionUtils {
	public static CustomUser currentUser(){
	    SecurityContext securityContext = SecurityContextHolder.getContext();
	    Authentication authentication = securityContext.getAuthentication();
	    if (authentication != null) {
	        Object principal = authentication.getPrincipal();
	        return (CustomUser)(principal instanceof CustomUser ? principal : null);
	    }
	    return null;
	}
	
	public static Date timestampToDate(String timestamp) {
		if(timestamp == null || timestamp.length() == 0)
			return null;
		Calendar cal = Calendar.getInstance();
		cal.setTimeInMillis(Long.parseLong(timestamp) * 1000);
		return cal.getTime();
	}
	
	public static Date stringToDateTime(String datetime) {
		return stringToDateTime(datetime, null, 0);
	}
	
	public static Date stringToDateTime(String datetime, String format, int timezone) {
		DateFormat df = null;
		if(format == null)
			df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		else
			df = new SimpleDateFormat(format);

		try {
			Date dt = df.parse(datetime);
			if(timezone != 0)
				dt.setTime(dt.getTime() - (timezone * 3600 * 1000));
			return dt;
		} catch (ParseException e) {
		    e.printStackTrace();
		    return null;
		}
	}
	
	public static Date stringToDate(String date) {
		return stringToDate(date, null, null);
	}
	
	public static Date stringToDate(String date, String format, String timezone) {
		DateFormat df = null;
		if(format == null)
			df = new SimpleDateFormat("yyyy-MM-dd");
		else
			df = new SimpleDateFormat(format);
		if(timezone != null)
			df.setTimeZone(TimeZone.getTimeZone(timezone));

		try {
			return df.parse(date);
		} catch (ParseException e) {
		    e.printStackTrace();
		    return null;
		}
	}
	
	public static boolean parseBoolean(String value) {
		if(value == null || value.length() == 0)
			return false;
		if(value.equals("on") || value.equals("true") || value.equals("1"))
			return true;
		return false;
	}
	
	public static Map<String, Object> cvtEntityToMap(Entity entity) {
		Map<String, Object> map = new HashMap<String, Object>();
		map.putAll(entity.getProperties());
		map.put("key", KeyFactory.keyToString(entity.getKey()));
		return map;
	}
}
