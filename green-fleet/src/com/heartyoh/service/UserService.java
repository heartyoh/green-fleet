package com.heartyoh.service;

import java.io.IOException;
import java.util.Date;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.EntityExistsException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.CustomUser;
import com.heartyoh.security.AppRole;
import com.heartyoh.util.SessionUtils;

@Controller
public class UserService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(UserService.class);
	
	protected String getEntityName() {
		return "CustomUser";
	}
	
	@RequestMapping(value = "/user/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String email = request.getParameter("email");
		String nickname = request.getParameter("nickname");
		String forename = request.getParameter("forename");
		String surname = request.getParameter("surname");
		String company = request.getParameter("company");
		String admin = request.getParameter("admin");
		String enabled = request.getParameter("enabled");

		Set<AppRole> roles = EnumSet.of(AppRole.USER);

		if (admin != null && (admin.equals("true") || admin.equals("on"))) {
			roles.add(AppRole.ADMIN);
		}
		
		Key objKey = null;
		boolean creating = false;

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Key companyKey = KeyFactory.createKey("Company", user.getCompany());

		Entity obj = null;

		/*
		 * TODO email 이 중복되지 않음을 검증해야 한다.
		 */
		if (key != null && key.trim().length() > 0) {
			objKey = KeyFactory.stringToKey(key);
			try {
				obj = datastore.get(objKey);
			} catch (EntityNotFoundException e) {
				// It's OK.(but Lost Key maybe.)
				creating = true;
			}
		} else {
			objKey = KeyFactory.createKey(companyKey, getEntityName(), email);
			try {
				obj = datastore.get(objKey);
			} catch (EntityNotFoundException e) {
				// It's OK.
				creating = true;

			}
			// It's Not OK. You try to add duplicated identifier.
			if (obj != null)
				throw new EntityExistsException(getEntityName() + " with email(" + email + ") already Exist.");
		}

		Date now = new Date();

		try {
			if (creating) {
				obj = new Entity(getEntityName(), email, companyKey);

				obj.setProperty("createdAt", now);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if (email != null)
				obj.setProperty("email", email);
			if (nickname != null)
				obj.setProperty("nickname", nickname);
			if (forename != null)
				obj.setProperty("forename", forename);
			if (surname != null)
				obj.setProperty("surname", surname);
			if (company != null)
				obj.setProperty("company", company);
			obj.setUnindexedProperty("enabled", enabled != null && (enabled.equals("true") || enabled.equals("on")));
			obj.setUnindexedProperty("admin", admin != null && (admin.equals("true") || admin.equals("on")));

	        long binaryAuthorities = 0;

	        for (AppRole r : roles) {
	            binaryAuthorities |= 1 << r.getBit();
	        }

	        obj.setUnindexedProperty("authorities", binaryAuthorities);

			obj.setProperty("updatedAt", now);

			datastore.put(obj);
		} finally {
		}

		response.setContentType("text/html");

		return "{ \"success\" : true, \"key\" : \"" + KeyFactory.keyToString(obj.getKey()) + "\" }";
	}

	@RequestMapping(value = "/user/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/user", method = RequestMethod.GET)
	public @ResponseBody
	List<Map<String, Object>> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

}
