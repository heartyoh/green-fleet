package com.heartyoh.security.service;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

@Controller
public class SecurityService {
	Pattern pattern = Pattern.compile("Android|iPhone|iPad");

	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String landing(HttpServletRequest request) {
		String userAgent = request.getHeader("user-agent");
		
		Matcher match = pattern.matcher(userAgent);
		if(match.find()) {
			return "redirect:/m/";
		} else {
			return "home";
		}
	}

	@RequestMapping(value = "/home", method = RequestMethod.GET)
	public String home(HttpServletRequest request) {
		String userAgent = request.getHeader("user-agent");
		
		Matcher match = pattern.matcher(userAgent);
		if(match.find()) {
			return "redirect:/m/";
		} else {
			return "home";
		}
	}

	@RequestMapping(value = "/m/", method = RequestMethod.GET)
	public String m_default() {
		return "m/home";
	}

	@RequestMapping(value = {"/m/home", "/m"}, method = RequestMethod.GET)
	public String m_home() {
		return "redirect:/m/";
	}

	@RequestMapping(value = "/disabled", method = RequestMethod.GET)
	public String disabled() {
		return "disabled";
	}

	@RequestMapping(value = "/logout", method = RequestMethod.GET)
	public void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
		HttpSession session = request.getSession(false);
		if(session != null) {
			session.invalidate();
		}
		
		//String logoutUrl = UserServiceFactory.getUserService().createLogoutURL("/");
		//response.sendRedirect(logoutUrl);
		
		UserService userService = UserServiceFactory.getUserService();		
		if(userService.isUserLoggedIn()) {
			response.sendRedirect("/signout");
		} else {
			response.sendRedirect("/signin");
		}			
	}
	
	@RequestMapping(value = "/signout", method = RequestMethod.GET)
	public String signout(HttpServletRequest request) {
		return "signout";
	}
	
	@RequestMapping(value = "/signin", method = RequestMethod.GET)
	public String signin(HttpServletRequest request) {
		return "signin";
	}

}
