/**
 * 
 */
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

/**
 * 위치 정보 서비스 
 * 
 * @author jhnam
 */
public class LocationService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(LocationService.class);
	
	@Override
	protected String getEntityName() {
		return "Location";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String)map.get("name");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("name", map.get("name"));

		super.onCreate(entity, map, datastore);		
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		// 주소 
		entity.setProperty("addr", map.get("addr"));
		// 위도 
		entity.setProperty("lat", map.get("lat"));
		// 경도 
		entity.setProperty("lng", map.get("lng"));
		// 반경
		entity.setProperty("rad", map.get("rad"));		
		// lat_hi
		entity.setProperty("lat_hi", map.get("lat_hi"));
		// lat_lo
		entity.setProperty("lat_lo", map.get("lat_lo"));
		// lng_hi
		entity.setProperty("lng_hi", map.get("lng_hi"));
		// lng_lo
		entity.setProperty("lng_lo", map.get("lng_lo"));		
		// 설명 
		entity.setProperty("desc", map.get("desc"));
		
		super.onSave(entity, map, datastore);
	}
	
	@RequestMapping(value = "/location/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/location/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/location/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/location", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {		
		return super.retrieve(request, response);
	}	
}
