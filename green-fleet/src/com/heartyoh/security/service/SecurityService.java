package com.heartyoh.security.service;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.google.appengine.api.users.UserServiceFactory;

/**
 * 
 * @author Luke Taylor
 * 
 */
@Controller
public class SecurityService {

	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String landing() {
		return "landing";
	}

	@RequestMapping(value = "/home.htm", method = RequestMethod.GET)
	public String home() {
		return "test";
	}

	@RequestMapping(value = "/disabled.htm", method = RequestMethod.GET)
	public String disabled() {
		return "disabled";
	}

	@RequestMapping(value = "/logout.htm", method = RequestMethod.GET)
	public void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
		request.getSession().invalidate();

		String logoutUrl = UserServiceFactory.getUserService().createLogoutURL("/loggedout.htm");

		response.sendRedirect(logoutUrl);
	}

	@RequestMapping(value = "/loggedout.htm", method = RequestMethod.GET)
	public String loggedOut() {
		return "loggedout";
	}
}
