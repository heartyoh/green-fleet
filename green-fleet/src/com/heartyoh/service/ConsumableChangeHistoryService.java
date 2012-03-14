/**
 * 
 */
package com.heartyoh.service;

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
import com.heartyoh.util.SessionUtils;

/**
 * 차량 소모품 교체 이력 서비스
 * 
 * @author jhnam
 */
@Controller
public class ConsumableChangeHistoryService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(ConsumableChangeHistoryService.class);
			
	@Override
	protected String getEntityName() {
		return "ConsumableChangeHistory";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return map.get("vehicle_id") + "@" + map.get("consumable_code") + "@" + map.get("repl_date");
	}
	
	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		Entity company = datastore.get((Key)map.get("_company_key"));
		entity.setProperty("vehicle_id", map.get("vehicle_id"));
		entity.setProperty("consumable_code", map.get("consumable_code"));		
		Date replDate = SessionUtils.stringToDateTime((String)map.get("datetime"), null, Integer.parseInt((String)company.getProperty("timezone")));
		entity.setProperty("repl_date", replDate);
		
		super.onCreate(entity, map, datastore);
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		entity.setProperty("repl_mileage", map.get("repl_mileage"));
		entity.setProperty("next_repl_mileage", map.get("next_repl_mileage"));
		entity.setProperty("next_repl_date", map.get("next_repl_date"));
		entity.setProperty("price", map.get("price"));
		entity.setProperty("component", map.get("component"));
		
		super.onSave(entity, map, datastore);
	}
	
	@RequestMapping(value = "/consumable_change/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/consumable_change/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/consumable_change/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/consumable_change", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {		
		return super.retrieve(request, response);
	}	

}
