package com.heartyoh.util;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

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
