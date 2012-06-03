package com.heartyoh.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;


public class VehicleService extends EntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(VehicleService.class);

	@Override
	protected String getEntityName() {
		return "Vehicle";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String) map.get("id");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("id", map.get("id"));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request)
			throws IOException {
		String image_file = saveFile(request, (MultipartFile) map.get("image_file"));
		if(image_file != null) {
			entity.setProperty("image_clip", image_file);
		}

		super.postMultipart(entity, map, request);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {		
		entity.setProperty("manufacturer", map.get("manufacturer"));
		entity.setProperty("fuel_type", map.get("fuel_type"));
		entity.setProperty("vehicle_type", map.get("vehicle_type"));
		entity.setProperty("birth_year", map.get("birth_year"));
		entity.setProperty("ownership_type", map.get("ownership_type"));
		entity.setProperty("status", map.get("status"));
		entity.setProperty("total_distance", doubleProperty(map, "total_distance"));
		entity.setProperty("registration_number", map.get("registration_number"));
		entity.setProperty("remaining_fuel", doubleProperty(map, "remaining_fuel"));
		entity.setProperty("health_status", map.get("health_status"));

		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/vehicle/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/vehicle/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/vehicle", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {		
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/vehicle/byhealth", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveByHealth(HttpServletRequest request, HttpServletResponse response) {
		
		String consumableItem = request.getParameter("consumable_item");
		
		// 1. health_status와 consumable_item이 동시에 : consumable이 health_status인 모든 vehicle을 조회 		
		if(DataUtils.isEmpty(consumableItem))
			return this.retrieve(request, response);
		// 2. consumable_item은 없고 health_status만 있는 경우 : vehicle의 상태가 health_status인 모든 차량 조회, 하지만 health_status가 세 개인 경우는 모든 vehicle 조회 		
		else {
			Key companyKey = this.getCompanyKey(request);
			Map<String, String> consumablesMap = this.findConsumables(companyKey, consumableItem, request.getParameterValues("health_status"));
			
			if(!consumablesMap.isEmpty()) {
				List<Object> items = this.findVehicles(companyKey, request.getParameter("sort"), request.getParameterValues("select"), consumablesMap);
				return packResultDataset(true, items.size(), items);
			} else {
				return packResultDataset(true, 0, null);
			}
		}
	}
	
	/**
	 * 소모품 정보를 조회하여 key (vehicle id) - value (consumable 상태) 맵으로 리턴 
	 * 
	 * @param companyKey
	 * @param consumableItem
	 * @param healthStatus
	 * @return
	 */
	private Map<String, String> findConsumables(Key companyKey, String consumableItem, String[] healthStatus) {
		
		List<Object> statusList = DataUtils.toList(healthStatus);
		Map<String, Object> filters = DataUtils.newMap(new String[] { "consumable_item", "status" }, new Object[] { consumableItem, statusList });
		Map<String, String> resultMap = new HashMap<String, String>();
		
		Iterator<Entity> consumables = DatastoreUtils.findEntities(companyKey, "VehicleConsumable", filters);
		while(consumables.hasNext()) {
			Entity consumable = consumables.next();
			resultMap.put((String)consumable.getProperty("vehicle_id"), (String)consumable.getProperty("status"));
		}
		
		return resultMap;
	}
	
	/**
	 * 조건에 의해 vehicle을 조회해서 consumableMap의 상태 정보를 vehicle 상태 정보로 overwrite해서 리턴  
	 * 
	 * @param companyKey
	 * @param sorterStr
	 * @param selectPropName
	 * @param consumablesMap
	 * @return
	 */
	private List<Object> findVehicles(Key companyKey, String sorterStr, String[] selectPropName, Map<String, String> consumablesMap) {
		
		List<Sorter> sorters = this.parseSorters(sorterStr);
		List<Object> list = new ArrayList<Object>();		
		Iterator<Entity> entities = DatastoreUtils.findEntities(companyKey, this.getEntityName(), DataUtils.newMap("id", consumablesMap.keySet()), sorters);
		
		while(entities.hasNext()) {
			Entity entity = entities.next();
			Map<String, Object> data = SessionUtils.cvtEntityToMap(entity, selectPropName);
			// vehicle 상태를 consumable 상태로 변경 
			String vehicleId = (String)data.get("id");
			String consumableStatus = consumablesMap.get(vehicleId);
			data.put("health_status", consumableStatus);
			list.add(data);
		}
		
		return list;
	}
	
	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		
		String vehicleId = request.getParameter("vehicle_id");
		if(!DataUtils.isEmpty(vehicleId)) {
			q.addFilter("id", FilterOperator.EQUAL, vehicleId);
		}
		
		String regNo = request.getParameter("registration_number");
		if(!DataUtils.isEmpty(regNo)) {
			q.addFilter("registration_number", FilterOperator.EQUAL, regNo);
		}
		
		String[] healthStatus = request.getParameterValues("health_status");
		if(!DataUtils.isEmpty(healthStatus)) {
			List<Object> statusList = DataUtils.toList(healthStatus);
			q.addFilter("health_status", FilterOperator.IN, statusList);
		}
	}
}
