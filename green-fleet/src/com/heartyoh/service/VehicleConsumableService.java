/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
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
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Transaction;
import com.heartyoh.util.CalculatorUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 차량별 소모품 교체 기준 정보
 * 
 * @author jhnam
 */
@Controller
public class VehicleConsumableService extends HistoricEntityService {

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
	protected String getHistoryEntityName() {
		return "ConsumableHistory";
	}	
	
	@Override
	protected String getHistoryIdValue(Entity mainEntity) {
		return mainEntity.getProperty("vehicle_id") + "@" + mainEntity.getProperty("consumable_item") + "@" + mainEntity.getProperty("updated_at");
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
	 * 소모품 교체시점에 ...
	 * 
	 * @param entity
	 * @param map
	 * @param datastore
	 * @throws Exception
	 */
	protected void onReplace(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		// 교체 비용 
		entity.setProperty("cost", map.get("cost"));
		// 교체 작업자 
		entity.setProperty("worker", map.get("worker"));
		// 교체 부품 
		entity.setProperty("component", map.get("component"));
		// 코멘트 
		entity.setProperty("comment", map.get("comment"));		
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
	
	@RequestMapping(value = "/vehicle_consumable/summary", method = RequestMethod.GET)
	public @ResponseBody
	String summary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		if(DataUtils.isEmpty(request.getParameter("company")))
			throw new Exception("Request parameter [company] is required!");
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();				
		Key companyKey = KeyFactory.createKey("Company", request.getParameter("company"));
		// 1. Request에 지정된 회사에 대한 것만 처리 
		Iterator<Entity> vehicles = DatastoreUtils.findEntities(companyKey, "Vehicle", null);
		int count = 0;
		
		// 2. 차량별로 소모품에 대한 상태 처리
		while(vehicles.hasNext()) {
			Entity vehicle = vehicles.next();
			String vehicleId = DataUtils.toString(vehicle.getProperty("id"));
			double totalMileage = DataUtils.toDouble(vehicle.getProperty("total_distance"));
			
			try {
				count += this.summaryConsumableStatus(datastore, companyKey, vehicleId, totalMileage);
			} catch (Exception e) {
				logger.error("Failed to summary consumable status - vehicle id (" + vehicleId + ")!", e);
			}
		}
		
		return this.getResultMsg(true, "Summary tasks (" + count + " count) have been processed successfully!");
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
	private int summaryConsumableStatus(DatastoreService datastore, Key companyKey, String vehicleId, double totalMileage) throws Exception {
		
		if(totalMileage < 1)
			return 0;
		
		Map<String, Object> filters = DataUtils.newMap("vehicle_id", vehicleId);
		Iterator<Entity> consumables = DatastoreUtils.findEntities(companyKey, "VehicleConsumable", filters);
		int count = 0;
		
		// 차량별로 각각의 consumable 정보를 가져옴
		while(consumables.hasNext()) {
			Entity consumable = consumables.next();
			// consumable 별로 health rate와 status를 계산하여 업데이트
			if(CalculatorUtils.calcConsumableHealth(totalMileage, consumable)) {
				// 변경되었다면 저장. 하루에 한 번씩 업데이트 되는 내용이라 이력을 쌓지 않는다. 만약 이력을 관리하려면 이 부부을 saveEntity(Entity obj, Map<String, Object> map, DatastoreService datastore)로 변경하면 된다.
				datastore.put(consumable);
				count++;
			}
		}
		
		logger.info("Updated vehicle (id :" + vehicleId + ") consumable health status - (" + count + ") count!");
		return count;
	}
		
	@RequestMapping(value = "/vehicle_consumable/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle_consumable/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/vehicle_consumable/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/vehicle_consumable/reset", method = RequestMethod.POST)
	public @ResponseBody
	String reset(HttpServletRequest request, HttpServletResponse response) throws Exception {
				
		String vehicleId = request.getParameter("vehicle_id");
		String consumableItem = request.getParameter("consumable_item");
		
		if(DataUtils.isEmpty(vehicleId))
			return this.getResultMsg(false, "Vehicle id is required!");
		
		if(DataUtils.isEmpty(consumableItem))
			return this.getResultMsg(false, "Consumable item is required!");
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Map<String, Object> map = toMap(request);
		Key companyKey = this.getCompanyKey(request);
		Map<String, Object> filters = DataUtils.newMap(new String[] { "vehicle_id", "consumable_item" }, new Object[] { vehicleId, consumableItem });		
		Entity consumable = DatastoreUtils.findEntity(companyKey, "VehicleConsumable", filters);
		Entity vehicle = DatastoreUtils.findVehicle(companyKey, vehicleId);
		CalculatorUtils.resetConsumable(DataUtils.toDouble(vehicle.getProperty("total_distance")), consumable);
		this.saveEntity(consumable, map, datastore);
		
		return this.getResultMsg(true, "Consumable Reset have been processed successfully.");
	}
	
	@RequestMapping(value = "/vehicle_consumable/replace", method = RequestMethod.POST)
	public @ResponseBody
	String replace(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String vehicleId = request.getParameter("vehicle_id");
		String consumableItem = request.getParameter("consumable_item");
		
		if(DataUtils.isEmpty(vehicleId))
			return this.getResultMsg(false, "Vehicle id is required!");
		
		if(DataUtils.isEmpty(consumableItem))
			return this.getResultMsg(false, "Consumable item is required!");
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Map<String, Object> map = toMap(request);
		Key companyKey = this.getCompanyKey(request);
		Map<String, Object> filters = DataUtils.newMap(new String[] { "vehicle_id", "consumable_item" }, new Object[] { vehicleId, consumableItem });
		Entity consumable = DatastoreUtils.findEntity(companyKey, "VehicleConsumable", filters);
		this.onReplace(consumable, map, datastore);
		Entity vehicle = DatastoreUtils.findVehicle(companyKey, vehicleId);
		double totalMileage = DataUtils.toDouble(vehicle.getProperty("total_distance"));
		CalculatorUtils.calcConsumableInfo(totalMileage, consumable, consumable);
		this.saveEntity(consumable, map, datastore);

		return this.getResultMsg(true, "Consumable Replacement have been processed successfully.");
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/vehicle_consumable", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		
		Map<String, Object> consumables = super.retrieve(request, response);
		
		if(DataUtils.toInt(consumables.get("total")) <= 0) {
			this.initConsumables(request, response);			
		} 

		consumables = super.retrieve(request, response);
		this.adjustMileage(request, (List<Map<String, Object>>)consumables.get("items"));
		return consumables;
	}
	
	@RequestMapping(value = "/vehicle_consumable/history", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveHistory(HttpServletRequest request, HttpServletResponse response) {
		
		String vehicleId = request.getParameter("vehicle_id");
		String consumableItem = request.getParameter("consumable_item");
		
		if(DataUtils.isEmpty(vehicleId) || DataUtils.isEmpty(consumableItem))
			return this.packResultDataset(false, 0, null);
		
		Key companyKey = this.getCompanyKey(request);
		Map<String, Object> filters = DataUtils.newMap(new String[] { "vehicle_id", "consumable_item" }, new Object[] { vehicleId, consumableItem });		
		Iterator<Entity> consumHistories = DatastoreUtils.findEntities(companyKey, "ConsumableHistory", filters);
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		while(consumHistories.hasNext()) {
			Entity entity = consumHistories.next();
			Map<String, Object> item = SessionUtils.cvtEntityToMap(entity, request.getParameterValues("select"));
			this.adjustItem(item);
			items.add(item);
		}
		
		return this.packResultDataset(true, items.size(), items);
	}	
	
	/**
	 * 차량의 소모품 리스트 조회시 소모품 리스트 별로 소모품 교체 후 주행거리를 계산하여 세팅해준다.
	 * 소모품 교체 후 주행거리는 상태 정보로 가지고 있지 않으므로 조회시 마다 계산해준다. 
	 * 
	 * @param request
	 * @param consumables
	 */
	private void adjustMileage(HttpServletRequest request, List<Map<String, Object>> consumables) {
		
		if(DataUtils.isEmpty(request.getParameter("vehicle_id")))
			return;
		
		Key companyKey = this.getCompanyKey(request);
		Entity vehicle = DatastoreUtils.findVehicle(companyKey, request.getParameter("vehicle_id"));
		double totalMileage = DataUtils.toDouble(vehicle.getProperty("total_distance"));
		
		for(Map<String, Object> consumable : consumables) {
			float milesLastRepl = DataUtils.toFloat(consumable.get("miles_last_repl"));
			consumable.put("miles_since_last_repl", totalMileage - milesLastRepl);
		}
	}
	
	/**
	 * 차량별 소모품 정보가 없을 경우 소모품 기준 정보로 부터 자동으로 생성한다.
	 *  
	 * @param request
	 * @param response
	 */
	private void initConsumables(HttpServletRequest request, HttpServletResponse response) {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		List<Entity> entities = new ArrayList<Entity>();		
		Key companyKey = this.getCompanyKey(request);
		Date now = new Date();
		Iterator<Entity> consumableCodes = DatastoreUtils.findEntities(companyKey, "ConsumableCode", null);
		
		// 소모품 기준 정보로 부터 데이터를 모두 가져와서 차량에 대한 기준정보로 추가 
		while (consumableCodes.hasNext()) {
			Entity consumableCode = consumableCodes.next();
			Map<String, Object> item = SessionUtils.cvtEntityToMap(consumableCode);
			item.put("_now", now);
			item.put("_company_key", companyKey);		
			item.put("consumable_item", item.remove("name"));
			item.put("key", "");
			item.remove("desc");
			item.put("miles_last_repl", 0);
			item.put("last_repl_date", null);
			item.put("next_repl_mileage", 0);
			item.put("next_repl_date", null);
			item.put("accrued_cost", 0);
			item.put("health_rate", 0f);
			item.put("status", "Healthy");
			item.put("vehicle_id", request.getParameter("vehicle_id"));
			
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
