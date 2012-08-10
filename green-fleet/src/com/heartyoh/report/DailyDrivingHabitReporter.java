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
 * 일일 운전습관 리포트 
 * 
 * @author jhnam
 */
public class DailyDrivingHabitReporter extends AbstractReporter {
	/**
	 * report id
	 */
	private static final String ID = "daily_driving_habit";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { 
		"driver_id", 
		"driver_name",
		"average_speed",
		"max_speed",
		"fuel_efficiency", 
		"co2_emissions", 
		"running_time",
		"eco_driving_time",
		"idle_time",
		"over_speed_time",
		"sudden_accel_count",
		"sudden_brake_count"};
		
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
		return this.getDrivingHabits(companyKey, fromDate, toDate);		
	}
	
	/**
	 * 일일 주행정보 
	 * 
	 * @param companyKey
	 * @param fromDate
	 * @param toDate
	 * @return
	 * @throws Exception
	 */
	private List<Object> getDrivingHabits(Key companyKey, Date fromDate, Date toDate) throws Exception {
		
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
			String driverId = (String)consumable.getProperty("driver_id");			
			map.put("driver_id", driverId);
			map.put("average_speed", consumable.getProperty("average_speed"));
			map.put("max_speed", consumable.getProperty("max_speed"));
			map.put("fuel_efficiency", consumable.getProperty("fuel_efficiency"));
			map.put("co2_emissions", consumable.getProperty("co2_emissions"));
			map.put("running_time", consumable.getProperty("running_time"));
			map.put("eco_driving_time", consumable.getProperty("eco_driving_time"));
			map.put("idle_time", consumable.getProperty("idle_time"));
			map.put("over_speed_time", consumable.getProperty("over_speed_time"));
			map.put("sudden_accel_count", consumable.getProperty("sudden_accel_count"));
			map.put("sudden_brake_count", consumable.getProperty("sudden_brake_count"));
			
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
	
	@Override
	public String getReportContent(Map<String, Object> params) throws Exception {
		
		List<Object> results = this.report(params);
		if(!DataUtils.isEmpty(results))
			return this.adjustDataToTemplate(results);
		else
			return null;
	}
	
	private String adjustDataToTemplate(List<Object> results) throws Exception {
		
		String template = this.getReportTemplate();
		StringBuffer content = new StringBuffer();

		if(DataUtils.isEmpty(results)) {
			content.append("<tr>\n");
			for(int i = 0 ; i < SELECT_FILEDS.length ; i++) {
				content.append("<td/>\n");
			}
			content.append("</tr>\n");
		} else {
			for(Object obj : results) {
				@SuppressWarnings("rawtypes")
				Map item = (Map)obj;
				this.appendRecord(content, SELECT_FILEDS, item);
			}
		}
		
		Date currentDate = DataUtils.addDate(DataUtils.getToday(), -1);
		template = template.replaceAll("\\{date\\}", DataUtils.dateToString(currentDate, GreenFleetConstant.DEFAULT_DATE_FORMAT));
		return template.replaceAll("\\{HABITS\\}", content.toString());
	}
	
	@SuppressWarnings("rawtypes")
	private void appendRecord(StringBuffer content, String[] selectFields, Map record) {
		content.append("<tr>\n");
		for(int i = 0 ; i < selectFields.length ; i++) {			
			content.append("<td>").append(record.get(selectFields[i])).append("</td>\n");
		}
		content.append("</tr>\n");		
	}	
}
