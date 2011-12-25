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
import com.heartyoh.greenfleet.model.Incident;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class IncidentService {
	private static final Logger logger = LoggerFactory.getLogger(IncidentService.class);

	@RequestMapping(value = "/incident/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> createVehicle(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String id = request.getParameter("id");
		String vehicle = request.getParameter("vehicle");
		String driver = request.getParameter("driver");
		// Date reservincidentTimeedDate = new Date(request.getParameter("incidentTime"));
		double lattitude = Double.parseDouble(request.getParameter("lattitude"));
		double longitude = Double.parseDouble(request.getParameter("longitude"));
		double impulse = Double.parseDouble(request.getParameter("impulse"));
		String videoClip = request.getParameter("videoClip");

		Date now = new Date();

//		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
		Key key = KeyFactory.createKey(Incident.class.getSimpleName(), id);

		boolean created = false;
		Incident incident = null;

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
//			Company company = pm.getObjectById(Company.class, companyKey);

			try {
				incident = pm.getObjectById(Incident.class, key);
			} catch (JDOObjectNotFoundException e) {
				incident = new Incident();
				incident.setKey(key);
				incident.setId(id);
				incident.setVehicle(vehicle);
				incident.setDriver(driver);
				incident.setIncidentTime(now);
				incident.setCreatedAt(now);

				created = true;
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			incident.setLattitude(lattitude);
			incident.setLongitude(longitude);
			incident.setImpulse(impulse);
			incident.setVideoClip(videoClip);
			incident.setUpdatedAt(now);

			incident = pm.makePersistent(incident);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", created ? "Incident  created." : "Incident  updated");
		result.put("key", KeyFactory.keyToString(incident.getKey()));

		return result;
	}

	@RequestMapping(value = "/incident/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> deleteVehicle(HttpServletRequest request, HttpServletResponse response) {
		String id = request.getParameter("id");

		Key key = KeyFactory.createKey(Incident.class.getSimpleName(), id);

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Incident Vehicle = pm.getObjectById(Incident.class, key);

			pm.deletePersistent(Vehicle);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", "Incident  destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/incident", method = RequestMethod.GET)
	public @ResponseBody
	List<Incident> getObdData(HttpServletRequest request, HttpServletResponse response) {

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query query = pm.newQuery(Incident.class);

		// query.setFilter();
		// query.setOrdering();
		// query.declareParameters();

		return (List<Incident>) query.execute();
	}

}
