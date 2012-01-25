package com.heartyoh.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.model.Track;
import com.heartyoh.model.Vehicle;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class TrackService {
	private static final Logger logger = LoggerFactory.getLogger(TrackService.class);
	private static final Class<Track> clazz = Track.class;

	@RequestMapping(value = "/track/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws IOException {
		CustomUser user = SessionUtils.currentUser();

		MultipartFile file = request.getFile("file");

		BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));

		String line = br.readLine();
		/*
		 * First line for the header Information
		 */
		String[] keys = line.split(",");

		/*
		 * Next lines for the values
		 */
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
			Company company = pm.getObjectById(Company.class, companyKey);

			Date now = new Date();

			while ((line = br.readLine()) != null) {
				String[] values = line.split(",");

				Map<String, String> map = new HashMap<String, String>();

				for (int i = 0; i < keys.length; i++) {
					map.put(keys[i].trim(), values[i].trim());
				}

				Track track = new Track();

				try {
					String vehicle = map.get("vehicle");
					String driver = map.get("driver");
					double lattitude = Double.parseDouble(map.get("lattitude"));
					double longitude = Double.parseDouble(map.get("longitude"));
					
					track.setCompany(company);
					track.setVehicle(vehicle);
					track.setDriver(driver);
					track.setLattitude(lattitude);
					track.setLongitude(longitude);
					track.setCreatedAt(now);

					track = pm.makePersistent(track);
					
					Key vehicleKey = KeyFactory.createKey(companyKey, Vehicle.class.getSimpleName(), vehicle);
					Vehicle objVehicle = pm.getObjectById(Vehicle.class, vehicleKey);
					
					objVehicle.setLattitude(lattitude);
					objVehicle.setLongitude(longitude);
					objVehicle.setDriver(driver);
					
					objVehicle = pm.makePersistent(objVehicle);

				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		} finally {
			pm.close();
		}

		response.setContentType("text/html");

		return "{ \"success\" : true }";
	}

	@RequestMapping(value = "/track/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> save(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String vehicle = request.getParameter("vehicle");
		String driver = request.getParameter("driver");
		String lattitude = request.getParameter("lattitude");
		String longitude = request.getParameter("longitude");

		Key objKey = null;
		boolean creating = false;

		PersistenceManager pm = PMF.get().getPersistenceManager();
		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
		Company company = pm.getObjectById(Company.class, companyKey);
		
		Key vehicleKey = KeyFactory.createKey(companyKey, Vehicle.class.getSimpleName(), vehicle);
		Vehicle objVehicle = pm.getObjectById(Vehicle.class, vehicleKey);
		
//		Key driverKey = KeyFactory.createKey(companyKey, Driver.class.getSimpleName(), driver);
//		Driver objDriver = pm.getObjectById(Driver.class, driverKey);
		
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
				obj.setCompany(company);
				obj.setCreatedAt(now);
			} else {
				obj = pm.getObjectById(clazz, objKey);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if(lattitude != null) {
				double dblLattitude = Double.parseDouble(lattitude);
				obj.setLattitude(dblLattitude);
				objVehicle.setLattitude(dblLattitude);
			}
			if(longitude != null) {
				double dblLongitude = Double.parseDouble(longitude);
				obj.setLongitude(dblLongitude);
				objVehicle.setLongitude(dblLongitude);
			}
			obj.setVehicle(vehicle);
			obj.setDriver(driver);

			objVehicle.setDriver(driver);

			obj = pm.makePersistent(obj);
			objVehicle = pm.makePersistent(objVehicle);
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
		if(vehicle != null && vehicle.length() > 0) {
			strFilter += " && vehicle == vehicleParam";
			strParameter += ", String vehicleParam";
		}
		if(driver != null && driver.length() > 0) {
			strFilter += " && driver == driverParam";
			strParameter += ", String driverParam";
		}

		query.setFilter(strFilter);
		query.declareParameters(strParameter);
//		query.setOrdering("createdAt ASC");
		
		// query.setGrouping(user.getCompany());
		// query.setOrdering();
		// query.declareParameters();

		if((vehicle != null && vehicle.length() > 0) && (driver != null && driver.length() > 0))
			return (List<Track>)query.execute(company, vehicle, driver);
		if((vehicle != null && vehicle.length() > 0))
			return (List<Track>)query.execute(company, vehicle);
		if((driver != null && driver.length() > 0))
			return (List<Track>)query.execute(company, driver);
		else
			return (List<Track>) query.execute(company);
	}

}
