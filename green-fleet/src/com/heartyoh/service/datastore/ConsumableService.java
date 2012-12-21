/**
 * 
 */
package com.heartyoh.service.datastore;

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
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Transaction;
import com.heartyoh.model.ConsumableCode;
import com.heartyoh.model.Task;
import com.heartyoh.model.Vehicle;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.CalculatorUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.GreenFleetConstant;
import com.heartyoh.util.SessionUtils;

/**
 * 차량별 소모품 교체 기준 정보
 * 
 * @author jhnam
 */
@Controller
public class ConsumableService extends HistoricEntityService {

	private static final Logger logger = LoggerFactory.getLogger(ConsumableService.class);

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
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Entity company = null;
		try {
			company = datastore.get(mainEntity.getParent());
		} catch (EntityNotFoundException e) {
			logger.error("Company not found by key [" + mainEntity.getParent() + "]!");
		}
		String updateTimeStr = DataUtils.dateToString((Date)mainEntity.getProperty("updated_at"), GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT, company);		
		return mainEntity.getProperty("vehicle_id") + "@" + mainEntity.getProperty("consumable_item") + "@" + updateTimeStr;
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
		
		if(!DataUtils.isEmpty(map.get("cost"))) {
			// 교체 비용 
			entity.setProperty("cost", map.get("cost"));
		}
		
		if(!DataUtils.isEmpty(map.get("worker"))) {
			// 교체 작업자 
			entity.setProperty("worker", map.get("worker"));
		}
		
		if(!DataUtils.isEmpty(map.get("component"))) {
			// 교체 부품 
			entity.setProperty("component", map.get("component"));
		}
		
		if(!DataUtils.isEmpty(map.get("comment"))) {
			// 코멘트 
			entity.setProperty("comment", map.get("comment"));
		}
		
		entity.setProperty("updated_at", new Date());
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
	
	/**
	 * daily summary, 차량별 소모품 상태 업데이트 
	 * 
	 * @param company
	 * @return
	 * @throws Exception
	 */
	public String dailySummary(String company) throws Exception {
		
		if(DataUtils.isEmpty(company))
			throw new Exception("Request parameter [company] is required!");
		
		Key companyKey = KeyFactory.createKey("Company", company);
		@SuppressWarnings("unchecked")
		List<Vehicle> vehicles = 
			(List<Vehicle>) DatasourceUtils.findEntities(Vehicle.class, DataUtils.newMap("company", company));
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService(); 
		int count = 0;
		
		// 차량별로 소모품에 대한 상태 처리
		for(Vehicle vehicle : vehicles) {
			try {
				count += this.updateConsumableStatus(datastore, companyKey, vehicle);
			} catch (Exception e) {
				logger.error("Failed to summary consumable status - vehicle id (" + vehicle.getId() + ")!", e);
			}
		}
		
		return this.getResultMsg(true, "Summary tasks (" + count + " count) have been processed successfully!");
	}
	
	/**
	 * 차량별 소모품 상태 업데이트
	 * 
	 * @param datastore
	 * @param companyKey
	 * @param vehicle
	 * @throws Exception
	 */
	private int updateConsumableStatus(DatastoreService datastore, Key companyKey, Vehicle vehicle) throws Exception {
		
		String vehicleId = vehicle.getId();
		double totalMileage = vehicle.getTotalDistance();
		
		if(totalMileage < 1)
			return 0;
		
		Map<String, Object> filters = DataUtils.newMap("vehicle_id", vehicleId);
		Iterator<Entity> consumables = 
				DatastoreUtils.findEntities(companyKey, "VehicleConsumable", filters);		
		String vehicleHealthStatus = GreenFleetConstant.VEHICLE_HEALTH_H;
		int count = 0;
		
		// 차량별로 각각의 consumable 정보를 가져옴
		while(consumables.hasNext()) {
			Entity consumable = consumables.next();
			// consumable 별로 health rate와 status를 계산하여 업데이트
			if(CalculatorUtils.calcConsumableHealth(totalMileage, consumable)) {
				// 변경되었다면 저장. 하루에 한 번씩 업데이트 되는 내용이라 이력을 쌓지 않는다. 
				// 만약 이력을 관리하려면 이 부분을 
				// saveEntity(consumable, Map<String, Object> map, datastore)로 변경하면 된다.
				datastore.put(consumable);
				count++;
			}
			
			// 차량 상태 결정 : 모든 소모품이 OK이면 Healthy, 
			// 하나라도 Impending이면 Impending, 하나라도 Overdue이면 무조건 Overdue, Overdue가 우선순위가 가장 높음
			if(GreenFleetConstant.VEHICLE_HEALTH_O.equalsIgnoreCase(vehicleHealthStatus))
				continue;
			
			String healthStatus = (String)consumable.getProperty("status");
			
			if(GreenFleetConstant.VEHICLE_HEALTH_I.equalsIgnoreCase(healthStatus)) {
				if(GreenFleetConstant.VEHICLE_HEALTH_H.equalsIgnoreCase(vehicleHealthStatus)) {
					vehicleHealthStatus = GreenFleetConstant.VEHICLE_HEALTH_I;
				}
			} else if(GreenFleetConstant.VEHICLE_HEALTH_O.equalsIgnoreCase(healthStatus)) {
				vehicleHealthStatus = GreenFleetConstant.VEHICLE_HEALTH_O;
			}
			
			// 다음 교체일이 있는 경우에는 소모품 관리 일정 관리 연동
			if(consumable.getProperty("next_repl_date") != null) {
				this.updateTask(consumable);								
			}
		}
		
		// 차량 상태가 바뀌었을 경우에만 차량 건강 상태 업데이트
		if(!vehicleHealthStatus.equalsIgnoreCase(vehicle.getHealthStatus())) {
			vehicle.setHealthStatus(vehicleHealthStatus);
			DatasourceUtils.updateVehicle(vehicle);
		}
		
		if(logger.isInfoEnabled())
			logger.info("Consumables' health statuses of vehicle (id :" + vehicleId + ") are updated! - (" + count + ") count!");
		
		return count;
	}
	
	/**
	 * 일정 조회 
	 * 
	 * @param consumable
	 * @return
	 * @throws Exception
	 */
	private Task findTask(Entity consumable) throws Exception {
		String company = consumable.getParent().getName();
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("category", GreenFleetConstant.TASK_TYPE_CONSUMABLES);
		params.put("url", KeyFactory.keyToString(consumable.getKey()));		
		return DatasourceUtils.findTask(params);		
	}
	
	/**
	 * 일정관리 연동 
	 * 
	 * @param consumable
	 * @throws Exception
	 */
	private void updateTask(Entity consumable) throws Exception {
		
		Date nextReplDate = (Date)consumable.getProperty("next_repl_date");
		String vehicleId = (String)consumable.getProperty("vehicle_id");
		String item = (String)consumable.getProperty("consumable_item");
		String consumableKey = KeyFactory.keyToString(consumable.getKey());
		Task task = this.findTask(consumable);
		
		if(task != null) {
			task.setStartDate(nextReplDate);
			task.setEndDate(nextReplDate);
			DatasourceUtils.updateTask(task);
			
		} else {
			task = new Task();
			task.setCategory(GreenFleetConstant.TASK_TYPE_CONSUMABLES);
			task.setAllDay(true);
			task.setCompany(consumable.getParent().getName());
			task.setStartDate(nextReplDate);
			task.setEndDate(nextReplDate);
			task.setUrl(consumableKey);
			task.setTitle("Replacement [" + item + "] of Vehicle [" + vehicleId + "]");
			DatasourceUtils.createTask(task);			
		}
	}
	
	/**
	 * vehicle의 소모품 상태를 기반으로 건강 상태를 업데이트한다. 
	 * 
	 * @param datastore
	 * @param dml
	 * @param vehicle
	 * @throws Exception
	 */
	private void updateVehicleHealth(DatastoreService datastore, Key companyKey, Vehicle vehicle) throws Exception {
		
		Iterator<Entity> consumables = 
				DatastoreUtils.findEntities(companyKey, "VehicleConsumable", DataUtils.newMap("vehicle_id", vehicle.getId()));
		String vehicleHealthStatus = GreenFleetConstant.VEHICLE_HEALTH_H;
		
		// 차량별로 각각의 consumable 정보를 가져옴
		while(consumables.hasNext()) {
			Entity consumable = consumables.next();
			
			// 차량 상태 결정 : 모든 소모품이 OK이면 Healthy, 하나라도 Impending이면 Impending, 하나라도 Overdue이면 무조건 Overdue, Overdue가 우선순위가 가장 높음
			if(GreenFleetConstant.VEHICLE_HEALTH_O.equalsIgnoreCase(vehicleHealthStatus))
				continue;
			
			String healthStatus = (String)consumable.getProperty("status");
			
			if(GreenFleetConstant.VEHICLE_HEALTH_I.equalsIgnoreCase(healthStatus)) {
				if(GreenFleetConstant.VEHICLE_HEALTH_H.equalsIgnoreCase(vehicleHealthStatus)) {
					vehicleHealthStatus = GreenFleetConstant.VEHICLE_HEALTH_I;
				}
			} else if(GreenFleetConstant.VEHICLE_HEALTH_O.equalsIgnoreCase(healthStatus)) {
				vehicleHealthStatus = GreenFleetConstant.VEHICLE_HEALTH_O;
			}
		}
		
		// 차량 상태가 바뀌었을 경우에만 차량 건강 상태 업데이트
		if(!vehicleHealthStatus.equalsIgnoreCase(vehicle.getHealthStatus())) {
			vehicle.setHealthStatus(vehicleHealthStatus);
			DatasourceUtils.updateVehicle(vehicle);
		}
	}
		
	@RequestMapping(value = "/vehicle_consumable/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle_consumable/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		
		try {
			Object[] results = this.findVehicleAndConsumable(request);
			Vehicle vehicle = (Vehicle)results[0];
			Entity consumable = (Entity)results[1];
			consumable.setProperty("updated_at", new Date());
			
			Map<String, Object> map = toMap(request);
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			CalculatorUtils.resetConsumable(DataUtils.toDouble(vehicle.getTotalDistance()), consumable);
			
			// 이력 저장을 위해 호출 
//			this.saveEntity(consumable, map, datastore);
			// vehicle의 건강 상태를 다시 업데이트
			this.updateVehicleHealth(datastore, consumable.getParent(), vehicle);
			
		} catch (Throwable t) {
			logger.error("Failed to replace consumable!", t);
		}
		
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
						
		try {
			Object[] results = this.findVehicleAndConsumable(request);
			Vehicle vehicle = (Vehicle)results[0];
			Entity consumable = (Entity)results[1];
			consumable.setProperty("updated_at", new Date());
			
			Map<String, Object> map = toMap(request);
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			CalculatorUtils.resetConsumable(DataUtils.toDouble(vehicle.getTotalDistance()), consumable);
			
			// 이력 저장을 위해 호출 
			this.saveEntity(consumable, map, datastore);
			// vehicle의 건강 상태를 다시 업데이트
			this.updateVehicleHealth(datastore, consumable.getParent(), vehicle);
			return this.getResultMsg(true, "Consumable Reset have been processed successfully.");
			
		} catch (Throwable t) {
			logger.error("Failed to replace consumable!", t);
			return this.getResultMsg(false, (t.getCause() != null) ? t.getCause().getMessage() : t.getMessage());
		}		
	}
	
	@RequestMapping(value = "/vehicle_consumable/replace", method = RequestMethod.POST)
	public @ResponseBody
	String replace(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		try {
			Object[] results = this.findVehicleAndConsumable(request);
			Vehicle vehicle = (Vehicle)results[0];
			Entity consumable = (Entity)results[1];
			
			Map<String, Object> map = toMap(request);
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			this.onReplace(consumable, map, datastore);
			CalculatorUtils.calcConsumableInfo(DataUtils.toDouble(vehicle.getTotalDistance()), consumable, map);			
			
			// 이력 저장을 위해 호출 
			this.saveEntity(consumable, map, datastore);
			// vehicle의 건강 상태를 다시 업데이트
			this.updateVehicleHealth(datastore, consumable.getParent(), vehicle);
			return this.getResultMsg(true, "Consumable Replacement have been processed successfully.");
			
		} catch (Throwable t) {
			logger.error("Failed to replace consumable!", t);
			return this.getResultMsg(false, (t.getCause() != null) ? t.getCause().getMessage() : t.getMessage());
		}
	}
	
	@RequestMapping(value = "/vehicle_consumable/by_health_rate", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> upcommingReplaceList(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Key companyKey = this.getCompanyKey(request);
		String healthRateStr = request.getParameter("health_rate");
		List<Entity> consumables = this.findConsumablesToReplace(companyKey, DataUtils.toFloat(healthRateStr));
		List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
		String[] selects = new String[] { "vehicle_id", "consumable_item", "status", "health_rate" };
		for(Entity consumable : consumables) {
			Map<String, Object> item = SessionUtils.cvtEntityToMap(consumable, selects);
			items.add(item);
		}		
		return this.packResultDataset(true, consumables.size(), items);
	}
	
	@RequestMapping(value = "/vehicle_consumable/alarm", method = RequestMethod.GET)
	public @ResponseBody
	String alarm(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Key companyKey = this.getCompanyKey(request);
		
		// 조건은 health rate가 0.98 이상인 것들 대상으로 조회 
		List<Entity> consumables = this.findConsumablesToReplace(companyKey, 0.98f);
		
		if(DataUtils.isEmpty(consumables))
			return this.getResultMsg(true, "No consumable to replace exist!");
		
		try {
			AlarmUtils.alarmConsumables(consumables);
		} catch (Exception e) {
			return this.getResultMsg(false, e.getMessage());
		}
		
		return this.getResultMsg(true, "Consumables replacement alarms notified (" + consumables.size() + " count) successfully!");
	}
	
	/**
	 * request 정보로 vehicle, consumable Entity를 조회 
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */
	private Object[] findVehicleAndConsumable(HttpServletRequest request) throws Exception {
		
		String vehicleId = request.getParameter("vehicle_id");
		String consmItem = request.getParameter("consumable_item");
		
		if(DataUtils.isEmpty(vehicleId))
			throw new Exception("Vehicle id is required!");
		
		if(DataUtils.isEmpty(consmItem))
			throw new Exception("Consumable item is required!");
				
		Key companyKey = this.getCompanyKey(request);
		Map<String, Object> filters = 
				DataUtils.newMap(new String[] { "vehicle_id", "consumable_item" }, 
						new Object[] { vehicleId, consmItem });
		Entity consumable = DatastoreUtils.findEntity(companyKey, "VehicleConsumable", filters);
		Vehicle vehicle = DatasourceUtils.findVehicle(companyKey.getName(), vehicleId);		
		return new Object[] { vehicle, consumable };
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/vehicle_consumable", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		
		try {
			Map<String, Object> consumables = super.retrieve(request, response);
		
			if(DataUtils.toInt(consumables.get("total")) <= 0) {
				this.initConsumables(request, response);
			}

			consumables = super.retrieve(request, response);
			this.adjustMileage(request, (List<Map<String, Object>>)consumables.get("items"));
			return consumables;
			
		} catch(Exception e) {
			logger.error("Failed to retrieve consumables!", e);
			return this.packResultData(false, null);
		}		
	}
	
	@RequestMapping(value = "/vehicle_consumable/history", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveHistory(HttpServletRequest request, HttpServletResponse response) {
		
		String vehicleId = request.getParameter("vehicle_id");
		String consmItem = request.getParameter("consumable_item");
		
		if(DataUtils.isEmpty(vehicleId) || DataUtils.isEmpty(consmItem))
			return this.packResultDataset(false, 0, null);
		
		Key companyKey = this.getCompanyKey(request);
		Map<String, Object> filters = 
				DataUtils.newMap(new String[] { "vehicle_id", "consumable_item" }, 
						new Object[] { vehicleId, consmItem });		
		Iterator<Entity> consumHists = 
				DatastoreUtils.findEntities(companyKey, "ConsumableHistory", filters);
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		while(consumHists.hasNext()) {
			Entity entity = consumHists.next();
			Map<String, Object> item = 
					SessionUtils.cvtEntityToMap(entity, request.getParameterValues("select"));
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
	 * @throws Exception
	 */
	private void adjustMileage(HttpServletRequest request, List<Map<String, Object>> consumables) throws Exception {
		
		String vehicleId = request.getParameter("vehicle_id");
		if(DataUtils.isEmpty(vehicleId))
			return;
		
		Key companyKey = this.getCompanyKey(request);
		Vehicle vehicle = DatasourceUtils.findVehicle(companyKey.getName(), vehicleId);
		double totalMileage = DataUtils.toDouble(vehicle.getTotalDistance());
		
		for(Map<String, Object> consumable : consumables) {
			float milesLastRepl = DataUtils.toFloat(consumable.get("miles_last_repl"));
			float maileSinceLastRepl = (float)totalMileage - milesLastRepl;
			consumable.put("miles_since_last_repl", (maileSinceLastRepl > 0f) ? maileSinceLastRepl : 0f);
		}
	}
	
	/**
	 * 차량별 소모품 정보가 없을 경우 소모품 기준 정보로 부터 자동으로 생성한다.
	 *  
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	private void initConsumables(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		List<Entity> entities = new ArrayList<Entity>();
		Key companyKey = this.getCompanyKey(request);
		Date now = new Date();
		List<ConsumableCode> consumableCodes = DatasourceUtils.findAllConsumableCodes(companyKey.getName());
		
		// 소모품 기준 정보로 부터 데이터를 모두 가져와서 차량에 대한 기준정보로 추가 
		for(ConsumableCode consumableCode : consumableCodes) {
			Map<String, Object> item = DataUtils.newMap("key", "");			
			item.put("_company_key", companyKey);			
			item.put("_now", now);
			item.put("consumable_item", consumableCode.getName());
			item.put("repl_mileage", consumableCode.getReplMileage());
			item.put("repl_time", consumableCode.getReplTime());
			item.put("repl_unit", consumableCode.getReplUnit());
			item.put("miles_last_repl", 0);
			item.put("last_repl_date", null);
			item.put("next_repl_mileage", 0);
			item.put("next_repl_date", null);
			item.put("accrued_cost", 0);
			item.put("health_rate", 0f);
			item.put("status", GreenFleetConstant.VEHICLE_HEALTH_H);
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
			q.addFilter("vehicle_id", Query.FilterOperator.EQUAL, vehicleId);
			//q.setFilter(new FilterPredicate("vehicle_id", Query.FilterOperator.EQUAL, vehicleId));
	}
	
	/**
	 * 소모품 교체 일정이 다가온 소모품 리스트를 조회한다. 조건은 health rate가 0.98 이상인 것들 대상으로 조회 
	 * 
	 * @param companyKey
	 * @return
	 */
	private List<Entity> findConsumablesToReplace(Key companyKey, float healthRate) {
		
		if(healthRate == 0)
			healthRate = 0.98f;
		
		Query q = new Query(this.getEntityName());
		q.setAncestor(companyKey);		
		q.addFilter("health_rate", Query.FilterOperator.GREATER_THAN_OR_EQUAL, healthRate);
		//q.setFilter(new FilterPredicate("health_rate", Query.FilterOperator.GREATER_THAN_OR_EQUAL, healthRate));
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		return pq.asList(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));
	}
}
