/**
 * 
 */
package com.heartyoh.service;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.google.appengine.api.datastore.Entity;
import com.heartyoh.util.DatastoreUtils;

/**
 * Administrator Service
 * 
 * @author jhnam
 */
@Controller
public class AdminService {

	@RequestMapping(value = "/admin", method = RequestMethod.GET)
	public String admin(HttpServletRequest request) {
		List<Entity> companies = DatastoreUtils.findAllCompany();
		request.setAttribute("companies", companies);
		return "admin";
	}
	
	@RequestMapping(value = "/admin", method = RequestMethod.POST)
	public void adminCompany(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		CompanyService svc = new CompanyService();
		svc.save(request, response);
		response.sendRedirect("/admin");
	}	
	
}
