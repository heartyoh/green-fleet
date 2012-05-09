package com.heartyoh.service;

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
import com.heartyoh.util.SessionUtils;

@Controller
public class IncidentLogService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(IncidentLogService.class);

	@Override
	protected String getEntityName() {
		return "IncidentLog";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		@SuppressWarnings("unchecked")
		Map<String, Object> commons = (Map<String, Object>) map.get("_commons");

		return commons.get("terminal_id") + "@" + map.get("datetime");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		Entity company = datastore.get((Key)map.get("_company_key"));
		@SuppressWarnings("unchecked")
		Map<String, Object> commons = (Map<String, Object>) map.get("_commons");

		entity.setProperty("terminal_id", commons.get("terminal_id"));
		entity.setProperty("datetime", SessionUtils.stringToDateTime((String)map.get("datetime"), null, Integer.parseInt((String)company.getProperty("timezone"))));
		Key incidentKey = KeyFactory.createKey(entity.getParent(), "Incident", commons.get("terminal_id") + "@"
				+ commons.get("datetime"));
		entity.setProperty("incident", KeyFactory.keyToString(incidentKey));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("datetime", SessionUtils.stringToDateTime((String) map.get("datetime")));
		entity.setProperty("lattitude", doubleProperty(map, "lattitude"));
		entity.setProperty("longitude", doubleProperty(map, "longitude"));
		entity.setProperty("velocity", doubleProperty(map, "velocity"));
		entity.setProperty("accelate_x", doubleProperty(map, "accelate_x"));
		entity.setProperty("accelate_y", doubleProperty(map, "accelate_y"));
		entity.setProperty("accelate_z", doubleProperty(map, "accelate_z"));

		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/incident/upload_log", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/incident_log/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = {"/incident_log", "/m/data/incident_log.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

}
