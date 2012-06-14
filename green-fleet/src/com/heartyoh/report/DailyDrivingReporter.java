/**
 * 
 */
package com.heartyoh.report;

import java.util.ArrayList;
import java.util.Date;
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
import com.heartyoh.util.SessionUtils;

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
		"driver_id", 
		"running_time", 
		"distance", 
		"fuel_efficiency" };
	
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
		
		Key companyKey = KeyFactory.createKey("Company", (String)params.get("company"));
		Date today = params.containsKey("_today") ? 
				(Date)params.get("_today") : DataUtils.getToday();
				
		DatastoreService datastoreService = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("CheckinData");
		q.setAncestor(companyKey);
		Date[] fromToDate = DataUtils.getFromToDate(today, -2, -1);
		q.addFilter("engine_end_time", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromToDate[0]);
		q.addFilter("engine_end_time", Query.FilterOperator.LESS_THAN_OR_EQUAL, fromToDate[1]);		
		PreparedQuery pq = datastoreService.prepare(q);
		
		List<Object> results = new ArrayList<Object>();
		for(Entity consumable : pq.asIterable()) {
			Map<String, Object> map = SessionUtils.cvtEntityToMap(consumable, SELECT_FILEDS);
			results.add(map);
		}
		return results;
	}
}
