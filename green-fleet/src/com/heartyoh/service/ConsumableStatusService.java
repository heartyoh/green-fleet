/**
 * 
 */
package com.heartyoh.service;

import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.heartyoh.util.SessionUtils;

/**
 * 차량 소모품의 현재 상태 정보 
 * 
 * @author jonghonam
 */
public class ConsumableStatusService extends EntityService {

	@Override
	protected String getEntityName() {
		return "ConsumableStatus";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return map.get("vehicle_id") + "@" + map.get("consumable_item");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("vehicle_id", map.get("vehicle_id"));
		entity.setProperty("consumable_item", map.get("consumable_item"));
		
		super.onCreate(entity, map, datastore);
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		// 마지막(최근) 교체일 
		entity.setProperty("last_repl_date", map.get("last_repl_date"));
		// 최근 교체시점에서의 마일리지 
		entity.setProperty("last_repl_mileage", map.get("last_repl_mileage"));
		// 다음 교체시점의 마일리지 
		entity.setProperty("next_repl_mileage", map.get("next_repl_mileage"));
		// 다음 교체일 
		entity.setProperty("next_repl_date", map.get("next_repl_date"));
		// 누적 비용 
		entity.setProperty("accum_cost", map.get("accum_cost"));
		
		super.onSave(entity, map, datastore);
	}
	
	@RequestMapping(value = "/consumable_status/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/consumable_status/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/consumable_status/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/consumable_status", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {		
		return super.retrieve(request, response);
	}	
}
