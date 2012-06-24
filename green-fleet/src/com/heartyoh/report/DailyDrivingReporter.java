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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * 일일 주행일지 리포터 : 운전자 ID, 운전자, 차량 ID, 차량번호, 주행거리, 주행시간, 연료소모량, 연비 
 * 
 * @author jhnam
 */
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
			
		DatastoreService datastoreService = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("CheckinData");
		q.setAncestor(companyKey);
		Calendar c = Calendar.getInstance();
		c.setTime(today);
		c.add(Calendar.SECOND, -1 * 60 * 60 * 24);
		Date fromDate = c.getTime();
		c.add(Calendar.SECOND, 60 * 60 * 24);
		Date toDate = c.getTime();
		
		q.addFilter("engine_end_time", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate);
		q.addFilter("engine_end_time", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate);		
		PreparedQuery pq = datastoreService.prepare(q);
		
		List<Object> results = new ArrayList<Object>();
		List<String> vehicles = new ArrayList<String>();
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
			
			if(!vehicles.contains(vehicleId)) {
				vehicles.add(vehicleId);
			}
			
			if(!drivers.contains(driverId)) {
				drivers.add(driverId);
			}
			
			results.add(map);
		}
		
		if(results != null && !results.isEmpty())
			this.addInfo(company, vehicles, drivers, results);
		
		return results;
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	private void addInfo(String company, List<String> vehicles, List<String> drivers, List<Object> results) throws Exception {
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("vehicles", vehicles);
		String vehicleSql = "select id, registration_number from vehicle where company = :company and id in(:vehicles)";
		List<Map> vehicleList = DatasourceUtils.selectBySql(vehicleSql, params);
		
		params.remove("vehicles");
		params.put("drivers", drivers);
		String driverSql = "select id, name from driver where company = :company and id in(:drivers)";
		List<Map> driverList = DatasourceUtils.selectBySql(driverSql, params);
		
		for(Object result : results) {
			Map resultMap = (Map)result;
			String vehicleId = (String)resultMap.get("vehicle_id");
			String driverId = (String)resultMap.get("driver_id");
			resultMap.put("reg_no", this.findRegNo(vehicleList, vehicleId));
			resultMap.put("driver_name", this.findDriver(driverList, driverId));
		}
	}
	
	@SuppressWarnings("rawtypes")
	private String findRegNo(List<Map> vehicleList, String vehicleId) {
		
		for(Map vehicle : vehicleList) {
			String id = (String)vehicle.get("id");
			if(vehicleId.equals(id)) {
				return (String)vehicle.get("registration_number");
			}
		}
		
		return null;
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
}
