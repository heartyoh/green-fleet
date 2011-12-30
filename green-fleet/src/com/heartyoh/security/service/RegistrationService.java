package com.heartyoh.security.service;

import java.util.EnumSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.google.appengine.api.users.UserServiceFactory;
import com.heartyoh.dao.UserDao;
import com.heartyoh.model.CustomUser;
import com.heartyoh.security.AppRole;
import com.heartyoh.security.GaeUserAuthentication;

@Controller
@RequestMapping(value = "/register")
public class RegistrationService {

	@Autowired
	private UserDao registry;

	@RequestMapping(method = RequestMethod.GET)
	public RegistrationForm registrationForm() {
		return new RegistrationForm();
	}

	@RequestMapping(method = RequestMethod.POST)
	public String register(RegistrationForm form, BindingResult result) {
		if (result.hasErrors()) {
			return null;
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		CustomUser currentUser = (CustomUser) authentication.getPrincipal();
		Set<AppRole> roles = EnumSet.of(AppRole.USER);

		if (UserServiceFactory.getUserService().isUserAdmin()) {
			roles.add(AppRole.ADMIN);
		}

		CustomUser user = new CustomUser(currentUser.getUserId(), currentUser.getNickname(), currentUser.getEmail(),
				form.getForename(), form.getSurname(), roles, form.getCompany(), true);

		registry.registerUser(user);

		// Update the context with the full authentication
		SecurityContextHolder.getContext().setAuthentication(
				new GaeUserAuthentication(user, authentication.getDetails()));

		return "redirect:/home";
	}
}
