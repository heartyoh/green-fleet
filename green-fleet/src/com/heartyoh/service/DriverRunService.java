/**
 * 
 */
package com.heartyoh.service;

import java.util.Map;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;

/**
 * 운전자별 운행 정보 서비스
 * 
 * @author jhnam
 */
public class DriverRunService extends EntityService {

	@Override
	protected String getEntityName() {
		return "DriverRunSum";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		// 운전자, 년, 월 
		return (String)map.get("driver") + "@" + map.get("month");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("driver", map.get("driver"));
		entity.setProperty("month", map.get("month"));

		super.onCreate(entity, map, datastore);		
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		// TODO
		
		super.onSave(entity, map, datastore);
	}
}
