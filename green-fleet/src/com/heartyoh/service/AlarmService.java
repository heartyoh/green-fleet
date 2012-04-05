/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Transaction;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 알람 컨트롤러
 * 
 * @author jhnam
 */
@Controller
public class AlarmService extends EntityService {

	@Override
	protected String getEntityName() {
		return "Alarm";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String)map.get("name");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		// 알람명
		entity.setProperty("name", map.get("name"));

		super.onCreate(entity, map, datastore);		
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {

		this.checkDate(map);
		
		// 모니터 대상 차량 
		entity.setProperty("vehicles", map.get("vehicles"));
		// 이벤트 종류 
		entity.setProperty("evt_type", map.get("evt_type"));
		// 위치 
		entity.setProperty("loc", map.get("loc"));
		// 이벤트 트리거 
		entity.setProperty("evt_trg", map.get("evt_trg"));
		// 알림 대상
		entity.setProperty("dest", map.get("dest"));
		// 알림 방식 
		entity.setProperty("type", map.get("type"));
		// 알림 기간 always
		entity.setProperty("always", DataUtils.toBool(map.get("always")));		
		// 알림 기간 from
		entity.setProperty("from_date", map.get("from_date"));
		// 알림 기간 to
		entity.setProperty("to_date", map.get("to_date"));
		// 알림 메세지 
		entity.setProperty("msg", map.get("msg"));
		
		super.onSave(entity, map, datastore);
	}
	
	private void checkDate(Map<String, Object> map) {
		Object fromDateObj = map.get("from_date");
		Object toDateObj = map.get("to_date");
		
		if(!DataUtils.isEmpty(fromDateObj) && fromDateObj instanceof String)
			map.put("from_date", SessionUtils.stringToDate(fromDateObj.toString()));
		
		if(!DataUtils.isEmpty(toDateObj) && toDateObj instanceof String)
			map.put("to_date", SessionUtils.stringToDate(toDateObj.toString()));
	}	
	
	@RequestMapping(value = "/alarm/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/alarm/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/alarm/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/alarm", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {		
		return super.retrieve(request, response);
	}
	
	@Override
	protected void saveEntity(Entity obj, Map<String, Object> map, DatastoreService datastore) throws Exception {
				
		String vehiclesStr = (String)obj.getProperty("vehicles");
		boolean create = DataUtils.isEmpty(obj.getKey()) ? true : false;
		
		if(DataUtils.isEmpty(vehiclesStr)) {
			super.saveEntity(obj, map, datastore);
		
		// Alarm 저장하기 전에 Alarm과 관계된 LbaStatus 정보를 추가 또는 갱신한다.	
		} else {			
			String[] vehicleIdArr = vehiclesStr.split(",");
			
			// Transaction으로 ...
			Transaction txn = datastore.beginTransaction();
			try {
				if(create) {
					// lbaStatus 생성 
					this.createLbaStatuses(datastore, obj, vehicleIdArr);
				} else {
					// lbaStatus 삭제 후 재 생성 
					this.updateLbaStatuses(datastore, obj, vehicleIdArr);
				}
				
				super.saveEntity(obj, map, datastore);
				txn.commit();
				
			} catch (Exception e) {
				txn.rollback();
				throw e;
			}
		}
	}
	
	/**
	 * Alarm과 관련된 LbaStatus 리스트를 생성 
	 * 
	 * @param datastore
	 * @param alarm
	 * @param vehicleIdArr
	 * @throws Exception
	 */
	private void createLbaStatuses(DatastoreService datastore, Entity alarm, String[] vehicleIdArr) throws Exception {
		
		List<Entity> lbaStatusList = new ArrayList<Entity>();
		
		for(int i = 0 ; i < vehicleIdArr.length ; i++)
			lbaStatusList.add(this.createLbaStatus(alarm, vehicleIdArr[i]));
		
		datastore.put(lbaStatusList);
	}
	
	/**
	 * Alarm과 관련된 LbaStatus를 찾아 삭제 
	 * 
	 * @param datastore
	 * @param alarm
	 * @throws Exception
	 */
	private void deleteLbaStatus(DatastoreService datastore, Entity alarm) throws Exception {
		
		List<Entity> lbaStatusList = DatastoreUtils.findEntityList(alarm.getParent(), "LbaStatus", DataUtils.newMap("alarm", alarm.getProperty("alarm")));
		if(DataUtils.isEmpty(lbaStatusList))
			return;
		
		List<Key> keysToDel = new ArrayList<Key>();
		for(Entity lbaStatus : lbaStatusList)
			keysToDel.add(lbaStatus.getKey());
		
		datastore.delete(keysToDel);
	}
	
	/**
	 * Alarm과 관련된 기존 LbaStatus를 찾아 삭제한 후 새로 생성 
	 *  
	 * @param datastore
	 * @param alarm
	 * @param vehicleIdArr
	 * @throws Exception
	 */
	private void updateLbaStatuses(DatastoreService datastore, Entity alarm, String[] vehicleIdArr) throws Exception {
		// 1. Delete
		this.deleteLbaStatus(datastore, alarm);
		// 2. create
		this.createLbaStatuses(datastore, alarm, vehicleIdArr);
	}
	
	/**
	 * LbaStatus Entity를 생성 
	 * 
	 * @param alarm
	 * @param vehicleId
	 * @return
	 */
	private Entity createLbaStatus(Entity alarm, String vehicleId) {
		
		String alarmName = (String)alarm.getProperty("name");
		String idValue = vehicleId + "@" + alarmName;
		Entity lbaStatus = new Entity(KeyFactory.createKey(alarm.getParent(), "LbaStatus", idValue));
		lbaStatus.setProperty("vehicle", vehicleId);
		lbaStatus.setProperty("alarm", alarmName);
		lbaStatus.setProperty("loc", alarm.getProperty("loc"));
		lbaStatus.setProperty("evt_trg", alarm.getProperty("evt_trg"));
		lbaStatus.setProperty("bef_status", "");
		lbaStatus.setProperty("cur_status", "");
		return lbaStatus;
	}
}
