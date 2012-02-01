package com.heartyoh.service;

import java.io.IOException;
import java.nio.ByteBuffer;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.SessionUtils;

@Controller
public class IncidentService {
	private static final Logger logger = LoggerFactory.getLogger(IncidentService.class);
	private static final String entity_name = "Incident";

	@RequestMapping(value = "/incident/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String videoClip = null;
		if (request instanceof MultipartHttpServletRequest) {
			// process the uploaded file
			MultipartFile videoFile = ((MultipartHttpServletRequest) request).getFile("videoFile");

			if (videoFile.getSize() > 0) {
				com.google.appengine.api.files.FileService fileService = FileServiceFactory.getFileService();
				AppEngineFile file = fileService.createNewBlobFile(videoFile.getContentType());

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
		String terminal = request.getParameter("terminal");
		String incidentTime = request.getParameter("incidentTime");
		String lattitude = request.getParameter("lattitude");
		String longitude = request.getParameter("longitude");
		String impulse = request.getParameter("impulse");
		String impulseThreshold = request.getParameter("impulseThreshold");
		String obdConnected = request.getParameter("obdConnected");
		String engineTemp = request.getParameter("engineTemp");
		String engineTempThreshold = request.getParameter("engineTempThreshold");
		String remainingFuel = request.getParameter("remainingFuel");
		String fuelThreshold = request.getParameter("fuelThreshold");

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

				obj = new Entity(entity_name, companyKey);
				obj.setProperty("createdAt", now);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if (vehicle != null)
				obj.setProperty("vehicle", vehicle);
			if (driver != null)
				obj.setProperty("driver", driver);
			if (terminal != null)
				obj.setProperty("terminal", terminal);
			if (incidentTime != null)
				obj.setProperty("incidentTime", SessionUtils.timestampToDate(incidentTime));
			if (lattitude != null)
				obj.setProperty("lattitude", Double.parseDouble(lattitude));
			if (longitude != null)
				obj.setProperty("longitude", Double.parseDouble(longitude));
			if (impulse != null)
				obj.setProperty("impulse", Double.parseDouble(impulse));
			if (impulseThreshold != null)
				obj.setProperty("impulseThreshold", Double.parseDouble(impulseThreshold));
			obj.setProperty("obdConnected", SessionUtils.parseBoolean(obdConnected));
			if (engineTemp != null)
				obj.setProperty("engineTemp", Double.parseDouble(engineTemp));
			if (engineTempThreshold != null)
				obj.setProperty("engineTempThreshold", Double.parseDouble(engineTempThreshold));
			if (remainingFuel != null)
				obj.setProperty("remainingFuel", Double.parseDouble(remainingFuel));
			if (fuelThreshold != null)
				obj.setProperty("fuelThreshold", Double.parseDouble(fuelThreshold));
			if (videoClip != null)
				obj.setProperty("videoClip", videoClip);

			obj.setProperty("updatedAt", now);

			datastore.put(obj);
		} finally {
		}

		response.setContentType("text/html");

		return "{ \"success\" : true, \"key\" : \"" + KeyFactory.keyToString(obj.getKey()) + "\" }";
	}

	@RequestMapping(value = "/incident/delete", method = RequestMethod.POST)
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

	@RequestMapping(value = "/incident", method = RequestMethod.GET)
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
		Query q = new Query("Incident");
		q.setAncestor(companyKey);

		if(vehicle != null && vehicle.length() > 0)
			q.addFilter("vehicle", Query.FilterOperator.EQUAL, vehicle);
		if(driver != null && driver.length() > 0)
			q.addFilter("driver", Query.FilterOperator.EQUAL, driver);

		// PreparedQuery contains the methods for fetching query results
		// from the datastore
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
