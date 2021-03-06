package com.heartyoh.service.datastore;

import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

@Controller
public class IncidentLogService extends EntityService {

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
		Date datetime = SessionUtils.stringToDateTime((String)map.get("datetime"), null, company);
		entity.setProperty("datetime", datetime);
		Key incidentKey = KeyFactory.createKey(entity.getParent(), "Incident", 
				commons.get("terminal_id") + "@" + commons.get("datetime"));
		entity.setProperty("incident", KeyFactory.keyToString(incidentKey));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("lat", doubleProperty(map, "lat"));
		entity.setProperty("lng", doubleProperty(map, "lng"));
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
	
	@Override
	protected void adjustItem(Map<String, Object> item) {
		
		if(item == null)
			return;
		
		Object lat = item.get("lat");
		Object lng = item.get("lng");
		
		if((lat == null && lng == null) || 
		   (DataUtils.toDouble(lat) == 0 && DataUtils.toDouble(lng) == 0)) {
			item.clear();
		}
	}

	@Override
	protected void saveEntity(Entity obj, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		Object latVal = obj.getProperty("lat");
		Object lngVal = obj.getProperty("lng");
		
		if((latVal == null && lngVal == null) || 
		   (DataUtils.toDouble(latVal) == 0 && DataUtils.toDouble(lngVal) == 0)) {
			return;
		}
		
		datastore.put(obj);
	}	
}
