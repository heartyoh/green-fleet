package com.heartyoh.service;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
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
import com.heartyoh.model.ControlData;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class ControlDataService {
	private static final Logger logger = LoggerFactory.getLogger(ControlDataService.class);
	private static final Class<ControlData> clazz = ControlData.class;

	@RequestMapping(value = "/control_data/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> save(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String vehicle = request.getParameter("vehicle");
		String driver = request.getParameter("driver");
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

		Key objKey = null;
		boolean creating = false;

		PersistenceManager pm = PMF.get().getPersistenceManager();
		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
		Company company = pm.getObjectById(Company.class, companyKey);
		
//		Key vehicleKey = KeyFactory.createKey(companyKey, Vehicle.class.getSimpleName(), vehicle);
//		Vehicle objVehicle = pm.getObjectById(Vehicle.class, vehicleKey);
		
//		Key driverKey = KeyFactory.createKey(companyKey, Driver.class.getSimpleName(), driver);
//		Driver objDriver = pm.getObjectById(Driver.class, driverKey);
		
		ControlData obj = null;

		if (key != null && key.trim().length() > 0) {
			objKey = KeyFactory.stringToKey(key);
		} else {
			creating = true;
		}

		Date now = new Date();

		try {
			if (creating) {
				obj = new ControlData();
				obj.setCompany(company);
				obj.setCreatedAt(now);
			} else {
				obj = pm.getObjectById(clazz, objKey);
			}

			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if(date != null) {
				Calendar cal = Calendar.getInstance();
				cal.setTimeInMillis(Long.parseLong(date));
				obj.setDate(cal.getTime());
			}
			if(driver != null) {
				obj.setDriver(driver);
			}
			if(driver != null) {
				obj.setVehicle(vehicle);
			}
			if(startTime != null) {
				Calendar cal = Calendar.getInstance();
				cal.setTimeInMillis(Long.parseLong(date));
				obj.setStartTime(cal.getTime());
			}
			if(endTime != null) {
				Calendar cal = Calendar.getInstance();
				cal.setTimeInMillis(Long.parseLong(date));
				obj.setEndTime(cal.getTime());
			}
			if(distance != null) {
				obj.setDistance(Double.parseDouble(distance));
			}
			if(runningTime != null) {
				obj.setRunningTime(Double.parseDouble(runningTime));
			}
			if(averageSpeed != null) {
				obj.setAverageSpeed(Double.parseDouble(averageSpeed));
			}
			if(highestSpeed != null) {
				obj.setHighestSpeed(Double.parseDouble(highestSpeed));
			}
			if(suddenAccelCount != null) {
				obj.setSuddenAccelCount(Double.parseDouble(suddenAccelCount));
			}
			if(suddenBrakeCount != null) {
				obj.setSuddenBrakeCount(Double.parseDouble(suddenBrakeCount));
			}
			if(econoDrivingRatio != null) {
				obj.setEconoDrivingRatio(Double.parseDouble(econoDrivingRatio));
			}
			if(fuelEfficiency != null) {
				obj.setFuelEfficiency(Double.parseDouble(fuelEfficiency));
			}

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

	@RequestMapping(value = "/control_data/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			ControlData obj = pm.getObjectById(clazz, KeyFactory.stringToKey(key));

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
	@RequestMapping(value = "/control_data", method = RequestMethod.GET)
	public @ResponseBody
	List<ControlData> retrieve(HttpServletRequest request, HttpServletResponse response) {
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

		String vehicle = null;
		String driver = null;
		
		if (filters != null) {
			Iterator<Filter> it = filters.iterator();
			while (it.hasNext()) {
				Filter filter = it.next();
				if(filter.getProperty().equals("vehicle"))
					vehicle = filter.getValue();
				else if(filter.getProperty().equals("driver"))
					driver = filter.getValue();
			}
		}

		String strFilter = "company == companyParam";
		String strParameter = Company.class.getName() + " companyParam";
		if(vehicle != null) {
			strFilter += " && vehicle == vehicleParam";
			strParameter += ", String vehicleParam";
		}
		if(driver != null) {
			strFilter += " && driver == driverParam";
			strParameter += ", String driverParam";
		}

		query.setFilter(strFilter);
		query.declareParameters(strParameter);
//		query.setOrdering("createdAt ASC");
		
		// query.setGrouping(user.getCompany());
		// query.setOrdering();
		// query.declareParameters();

		if(vehicle != null && driver != null)
			return (List<ControlData>)query.execute(company, vehicle, driver);
		if(vehicle != null)
			return (List<ControlData>)query.execute(company, vehicle);
		if(driver != null)
			return (List<ControlData>)query.execute(company, driver);
		else
			return (List<ControlData>) query.execute(company);
	}

}
