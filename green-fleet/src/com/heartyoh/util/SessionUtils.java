package com.heartyoh.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

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
}
