package com.heartyoh.service;

import java.io.IOException;
import java.util.Map;

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

@Controller
public class IncidentVideoService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(IncidentVideoService.class);

	@Override
	protected String getEntityName() {
		return "Incident";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		map.get("video_file");
		return null;
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) {
		entity.setProperty("terminal_id", map.get("terminal_id"));
		entity.setProperty("datetime", map.get("datetime"));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request)
			throws IOException {
		entity.setProperty("video_clip", saveFile((MultipartFile) map.get("video_file")));

		super.postMultipart(entity, map, request);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) {

		entity.setProperty("terminal_id", stringProperty(map, "terminal_id"));
		entity.setProperty("vehicle_id", stringProperty(map, "vehicle_id"));
		entity.setProperty("driver_id", stringProperty(map, "driver_id"));
		entity.setProperty("lattitude", doubleProperty(map, "lattitude"));
		entity.setProperty("longitude", doubleProperty(map, "longitude"));
		entity.setProperty("velocity", doubleProperty(map, "velocity"));
		entity.setProperty("impulse_abs", doubleProperty(map, "impulse_abs"));
		entity.setProperty("impulse_x", doubleProperty(map, "impulse_x"));
		entity.setProperty("impulse_y", doubleProperty(map, "impulse_y"));
		entity.setProperty("impulse_z", doubleProperty(map, "impulse_z"));
		entity.setProperty("impulse_threshold", doubleProperty(map, "impulse_threshold"));
		entity.setProperty("engine_temp", doubleProperty(map, "engine_temp"));
		entity.setProperty("engine_temp_threshold", doubleProperty(map, "engine_temp_threshold"));
		entity.setProperty("obd_connected", booleanProperty(map, "obd_connected"));

		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/incident/upload_video", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws IOException {
		return super.imports(request, response);
	}

}
