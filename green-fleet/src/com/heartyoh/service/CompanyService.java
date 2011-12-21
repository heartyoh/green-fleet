package com.heartyoh.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
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

	@RequestMapping(value = "/company/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> createCompany(HttpServletRequest request, HttpServletResponse response) {
		String id = request.getParameter("id");
		String name = request.getParameter("name");

		Date now = new Date();

		Key key = KeyFactory.createKey(Company.class.getSimpleName(), id);

		boolean created = false;
		Company company = null;

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			try {
				company = pm.getObjectById(Company.class, key);
			} catch (JDOObjectNotFoundException e) {
				company = new Company();
				company.setKey(key);
				company.setId(id);
				company.setCreatedAt(now);

				created = true;
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */
			company.setName(name);
			company.setUpdatedAt(now);

			company = pm.makePersistent(company);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", created ? "Company created." : "Company updated");
		result.put("key", KeyFactory.keyToString(company.getKey()));

		return result;
	}

	@RequestMapping(value = "/company/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> deleteCompany(HttpServletRequest request, HttpServletResponse response) {
		String id = request.getParameter("id");

		Key key = KeyFactory.createKey(Company.class.getSimpleName(), id);

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Company company = pm.getObjectById(Company.class, key);

			pm.deletePersistent(company);
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
	List<Company> getObdData(HttpServletRequest request, HttpServletResponse response) {

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query query = pm.newQuery(Company.class);

		// query.setFilter();
		// query.setOrdering();
		// query.declareParameters();

		return (List<Company>) query.execute();
	}

}
