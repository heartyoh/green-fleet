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
