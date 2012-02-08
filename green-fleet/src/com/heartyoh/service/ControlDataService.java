package com.heartyoh.service;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.SessionUtils;

@Controller
public class ControlDataService {
	private static final Logger logger = LoggerFactory.getLogger(ControlDataService.class);
	private static final String entity_name = "ControlData";

	@RequestMapping(value = "/control_data/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> save(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String vehicle = request.getParameter("vehicle");
		String driver = request.getParameter("driver");
		String terminal = request.getParameter("terminal");
		String date = request.getParameter("date");
		String startTime = request.getParameter("startTime");
		String endTime = request.getParameter("endTime");
		String distance = request.getParameter("distance");
		String runningTime = request.getParameter("runningTime");
		String averageSpeed = request.getParameter("averageSpeed");
		String highestSpeed = request.getParameter("highestSpeed");
		String suddenAccelCount = request.getParameter("suddenAccelCount");
		String suddenBrakeCount = request.getParameter("suddenBrakeCount");
		String econoDrivingRatio = request.getParameter("econoDrivingRatio");
		String fuelEfficiency = request.getParameter("fuelEfficiency");
		String idlingTime = request.getParameter("idlingTime");
		String ecoDrivingTime = request.getParameter("ecoDrivingTime");
		String overSpeedingTime = request.getParameter("overSpeedingTime");
		String co2Emissions = request.getParameter("co2Emissions");
		String maxCoolingWaterTemp = request.getParameter("maxCoolingWaterTemp");
		String avgBatteryVolt = request.getParameter("avgBatteryVolt");

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Entity obj = null;

		Date now = new Date();

		try {
			if (key != null && key.trim().length() > 0) {
				try {
					obj = datastore.get(KeyFactory.stringToKey(key));
				} catch (EntityNotFoundException e) {
					logger.warn(e.getMessage(), e);
				}
			} 
			
			if(obj == null) {
				Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());

				obj = new Entity(entity_name, terminal + ":" + startTime, companyKey);
				obj.setProperty("createdAt", now);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if(date != null) {
				Calendar cal = Calendar.getInstance();
				cal.setTimeInMillis(Long.parseLong(date) * 1000);
				obj.setProperty("date", cal.getTime());
			}
			if(driver != null) {
				obj.setProperty("driver", driver);
			}
			if(driver != null) {
				obj.setProperty("vehicle", vehicle);
			}
			if(startTime != null) {
				Calendar cal = Calendar.getInstance();
				cal.setTimeInMillis(Long.parseLong(date) * 1000);
				obj.setProperty("startTime", cal.getTime());
			}
			if(endTime != null) {
				Calendar cal = Calendar.getInstance();
				cal.setTimeInMillis(Long.parseLong(date) * 1000);
				obj.setProperty("endTime", cal.getTime());
			}
			if(distance != null) {
				obj.setProperty("distance", Double.parseDouble(distance));
			}
			if(runningTime != null) {
				obj.setProperty("runningTime", Double.parseDouble(runningTime));
			}
			if(averageSpeed != null) {
				obj.setProperty("averageSpeed", Double.parseDouble(averageSpeed));
			}
			if(highestSpeed != null) {
				obj.setProperty("highestSpeed", Double.parseDouble(highestSpeed));
			}
			if(suddenAccelCount != null) {
				obj.setProperty("suddenAccelCount", Double.parseDouble(suddenAccelCount));
			}
			if(suddenBrakeCount != null) {
				obj.setProperty("suddenBrakeCount", Double.parseDouble(suddenBrakeCount));
			}
			if(econoDrivingRatio != null) {
				obj.setProperty("econoDrivingRatio", Double.parseDouble(econoDrivingRatio));
			}
			if(fuelEfficiency != null) {
				obj.setProperty("fuelEfficiency", Double.parseDouble(fuelEfficiency));
			}
			if(idlingTime != null) {
				obj.setProperty("idlingTime", Double.parseDouble(idlingTime));
			}
			if(ecoDrivingTime != null) {
				obj.setProperty("ecoDrivingTime", Double.parseDouble(ecoDrivingTime));
			}
			if(overSpeedingTime != null) {
				obj.setProperty("overSpeedingTime", Double.parseDouble(overSpeedingTime));
			}
			if(co2Emissions != null) {
				obj.setProperty("co2Emissions", Double.parseDouble(co2Emissions));
			}
			if(maxCoolingWaterTemp != null) {
				obj.setProperty("maxCoolingWaterTemp", Double.parseDouble(maxCoolingWaterTemp));
			}
			if(avgBatteryVolt != null) {
				obj.setProperty("avgBatteryVolt", Double.parseDouble(avgBatteryVolt));
			}

			obj.setProperty("updatedAt", now);

			datastore.put(obj);
		} finally {
		}

		Map<String, Object> result = new HashMap<String, Object>();

		result.put("success", true);
		result.put("key", obj.getKey());

		return result;
	}

	@RequestMapping(value = "/control_data/delete", method = RequestMethod.POST)
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

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/control_data", method = RequestMethod.GET)
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
		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());

		String vehicle = null;
		String driver = null;

		if (filters != null) {
			Iterator<Filter> it = filters.iterator();
			while (it.hasNext()) {
				Filter filter = it.next();
				if (filter.getProperty().equals("vehicle"))
					vehicle = filter.getValue();
				else if (filter.getProperty().equals("driver"))
					driver = filter.getValue();
			}
		}

		// The Query interface assembles a query
		Query q = new Query(entity_name);
		q.setAncestor(companyKey);

		if(vehicle != null && vehicle.length() > 0)
			q.addFilter("vehicle", Query.FilterOperator.EQUAL, vehicle);
		if(driver != null && driver.length() > 0)
			q.addFilter("driver", Query.FilterOperator.EQUAL, driver);

		PreparedQuery pq = datastore.prepare(q);
		
		List<Map<String, Object>> list = new LinkedList<Map<String, Object>>();
		
		for (Entity result : pq.asIterable()) {
			Map<String, Object> prop = new HashMap<String, Object>();
			prop.putAll(result.getProperties());
			prop.put("key", KeyFactory.keyToString(result.getKey()));
			list.add(prop);
		}
		
		return list;
	}

}
