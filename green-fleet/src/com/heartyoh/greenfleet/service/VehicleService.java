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
import com.heartyoh.greenfleet.model.Vehicle;
import com.heartyoh.util.PMF;

@Controller
public class VehicleService {
	private static final Logger logger = LoggerFactory.getLogger(VehicleService.class);

	@RequestMapping(value = "/vehicle/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> createVehicle(HttpServletRequest request, HttpServletResponse response) {
		String id = request.getParameter("id");
		String name = request.getParameter("name");

		Date now = new Date();

		Key key = KeyFactory.createKey(Vehicle.class.getSimpleName(), id);

		boolean created = false;
		Vehicle Vehicle = null;

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			try {
				Vehicle = pm.getObjectById(Vehicle.class, key);
			} catch (JDOObjectNotFoundException e) {
				Vehicle = new Vehicle();
				Vehicle.setKey(key);
				Vehicle.setId(id);
				Vehicle.setCreatedAt(now);

				created = true;
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */
			Vehicle.setUpdatedAt(now);

			Vehicle = pm.makePersistent(Vehicle);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", created ? "Vehicle created." : "Vehicle updated");
		result.put("key", KeyFactory.keyToString(Vehicle.getKey()));

		return result;
	}

	@RequestMapping(value = "/vehicle/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> deleteVehicle(HttpServletRequest request, HttpServletResponse response) {
		String id = request.getParameter("id");

		Key key = KeyFactory.createKey(Vehicle.class.getSimpleName(), id);

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Vehicle Vehicle = pm.getObjectById(Vehicle.class, key);

			pm.deletePersistent(Vehicle);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", "Vehicle destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/vehicle", method = RequestMethod.GET)
	public @ResponseBody
	List<Vehicle> getObdData(HttpServletRequest request, HttpServletResponse response) {

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query query = pm.newQuery(Vehicle.class);

		// query.setFilter();
		// query.setOrdering();
		// query.declareParameters();

		return (List<Vehicle>) query.execute();
	}


}
