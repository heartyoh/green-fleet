/**
 * 
 */
package com.heartyoh.report;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Controller;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * 일일 주행일지 리포터 : 운전자 ID, 운전자, 차량 ID, 차량번호, 주행거리, 주행시간, 연료소모량, 연비 
 * 
 * @author jhnam
 */
@Controller
public class DailyDrivingReporter extends AbstractReporter {

	/**
	 * report id
	 */
	private static final String ID = "daily_driving_log";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { 
		"vehicle_id", 
		"reg_no",
		"driver_id",
		"driver_name",
		"run_time", 
		"run_dist", 
		"consmpt",
		"effcc" };
	
	/**
	 * parameter names
	 */
	private static final String[] PARAM_NAMES = new String[] { "company", "_today" };
	
	@Override
	public String getId() {
		return ID;
	}
	
	@Override
	public String[] getOutputNames() {
		return SELECT_FILEDS;
	}
	
	@Override
	public String[] getInputNames() {
		return PARAM_NAMES;
	}	

	@Override
	public List<Object> report(Map<String, Object> params) throws Exception {
		
		String company = (String)params.get("company");
		Key companyKey = KeyFactory.createKey("Company", company);
		Date today = null;
		if(params.containsKey("_today")) {
			Object todayObj = params.get("_today");
			if(todayObj instanceof String) {
				today = DataUtils.toDate(todayObj.toString(), GreenFleetConstant.DEFAULT_DATE_FORMAT);
			} else if(todayObj instanceof Date) {
				today = (Date)todayObj;
			}
		} else {
			today = DataUtils.getToday();
		}
		
		Calendar c = Calendar.getInstance();
		c.setTime(today);
		c.add(Calendar.SECOND, -2 * 60 * 60 * 24);
		Date fromDate = c.getTime();
		c.add(Calendar.SECOND, 60 * 60 * 24);
		Date toDate = c.getTime();
		
		List<Object> results = new ArrayList<Object>();		
		Map<String, String> vehicleInfoMap = this.getVehicleMap(company);
		Map<String, Object> totalItems = new HashMap<String, Object>();
		List<Object> drvItems = this.getDrivingInfo(companyKey, fromDate, toDate, vehicleInfoMap);		
		totalItems.put("driving", drvItems);
		List<Object> maintItems = this.getMaintanence(companyKey, fromDate, toDate, vehicleInfoMap);
		totalItems.put("maint", maintItems);
		List<Object> consumableItems = this.getConsumables(companyKey, vehicleInfoMap);
		totalItems.put("consumable", consumableItems);
		results.add(totalItems);
		return results;
	}
	
	/**
	 * 일일 주행정보 
	 * 
	 * @param companyKey
	 * @param fromDate
	 * @param toDate
	 * @param vehicleInfo
	 * @return
	 * @throws Exception
	 */
	private List<Object> getDrivingInfo(Key companyKey, Date fromDate, Date toDate, Map<String, String> vehicleInfo) 
			throws Exception {
		
		DatastoreService datastoreService = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("CheckinData");
		q.setAncestor(companyKey);		
		q.addFilter("engine_end_time", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate);
		q.addFilter("engine_end_time", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate);
		//q.setFilter(CompositeFilterOperator.and (
		//	     new FilterPredicate("engine_end_time", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate),
		//	     new FilterPredicate("engine_end_time", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate)));		
		PreparedQuery pq = datastoreService.prepare(q);
		
		List<Object> drvItems = new ArrayList<Object>();
		List<String> drivers = new ArrayList<String>();
		
		for(Entity consumable : pq.asIterable()) {
			Map<String, Object> map = new HashMap<String, Object>();
			String vehicleId = (String)consumable.getProperty("vehicle_id");
			String driverId = (String)consumable.getProperty("driver_id");
			map.put("vehicle_id", vehicleId);
			map.put("driver_id", driverId);
			map.put("run_time", consumable.getProperty("running_time"));
			map.put("run_dist", consumable.getProperty("distance"));
			map.put("consmpt", consumable.getProperty("fuel_consumption"));
			map.put("effcc", consumable.getProperty("fuel_efficiency"));
			map.put("reg_no", vehicleInfo.get(vehicleId));			
			
			if(!drivers.contains(driverId)) {
				drivers.add(driverId);
			}
			
			drvItems.add(map);
		}
		
		if(drvItems != null && !drvItems.isEmpty())
			this.addInfo(companyKey.getName(), drivers, drvItems);
		
		return drvItems;
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	private void addInfo(String company, List<String> drivers, List<Object> results) throws Exception {
		
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("drivers", drivers);
		String driverSql = "select id, name from driver where company = :company and id in(:drivers)";
		List<Map> driverList = DatasourceUtils.selectBySql(driverSql, params);
		
		for(Object result : results) {
			Map resultMap = (Map)result;
			String driverId = (String)resultMap.get("driver_id");
			resultMap.put("driver_name", this.findDriver(driverList, driverId));
		}
	}
	
	/**
	 * vehicle id : reg_no map
	 * 
	 * @param company
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	private Map<String, String> getVehicleMap(String company) throws Exception {
		String vehicleSql = "select id, registration_number from vehicle where company = '" + company + "'";
		List<Map> vehicleList = DatasourceUtils.selectBySql(vehicleSql, null);
		Map<String, String> vehicleInfoMap = new HashMap<String, String>();
		for(Map vehicleInfo : vehicleList) {
			vehicleInfoMap.put((String)vehicleInfo.get("id"), (String)vehicleInfo.get("registration_number"));
		}		
		return vehicleInfoMap;
	}
	
	@SuppressWarnings("rawtypes")
	private String findDriver(List<Map> driverList, String driverId) {
		
		for(Map driver : driverList) {
			String id = (String)driver.get("id");
			if(driverId.equals(id)) {
				return (String)driver.get("name");
			}
		}
		
		return null;
	}
	
	/**
	 * vehicle 소모품 정보 
	 * 
	 * @param companyKey
	 * @param vehicleInfo
	 * @throws Exception
	 */
	private List<Object> getConsumables(Key companyKey, Map<String, String> vehicleInfo) throws Exception {
		
		Query q = new Query("VehicleConsumable");
		q.setAncestor(companyKey);
		q.addFilter("health_rate", Query.FilterOperator.GREATER_THAN_OR_EQUAL, 0.99f);
		//q.setFilter(new FilterPredicate("health_rate", Query.FilterOperator.GREATER_THAN_OR_EQUAL, 0.99f));
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);		
		List<Object> consumableItems = new ArrayList<Object>();
		
		for(Entity consumable : pq.asIterable()) {
			String vehicleId = (String)consumable.getProperty("vehicle_id");
			String regNo = vehicleInfo.get(vehicleId);
			String consumableItem = (String)consumable.getProperty("consumable_item");
			Map<String, Object> item = DataUtils.newMap("vehicle_id", vehicleId);
			item.put("reg_no", regNo);
			item.put("item", consumableItem);
			consumableItems.add(item);			
		}
	
		return consumableItems;
	}
	
	/**
	 * vehicle 정비 정보 
	 * 
	 * @param companyKey
	 * @param fromDate
	 * @param toDate
	 * @param vehicleInfoMap
	 * @throws Exception
	 */
	private List<Object> getMaintanence(Key companyKey, Date fromDate, Date toDate, Map<String, String> vehicleInfoMap) throws Exception {
		
		// 넘어온 기준 날짜로 정비 스케줄이 잡혀 있는 모든 Repair 조회 
		Query q = new Query("Repair");
		q.setAncestor(companyKey);
		q.addFilter("next_repair_date", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate);
		q.addFilter("next_repair_date", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate);
		//q.setFilter(CompositeFilterOperator.and (
		//	     new FilterPredicate("next_repair_date", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate),
		//	     new FilterPredicate("next_repair_date", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate)));
		q.addSort("next_repair_date", SortDirection.DESCENDING);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		List<Object> maintItems = new ArrayList<Object>();
		for(Entity repair : pq.asIterable()) {
			String vehicleId = (String)repair.getProperty("vehicle_id");
			String regNo = vehicleInfoMap.get(vehicleId);
			String comment = (String)repair.getProperty("comment");
			Map<String, Object> item = DataUtils.newMap("vehicle_id", vehicleId);
			item.put("reg_no", regNo);
			item.put("comment", comment);
			maintItems.add(item);
		}
		
		return maintItems;
	}

	@Override
	public String getReportContent(Map<String, Object> params) throws Exception {
		
		List<Object> results = this.report(params);
		if(!DataUtils.isEmpty(results))
			return this.adjustDataToTemplate(results);
		else
			return null;
	}
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	private String adjustDataToTemplate(List<Object> results) throws Exception {
		
		Date currentDate = DataUtils.addDate(DataUtils.getToday(), -1);
		String template = this.getReportTemplate();
		StringBuffer content = new StringBuffer();
		Map<String, Object> items = (Map<String, Object>)results.get(0);
		List<Object> drivings = (List<Object>)items.get("driving");

		if(DataUtils.isEmpty(drivings)) {
			content.append("<tr>\n");
			for(int i = 0 ; i < 6 ; i++) {
				this.appendTd(content, "");
			}
			content.append("</tr>\n");
		} else {
			for(Object obj : drivings) {
				Map item = (Map)obj;
				content.append("<tr>\n");				
				this.appendTd(content, item.get("driver_id"));
				this.appendTd(content, item.get("driver_name"));
				this.appendTd(content, item.get("vehicle_id"));
				this.appendTd(content, item.get("reg_no"));				
				this.appendTd(content, item.get("run_dist"));
				this.appendTd(content, item.get("run_time"));
				this.appendTd(content, item.get("consmpt"));
				this.appendTd(content, item.get("effcc"));
				content.append("</tr>\n");
			}
		}
		
		template = template.replaceAll("\\{date\\}", DataUtils.dateToString(currentDate, GreenFleetConstant.DEFAULT_DATE_FORMAT));
		template = template.replaceAll("\\{DRIVINGS\\}", content.toString());
		content.delete(0, content.length() - 1);
		
		List<Object> consumables = (List<Object>)items.get("consumable");
		if(DataUtils.isEmpty(consumables)) {
			content.append("<tr>\n");
			for(int i = 0 ; i < 6 ; i++) {
				this.appendTd(content, "");
			}
			content.append("</tr>\n");
		} else {
			for(Object obj : consumables) {
				Map item = (Map)obj;
				content.append("<tr>\n");				
				this.appendTd(content, item.get("vehicle_id"));
				this.appendTd(content, item.get("reg_no"));
				this.appendTd(content, item.get("item"));
				content.append("</tr>\n");
			}
		}
		
		template = template.replaceAll("\\{CONSUMABLES\\}", content.toString());
		content.delete(0, content.length() - 1);
		
		List<Object> maints = (List<Object>)items.get("maint");
		if(DataUtils.isEmpty(maints)) {
			content.append("<tr>\n");
			for(int i = 0 ; i < 6 ; i++) {
				this.appendTd(content, "");
			}
			content.append("</tr>\n");
		} else {
			for(Object obj : maints) {
				Map item = (Map)obj;
				content.append("<tr>\n");				
				this.appendTd(content, item.get("vehicle_id"));
				this.appendTd(content, item.get("reg_no"));
				this.appendTd(content, item.get("comment"));
				content.append("</tr>\n");
			}
		}
		
		return template.replaceAll("\\{MAINTENANCES\\}", content.toString());		
	}
	
	/**
	 * <td>data</td> 추가 
	 * @param buffer
	 * @param data
	 */
	private void appendTd(StringBuffer buffer, Object data) {
		buffer.append("<td class='alignCenter'>").append(data).append("</td>\n");
	}
}
