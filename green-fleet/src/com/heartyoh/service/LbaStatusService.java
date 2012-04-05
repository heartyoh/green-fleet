/**
 * 
 */
package com.heartyoh.service;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;

/**
 * LBA (Location Based Alarm) 상태 관리 서비스 
 * 
 * @author jhnam
 */
@Controller
public class LbaStatusService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(LbaStatusService.class);
	
	@Override
	protected String getEntityName() {
		return "LbaStatus";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String)map.get("vehicle") + "@" + (String)map.get("alarm");
	}
	
	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		// 차량 아이디 
		entity.setProperty("vehicle", map.get("vehicle"));
		// Alarm 아이디 
		entity.setProperty("alarm", map.get("alarm"));

		super.onCreate(entity, map, datastore);		
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		// Location 명 
		entity.setProperty("loc", map.get("loc"));		
		// 이벤트 트리거 
		entity.setProperty("evt_trg", map.get("evt_trg"));
		// 이전 상태 
		entity.setProperty("bef_status", map.get("bef_status"));
		// 현재 상태
		entity.setProperty("cur_status", map.get("cur_status"));
		
		super.onSave(entity, map, datastore);
	}	

	@RequestMapping(value = "/lba_status/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/lba_status/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/lba_status/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/lba_status", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {		
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/lba_status/execute_task", method = RequestMethod.POST)
	public void executeTask(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = request.getParameter("company");
		Key companyKey = KeyFactory.createKey("Company", company);
		String vehicle = request.getParameter("vehicle");
		float lattitude = DataUtils.toFloat(request.getParameter("lat"));
		float longitude = DataUtils.toFloat(request.getParameter("lng"));
		
		// VehicleId로 LbaStatus를 찾아서 각각의 현재 상태와 이전 상태를 업데이트 해준다. 
		List<Entity> lbaStatuses = DatastoreUtils.findEntityList(companyKey, "LbaStatus", DataUtils.newMap("vehicle", vehicle));
		for(Entity lbaStatus : lbaStatuses) {
			// TODO location 조회부분은 cache로 처리...
			Entity location = DatastoreUtils.findEntity(companyKey, "Location", DataUtils.newMap("name", lbaStatus.getProperty("loc")));
			
			if(location == null)
				continue;
			
			String beforeStatus = (String)lbaStatus.getProperty("cur_status");
			lbaStatus.setProperty("cur_status", this.inOrOut(location, lattitude, longitude));
			lbaStatus.setProperty("bef_status", beforeStatus);
			this.checkAlarm(lbaStatus);
		}
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		ds.put(lbaStatuses);
	}
	
	/**
	 * lattitude, longitude 위치가 location 내부(IN)인지 외부(OUT)인지를 판단하여 리턴 
	 * 
	 * @param location
	 * @param lattitude
	 * @param longitude
	 * @return
	 * @throws Exception
	 */
	private String inOrOut(Entity location, float lattitude, float longitude) throws Exception {		
		float minLat = DataUtils.toFloat(location.getProperty("lat_lo"));
		float minLng = DataUtils.toFloat(location.getProperty("lng_lo"));
		float maxLat = DataUtils.toFloat(location.getProperty("lat_hi"));
		float maxLng = DataUtils.toFloat(location.getProperty("lng_hi"));		
		return (lattitude <= maxLat && lattitude >= minLat && longitude <= maxLng && longitude >= minLng) ? "in" : "out";
	}
	
	/**
	 * LbaStatus 정보로 알람을 보내야 하는지를 체크하여 조건에 맞으면 알람을 보냄 ...
	 * 
	 * @param lbaStatus
	 */
	private void checkAlarm(Entity lbaStatus) {
		
		String evtTrg = (String)lbaStatus.getProperty("evt_trg");
		String beforeStatus = DataUtils.toNotNull(lbaStatus.getProperty("bef_status"));
		String currentStatus = DataUtils.toNotNull(lbaStatus.getProperty("cur_status"));
		
		if("in".equalsIgnoreCase(evtTrg)) {
			if("out".equalsIgnoreCase(beforeStatus) && "in".equalsIgnoreCase(currentStatus)) {
				this.alarm(lbaStatus);
			}
		} else if("out".equalsIgnoreCase(evtTrg)) {
			if("in".equalsIgnoreCase(beforeStatus) && "out".equalsIgnoreCase(currentStatus)) {
				this.alarm(lbaStatus);
			}
		} else if("in-out".equalsIgnoreCase(evtTrg)) {
			if(beforeStatus.equalsIgnoreCase(currentStatus)) {
				this.alarm(lbaStatus);
			}
		}
	}
	
	private void alarm(Entity lbaStatus) {
		Entity alarm = DatastoreUtils.findEntity(lbaStatus.getParent(), "Alarm", DataUtils.newMap("name", lbaStatus.getProperty("alarm")));
		
		if(alarm == null)
			return;
		
		String[] receivers = DataUtils.toNotNull(alarm.getProperty("dest")).split(",");
		String message = DataUtils.toNotNull(alarm.getProperty("msg"));
		
		for(int i = 0 ; i < receivers.length ; i++) {
			// 일단 xmpp로만 alarm
			try {
				AlarmUtils.sendXmppMessage(receivers[i], message);
			} catch (Exception e) {
				logger.error("Failed to alarm!", e);
			}
		}
	}
}
