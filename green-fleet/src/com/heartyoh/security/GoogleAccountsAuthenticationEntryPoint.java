package com.heartyoh.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class GoogleAccountsAuthenticationEntryPoint implements AuthenticationEntryPoint {

	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
			throws IOException, ServletException {
		
		if(!response.isCommitted()) {
	    	String ajax = request.getHeader("X-Requested-With");
	    	
	    	if ("XMLHttpRequest".equals(ajax)) {
	            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication Failed!");
	            return;
	    	}
		}
		
		UserService userService = UserServiceFactory.getUserService();
		String loginUrl = userService.createLoginURL(request.getRequestURI());
		response.sendRedirect(loginUrl);		
	}

}
