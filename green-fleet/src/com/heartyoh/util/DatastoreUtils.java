/**
 * 
 */
package com.heartyoh.util;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.model.Filter;

/**
 * Entity 유틸리티 클래스 
 * 
 * @author jhnam
 */
public class DatastoreUtils {
	
	/**
	 * key로 entity가 존재하는지 여부를 리턴 
	 * 
	 * @param key
	 * @return
	 */
	public static boolean checkExist(Key key) {
		return findByKey(key) != null ? true : false;
	}
	
	/**
	 * keyStr으로 entity가 존재하는지 여부를 리턴 
	 * 
	 * @param keyStr
	 * @return
	 */
	public static boolean checkExist(String keyStr) {
		return findByKey(keyStr) != null ? true : false;
	}
	
	/**
	 * key로 entity를 조회 
	 * 
	 * @param key
	 * @return
	 */
	public static Entity findByKey(Key key) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		
		try {
			return datastore.get(key);
		} catch (EntityNotFoundException e) {
		}
		
		return null;		
	}
	
	/**
	 * key로 Entity를 조회 
	 * 
	 * @param key
	 * @return
	 */
	public static Entity findByKey(String keyStr) {		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		
		try {
			return datastore.get(KeyFactory.stringToKey(keyStr));
		} catch (EntityNotFoundException e) {
		}
		
		return null;
	}
	
	/**
	 * 검색조건 filters를 반영한 Entity 조회 
	 * 
	 * @param entityName
	 * @param companyKey
	 * @param filters
	 * @return
	 */
	public static Iterator<Entity> findEntities(String entityName, Key companyKey, List<Filter> filters) {
		
		Query q = createDefaultQuery(companyKey, entityName);
		
		if(!DataUtils.isEmpty(filters)) {			
			for(Filter filter : filters) {
				q.addFilter(filter.getProperty(), FilterOperator.EQUAL, filter.getValue());
			}
 		}

		return findMultiEntity(q);
	}
	
	/**
	 * 검색 조건 filters를 반영한 하나의 Entity 조회
	 *  
	 * @param entityName
	 * @param companyKey
	 * @param filters
	 * @return
	 */
	public static Entity findEntity(String entityName, Key companyKey, List<Filter> filters) {
		Query q = createDefaultQuery(companyKey, entityName);
		
		for(Filter filter : filters) {
			q.addFilter(filter.getProperty(), FilterOperator.EQUAL, filter.getValue());
		}

		return findSingleEntity(q);		
	}
	
	/**
	 * 검색조건 filters를 반영한 Entity 조회 
	 * 
	 * @param companyKey
	 * @param entityName
	 * @param filters
	 * @return
	 */
	public static Iterator<Entity> findEntities(Key companyKey, String entityName, Map<String, Object> filters) {
		
		Query q = createDefaultQuery(companyKey, entityName);
		
		if(!DataUtils.isEmpty(filters)) {
			Iterator<String> filterKeyIter = filters.keySet().iterator();
			while(filterKeyIter.hasNext()) {
				String filterKey = filterKeyIter.next();
				Object filterValue = filters.get(filterKey);
				
				if(filterValue instanceof Collection)
					q.addFilter(filterKey, FilterOperator.IN, filterValue);
				else
					q.addFilter(filterKey, FilterOperator.EQUAL, filterValue);
			}
 		}

		return findMultiEntity(q);
	}
	
	/**
	 * 검색 조건 filters를 반영한 하나의 Entity 조회
	 *  
	 * @param companyKey
	 * @param entityName
	 * @param filters
	 * @return
	 */
	public static Entity findEntity(Key companyKey, String entityName, Map<String, Object> filters) {
		Query q = createDefaultQuery(companyKey, entityName);
		
		if(!DataUtils.isEmpty(filters)) {
			Iterator<String> filterKeyIter = filters.keySet().iterator();
			while(filterKeyIter.hasNext()) {
				String filterKey = filterKeyIter.next();				
				Object filterValue = filters.get(filterKey);
				
				if(filterValue instanceof Collection)
					q.addFilter(filterKey, FilterOperator.IN, filterValue);
				else
					q.addFilter(filterKey, FilterOperator.EQUAL, filterValue);				
			}
 		}

		return findSingleEntity(q);		
	}
	
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
	 * key로 vehicle을 찾아 리턴 
	 * 
	 * @param key
	 * @return
	 */
	public static Entity findVehicle(String key) {
		return findByKey(key);
	}
	
	/**
	 * vehicleKey로 vehicle을 찾아 리턴 
	 * 
	 * @param vehicleKey
	 * @return
	 */
	public static Entity findVehicle(Key vehicleKey) {
		return findByKey(vehicleKey);
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
	
	private static Iterator<Entity> findMultiEntity(Query q) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		return pq.asIterable().iterator();
	}
}
