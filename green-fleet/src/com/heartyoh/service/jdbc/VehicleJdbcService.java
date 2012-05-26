/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;

/**
 * Vehicle Service
 * 
 * @author jhnam
 */
public class VehicleJdbcService extends JdbcEntityService {

	/**
	 * key names
	 */
	private static final String TABLE_NAME = "vehicle";	
	/**
	 * table column - service field map
	 */
	private static Map<String, String> COLUMN_SVC_FIELD_MAP;
	/**
	 * service field - table column map
	 */
	private static Map<String, String> SVC_COLUMN_FIELD_MAP;
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {
		
		if(COLUMN_SVC_FIELD_MAP == null) {
			COLUMN_SVC_FIELD_MAP = new HashMap<String, String>();
			COLUMN_SVC_FIELD_MAP.put("reg_no", "registration_number");
			COLUMN_SVC_FIELD_MAP.put("run_dist", "total_distance");
			COLUMN_SVC_FIELD_MAP.put("remain_fuel", "remaining_fuel");
			COLUMN_SVC_FIELD_MAP.put("lat", "lattitude");
			COLUMN_SVC_FIELD_MAP.put("lng", "longitude");
		}
		
		return COLUMN_SVC_FIELD_MAP;
	}

	/**
	 * service field - column map
	 * 
	 * @return
	 */
	protected Map<String, String> getSvcFieldColumnMap() {
		
		if(SVC_COLUMN_FIELD_MAP == null) {
			SVC_COLUMN_FIELD_MAP = new HashMap<String, String>();
			SVC_COLUMN_FIELD_MAP.put("registration_number", "reg_no");
			SVC_COLUMN_FIELD_MAP.put("total_distance", "run_dist");
			SVC_COLUMN_FIELD_MAP.put("remaining_fuel", "remain_fuel");
			SVC_COLUMN_FIELD_MAP.put("lattitude", "lat");
			SVC_COLUMN_FIELD_MAP.put("longitude", "lng");			
		}
		
		return SVC_COLUMN_FIELD_MAP;
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
	
	@RequestMapping(value = "/vehicle/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.find(request, response);
	}
		
	@RequestMapping(value = "/vehicle/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
	@RequestMapping(value = {"/vehicle", "/m/data/vehicle.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		

		Map<String, Object> queryParams = DataUtils.newMap("company", this.getCompany(request));
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle_id")))
			queryParams.put("id", request.getParameter("vehicle_id"));
		
		if(!DataUtils.isEmpty(request.getParameter("registration_number")))
			queryParams.put("reg_no", request.getParameter("registration_number"));
		
		return super.retrieve(false, queryParams, request, response);
	}
	
	@RequestMapping(value = "/vehicle/byhealth", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveByHealth(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String consumableItem = request.getParameter("consumable_item");
		
		// 1. health_status와 consumable_item이 동시에 : consumable이 health_status인 모든 vehicle을 조회 		
		if(DataUtils.isEmpty(consumableItem)) {
			return super.retrieve(false, DataUtils.newMap("company", this.getCompany(request)), request, response);
			
		// 2. consumable_item은 없고 health_status만 있는 경우 : 
		// vehicle의 상태가 health_status인 모든 차량 조회, 하지만 health_status가 세 개인 경우는 모든 vehicle 조회 		
		} else {
			Map<String, String> consumablesMap = this.findConsumables(this.getCompanyKey(request), consumableItem, request.getParameterValues("health_status"));
			
			if(!consumablesMap.isEmpty()) {
				List<Map<String, Object>> items = this.findVehicles(consumablesMap, request, response);
				return this.getResultSet(true, items.size(), items);
			} else {
				return getResultSet(true, 0, null);
			}
		}
	}
	
	/**
	 * 조건에 의해 vehicle을 조회해서 consumableMap의 상태 정보를 vehicle 상태 정보로 overwrite해서 리턴  
	 * 
	 * @param consumablesMap
	 * @param request
	 * @param response
	 * @return
	 * @throws
	 */
	private List<Map<String, Object>> findVehicles(Map<String, String> consumablesMap, HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, String> svcColumnMap = this.getSvcFieldColumnMap();
		String[] selectCols = request.getParameterValues("select");
		StringBuffer query = new StringBuffer("select ");
		
		if(selectCols == null || selectCols.length == 0) {
			query.append("*");
		} else {
			for(int i = 0 ; i < selectCols.length ; i++) {
				String column = selectCols[i];
				query.append(i == 0 ? "" : ",");
				query.append(svcColumnMap.containsKey(column) ? svcColumnMap.get(column) : column);				
			}
		}		
		query.append(" from vehicle where company = '");
		query.append(this.getCompany(request)).append("'");
		query.append(" and id in (");
		
		int idx = 0;
		Iterator<String> keyIter = consumablesMap.keySet().iterator();
		while(keyIter.hasNext()) {
			String vehicleId = keyIter.next();
			query.append((idx++ > 0) ? "," : "").append("'").append(vehicleId).append("'");
		}		
		query.append(")");
		
		List<Map<String, Object>> items = this.executeQuery(query.toString(), null);
		for(Map<String, Object> item : items) {
			String vehicleId = (String)item.get("id");			
			String consumableStatus = consumablesMap.get(vehicleId);
			item.put("health_status", consumableStatus);
			item.put("registration_number", item.remove("reg_no"));
			item.put("total_distance", item.remove("run_dist"));
		}
		
		return items;
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
		Map<String, Object> filters = DataUtils.newMap("consumable_item", consumableItem);
		filters.put("status", statusList);				
		Map<String, String> resultMap = new HashMap<String, String>();
		
		Iterator<Entity> consumables = DatastoreUtils.findEntities(companyKey, "VehicleConsumable", filters);
		while(consumables.hasNext()) {
			Entity consumable = consumables.next();
			resultMap.put((String)consumable.getProperty("vehicle_id"), (String)consumable.getProperty("status"));
		}
		
		return resultMap;
	}
}
