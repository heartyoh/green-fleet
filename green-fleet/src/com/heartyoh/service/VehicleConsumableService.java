/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
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
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.util.SessionUtils;

/**
 * 차량별 소모품 교체 기준 정보
 * 
 * @author jhnam
 */
@Controller
public class VehicleConsumableService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(VehicleConsumableService.class);

	@Override
	protected String getEntityName() {
		return "VehicleConsumable";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String) map.get("vehicle_id") + "@" + (String) map.get("consumable_item");
	}
	
	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("vehicle_id", map.get("vehicle_id"));
		entity.setProperty("consumable_item", map.get("consumable_item"));
		
		super.onCreate(entity, map, datastore);
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		// 소모품 교체 주기 단위 - 주행거리, 기간, 주행거리 and 기간 
		entity.setProperty("repl_unit", map.get("repl_unit"));
		// 교체 주기 
		entity.setProperty("repl_mileage", map.get("repl_mileage"));
		// 교체 mileage
		entity.setProperty("repl_time", map.get("repl_time"));
		
		// 마지막(최근) 교체일
		entity.setProperty("last_repl_date", map.get("last_repl_date"));
		// 최근 교체시점에서의 주행거리 
		entity.setProperty("miles_last_repl", map.get("miles_last_repl"));
		// 다음 교체시점의 주행거리 ==> 소모품 교체 이력 입력시 자동 계산 
		entity.setProperty("next_repl_mileage", map.get("next_repl_mileage"));
		// 다음 교체일 ==> 소모품 교체 이력 입력시 자동 계산 
		entity.setProperty("next_repl_date", map.get("next_repl_date"));
		// 누적 비용 ==> 소모품 교체 이력 입력시 자동 계산 
		entity.setProperty("accrued_cost", map.get("accrued_cost"));
		
		// 건강율 ==> 하루 한 번씩 업데이트 
		entity.setProperty("health_rate", map.get("health_rate"));
		// 건강상태 ==> 하루 한 번씩 업데이트 
		entity.setProperty("status", map.get("status"));
		
		super.onSave(entity, map, datastore);
	}
	
	@RequestMapping(value = "/vehicle_consumable/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle_consumable/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/vehicle_consumable/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/vehicle_consumable", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		
		Map<String, Object> vehicleConsumables = super.retrieve(request, response);
		
		if(vehicleConsumables.get("total") != null && (Integer)vehicleConsumables.get("total") <= 0 ) {
			this.initConsumables(request, response);			
		} 

		return super.retrieve(request, response);
	}
	
	/**
	 * 차량별 소모품 정보가 없을 경우 소모품 기준 정보로 부터 자동으로 생성한다.
	 *  
	 * @param request
	 * @param response
	 */
	private void initConsumables(HttpServletRequest request, HttpServletResponse response) {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = this.getCompanyKey(request);		
		Query q = new Query("ConsumableCode");
		q.setAncestor(companyKey);		

		PreparedQuery pq = datastore.prepare(q);
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		Date now = new Date();
				
		for (Entity result : pq.asIterable()) {
			Map<String, Object> item = SessionUtils.cvtEntityToMap(result);
			item.put("_now", now);
			item.put("_company_key", companyKey);			
			item.put("consumable_item", item.remove("name"));
			item.put("key", "");
			item.remove("desc");
			item.put("miles_last_repl", 0);
			item.put("next_repl_mileage", 0);
			item.put("accrued_cost", 0);
			item.put("vehicle_id", request.getParameter("vehicle_id"));
			items.add(item);
		}
		
		List<Entity> entities = new ArrayList<Entity>();
		
		for(Map<String, Object> item : items) {
			Key objKey = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(item));		
			Entity obj = new Entity(objKey);
			try {
				onCreate(obj, item, datastore);				
				onSave(obj, item, datastore);
				entities.add(obj);
			} catch (Exception e) {
				logger.error("Error at OnCreate", e);
			}			
		}
			
		Transaction txn = datastore.beginTransaction();
		try {
			datastore.put(entities);
			txn.commit();
		} catch (Exception e) {
			txn.rollback();
			logger.error("Error when create consumables data!", e);
		} 	
	}

	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		String vehicleId = request.getParameter("vehicle_id");
		
		if(vehicleId != null && !vehicleId.isEmpty())
			q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
	}
}
