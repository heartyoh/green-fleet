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
import com.google.appengine.api.datastore.Query.SortDirection;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 정비 대상 목록 
 * 
 * @author jhnam
 */
public class DailyMaintReporter extends AbstractReporter {

	/**
	 * report id
	 */
	private static final String ID = "repair_list";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { "vehicle_id", "next_repair_date" };
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
		
		String type = (String)params.get("type");
		
		if(DataUtils.isEmpty(type)) {
			return this.dailyMaintList(params);
		} else if("maint_trend".equalsIgnoreCase(type)) {
			return this.maintTrend(params);
		} else {
			return null;
		}
	}
	
	/**
	 * 년간 차량별 정비 추이 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	private List<Object> maintTrend(Map<String, Object> params) throws Exception {
		
		Map<String, Object> paramMap = DataUtils.newMap("company", params.get("company"));		
		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("	year, vehicle, sum(mnt_cnt) mnt_cnt ");
		sql.append("from ");
		sql.append("	vehicle_run_sum ");
		sql.append("where ");
		sql.append("	company = :company group by vehicle, year order by vehicle");
		List<?> items = DatasourceUtils.selectBySql(sql.toString(), paramMap);
		return (List<Object>)items;		
	}
	
	/**
	 * 일일 정비 리스트 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	private List<Object> dailyMaintList(Map<String, Object> params) throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", (String)params.get("company"));
		Date today = params.containsKey("_today") ? 
				(Date)params.get("_today") : DataUtils.getToday();
				
		// 넘어온 기준 날짜로 정비 스케줄이 잡혀 있는 모든 Repair 조회 
		Query q = new Query("Repair");
		q.setAncestor(companyKey);
		Date[] fromToDate = DataUtils.getFromToDate(today, -2, -1);
		q.addFilter("next_repair_date", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromToDate[0]);
		q.addFilter("next_repair_date", Query.FilterOperator.LESS_THAN_OR_EQUAL, fromToDate[1]);
		q.addSort("next_repair_date", SortDirection.DESCENDING);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		List<Object> results = new ArrayList<Object>();
		for(Entity repair : pq.asIterable()) {
			results.add(SessionUtils.cvtEntityToMap(repair, SELECT_FILEDS));
		}
		return results;		
	}
	
}
