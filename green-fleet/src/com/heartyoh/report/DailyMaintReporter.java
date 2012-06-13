/**
 * 
 */
package com.heartyoh.report;

import java.sql.Types;
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
import com.google.appengine.api.datastore.Query.SortDirection;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 정비 대상 목록 
 * 
 * @author jhnam
 */
public class DailyMaintReporter implements IReporter {

	/**
	 * report id
	 */
	private static final String ID = "repair_list";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { "vehicle_id", "next_repair_date" };

	/**
	 * field types
	 */
	private static final int[] FIELD_TYPES = new int[] { Types.VARCHAR, Types.DATE };
	
	/**
	 * parameters
	 */
	private Map<String, Object> params;
	
	@Override
	public String getId() {
		return ID;
	}
	
	@Override
	public String[] getSelectFields() {
		return SELECT_FILEDS;
	}

	@Override
	public int[] getFieldTypes() {
		return FIELD_TYPES;
	}
	
	@Override
	public void setParameter(Map<String, Object> params) {
		this.params = params;
	}

	@Override
	public List<Map<String, Object>> report() throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", (String)params.get("company"));
		Date today = this.params.containsKey("_today") ? 
				(Date)this.params.get("_today") : DataUtils.getToday();
				
		// 넘어온 기준 날짜로 정비 스케줄이 잡혀 있는 모든 Repair 조회 
		Query q = new Query("Repair");
		q.setAncestor(companyKey);
		Date[] fromToDate = DataUtils.getFromToDate(today, -2, -1);
		q.addFilter("next_repair_date", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromToDate[0]);
		q.addFilter("next_repair_date", Query.FilterOperator.LESS_THAN_OR_EQUAL, fromToDate[1]);
		q.addSort("next_repair_date", SortDirection.DESCENDING);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		List<Map<String, Object>> results = new ArrayList<Map<String, Object>>();
		for(Entity repair : pq.asIterable()) {
			results.add(SessionUtils.cvtEntityToMap(repair, SELECT_FILEDS));
		}
		return results;
	}
	
}
