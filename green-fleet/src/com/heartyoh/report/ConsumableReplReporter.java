/**
 * 
 */
package com.heartyoh.report;

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
public class ConsumableReplReporter extends AbstractReporter {

	/**
	 * report id
	 */
	private static final String ID = "consumables_to_replace";
	/**
	 * output field names
	 */
	private static final String[] OUTPUT_NAMES = new String[] { 
		"vehicle_id", 
		"consumable_item", 
		"next_repl_date", 
		"last_repl_date", 
		"repl_mileage", 
		"health_rate", 
		"status" };
	
	/**
	 * input parameter names
	 */
	private static final String[] INPUT_NAMES = new String[] {
		"company", "health_rate"
	};
	
	@Override
	public String getId() {
		return ID;
	}
	
	@Override
	public String[] getOutputNames() {
		return OUTPUT_NAMES;
	}
	
	@Override
	public String[] getInputNames() {
		return INPUT_NAMES;
	}

	/**
	 * 소모품 교체 일정이 다가온 소모품 리스트를 조회한다. 조건은 health rate가 0.99 이상인 것들 대상으로 조회
	 */
	@Override
	public List<Object> report(Map<String, Object> params) throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", (String)params.get("company"));
		Query q = new Query("VehicleConsumable");
		q.setAncestor(companyKey);
		
		// 조건은 health rate가 0.99 이상인 것들 대상으로 조회
		float healthRate = params.containsKey("health_rate") ? DataUtils.toFloat(params.get("health_rate")) : 0.99f;
		q.addFilter("health_rate", Query.FilterOperator.GREATER_THAN_OR_EQUAL, healthRate);
		//q.setFilter(new FilterPredicate("health_rate", Query.FilterOperator.EQUAL, healthRate));
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		List<Object> results = new ArrayList<Object>();
		for(Entity consumable : pq.asIterable()) {
			Map<String, Object> map = SessionUtils.cvtEntityToMap(consumable, OUTPUT_NAMES);
			results.add(map);
		}
		return results;
	}
}