package com.heartyoh.service;

import java.io.IOException;
import java.nio.ByteBuffer;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Incident;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class IncidentService {
	private static final Logger logger = LoggerFactory.getLogger(IncidentService.class);
	private static final Class<Incident> clazz = Incident.class;

	@RequestMapping(value = "/incident/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String videoClip = null;
		if (request instanceof MultipartHttpServletRequest) {
			// process the uploaded file
			MultipartFile videoFile = ((MultipartHttpServletRequest) request).getFile("videoFile");

			if(videoFile.getSize() > 0) {
				com.google.appengine.api.files.FileService fileService = FileServiceFactory.getFileService();
				AppEngineFile file = fileService.createNewBlobFile(videoFile.getContentType()); //, videoFile.getOriginalFilename());

				boolean lock = true;
				FileWriteChannel writeChannel = fileService.openWriteChannel(file, lock);

				writeChannel.write(ByteBuffer.wrap(videoFile.getBytes()));

				writeChannel.closeFinally();

				videoClip = fileService.getBlobKey(file).getKeyString();
			}
		}

		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String vehicle = request.getParameter("vehicle");
		String driver = request.getParameter("driver");
		String incidentTime = request.getParameter("incidentTime");
		String lattitude = request.getParameter("lattitude");
		String longitude = request.getParameter("longitude");
		String impulse = request.getParameter("impulse");

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Incident obj = null;

		Date now = new Date();

		try {
			obj = new Incident();
			if (key != null && key.trim().length() > 0) {
				obj = pm.getObjectById(clazz, KeyFactory.stringToKey(key));
			} else {
				Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
				Company company = pm.getObjectById(Company.class, companyKey);

				obj.setCompany(company);
				obj.setCreatedAt(now);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if (vehicle != null)
				obj.setVehicle(vehicle);
			if (driver != null)
				obj.setDriver(driver);
			if (driver != null)
				obj.setDriver(driver);
			if (incidentTime != null) {
				Calendar cal = Calendar.getInstance();
				cal.setTimeInMillis(Long.parseLong(incidentTime) * 1000);
				obj.setIncidentTime(cal.getTime());
			}
			if (lattitude != null)
				obj.setLattitude(Double.parseDouble(lattitude));
			if (longitude != null)
				obj.setLongitude(Double.parseDouble(longitude));
			if (impulse != null)
				obj.setImpulse(Double.parseDouble(impulse));
			if (videoClip != null)
				obj.setVideoClip(videoClip);

			obj.setUpdatedAt(now);

			obj = pm.makePersistent(obj);
		} finally {
			pm.close();
		}

		response.setContentType("text/html");

		return "{ \"success\" : true, \"key\" : \"" + obj.getKey() + "\" }";
	}

	@RequestMapping(value = "/incident/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Incident obj = pm.getObjectById(clazz, KeyFactory.stringToKey(key));

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
	@RequestMapping(value = "/incident", method = RequestMethod.GET)
	public @ResponseBody
	List<Incident> retrieve(HttpServletRequest request, HttpServletResponse response) {
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
			return (List<Incident>)query.execute(company, vehicle, driver);
		if((vehicle != null && vehicle.length() > 0))
			return (List<Incident>)query.execute(company, vehicle);
		if((driver != null && driver.length() > 0))
			return (List<Incident>)query.execute(company, driver);
		else
			return (List<Incident>) query.execute(company);
	}

}
