package com.heartyoh.service;

import java.io.IOException;
import java.util.Date;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.EntityExistsException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.users.UserServiceFactory;
import com.heartyoh.dao.UserDao;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.security.AppRole;
import com.heartyoh.util.SessionUtils;

@Controller
public class UserService {
	private static final Logger logger = LoggerFactory.getLogger(UserService.class);
	private static final String entity_name = "CustomUser";
	
	@Autowired
    private UserDao userRegistry;

	@RequestMapping(value = "/user/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String email = request.getParameter("email");
		String nickname = request.getParameter("nickname");
		String forename = request.getParameter("forename");
		String surname = request.getParameter("surname");
		String company = user.getCompany();

		Set<AppRole> roles = EnumSet.of(AppRole.USER);

		if (UserServiceFactory.getUserService().isUserAdmin()) {
			roles.add(AppRole.ADMIN);
		}
		
		CustomUser cuser = new CustomUser(email, nickname, 
				forename, surname, roles, user.getCompany(), true);

		key = userRegistry.registerUser(cuser);
		
//		Key objKey = null;
//		boolean creating = false;
//
//		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
//
//		Key companyKey = KeyFactory.createKey("Company", user.getCompany());
//
//		Entity obj = null;
//
//		/*
//		 * TODO email 이 중복되지 않음을 검증해야 한다.
//		 */
//		if (key != null && key.trim().length() > 0) {
//			objKey = KeyFactory.stringToKey(key);
//			try {
//				obj = datastore.get(objKey);
//			} catch (EntityNotFoundException e) {
//				// It's OK.(but Lost Key maybe.)
//				creating = true;
//			}
//		} else {
//			objKey = KeyFactory.createKey(companyKey, entity_name, email);
//			try {
//				obj = datastore.get(objKey);
//			} catch (EntityNotFoundException e) {
//				// It's OK.
//				creating = true;
//
//			}
//			// It's Not OK. You try to add duplicated identifier.
//			if (obj != null)
//				throw new EntityExistsException(entity_name + " with email(" + email + ") already Exist.");
//		}
//
//		Date now = new Date();
//
//		try {
//			if (creating) {
//				obj = new Entity(entity_name, email, companyKey);
//
//				obj.setProperty("createdAt", now);
//			}
//			/*
//			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
//			 */
//
//			if (email != null)
//				obj.setProperty("email", email);
//			if (nickname != null)
//				obj.setProperty("nickname", nickname);
//			if (forename != null)
//				obj.setProperty("forename", forename);
//			if (surname != null)
//				obj.setProperty("surname", surname);
//			if (company != null)
//				obj.setProperty("company", company);
//
//			obj.setProperty("updatedAt", now);
//
//			datastore.put(obj);
//		} finally {
//		}

		response.setContentType("text/html");

		return "{ \"success\" : true, \"key\" : \"" + key + "\" }";
	}

	@RequestMapping(value = "/user/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		try {
			datastore.delete(KeyFactory.stringToKey(key));
		} finally {
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", entity_name + " destroyed.");

		return result;
	}

	@RequestMapping(value = "/user", method = RequestMethod.GET)
	public @ResponseBody
	List<Map<String, Object>> retrieve(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String jsonFilter = request.getParameter("filter");
		String jsonSorter = request.getParameter("sort");

		List<Filter> filters = null;
		List<Sorter> sorters = null;

		try {
			if (jsonFilter != null) {
				filters = new ObjectMapper().readValue(request.getParameter("filter"),
						new TypeReference<List<Filter>>() {
						});
			}
			if (jsonSorter != null) {
				sorters = new ObjectMapper().readValue(request.getParameter("sort"), new TypeReference<List<Sorter>>() {
				});
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = KeyFactory.createKey("Company", user.getCompany());

		// The Query interface assembles a query
		Query q = new Query(entity_name);
		q.setAncestor(companyKey);

		// PreparedQuery contains the methods for fetching query results
		// from the datastore
		PreparedQuery pq = datastore.prepare(q);

		List<Map<String, Object>> list = new LinkedList<Map<String, Object>>();

		for (Entity result : pq.asIterable()) {
			list.add(SessionUtils.cvtEntityToMap(result));
		}

		return list;
	}

}
