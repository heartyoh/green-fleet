/**
 * 
 */
package com.heartyoh.report;

import java.sql.Types;
import java.util.ArrayList;
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
 * 소모품 교체 대상 목록
 * 
 * @author jhnam
 */
public class ConsumableReplReporter implements IReporter {

	/**
	 * report id
	 */
	private static final String ID = "consumables_to_replace";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { 
		"vehicle_id", 
		"consumable_item", 
		"next_repl_date", 
		"last_repl_date", 
		"repl_mileage", 
		"health_rate", 
		"status" };
	
	/**
	 * select fields
	 */
	private static final int[] FIELD_TYPES = new int[] {
		Types.VARCHAR,
		Types.VARCHAR,
		Types.VARCHAR,
		Types.VARCHAR,
		Types.DOUBLE,
		Types.DOUBLE,
		Types.VARCHAR
	};
	
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
		
	/**
	 * 소모품 교체 일정이 다가온 소모품 리스트를 조회한다. 조건은 health rate가 0.99 이상인 것들 대상으로 조회
	 */
	@Override
	public List<Map<String, Object>> report() throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", (String)params.get("company"));
		Query q = new Query("VehicleConsumable");
		q.setAncestor(companyKey);
		
		// 조건은 health rate가 0.99 이상인 것들 대상으로 조회
		float healthRate = params.containsKey("health_rate") ? DataUtils.toFloat(params.get("health_rate")) : 0.99f;
		q.addFilter("health_rate", Query.FilterOperator.GREATER_THAN_OR_EQUAL, healthRate);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		List<Map<String, Object>> results = new ArrayList<Map<String, Object>>();
		for(Entity consumable : pq.asIterable()) {
			Map<String, Object> map = SessionUtils.cvtEntityToMap(consumable, SELECT_FILEDS);
			results.add(map);
		}
		return results;
	}

}