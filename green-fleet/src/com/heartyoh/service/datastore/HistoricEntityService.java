/**
 * 
 */
package com.heartyoh.service.datastore;

import java.util.Date;
import java.util.Map;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Transaction;
import com.heartyoh.util.DataUtils;

/**
 * 이력 저장을 위한 컨트롤러 클래스 
 * 
 * @author jhnam
 */
public abstract class HistoricEntityService extends EntityService {

	/**
	 * History Entity 명을 리턴.
	 * 
	 * @return
	 */
	protected String getHistoryEntityName() {
		return this.getEntityName() + "History";
	}
	
	/**
	 * mainEntity로 부터 History Entity의 키 값을 설정  
	 * 
	 * @param mainEntity
	 * @return
	 */
	protected abstract String getHistoryIdValue(Entity mainEntity);
	
	@Override
	protected void saveEntity(Entity obj, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		// 이력 처리 && Transaction 처리 ...
		Transaction txn = datastore.beginTransaction();
		
		try {
			super.saveEntity(obj, map, datastore);
			this.saveHistoryEntity(obj, map, datastore);
			txn.commit();
			
		} catch (Exception e) {
			txn.rollback();
			throw e;
		}
	}
	
	/**
	 * mainEntity로 부터 historyEntity를 생성하여 추가
	 * 
	 * @param mainEntity
	 * @param map
	 * @param datastore
	 * @throws Exception
	 */
	protected void saveHistoryEntity(Entity mainEntity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		// 1. mainEntity로 부터 historyEntity를 복사 후 생성
		Key histKey = KeyFactory.createKey(mainEntity.getParent(), getHistoryEntityName(), getHistoryIdValue(mainEntity));
		Entity histEntity = new Entity(histKey);
		histEntity.setPropertiesFrom(mainEntity);
		Date now = new Date();
		
		if(!DataUtils.isEmpty(histEntity.getProperty("created_at"))) {			
			histEntity.setProperty("created_at", now);
		}
		
		if(!DataUtils.isEmpty(histEntity.getProperty("updated_at"))) {
			histEntity.setProperty("updated_at", now);
		}
		
		datastore.put(histEntity);
	}
}
