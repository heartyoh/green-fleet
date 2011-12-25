package com.heartyoh.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.Company;
import com.heartyoh.util.PMF;

@Controller
public class CompanyService {
	private static final Logger logger = LoggerFactory.getLogger(CompanyService.class);
	private static final Class<Company> clazz = Company.class;

	@RequestMapping(value = "/company/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> create(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");
		String id = request.getParameter("id");
		String name = request.getParameter("name");

		Key objKey = null;
		boolean creating = false;
		
		PersistenceManager pm = PMF.get().getPersistenceManager();

		Company obj = null;
		
		if(key != null && key.trim().length() > 0) {
			objKey = KeyFactory.stringToKey(key);
		} else {
			objKey = KeyFactory.createKey(clazz.getSimpleName(), id);

			try {
				obj = pm.getObjectById(clazz, objKey);
			} catch(JDOObjectNotFoundException e) {
				// It's OK.
				creating = true;
				
			}
			// It's Not OK. You try to add duplicated identifier.
			if(obj != null)
				throw new EntityExistsException(clazz.getSimpleName() + " with id(" + id + ") already Exist.");
		}
		
		Date now = new Date();

		try {
			if(creating) {
				obj = new Company();
				obj.setKey(KeyFactory.keyToString(objKey));
				obj.setId(id);
				obj.setCreatedAt(now);
			} else {
				obj = pm.getObjectById(Company.class, objKey);				
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if(name != null)
				obj.setName(name);

			obj.setUpdatedAt(now);

			obj = pm.makePersistent(obj);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", clazz.getSimpleName() + (creating ? " created." : " updated"));
		result.put("key", obj.getKey());

		return result;
	}

	@RequestMapping(value = "/company/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Company obj = pm.getObjectById(clazz, KeyFactory.stringToKey(key));

			pm.deletePersistent(obj);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", "Company destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/company", method = RequestMethod.GET)
	public @ResponseBody
	List<Company> retrieve(HttpServletRequest request, HttpServletResponse response) {

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query query = pm.newQuery(clazz);

		// query.setFilter();
		// query.setOrdering();
		// query.declareParameters();

		return (List<Company>) query.execute();
	}

}
