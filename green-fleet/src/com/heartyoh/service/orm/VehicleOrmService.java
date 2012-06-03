/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.HashMap;
import java.util.Iterator;
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
	}
	
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
		vehicle.setRemainingFuel(DataUtils.toFloat(request.getParameter("remaining_fuel")));
		
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
}