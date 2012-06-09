package com.heartyoh.security.service;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.users.UserServiceFactory;
import com.heartyoh.dao.UserDao;
import com.heartyoh.model.CustomUser;
import com.heartyoh.security.AppRole;
import com.heartyoh.security.GaeUserAuthentication;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;

@Controller
public class RegistrationService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(RegistrationService.class);
	
	@Autowired
	private UserDao registry;
	
	@Autowired
	private ProductionHostInfo productionHostInfo;

	@RequestMapping(value = "/register", method = RequestMethod.GET)
	public RegistrationForm registrationForm(HttpServletRequest request) {
		RegistrationForm form = new RegistrationForm();
		form.setProdEnv(this.isProductionMode(request.getServerName()));
		return form;
	}

	/**
	 * serverHost명으로 개발 모드인지 운영 모드인지 구분한다.
	 * 
	 * @param serverHost
	 * @return
	 */
	private boolean isProductionMode(String serverHost) {
		List<String> hostNameList = this.productionHostInfo.getHostNameList();
		return hostNameList.contains(serverHost);
	}

	@RequestMapping(value = "/register", method = RequestMethod.POST)
	public String register(RegistrationForm form, BindingResult result) {
				
		if (result.hasErrors())
			return null;
		
		return form.isProdEnv() ? this.registerByProdEnv(form, result) : this.registerByDevelEnv(form, result);
	}
	
	/**
	 * local 개발 모드일 경우
	 * 
	 * @param form
	 * @param result
	 * @return
	 */
	private String registerByDevelEnv(RegistrationForm form, BindingResult result) {
		
		if (result.hasErrors()) {
			return null;
		}

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		CustomUser currentUser = (CustomUser) authentication.getPrincipal();
		Set<AppRole> roles = EnumSet.of(AppRole.USER);

		if (UserServiceFactory.getUserService().isUserAdmin()) {
			roles.add(AppRole.ADMIN);
		}

		CustomUser user = new CustomUser(currentUser.getUserId(), currentUser.getEmail(), form.getName(),
				roles, form.getCompany(), form.getLanguage(), true);

		registry.registerUser(user);

		// Update the context with the full authentication
		SecurityContextHolder.getContext().setAuthentication(
				new GaeUserAuthentication(user, authentication.getDetails()));

		return "redirect:/home";		
	}
	
	/**
	 * 운영 환경일 경우 
	 * 
	 * @param form
	 * @param result
	 * @return
	 */
	private String registerByProdEnv(RegistrationForm form, BindingResult result) {
		
		// 0. email이 비어있다면 인증 정보로 부터 가져와 채움 
		if(DataUtils.isEmpty(form.getEmail())) {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			CustomUser currentUser = (CustomUser) authentication.getPrincipal();
			String email = currentUser.getEmail();
			form.setEmail(email);
		}
		
		// 1. 회사가 유효한 회사인지 체크 
		Entity company = DatastoreUtils.findCompany(form.getCompany());
		if(company == null) {
			logger.error("Company [" + form.getCompany() + "] not exist!");
			return "redirect:/reg_result?company=" + form.getCompany() + "&email=" + form.getEmail() + "&error=true&message=company_not_exit";
		}
		
		// 2. 이미 사용중인 사용자인지 체크 
		CustomUser user = this.registry.findUser(form.getEmail());
		if(user != null) {
			logger.error("User Email [" + form.getEmail() + "] is already in use by another user!");
			return "redirect:/reg_result?company=" + form.getCompany() + "&email=" + form.getEmail() + "&error=true&message=user_already_exit";
		}
		
		// 4. 해당 회사의 관리자에게 메일을 보냄
		try {
			// TODO 수정 
			AlarmUtils.sendXmppMessage("maparam419@gmail.com", 
					"You have received user registration request. [name : " + form.getName() + ", email : " + form.getEmail() + "]!");
		} catch (Exception e) {
			logger.error("Failed to send message!", e);
		}
				
		return "redirect:/reg_result?email=" + form.getEmail() + "&error=false&message=";		
	}
	
	@RequestMapping(value = "/reg_result", method = RequestMethod.GET)
	public void registerResult(String company, String email, String error, String message) {
	}
}
