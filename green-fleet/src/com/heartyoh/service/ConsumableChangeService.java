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
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.heartyoh.util.CalculatorUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;

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
		this.checkReplDate(map);
		return map.get("vehicle_id") + "@" + map.get("consumable_item") + "@" + map.get("repl_date");
	}
	
	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		this.checkReplDate(map);
		entity.setProperty("vehicle_id", map.get("vehicle_id"));
		entity.setProperty("consumable_item", map.get("consumable_item"));
		entity.setProperty("repl_date", map.get("repl_date"));
		
		super.onCreate(entity, map, datastore);
	}
	
	private void checkReplDate(Map<String, Object> map) {		
		if(!DataUtils.isEmpty(map.get("repl_date"))) {
			Date lastReplDate = DataUtils.toDate(map.get("repl_date"));
			map.put("repl_date", lastReplDate);
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
	
	/**
	 * 소모품 기준 정보 혹은 소모품 교체 이력 추가에 따른 다음 교체일, 다음 교체시점의 주행거리 등의 정보 업데이트  
	 * 
	 * @param entity
	 * @return
	 */
	private Entity recalcConsumable(Key companyKey, Entity consumableChange) {
		
		// vehicle, consumable 정보를 모두 찾아서 업데이트 ...
		Entity vehicle = DatastoreUtils.findVehicle(companyKey, (String)consumableChange.getProperty("vehicle_id"));
		Entity consumable = DatastoreUtils.findConsumable(companyKey, (String)consumableChange.getProperty("vehicle_id"), (String)consumableChange.getProperty("consumable_item"));
		double totalMileage = DataUtils.toFloat(vehicle.getProperty("total_distance"));
		CalculatorUtils.recalcConsumableInfo(totalMileage, consumable, consumableChange);
		return consumable;
	}
	
	@RequestMapping(value = "/consumable_change/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/consumable_change/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, Object> map = toMap(request);
		if (request instanceof MultipartHttpServletRequest) {
			preMultipart(map, (MultipartHttpServletRequest) request);
		}

		String key = request.getParameter("key");
		Key companyKey = this.getCompanyKey(request);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();	
		Key objKey = (key != null && key.trim().length() > 0) ? KeyFactory.stringToKey(key) : KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
		
		boolean creating = false;
		Entity obj = null;

		try {
			obj = datastore.get(objKey);
		} catch (EntityNotFoundException e) {
			creating = true;
		}		

		Date now = new Date();
		map.put("_now", now);
		map.put("_company_key", companyKey);

		if (creating) {
			obj = new Entity(objKey);
			onCreate(obj, map, datastore);
		}

		if (request instanceof MultipartHttpServletRequest) {
			postMultipart(obj, map, (MultipartHttpServletRequest) request);
		}

		onSave(obj, map, datastore);
		Transaction txn = datastore.beginTransaction();
		
		try {
			Entity consumable = this.recalcConsumable(companyKey, obj);
			datastore.put(obj);
			datastore.put(consumable);
			txn.commit();
			
		} catch (Exception e) {
			logger.error("Failed to save consumable change!", e);
			txn.rollback();
		} 

		response.setContentType("text/html");
		return this.getCreateResultMsg(true, obj);		
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
