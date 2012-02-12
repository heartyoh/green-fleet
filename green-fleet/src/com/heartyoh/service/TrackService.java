package com.heartyoh.service;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
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
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
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
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) {
		String datetime = (String)map.get("datetime");
		
		if(datetime == null) {
			entity.setProperty("datetime", map.get("_now"));
		} else {
			entity.setProperty("datetime", SessionUtils.stringToDateTime(datetime));
		}

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) {
		String terminal_id = (String) map.get("terminal_id");
		String vehicle_id = (String) map.get("vehicle_id");
		String driver_id = (String) map.get("driver_id");
		String lattitude = (String) map.get("lattitude");
		String longitude = (String) map.get("longitude");
		String velocity = (String) map.get("velocity");

		Key keyVehicle = KeyFactory.createKey(entity.getParent(), "Vehicle", vehicle_id);
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
		entity.setProperty("terminal_id", terminal_id);
		entity.setProperty("vehicle_id", vehicle_id);
		entity.setProperty("driver_id", driver_id);
		entity.setProperty("velocity", velocity);

		if (objVehicle != null) {
			objVehicle.setProperty("driver_id", driver_id);
			objVehicle.setProperty("terminal_id", terminal_id);
		}

		datastore.put(objVehicle);
		
		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/track/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws IOException {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/track/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		return super.save(request, response);
	}

	@RequestMapping(value = "/track/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/track", method = RequestMethod.GET)
	public @ResponseBody
	List<Map<String, Object>> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

}
