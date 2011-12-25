package com.heartyoh.greenfleet.service;

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
import com.heartyoh.greenfleet.model.Driver;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class DriverService {
	private static final Logger logger = LoggerFactory.getLogger(DriverService.class);

	@RequestMapping(value = "/driver/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> createVehicle(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String employeeId = request.getParameter("employeeId");
		String name = request.getParameter("name");
		String division = request.getParameter("division");
		String title = request.getParameter("title");
		String imageClip = request.getParameter("imageClip");

		Date now = new Date();

		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
		Key key = KeyFactory.createKey(Driver.class.getSimpleName(), employeeId);

		boolean created = false;
		Driver driver = null;

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Company company = pm.getObjectById(Company.class, companyKey);

			try {
				driver = pm.getObjectById(Driver.class, key);
			} catch (JDOObjectNotFoundException e) {
				driver = new Driver();
				driver.setCompany(company);
				driver.setKey(key);
				driver.setEmployeeId(employeeId);
				driver.setCreatedAt(now);

				created = true;
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			driver.setName(name);
			driver.setTitle(title);
			driver.setDivision(division);
			driver.setImageClip(imageClip);
			driver.setUpdatedAt(now);

			driver = pm.makePersistent(driver);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", created ? "Driver created." : "Driver updated");
		result.put("key", KeyFactory.keyToString(driver.getKey()));

		return result;
	}

	@RequestMapping(value = "/driver/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> deleteVehicle(HttpServletRequest request, HttpServletResponse response) {
		String employeeId = request.getParameter("employeeId");

		Key key = KeyFactory.createKey(Driver.class.getSimpleName(), employeeId);

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Driver Vehicle = pm.getObjectById(Driver.class, key);

			pm.deletePersistent(Vehicle);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", "Driver destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/driver", method = RequestMethod.GET)
	public @ResponseBody
	List<Driver> getObdData(HttpServletRequest request, HttpServletResponse response) {

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query query = pm.newQuery(Driver.class);

		// query.setFilter();
		// query.setOrdering();
		// query.declareParameters();

		return (List<Driver>) query.execute();
	}

}
