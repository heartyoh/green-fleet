/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Query;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.Filter;
import com.heartyoh.model.IEntity;
import com.heartyoh.model.Sorter;
import com.heartyoh.model.Vehicle;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * Vehicle Service
 * 
 * @author jhnam
 */
@Controller
public class VehicleOrmService extends OrmEntityService {

	/**
	 * key fields
	 */
	private static final String[] KEY_FIELDS = new String[] { "company", "id" };
	
	@Override
	public Class<?> getEntityClass() {
		return Vehicle.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}
	
	@Override
	public boolean useFilter() {
		return true;
	}

	@RequestMapping(value = "/vehicle/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/vehicle/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/vehicle", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.retrieve(request, response);
		/*Map<String, Object> list = super.retrieve(request, response);
		List vehicleList = (List)list.get("items");
		List<String> vehicleIdList = new ArrayList<String>();
		for(int i = 0 ; i < list.size() ; i++) {
			vehicleIdList.add((String)list.get(i));
		}
		
		String sql = "select vehicle_id, id, driver_id from terminal where vehicle_id in(:vehicleIdList)";
		Map<String, Object> params = DataUtils.newMap("company", this.getCompany(request));
		params.put("vehicleIdList", vehicleIdList);
		List<Map> terminalList = this.dml.selectListBySql(sql, params, Map.class, 0, 0);
		
		for(int i = 0 ; i < vehicleList.size() ; i++) {
			Map vehicle = (Map)vehicleList.get(i);
			String vehicleId = (String)vehicle.get("id");
			Map terminal = this.getTerminalMap(terminalList, vehicleId);
			if(terminal != null) {
				vehicle.put("terminal_id", terminal.get("id"));
				vehicle.put("driver_id", terminal.get("driver_id"));
			}
		}
		return list;*/
	}
	
	/*private Map getTerminalMap(List<Map> terminalList, String vehicleId) {
		for(int j = 0 ; j < terminalList.size() ; j++) {
			Map terminal = terminalList.get(j);
			if(vehicleId.equalsIgnoreCase((String)terminal.get("vehicle_id"))) {
				return terminal;
			}
		}
		return null;
	}*/
	
	@RequestMapping(value = "/vehicle/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/vehicle/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		Vehicle vehicle = (Vehicle)entity;
		vehicle.setDriverId(request.getParameter("driver_id"));
		vehicle.setTerminalId(request.getParameter("terminal_id"));
		vehicle.setRegistrationNumber(request.getParameter("registration_number"));
		vehicle.setVehicleModel(request.getParameter("vehicle_model"));		
		vehicle.setManufacturer(request.getParameter("manufacturer"));
		vehicle.setVehicleType(request.getParameter("vehicle_type"));
		vehicle.setFuelType(request.getParameter("fuel_type"));
		vehicle.setBirthYear(DataUtils.toInt(request.getParameter("birth_year")));
		vehicle.setOwnershipType(request.getParameter("ownership_type"));
		vehicle.setStatus(request.getParameter("status"));
		vehicle.setHealthStatus(request.getParameter("health_status"));
		vehicle.setTotalDistance(DataUtils.toFloat(request.getParameter("total_distance")));
		vehicle.setTotalRunTime(DataUtils.toInt(request.getParameter("total_run_time")));
		vehicle.setRemainingFuel(DataUtils.toFloat(request.getParameter("remaining_fuel")));
		vehicle.setEcoRunRate(DataUtils.toInt(request.getParameter("eco_run_rate")));
		vehicle.setEcoIndex(DataUtils.toInt(request.getParameter("eco_index")));
		vehicle.setOfficialEffcc(DataUtils.toFloat(request.getParameter("official_effcc")));		
		vehicle.setAvgEffcc(DataUtils.toFloat(request.getParameter("avg_effcc")));
		
		if(!DataUtils.isEmpty(request.getParameter("lat")))
			vehicle.setLat(DataUtils.toFloat(request.getParameter("lat")));
		
		if(!DataUtils.isEmpty(request.getParameter("lng")))
			vehicle.setLng(DataUtils.toFloat(request.getParameter("lng")));
		
		vehicle.beforeUpdate();
		return vehicle;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new Vehicle(this.getCompany(request), request.getParameter("id"));
		}
		
		entity.beforeCreate();
		return entity;
	}
	
	@Override
	protected void postMultipart (IEntity entity, Map<String, Object> paramMap, MultipartHttpServletRequest request) throws Exception {
		
		String imageFile = super.saveFile(request, (MultipartFile) paramMap.get("image_file"));
		if(imageFile != null) {
			paramMap.put("image_clip", imageFile);
			Vehicle vehicle = (Vehicle)entity;
			vehicle.setImageClip(imageFile);
			this.dml.update(vehicle);
		}

		super.postMultipart(entity, paramMap, request);
	}
	
	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle_id")))
			query.addFilter("id", request.getParameter("vehicle_id"));
		
		if(!DataUtils.isEmpty(request.getParameter("registration_number")))
			query.addFilter("registration_number", request.getParameter("registration_number"));		
		
		String[] healthStatus = request.getParameterValues("health_status");
		if(!DataUtils.isEmpty(healthStatus)) {
			query.addFilter("health_status", "in", healthStatus);
		}
		
		if(this.useFilter()) {
			List<Filter> filters = this.parseFilters(request.getParameter("filter"));
			List<Sorter> sorters = this.parseSorters(request.getParameter("sorter"));
		
			if(filters != null) {
				for(Filter filter : filters) {
					if(!DataUtils.isEmpty(filter.getValue()))
						query.addFilter(filter.getProperty(), filter.getValue());
				}
			} 
		
			if(sorters != null) {
				for(Sorter sorter : sorters) {
					query.addOrder(sorter.getProperty(), "asc".equals(sorter.getDirection().toLowerCase()));
				}
			}
		}
		
		return query;
	}
	
	@RequestMapping(value = "/vehicle/byhealth", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> findByHealth(HttpServletRequest request, HttpServletResponse response) 
			throws Exception {
		
		String consumableItem = request.getParameter("consumable_item");
		
		// 1. health_status와 consumable_item이 동시에 : consumable이 health_status인 모든 vehicle을 조회 		
		if(DataUtils.isEmpty(consumableItem)) {
			return this.retrieve(request, response);
			
		// 2. consumable_item은 없고 health_status만 있는 경우 : 
		//    vehicle의 상태가 health_status인 모든 차량 조회, 하지만 health_status가 세 개인 경우는 모든 vehicle 조회 		
		} else {
			String company = this.getCompany(request);
			Map<String, String> consumablesMap = 
					this.findConsumables(company, consumableItem, request.getParameterValues("health_status"));
			
			if(!consumablesMap.isEmpty()) {
				@SuppressWarnings("rawtypes")
				List<Map> items = this.findByConsumable(company, 
						request.getParameter("sort"), 
						request.getParameterValues("select"), 
						consumablesMap);
				return super.getResultSet(true, items.size(), items);
			} else {
				return super.getResultSet(true, 0, null);
			}
		}
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	private List<Map> findByConsumable(String company, String sorterStr, String[] select, Map<String, String> consumableMap) throws Exception {
		
		List<Sorter> sorters = this.parseSorters(sorterStr);
		StringBuffer sql = new StringBuffer("select ");		
		for(int i = 0 ; i < select.length ; i++) {
			sql.append(i == 0 ? "" : ",").append(select[i]);
		}
		sql.append(" from vehicle where id in (");
		
		Iterator<String> keyIter = consumableMap.keySet().iterator();
		int idx = 0;
		while(keyIter.hasNext()) {
			sql.append(idx++ == 0 ? "'" : ",'").append(keyIter.next()).append("'");
		}
		sql.append(")");
		
		if(sorters != null && !sorters.isEmpty()) {
			sql.append(" order by ");
			for(int i = 0 ; i < sorters.size() ; i++) {
				Sorter sorter = sorters.get(i);
				sql.append(i == 0 ? "" : ",");
				sql.append(sorter.getProperty()).append(" ").append(sorter.getDirection()); 
			}
		}
		
		List<Map> items = this.dml.selectListBySql(sql.toString(), null, Map.class, 0, 0);		
		for(Map item : items) {
			String vehicleId = (String)item.get("id");
			String consumableStatus = consumableMap.get(vehicleId);
			item.put("health_status", consumableStatus);			
		}
		
		return items;
	}
	
	/**
	 * 소모품 정보를 조회하여 key (vehicle id) - value (consumable 상태) 맵으로 리턴 
	 * 
	 * @param company
	 * @param consumableItem
	 * @param healthStatus
	 * @return
	 */
	private Map<String, String> findConsumables(String company, String consumableItem, String[] healthStatus) {
		
		Key companyKey = KeyFactory.createKey("Company", company);
		List<Object> statusList = DataUtils.toList(healthStatus);
		Map<String, Object> filters = DataUtils.newMap(
				new String[] { "consumable_item", "status" }, 
				new Object[] { consumableItem, statusList });
		Map<String, String> resultMap = new HashMap<String, String>();
		
		Iterator<Entity> consumables = DatastoreUtils.findEntities(companyKey, "VehicleConsumable", filters);
		while(consumables.hasNext()) {
			Entity consumable = consumables.next();
			resultMap.put((String)consumable.getProperty("vehicle_id"), (String)consumable.getProperty("status"));
		}
		
		return resultMap;
	}
	
	@RequestMapping(value = "/vehicle/summary", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> summary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		Key companyKey = KeyFactory.createKey("Company", company);
		String vehicleId = null;
		String yearStr = null;
		String monthStr = null;
		int year = 0;
		int month = 0;
		
		List<Filter> filters = this.parseFilters(request.getParameter("filter"));
		if(!DataUtils.isEmpty(filters)) {
			for(Filter filter : filters) {
				if("id".equalsIgnoreCase(filter.getProperty()))
					vehicleId = filter.getValue();
				
				if("year".equalsIgnoreCase(filter.getProperty()))
					yearStr = filter.getValue();
				
				if("month".equalsIgnoreCase(filter.getProperty()))
					monthStr = filter.getValue();			
			}
		} else {
			vehicleId = request.getParameter("id");
			yearStr = request.getParameter("year");
			monthStr = request.getParameter("month");
		}
		
		if(DataUtils.isEmpty(vehicleId))
			throw new Exception("Parameter [id] required!");
		
		if(DataUtils.isEmpty(yearStr)) {
			Calendar c = Calendar.getInstance();
			c.setTime(new Date());
			year = c.get(Calendar.YEAR);
			month = c.get(Calendar.MONTH) + 1;
		} else {
			year = Integer.parseInt(yearStr);
			month = Integer.parseInt(monthStr);
		}
		
		List<Object> results = new ArrayList<Object>();
		Map<String, Object> items = new HashMap<String, Object>();
		results.add(items);
		
		// 1. 차량 마스터 정보		
		if(!this.getVehicleMaster(items, company, vehicleId, year, month)) {
			return this.getResultSet(true, 0, null);
		}
		
		// 2. 차량 소모품 정보
		this.getConsumables(items, companyKey, vehicleId);
		// 3. 차량 정비 정보 
		this.getMaintanence(items, companyKey, vehicleId);
		
		return this.getResultSet(true, 1, results);
	}
	
	/**
	 * vehicle master 정보 
	 * 
	 * @param results
	 * @param company
	 * @param vehicleId
	 * @param year
	 * @param month
	 * @throws Exception
	 */
	private boolean getVehicleMaster(Map<String, Object> items, String company, String vehicleId, int year, int month) throws Exception {
		
		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("v.id, v.registration_number, v.birth_year, v.vehicle_type, v.manufacturer, v.image_clip, v.fuel_type, ");
		sql.append("v.remaining_fuel, v.total_run_time, v.total_distance, v.official_effcc, v.avg_effcc, v.eco_index, ");
		sql.append("v.eco_run_rate, vs.run_time_of_month, vs.eco_drv_time_of_month, vs.run_dist_of_month, ");
		sql.append("vs.consmpt_of_month, vs.effcc_of_month, vs.co2_emss_of_month ");
		sql.append("from ");
		sql.append("vehicle v LEFT OUTER JOIN ");
		sql.append("(select vehicle, run_time as run_time_of_month, eco_drv_time as eco_drv_time_of_month, run_dist as run_dist_of_month, ");
		sql.append("consmpt as consmpt_of_month, effcc as effcc_of_month, co2_emss as co2_emss_of_month ");
		sql.append("from vehicle_run_sum where company = :company and year = :year and month = :month and vehicle = :id) vs ");
		sql.append("ON v.id = vs.vehicle ");
		sql.append("where v.company = :company and v.id = :id");
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("id", vehicleId);
		params.put("year", year);
		params.put("month", month);
		@SuppressWarnings("rawtypes")
		Map data = dml.selectBySql(sql.toString(), params, Map.class);
		
		if(DataUtils.isEmpty(data)) {
			items.put("vehicle", null);
			return false;
		} else {
			items.put("vehicle", data);
			return true;
		}		
	}

	/**
	 * vehicle 소모품 정보 
	 * 
	 * @param items
	 * @param companyKey
	 * @param vehicleId
	 * @throws Exception
	 */
	private void getConsumables(Map<String, Object> items, Key companyKey, String vehicleId) throws Exception {
		
		List<Entity> consumables = DatastoreUtils.findConsumables(companyKey, vehicleId);
		if(consumables == null || consumables.isEmpty()) {
			items.put("consumables", null);
			return;
		}
		
		List<Map<String, Object>> consumableList = new ArrayList<Map<String, Object>>();
		for(Entity consumable : consumables) {
			Map<String, Object> item = new HashMap<String, Object>();
			item.put("consumable_item", consumable.getProperty("consumable_item"));
			item.put("health_rate", consumable.getProperty("health_rate"));
			consumableList.add(item);
		}
		
		items.put("consumables", consumableList);
	}
	
	/**
	 * vehicle 정비 정보 
	 * 
	 * @param items
	 * @param companyKey
	 * @param vehicleId
	 * @throws Exception
	 */
	private void getMaintanence(Map<String, Object> items, Key companyKey, String vehicleId) throws Exception {
		
		Map<String, Object> params = DataUtils.newMap("vehicle_id", vehicleId);
		List<Sorter> sorters = new ArrayList<Sorter>();
		Sorter sorter = new Sorter();
		sorter.setProperty("repair_date");
		sorter.setDirection("desc");
		Iterator<Entity> repairs = DatastoreUtils.findEntities(companyKey, "Repair", params, sorters);
		
		if(repairs == null || !repairs.hasNext()) {
			items.put("maint", null);
		} else {
			if(repairs.hasNext()) {
				Entity repair = repairs.next();
				Map<String, Object> item = new HashMap<String, Object>();
				Date repairDate = (Date)repair.getProperty("repair_date");
				Date nextRepairDate = (Date)repair.getProperty("next_repair_date");
				item.put("repair_date", DataUtils.dateToString(repairDate, GreenFleetConstant.DEFAULT_DATE_FORMAT));
				if(nextRepairDate != null)
					item.put("next_repair_date", DataUtils.dateToString(nextRepairDate, GreenFleetConstant.DEFAULT_DATE_FORMAT));
				items.put("maint", item);
			}
		}
	}	
}
