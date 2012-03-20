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
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Transaction;
import com.heartyoh.util.CalculatorUtils;
import com.heartyoh.util.DataUtils;
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
		
		this.checkDate(map);
		
		if(!DataUtils.isEmpty(map.get("repl_unit"))) {
			// 소모품 교체 주기 단위 - 주행거리, 기간, 주행거리 and 기간 
			entity.setProperty("repl_unit", map.get("repl_unit"));
		}
		
		if(!DataUtils.isEmpty(map.get("repl_mileage"))) {
			// 교체 주기 
			entity.setProperty("repl_mileage", map.get("repl_mileage"));
		}
		
		if(!DataUtils.isEmpty(map.get("repl_time"))) {
			// 교체 mileage
			entity.setProperty("repl_time", map.get("repl_time"));
		}
		
		if(!DataUtils.isEmpty(map.get("last_repl_date"))) {
			// 마지막(최근) 교체일
			entity.setProperty("last_repl_date", map.get("last_repl_date"));
		}
		
		if(!DataUtils.isEmpty(map.get("miles_last_repl"))) {
			// 최근 교체시점에서의 주행거리 
			entity.setProperty("miles_last_repl", map.get("miles_last_repl"));
		}
		
		if(!DataUtils.isEmpty(map.get("next_repl_mileage"))) {
			// 다음 교체시점의 주행거리 ==> 소모품 교체 이력 입력시 자동 계산 
			entity.setProperty("next_repl_mileage", map.get("next_repl_mileage"));
		}
		
		if(!DataUtils.isEmpty(map.get("next_repl_date"))) {
			// 다음 교체일 ==> 소모품 교체 이력 입력시 자동 계산 
			entity.setProperty("next_repl_date", map.get("next_repl_date"));
		}
		
		if(!DataUtils.isEmpty(map.get("accrued_cost"))) {
			// 누적 비용 ==> 소모품 교체 이력 입력시 자동 계산 
			entity.setProperty("accrued_cost", map.get("accrued_cost"));
		}
		
		if(!DataUtils.isEmpty(map.get("health_rate"))) {
			// 건강율 ==> 하루 한 번씩 업데이트 
			entity.setProperty("health_rate", map.get("health_rate"));
		}
		
		if(!DataUtils.isEmpty(map.get("status"))) {
			// 건강상태 ==> 하루 한 번씩 업데이트 
			entity.setProperty("status", map.get("status"));
		}
		
		super.onSave(entity, map, datastore);
	}
	
	/**
	 * String 타입의 데이터를 date 타입의 데이터로 변환하여 map에 추가  
	 * 
	 * @param map
	 */
	private void checkDate(Map<String, Object> map) {
		
		if(!DataUtils.isEmpty(map.get("last_repl_date"))) {
			Date lastReplDate = DataUtils.toDate(map.get("last_repl_date"));
			map.put("last_repl_date", lastReplDate);
		}
		
		if(!DataUtils.isEmpty(map.get("next_repl_date"))) {
			Date nextReplDate = DataUtils.toDate(map.get("next_repl_date"));		
			map.put("next_repl_date", nextReplDate);
		}
	}	
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/vehicle_consumable/summary", method = RequestMethod.GET)
	public @ResponseBody
	String summary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		
		// 0. 모든 company list를 가져옴
		CompanyService cs = new CompanyService();
		Map<String, Object> companyResults = cs.retrieve(request, response);
		List<Map<String, Object>> companies = (List<Map<String, Object>>)companyResults.get("items");
		
		for(Map<String, Object> company : companies) {
						
			// 1. 모든 vehicle list를 가져옴			
			String companyId = (String)company.get("id");
			Key companyKey = KeyFactory.createKey("Company", companyId);
			List<Object[]> vehicles = this.retrieveVehicles(datastore, companyKey);
			
			// 2. 차량별로 소모품에 대한 상태 처리
			for(Object[] vehicleInfo : vehicles) {
				String vehicleId = (String)vehicleInfo[0];
				double totalMileage = (vehicleInfo[1] != null) ? ((vehicleInfo[1] instanceof Double) ? ((Double)vehicleInfo[1]).doubleValue() : Double.parseDouble(vehicleInfo[1].toString())) : 0d; 
				
				try {
					this.summaryVehicleConsumables(datastore, companyKey, vehicleId, totalMileage);
				} catch (Exception e) {
					logger.error("Failed to summary consumable status - vehicle id (" + vehicleId + ")!", e);
				}
			}
		}
				
		return this.getResultMsg(true, "Summary tasks have been processed successfully!");
	}
	
	/**
	 * 차량별 소모품 summary
	 * 
	 * @param datastore
	 * @param companyKey
	 * @param vehicleId
	 * @param totalMileage
	 * @throws Exception
	 */
	private void summaryVehicleConsumables(DatastoreService datastore, Key companyKey, String vehicleId, double totalMileage) throws Exception {
		
		if(totalMileage < 1)
			return;
		
		List<Entity> consumables = this.retrieveConsumables(datastore, companyKey, vehicleId);
		
		if(consumables.isEmpty()) 
			return;
		
		// 3. 차량별로 각각의 consumable 정보를 가져옴
		for(Entity consumable : consumables) {
			// 4. consumable 별로 health rate와 status를 계산하여 업데이트
			CalculatorUtils.recalcConsumableHealthRate(totalMileage, consumable);			
			// 5. 변경 되었다면 저장
			datastore.put(consumable);
		}
	}
	
	/**
	 * company별 모든 차량 조회
	 * TODO Util로 이동 
	 * 
	 * @param datastore
	 * @param companyKey
	 * @return
	 */
	private List<Object[]> retrieveVehicles(DatastoreService datastore, Key companyKey) {
		
		Query q = new Query("Vehicle");
		q.setAncestor(companyKey);

		PreparedQuery pq = datastore.prepare(q);
		List<Object[]> items = new LinkedList<Object[]>();
		
		for (Entity result : pq.asIterable()) {
			Object[] vehicleInfo = new Object[]{ result.getProperty("id"), result.getProperty("total_distance") };
			items.add(vehicleInfo);
		}
		
		return items;
	}
	
	/**
	 * 차량별 소모품 목록 조회 
	 * 
	 * @param datastore
	 * @param companyKey
	 * @param vehicleId
	 * @return
	 */
	private List<Entity> retrieveConsumables(DatastoreService datastore, Key companyKey, String vehicleId) {
		
		Query q = new Query("VehicleConsumable");
		q.setAncestor(companyKey);

		PreparedQuery pq = datastore.prepare(q);
		List<Entity> items = new LinkedList<Entity>();
		
		for (Entity result : pq.asIterable()) {
			items.add(result);
		}
		
		return items;		
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
		
		if(DataUtils.toInt(vehicleConsumables.get("total")) <= 0 ) {
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
		
		if(!DataUtils.isEmpty(vehicleId))
			q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
	}
}
