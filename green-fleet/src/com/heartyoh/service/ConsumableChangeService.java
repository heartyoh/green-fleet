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
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.heartyoh.util.SessionUtils;

/**
 * 차량 소모품 교체 이력 서비스
 * 
 * @author jhnam
 */
@Controller
public class ConsumableChangeService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(ConsumableChangeService.class);
			
	@Override
	protected String getEntityName() {
		return "ConsumableChange";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		this.checkReplacementDate(map);
		return map.get("vehicle_id") + "@" + map.get("consumable_item") + "@" + map.get("repl_date");
	}
	
	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		this.checkReplacementDate(map);
		entity.setProperty("vehicle_id", map.get("vehicle_id"));
		entity.setProperty("consumable_item", map.get("consumable_item"));
		entity.setProperty("repl_date", map.get("repl_date"));
		
		super.onCreate(entity, map, datastore);
	}
	
	private void checkReplacementDate(Map<String, Object> map) {
		Object replacementDate = map.get("repl_date");
		
		if(replacementDate instanceof String) {
			map.put("repl_date", SessionUtils.stringToDate((String)map.get("repl_date")));
		}
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		// 교체 시점에서의 마일리지 
		entity.setProperty("repl_mileage", map.get("repl_mileage"));
		// 교체 비용 
		entity.setProperty("cost", map.get("cost"));
		// 교체 작업자 
		entity.setProperty("worker", map.get("worker"));
		// 교체 부품 
		entity.setProperty("component", map.get("component"));
		// 코멘트 
		entity.setProperty("comment", map.get("comment"));
		
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

	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		String vehicleId = request.getParameter("vehicle_id");
		String consumableItem = request.getParameter("consumable_item");
		
		if(vehicleId != null && !vehicleId.isEmpty())
			q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
		
		if(consumableItem != null && !consumableItem.isEmpty())
			q.addFilter("consumable_item", FilterOperator.EQUAL, consumableItem);
		
		q.addSort("repl_date", SortDirection.DESCENDING);
	}
}
