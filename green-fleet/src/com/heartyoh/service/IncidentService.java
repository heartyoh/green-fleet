package com.heartyoh.service;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedList;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.util.SessionUtils;

@Controller
public class IncidentService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(IncidentService.class);

	@Override
	protected String getEntityName() {
		return "Incident";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return map.get("terminal_id") + "@" + map.get("datetime");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		Entity company = datastore.get((Key)map.get("_company_key"));
		
		entity.setProperty("terminal_id", map.get("terminal_id"));
		entity.setProperty("datetime", SessionUtils.stringToDateTime((String)map.get("datetime"), null, Integer.parseInt((String)company.getProperty("timezone"))));
		entity.setProperty("confirm", false);

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request) throws IOException {
		String video_file = saveFile((MultipartFile) map.get("video_file"));
		if(video_file != null) {
			entity.setProperty("video_clip", video_file);
		}

		super.postMultipart(entity, map, request);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {

		if (map.get("vehicle_id") != null)
			entity.setProperty("vehicle_id", stringProperty(map, "vehicle_id"));
		if (map.get("driver_id") != null)
			entity.setProperty("driver_id", stringProperty(map, "driver_id"));
		if (map.get("lattitude") != null)
			entity.setProperty("lattitude", doubleProperty(map, "lattitude"));
		if (map.get("longitude") != null)
			entity.setProperty("longitude", doubleProperty(map, "longitude"));
		if (map.get("velocity") != null)
			entity.setProperty("velocity", doubleProperty(map, "velocity"));
		if (map.get("impulse_abs") != null)
			entity.setProperty("impulse_abs", doubleProperty(map, "impulse_abs"));
		if (map.get("impulse_x") != null)
			entity.setProperty("impulse_x", doubleProperty(map, "impulse_x"));
		if (map.get("impulse_y") != null)
			entity.setProperty("impulse_y", doubleProperty(map, "impulse_y"));
		if (map.get("impulse_z") != null)
			entity.setProperty("impulse_z", doubleProperty(map, "impulse_z"));
		if (map.get("impulse_threshold") != null)
			entity.setProperty("impulse_threshold", doubleProperty(map, "impulse_threshold"));
		if (map.get("engine_temp") != null)
			entity.setProperty("engine_temp", doubleProperty(map, "engine_temp"));
		if (map.get("engine_temp_threshold") != null)
			entity.setProperty("engine_temp_threshold", doubleProperty(map, "engine_temp_threshold"));
		if (map.get("obd_connected") != null)
			entity.setProperty("obd_connected", booleanProperty(map, "obd_connected"));
		if (map.get("confirm") != null) {
			entity.setProperty("confirm", booleanProperty(map, "confirm"));
		}

		super.onSave(entity, map, datastore);
		
		datastore.put(entity);
		
		/*
		 * 관련 차량의 정보를 가져온다.
		 */
		Key vehicleKey = KeyFactory.createKey(entity.getParent(), "Vehicle", (String)entity.getProperty("vehicle_id"));
		Entity vehicle;
		try {
			vehicle = datastore.get(vehicleKey);
		} catch (EntityNotFoundException e) {
			e.printStackTrace();
			return;
		}
		boolean confirmed = (entity.getProperty("confirm") == null) ? false : ((Boolean)entity.getProperty("confirm")).booleanValue();
		if(!confirmed) {
			vehicle.setProperty("status", "Incident");
			datastore.put(vehicle);
			return;
		}
		
		/*
		 * 만약, 이 Incident의 컨펌 정보가 off이면, 차량의 상태는 무조건 Incident이며,
		 * 컨펌정보가 on이면, 컨펌정보가 off인 Incident 리스트를 가져와서 하나라도 남아있으면, 차량의 상태는 Incident가 된다.
		 * 따라서, 아래에서는 관련 차량의 Incident 정보중 아직 컨펌되지 않은 리스트를 가져온다.
		 */
		Query q = new Query("Incident");
		q.setAncestor(entity.getParent());
		q.addFilter("vehicle_id", FilterOperator.EQUAL, (String)vehicle.getProperty("id"));
		q.addFilter("confirm", FilterOperator.NOT_EQUAL, true);
		
		PreparedQuery pq = datastore.prepare(q);

		List<Map<String, Object>> incidents = new LinkedList<Map<String, Object>>();
		
		for (Entity result : pq.asIterable()) {
			incidents.add(SessionUtils.cvtEntityToMap(result));
		}

		if(incidents.size() > 0) {
			vehicle.setProperty("status", "Incident");
		} else {
			vehicle.setProperty("status", "Running");
		}

		datastore.put(vehicle);
	}

	@RequestMapping(value = "/incident/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/incident/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/incident/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		String date = request.getParameter("date");
		if(date != null) {
			long fromMillis = Long.parseLong(date);
			Calendar c = Calendar.getInstance();
			c.setTimeInMillis(fromMillis * 1000);
			Date fromDate = c.getTime();
			c.setTimeInMillis((fromMillis + (60 * 60 * 24)) * 1000);
			Date toDate = c.getTime();
			q.addFilter("datetime", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate);
			q.addFilter("datetime", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate);
		}
		
		String vehicle_id = request.getParameter("vehicle_id");
		if(vehicle_id != null && !vehicle_id.isEmpty()) {
			q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicle_id);
		}

		String driver_id = request.getParameter("driver_id");
		if(driver_id != null && !driver_id.isEmpty()) {
			q.addFilter("driver_id", FilterOperator.EQUAL, driver_id);
		}

		String confirm = request.getParameter("confirm");
		if(confirm != null && !confirm.isEmpty()) {
			q.addFilter("confirm", FilterOperator.EQUAL, confirm.equals("true") || confirm.equals("on"));
		}
	}

	@RequestMapping(value = "/incident", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
}
