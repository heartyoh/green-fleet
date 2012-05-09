package com.heartyoh.service;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
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
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.util.AsyncUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

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
	protected String getIdValue(Map<String, Object> map) {
		String datetime = (String)map.get("datetime");
		if(datetime == null) {
			DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			datetime = df.format(new Date());
		}

		return map.get("terminal_id") + "@" + datetime;
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		Entity company = datastore.get((Key)map.get("_company_key"));
		
		String datetime = (String)map.get("datetime");
		
		if(datetime == null) {
			entity.setProperty("datetime", map.get("_now"));
		} else {
			entity.setProperty("datetime", SessionUtils.stringToDateTime(datetime, null, Integer.parseInt((String)company.getProperty("timezone"))));
		}

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		String terminal_id = (String) map.get("terminal_id");
		String vehicle_id = (String) map.get("vehicle_id");
		String driver_id = (String) map.get("driver_id");
		String lattitude = (String) map.get("lattitude");
		String longitude = (String) map.get("longitude");
		String velocity = (String) map.get("velocity");

		double dblLattitude = 0;
		double dblLongitude = 0;
		
		if (!DataUtils.isEmpty(lattitude)) {
			dblLattitude = Double.parseDouble(lattitude);
			entity.setProperty("lattitude", dblLattitude);
		}
		
		if (!DataUtils.isEmpty(longitude)) {
			dblLongitude = Double.parseDouble(longitude);
			entity.setProperty("longitude", dblLongitude);
		}
		
		if(dblLattitude == 0 && dblLongitude == 0)
			throw new Exception("Both of lattitude & longitude values are 0. It might meant to be non stable status of blackbox.");
		
		// 위치 기반 서비스 알림 비동기 처리
		AsyncUtils.addLbaTaskToQueue(entity.getParent().getName(), vehicle_id, dblLattitude, dblLongitude);
		
		entity.setProperty("terminal_id", terminal_id);
		entity.setProperty("vehicle_id", vehicle_id);
		entity.setProperty("driver_id", driver_id);
		entity.setProperty("velocity", velocity);

		super.onSave(entity, map, datastore);
	}
	
	@Override
	protected void saveEntity(Entity trackObj, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		Key vehicleKey = KeyFactory.createKey(trackObj.getParent(), "Vehicle", (String)trackObj.getProperty("vehicle_id"));
		Entity vehicle = DatastoreUtils.findVehicle(vehicleKey);

		if(vehicle != null) {			
			vehicle.setProperty("lattitude", trackObj.getProperty("lattitude"));
			vehicle.setProperty("longitude", trackObj.getProperty("longitude"));
			vehicle.setProperty("driver_id", trackObj.getProperty("driver_id"));
			vehicle.setProperty("terminal_id", trackObj.getProperty("terminal_id"));			
			super.saveEntity(vehicle, map, datastore);
		}
		
		super.saveEntity(trackObj, map, datastore);
	}

	@RequestMapping(value = "/track/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/track/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/track/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = {"/track", "/m/data/track.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrievex(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		
		String date = request.getParameter("date");
		String vehicleId = request.getParameter("vehicle_id");
		
		if(!DataUtils.isEmpty(date)) {
			
			long dateMillis = DataUtils.toLong(date);
			if(dateMillis > 1) {
				Date[] fromToDate = DataUtils.getFromToDate(dateMillis * 1000, 0, 1);
				q.addFilter("datetime", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromToDate[0]);
				q.addFilter("datetime", Query.FilterOperator.LESS_THAN_OR_EQUAL, fromToDate[1]);
			}
		}
				
		if(!DataUtils.isEmpty(vehicleId)) {
			q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
		}
	}
}
