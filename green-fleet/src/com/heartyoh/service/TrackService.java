package com.heartyoh.service;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

@Controller
public class TrackService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(TrackService.class);

	@Override
	protected String getEntityName() {
		return "Track";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	@Override
	protected String getIdValue(Map<String, String> map) {
		return map.get("terminal") + "@" + map.get("datetime");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, String> map, Date now) {
		entity.setProperty("createdAt", now);
	}

	@Override
	protected void onSave(Entity entity, Map<String, String> map, Date now) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		String terminal = map.get("terminal");
		String vehicle = map.get("vehicle");
		String driver = map.get("driver");
		String lattitude = map.get("lattitude");
		String longitude = map.get("longitude");
		String datetime = map.get("datetime");
		String velocity = map.get("velocity");

		Key keyVehicle = KeyFactory.createKey(entity.getParent(), "Vehicle", vehicle);
		Entity objVehicle = null;

		try {
			objVehicle = datastore.get(keyVehicle);
		} catch (EntityNotFoundException e) {
			e.printStackTrace();
		}

		if (lattitude != null) {
			double dblLattitude = Double.parseDouble(lattitude);
			entity.setProperty("lattitude", dblLattitude);
			if (objVehicle != null)
				objVehicle.setProperty("lattitude", dblLattitude);
		}
		if (longitude != null) {
			double dblLongitude = Double.parseDouble(longitude);
			entity.setProperty("longitude", dblLongitude);
			if (objVehicle != null)
				objVehicle.setProperty("longitude", dblLongitude);
		}
		entity.setProperty("terminal", terminal);
		entity.setProperty("vehicle", vehicle);
		entity.setProperty("driver", driver);
		entity.setProperty("datetime", datetime);
		entity.setProperty("velocity", velocity);

		if (objVehicle != null) {
			objVehicle.setProperty("driver", driver);
			objVehicle.setProperty("terminal", terminal);
		}

		entity.setProperty("updatedAt", now);
	}

	@RequestMapping(value = "/track/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws IOException {
		return super.imports(request, response);
	}

	// @RequestMapping(value = "/track/import", method = RequestMethod.POST)
	// public @ResponseBody
	// String imports(MultipartHttpServletRequest request, HttpServletResponse
	// response) throws IOException {
	// CustomUser user = SessionUtils.currentUser();
	//
	// MultipartFile file = request.getFile("file");
	//
	// BufferedReader br = new BufferedReader(new
	// InputStreamReader(file.getInputStream(), "UTF-8"));
	//
	// String line = br.readLine();
	// /*
	// * First line for the header Information
	// */
	// String[] keys = line.split(",");
	//
	// /*
	// * Next lines for the values
	// */
	// PersistenceManager pm = PMF.get().getPersistenceManager();
	// try {
	// Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(),
	// user.getCompany());
	// Company company = pm.getObjectById(Company.class, companyKey);
	//
	// Date now = new Date();
	//
	// while ((line = br.readLine()) != null) {
	// String[] values = line.split(",");
	//
	// Map<String, String> map = new HashMap<String, String>();
	//
	// for (int i = 0; i < keys.length; i++) {
	// map.put(keys[i].trim(), values[i].trim());
	// }
	//
	// Track track = new Track();
	//
	// try {
	// String vehicle = map.get("vehicle");
	// String driver = map.get("driver");
	// double lattitude = Double.parseDouble(map.get("lattitude"));
	// double longitude = Double.parseDouble(map.get("longitude"));
	//
	// track.setCompany(company);
	// track.setVehicle(vehicle);
	// track.setDriver(driver);
	// track.setLattitude(lattitude);
	// track.setLongitude(longitude);
	// track.setCreatedAt(now);
	//
	// track = pm.makePersistent(track);
	//
	// Key vehicleKey = KeyFactory.createKey(companyKey,
	// Vehicle.class.getSimpleName(), vehicle);
	// Vehicle objVehicle = pm.getObjectById(Vehicle.class, vehicleKey);
	//
	// objVehicle.setLattitude(lattitude);
	// objVehicle.setLongitude(longitude);
	// objVehicle.setDriver(driver);
	//
	// objVehicle = pm.makePersistent(objVehicle);
	//
	// } catch (Exception e) {
	// e.printStackTrace();
	// }
	// }
	// } finally {
	// pm.close();
	// }
	//
	// response.setContentType("text/html");
	//
	// return "{ \"success\" : true }";
	// }

	// @RequestMapping(value = "/track/save", method = RequestMethod.POST)
	// public @ResponseBody
	// Map<String, Object> save(HttpServletRequest request, HttpServletResponse
	// response) {
	// super.save(request, response);
	// CustomUser user = SessionUtils.currentUser();
	//
	// String key = request.getParameter("key");
	// String vehicle = request.getParameter("vehicle");
	// String driver = request.getParameter("driver");
	// String lattitude = request.getParameter("lattitude");
	// String longitude = request.getParameter("longitude");
	//
	// Key objKey = null;
	// boolean creating = false;
	//
	// PersistenceManager pm = PMF.get().getPersistenceManager();
	// Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(),
	// user.getCompany());
	// Company company = pm.getObjectById(Company.class, companyKey);
	//
	// Key vehicleKey = KeyFactory.createKey(companyKey,
	// Vehicle.class.getSimpleName(), vehicle);
	// Vehicle objVehicle = pm.getObjectById(Vehicle.class, vehicleKey);
	//
	// // Key driverKey = KeyFactory.createKey(companyKey,
	// Driver.class.getSimpleName(), driver);
	// // Driver objDriver = pm.getObjectById(Driver.class, driverKey);
	//
	// Track obj = null;
	//
	// if (key != null && key.trim().length() > 0) {
	// objKey = KeyFactory.stringToKey(key);
	// } else {
	// creating = true;
	// }
	//
	// Date now = new Date();
	//
	// try {
	// if (creating) {
	// obj = new Track();
	// obj.setCompany(company);
	// obj.setCreatedAt(now);
	// } else {
	// obj = pm.getObjectById(clazz, objKey);
	// }
	// /*
	// * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
	// */
	//
	// if(lattitude != null) {
	// double dblLattitude = Double.parseDouble(lattitude);
	// obj.setLattitude(dblLattitude);
	// objVehicle.setLattitude(dblLattitude);
	// }
	// if(longitude != null) {
	// double dblLongitude = Double.parseDouble(longitude);
	// obj.setLongitude(dblLongitude);
	// objVehicle.setLongitude(dblLongitude);
	// }
	// obj.setVehicle(vehicle);
	// obj.setDriver(driver);
	//
	// objVehicle.setDriver(driver);
	//
	// obj = pm.makePersistent(obj);
	// objVehicle = pm.makePersistent(objVehicle);
	// } finally {
	// pm.close();
	// }
	//
	// Map<String, Object> result = new HashMap<String, Object>();
	//
	// result.put("success", true);
	// result.put("msg", clazz.getSimpleName() + (creating ? " created." :
	// " updated"));
	// result.put("key", obj.getKey());
	//
	// return result;
	// }

	// @RequestMapping(value = "/track/delete", method = RequestMethod.POST)
	// public @ResponseBody
	// Map<String, Object> delete(HttpServletRequest request,
	// HttpServletResponse response) {
	// String key = request.getParameter("key");
	//
	// PersistenceManager pm = PMF.get().getPersistenceManager();
	//
	// try {
	// Track obj = pm.getObjectById(clazz, KeyFactory.stringToKey(key));
	//
	// pm.deletePersistent(obj);
	// } finally {
	// pm.close();
	// }
	//
	// Map<String, Object> result = new HashMap<String, Object>();
	// result.put("success", true);
	// result.put("msg", clazz.getSimpleName() + " destroyed.");
	//
	// return result;
	// }

	// @SuppressWarnings("unchecked")
	// @RequestMapping(value = "/track", method = RequestMethod.GET)
	// public @ResponseBody
	// List<Track> retrieve(HttpServletRequest request, HttpServletResponse
	// response) {
	// CustomUser user = SessionUtils.currentUser();
	//
	// String jsonFilter = request.getParameter("filter");
	// String jsonSorter = request.getParameter("sort");
	//
	// List<Filter> filters = null;
	// List<Sorter> sorters = null;
	//
	// try {
	// if(jsonFilter != null) {
	// filters = new ObjectMapper().readValue(request.getParameter("filter"),
	// new TypeReference<List<Filter>>(){ });
	// }
	// if(jsonSorter != null) {
	// sorters = new ObjectMapper().readValue(request.getParameter("sort"), new
	// TypeReference<List<Sorter>>(){ });
	// }
	// } catch (Exception e) {
	// e.printStackTrace();
	// }
	//
	// Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(),
	// user.getCompany());
	//
	// PersistenceManager pm = PMF.get().getPersistenceManager();
	//
	// Company company = pm.getObjectById(Company.class, companyKey);
	//
	// Query query = pm.newQuery(clazz);
	//
	// String vehicle = null;
	// String driver = null;
	//
	// if (filters != null) {
	// Iterator<Filter> it = filters.iterator();
	// while (it.hasNext()) {
	// Filter filter = it.next();
	// if(filter.getProperty().equals("vehicle"))
	// vehicle = filter.getValue();
	// else if(filter.getProperty().equals("driver"))
	// driver = filter.getValue();
	// }
	// }
	//
	// String strFilter = "company == companyParam";
	// String strParameter = Company.class.getName() + " companyParam";
	// if(vehicle != null && vehicle.length() > 0) {
	// strFilter += " && vehicle == vehicleParam";
	// strParameter += ", String vehicleParam";
	// }
	// if(driver != null && driver.length() > 0) {
	// strFilter += " && driver == driverParam";
	// strParameter += ", String driverParam";
	// }
	//
	// query.setFilter(strFilter);
	// query.declareParameters(strParameter);
	// // query.setOrdering("createdAt ASC");
	//
	// // query.setGrouping(user.getCompany());
	// // query.setOrdering();
	// // query.declareParameters();
	//
	// if((vehicle != null && vehicle.length() > 0) && (driver != null &&
	// driver.length() > 0))
	// return (List<Track>)query.execute(company, vehicle, driver);
	// if((vehicle != null && vehicle.length() > 0))
	// return (List<Track>)query.execute(company, vehicle);
	// if((driver != null && driver.length() > 0))
	// return (List<Track>)query.execute(company, driver);
	// else
	// return (List<Track>) query.execute(company);
	// }

	@RequestMapping(value = "/track/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		return super.save(request, response);
	}

	@RequestMapping(value = "/track/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/track", method = RequestMethod.GET)
	public @ResponseBody
	List<Map<String, Object>> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

}
