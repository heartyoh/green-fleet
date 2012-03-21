/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
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
import com.heartyoh.util.GreenFleetConstant;
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
		List<Map<String, Object>> companies = (List<Map<String, Object>>)cs.retrieve(request, response).get("items");
		
		for(Map<String, Object> company : companies) {
			// 1. 모든 vehicle list 조회 
			Key companyKey = KeyFactory.createKey("Company", (String)company.get("id"));
			Iterator<Entity> vehicles = DatastoreUtils.findEntities(companyKey, "Vehicle", null);
			
			// 2. 차량별로 소모품에 대한 상태 처리
			while(vehicles.hasNext()) {
				Entity vehicle = vehicles.next();
				String vehicleId = DataUtils.toString(vehicle.getProperty("id"));
				double totalMileage = DataUtils.toDouble(vehicle.getProperty("total_distance"));
				
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
		
		Map<String, Object> filters = DataUtils.newMap("vehicle_id", vehicleId);
		Iterator<Entity> consumables = DatastoreUtils.findEntities(companyKey, "VehicleConsumable", filters);
		int count = 0;
		
		// 차량별로 각각의 consumable 정보를 가져옴
		while(consumables.hasNext()) {
			Entity consumable = consumables.next();
			// consumable 별로 health rate와 status를 계산하여 업데이트
			CalculatorUtils.recalcConsumableHealthRate(totalMileage, consumable);
			// 변경되었다면 저장 TODO 변경된 것에 대해서만 저장
			datastore.put(consumable);
			count++;
		}
		
		logger.info("Updated vehicle (id :" + vehicleId + ") consumable health status - (" + count + ") count!");
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
	
	@RequestMapping(value = "/vehicle_consumable/reset", method = RequestMethod.POST)
	public @ResponseBody
	String reset(HttpServletRequest request, HttpServletResponse response) {
		
		String vehicleId = request.getParameter("vehicle_id");
		String consumableItem = request.getParameter("consumable_item");
		
		if(DataUtils.isEmpty(vehicleId))
			return this.getResultMsg(false, "Vehicle id is required!");
		
		if(DataUtils.isEmpty(consumableItem))
			return this.getResultMsg(false, "Consumable item is required!");		
		
		Key companyKey = this.getCompanyKey(request);
		Map<String, Object> filters = DataUtils.newMap(new String[] {"vehicle_id", "consumable_item"}, new Object[] {vehicleId, consumableItem});		
		Entity consumable = DatastoreUtils.findEntity(companyKey, "VehicleConsumable", filters);
		Entity vehicle = DatastoreUtils.findVehicle(companyKey, vehicleId);
		this.resetConsumable(vehicle, consumable);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.put(consumable);
		return this.getResultMsg(true, "Consumable Reset Have been processed successfully.");
	}

	/**
	 * 소모품의 최근 교체일, 최근 교체 주행거리, 다음 교체일, 다음 교체 주행거리, 건강율, 상태 등의 정보를 업데이트한다. 
	 * 
	 * @param vehicle
	 * @param consumable
	 */
	private void resetConsumable(Entity vehicle, Entity consumable) {
		
		double currentMileage = DataUtils.toDouble(vehicle.getProperty("total_distance"));
		String replUnit = DataUtils.toNotNull(consumable.getProperty("repl_unit"));
		Date nextReplDate = null;
		float nextReplMileage = -1f;
		
		// 다음 교체일 계산
		if(GreenFleetConstant.REPL_UNIT_TIME.equals(replUnit) || GreenFleetConstant.REPL_UNIT_MILEAGE.equals(replUnit)) {			
			int replMonth = DataUtils.toInt(consumable.getProperty("repl_time"));
			if(replMonth > 0) {
				int amount = replMonth * 30;
				nextReplDate = DataUtils.add(new Date(), amount);
			}
		} 
		
		// 다음 교체 주행거리 계산 
		if(GreenFleetConstant.REPL_UNIT_MILEAGE_TIME.equals(replUnit) || GreenFleetConstant.REPL_UNIT_MILEAGE.equals(replUnit)) {
			float replMiles = DataUtils.toFloat(consumable.getProperty("repl_mileage"));
			if(replMiles > 1f) {
				nextReplMileage = (float)currentMileage + replMiles;
			}
		}
		
		consumable.setProperty("last_repl_date", new Date());
		consumable.setProperty("miles_last_repl", currentMileage);
		consumable.setProperty("health_rate", 0f);
		consumable.setProperty("status", "Healthy");
		
		if(nextReplDate != null)
			consumable.setProperty("next_repl_date", nextReplDate);
		
		if(nextReplMileage >= 0f)
			consumable.setProperty("next_repl_mileage", nextReplMileage);		
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
