/**
 * 
 */
package com.heartyoh.util;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;

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
	 * String으로 company를 조회 
	 * 
	 * @param company
	 * @return
	 */
	public static Entity findCompany(String company) {
		Query q = new Query("Company");
		q.addFilter("id", FilterOperator.EQUAL, company);
		return findSingleEntity(q);
	}
	
	/**
	 * 모든 회사 리스트 조회 
	 * 
	 * @return
	 */
	public static List<Entity> findAllCompany() {		
		Query q = new Query("Company");
		return findMultiEntityByList(q);
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
	 * Query q에 filter 적용 
	 * 
	 * @param q
	 * @param filters
	 */
	public static void adjustFilters(Query q, List<Filter> filters) {
		
		if(DataUtils.isEmpty(filters))
			return;
		
		for(Filter filter : filters) {
			q.addFilter(filter.getProperty(), FilterOperator.EQUAL, filter.getValue());
		}
	}
	
	/**
	 * Query q에 filters 적용 
	 * 
	 * @param q
	 * @param filters
	 */
	@SuppressWarnings("rawtypes")
	public static void adjustFilters(Query q, Map<String, Object> filters) {
		
		if(DataUtils.isEmpty(filters))
			return;
		
		Iterator<String> filterKeyIter = filters.keySet().iterator();
		while(filterKeyIter.hasNext()) {
			String filterKey = filterKeyIter.next();
			Object filterValue = filters.get(filterKey);
					
			if(filterValue instanceof Collection && !((Collection)filterValue).isEmpty())
				q.addFilter(filterKey, FilterOperator.IN, filterValue);
			else
				q.addFilter(filterKey, FilterOperator.EQUAL, filterValue);
		}
	}
	
	/**
	 * Query q에 sorters 적용 
	 * 
	 * @param q
	 * @param sorters
	 */
	public static void adjustSorters(Query q, List<Sorter> sorters) {
	
		if(DataUtils.isEmpty(sorters))
			return;

		for(Sorter sorter : sorters) {
			SortDirection dir = (DataUtils.toNotNull(sorter.getDirection()).startsWith("ASC")) ? SortDirection.ASCENDING : SortDirection.DESCENDING;
			q.addSort(sorter.getProperty(), dir);				
		}
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
		adjustFilters(q, filters);
		return findMultiEntity(q);
	}
	
	/**
	 * 검색조건 filters, sorters를 반영한 Entity 조회 
	 * 
	 * @param entityName
	 * @param companyKey
	 * @param filters
	 * @param sorters
	 * @return
	 */
	public static Iterator<Entity> findEntities(String entityName, Key companyKey, List<Filter> filters, List<Sorter> sorters) {
		
		Query q = createDefaultQuery(companyKey, entityName);		
		adjustFilters(q, filters);		
		adjustSorters(q, sorters);
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
		adjustFilters(q, filters);
		return findSingleEntity(q);		
	}
	
	/**
	 * 검색 조건 filters, sorters를 반영한 하나의 Entity 조회
	 *  
	 * @param entityName
	 * @param companyKey
	 * @param filters
	 * @param sorters
	 * @return
	 */
	public static Entity findEntity(String entityName, Key companyKey, List<Filter> filters, List<Sorter> sorters) {
		
		Query q = createDefaultQuery(companyKey, entityName);		
		adjustFilters(q, filters);
		adjustSorters(q, sorters);
		return findSingleEntity(q);		
	}	
	
	/**
	 * 검색조건 filters를 반영한 Entity List 조회 
	 * 
	 * @param companyKey
	 * @param entityName
	 * @param filters
	 * @return
	 */
	public static List<Entity> findEntityList(Key companyKey, String entityName, Map<String, Object> filters) {
		
		Query q = createDefaultQuery(companyKey, entityName);
		adjustFilters(q, filters);
		return findMultiEntityByList(q);
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
		adjustFilters(q, filters);
		return findMultiEntity(q);
	}
	
	/**
	 * 검색조건 filters, sorters를 반영한 Entity 조회 
	 * 
	 * @param companyKey
	 * @param entityName
	 * @param filters
	 * @param sorters
	 * @return
	 */
	public static Iterator<Entity> findEntities(Key companyKey, String entityName, Map<String, Object> filters, List<Sorter> sorters) {
		
		Query q = createDefaultQuery(companyKey, entityName);
		adjustFilters(q, filters);
		adjustSorters(q, sorters);
		return findMultiEntity(q);
	}
	
	/**
	 * 검색조건 filters, sorters를 반영한 Entity List 조회 
	 * 
	 * @param companyKey
	 * @param entityName
	 * @param filters
	 * @param sorters
	 * @return
	 */
	public static List<Entity> findEntityList(Key companyKey, String entityName, Map<String, Object> filters, List<Sorter> sorters) {
		
		Query q = createDefaultQuery(companyKey, entityName);
		adjustFilters(q, filters);
		adjustSorters(q, sorters);		
		return findMultiEntityByList(q);
	}	
	
	/**
	 * companyKey, entityName, filters 로 entity 리스트를 조회해서 그 중에 selectPropName 프로퍼티 정보만 추출해서 리턴  
	 * 
	 * @param companyKey
	 * @param entityName
	 * @param filters
	 * @param selectPropName
	 * @return
	 */
	public static List<Object> findEntityProperties(Key companyKey, String entityName, Map<String, Object> filters, String selectPropName) {
		
		List<Object> list = new ArrayList<Object>();
		Iterator<Entity> entities = findEntities(companyKey, entityName, filters);
		while(entities.hasNext()) {
			Entity entity = entities.next();
			list.add(entity.getProperty(selectPropName));
		}
		
		return list;
	}
	
	/**
	 * companyKey, entityName, filters 로 entity 리스트를 조회해서 그 중에 selectPropName 프로퍼티 정보만 추출해서 sorters를 적용하여 Map으로 리턴  
	 * 
	 * @param companyKey
	 * @param entityName
	 * @param filters
	 * @param sorters
	 * @param selectPropName
	 * @return
	 */
	public static List<Map<String, Object>> findEntityPropMap(Key companyKey, String entityName, Map<String, Object> filters, List<Sorter> sorters, String[] selectPropName) {
		
		List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
		Iterator<Entity> entities = findEntities(companyKey, entityName, filters, sorters);
		
		while(entities.hasNext()) {
			Entity entity = entities.next();
			Map<String, Object> item = SessionUtils.cvtEntityToMap(entity, selectPropName);
			items.add(item);
		}
		
		return items;
	}
	
	/**
	 * companyKey, entityName, filters 로 entity 리스트를 조회해서 그 중에 selectPropName 프로퍼티 정보만 추출해서 Map으로 리턴  
	 * 
	 * @param companyKey
	 * @param entityName
	 * @param filters
	 * @param selectPropName
	 * @return
	 */
	public static List<Map<String, Object>> findEntityPropMap(Key companyKey, String entityName, Map<String, Object> filters, String[] selectPropName) {
		
		List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
		Iterator<Entity> entities = findEntities(companyKey, entityName, filters);
		
		while(entities.hasNext()) {
			Entity entity = entities.next();
			Map<String, Object> item = SessionUtils.cvtEntityToMap(entity, selectPropName);
			items.add(item);
		}
		
		return items;
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
		adjustFilters(q, filters);
		return findSingleEntity(q);
	}
	
	/**
	 * 관리자 리스트를 조회 
	 * 
	 * @param companyKey
	 * @return
	 */
	public static List<Entity> findAdminUsers(String company) {
		
		Query q = new Query("CustomUser");
		q.addFilter("company", FilterOperator.EQUAL, company);
		q.addFilter("admin", FilterOperator.EQUAL, true);
		return findMultiEntityByList(q);
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
	
	/**
	 * companyKey, vehicleId로 consumable list 조회 
	 * 
	 * @param companyKey
	 * @param vehicleId
	 * @return
	 */
	public static List<Entity> findConsumables(Key companyKey, String vehicleId) {
		
		Query q = createDefaultQuery(companyKey, "VehicleConsumable");
		q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
		return findMultiEntityByList(q);
	}
	
	/**
	 * driverId로 checkin data를 조회
	 * 
	 * @param companyKey
	 * @param driverId
	 * @param fromDate
	 * @param toDate
	 * @return
	 */
	public static List<Entity> findCheckinsByDriver(Key companyKey, String driverId, Date fromDate, Date toDate) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("CheckinData");
		q.setAncestor(companyKey);		
		q.addFilter("engine_end_time", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate);
		q.addFilter("engine_end_time", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate);
		q.addFilter("driver_id", Query.FilterOperator.EQUAL, driverId);
		PreparedQuery pq = datastore.prepare(q);
		return pq.asList(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));
	}
	
	/**
	 * vehicleId로 checkin data를 조회 
	 * 
	 * @param companyKey
	 * @param vehicleId
	 * @param fromDate
	 * @param toDate
	 * @return
	 */
	public static List<Entity> findCheckinsByVehicle(Key companyKey, String vehicleId, Date fromDate, Date toDate) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("CheckinData");
		q.setAncestor(companyKey);
		q.addFilter("engine_end_time", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate);
		q.addFilter("engine_end_time", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate);
		q.addFilter("vehicle_id", Query.FilterOperator.EQUAL, vehicleId);
		PreparedQuery pq = datastore.prepare(q);
		return pq.asList(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));
	}	
	
	/**
	 * companyKey, entityName, filters로 총 개수를 리턴
	 * 
	 * @param companyKey
	 * @param entityName
	 * @param filters
	 * @return
	 */
	public static int totalCount(Key companyKey, String entityName, Map<String, Object> filters) {
		
		Query q = createDefaultQuery(companyKey, entityName);
		adjustFilters(q, filters);
		return getTotalCount(q);
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
	
	private static List<Entity> findMultiEntityByList(Query q) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		return pq.asList(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));
	}	
	
	private static int getTotalCount(Query q) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		return pq.countEntities(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));
	}
}
