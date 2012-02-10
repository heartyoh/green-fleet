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

import com.google.appengine.api.datastore.Entity;

@Controller
public class VehicleService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(VehicleService.class);

	@Override
	protected String getEntityName() {
		return "Vehicle";
	}

	@Override
	protected boolean useFilter() {
		return false;
	}

	@Override
	protected String getIdValue(Map<String, String> map) {
		return map.get("id");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, String> map, Date now) {
		entity.setProperty("id", map.get("id"));
		entity.setProperty("createdAt", now);
	}

	@Override
	protected void onMultipart(Entity entity, Map<String, String> map, MultipartHttpServletRequest request)
			throws IOException {
		super.onMultipart(entity, map, request);
		if(map.containsKey("imageFile"))
			entity.setProperty("imageClip", map.get("imageFile"));
	}

	@Override
	protected void onSave(Entity entity, Map<String, String> map, Date now) {
		entity.setProperty("manufacturer", map.get("manufacturer"));
		entity.setProperty("vehicleType", map.get("vehicleType"));
		entity.setProperty("birthYear", map.get("birthYear"));
		entity.setProperty("ownershipType", map.get("ownershipType"));
		entity.setProperty("status", map.get("status"));
		entity.setProperty("totalDistance", doubleProperty(map, "totalDistance"));
		entity.setProperty("registrationNumber", map.get("registrationNumber"));
		entity.setProperty("remainingFuel", doubleProperty(map, "remainingFuel"));
		entity.setProperty("distanceSinceNewOil", doubleProperty(map, "distanceSinceNewOil"));
		entity.setProperty("engineOilStatus", map.get("engineOilStatus"));
		entity.setProperty("fuelFilterStatus", map.get("fuelFilterStatus"));
		entity.setProperty("brakeOilStatus", map.get("brakeOilStatus"));
		entity.setProperty("brakePedalStatus", map.get("brakePedalStatus"));
		entity.setProperty("coolingWaterStatus", map.get("coolingWaterStatus"));
		entity.setProperty("timingBeltStatus", map.get("timingBeltStatus"));
		entity.setProperty("sparkPlugStatus", map.get("sparkPlugStatus"));

		entity.setProperty("updatedAt", now);
	}

	@RequestMapping(value = "/vehicle/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws IOException {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		return super.save(request, response);
	}

	@RequestMapping(value = "/vehicle/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/vehicle", method = RequestMethod.GET)
	public @ResponseBody
	List<Map<String, Object>> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

}
