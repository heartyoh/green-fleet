package com.heartyoh.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.model.Track;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class TrackService {
	private static final Logger logger = LoggerFactory.getLogger(TrackService.class);
	private static final Class<Track> clazz = Track.class;

	@RequestMapping(value = "/track/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> save(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String vehicle = request.getParameter("vehicle");
		String lattitude = request.getParameter("lattitude");
		String longitude = request.getParameter("longitude");

		Key objKey = null;
		boolean creating = false;

		PersistenceManager pm = PMF.get().getPersistenceManager();
		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
		Company company = pm.getObjectById(Company.class, companyKey);
		Key vehicleKey = KeyFactory.stringToKey(vehicle);
		
		Track obj = null;

		if (key != null && key.trim().length() > 0) {
			objKey = KeyFactory.stringToKey(key);
		} else {
			creating = true;
		}

		Date now = new Date();

		try {
			if (creating) {
				obj = new Track();
				obj.setVehicle(vehicle);
				obj.setCompany(company);
				obj.setCreatedAt(now);
			} else {
				obj = pm.getObjectById(clazz, objKey);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */


			if(lattitude != null)
				obj.setLattitude(Double.parseDouble(lattitude));
			if(longitude != null)
				obj.setLongitude(Double.parseDouble(longitude));

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

	@RequestMapping(value = "/track/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Track obj = pm.getObjectById(clazz, KeyFactory.stringToKey(key));

			pm.deletePersistent(obj);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", clazz.getSimpleName() + " destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/track", method = RequestMethod.GET)
	public @ResponseBody
	List<Track> retrieve(HttpServletRequest request, HttpServletResponse response) {
//		String vehicle = request.getParameter("vehicle");
//
//		Key vehicleKey = KeyFactory.stringToKey(vehicle);
//
//		PersistenceManager pm = PMF.get().getPersistenceManager();
//
//		Vehicle objVehicle = pm.getObjectById(Vehicle.class, vehicleKey);
//
//		return objVehicle.getIncidents();
		
		CustomUser user = SessionUtils.currentUser();

		String jsonFilter = request.getParameter("filter");
		String jsonSorter = request.getParameter("sort");
		
		List<Filter> filters = null;
		List<Sorter> sorters = null;

		try {
			if(jsonFilter != null) {
				filters = new ObjectMapper().readValue(request.getParameter("filter"), new TypeReference<List<Filter>>(){ });
			}
			if(jsonSorter != null) {
				sorters = new ObjectMapper().readValue(request.getParameter("sort"), new TypeReference<List<Sorter>>(){ });
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Company company = pm.getObjectById(Company.class, companyKey);

		Query query = pm.newQuery(clazz);

		String vehicleKey = null;
		
		if (filters != null) {
			Iterator<Filter> it = filters.iterator();
			while (it.hasNext()) {
				Filter filter = it.next();
				if(filter.getProperty().equals("vehicle"))
					vehicleKey = filter.getValue(); 
			}
		}
		
		String strFilter = "company == companyParam";
		String strParameter = Company.class.getName() + " companyParam";
		if(vehicleKey != null && vehicleKey.length() > 0) {
			strFilter += " && vehicle == vehicleParam";
			strParameter += ", String vehicleParam";
		}
		query.setFilter(strFilter);
		query.declareParameters(strParameter);
//		query.setOrdering("createdAt ASC");
		
		// query.setGrouping(user.getCompany());
		// query.setOrdering();
		// query.declareParameters();

		if(vehicleKey != null && vehicleKey.length() > 0)
			return (List<Track>)query.execute(company, vehicleKey);
		else
			return (List<Track>) query.execute(company);
	}

}
