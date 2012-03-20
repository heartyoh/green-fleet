/**
 * 
 */
package com.heartyoh.util;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;

/**
 * Entity 유틸리티 클래스 
 * 
 * @author jhnam
 */
public class DatastoreUtils {

	/**
	 * companyKey, vehicleId로 Vehicle을 찾아 리턴
	 * 
	 * @param companyKey
	 * @param id
	 * @return
	 */
	public static Entity findVehicle(Key companyKey, String vehicleId) {
		Query q = createDefaultQuery(companyKey, "Vehicle");
		q.addFilter("id", FilterOperator.EQUAL, vehicleId);
		return findSingleEntity(q);
	}
	
	/**
	 * companyKey, vehicleId, consumableItem으로 Consumable을 찾아 리턴 
	 * 
	 * @param companyKey
	 * @param vehicleId
	 * @param comsumableItem
	 * @return
	 */
	public static Entity findConsumable(Key companyKey, String vehicleId, String consumableItem) {
		Query q = createDefaultQuery(companyKey, "VehicleConsumable");
		q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
		q.addFilter("consumable_item", FilterOperator.EQUAL, consumableItem);
		return findSingleEntity(q);
	}
	
	private static Query createDefaultQuery(Key companyKey, String entityName) {
		Query q = new Query(entityName);
		q.setAncestor(companyKey);
		return q;
	}
	
	private static Entity findSingleEntity(Query q) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		return pq.asSingleEntity();
	}
}
