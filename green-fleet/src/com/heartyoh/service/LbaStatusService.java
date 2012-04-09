/**
 * 
 */
package com.heartyoh.service;

import java.util.Date;
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
import com.google.appengine.api.prospectivesearch.ProspectiveSearchService;
import com.google.appengine.api.prospectivesearch.ProspectiveSearchServiceFactory;
import com.heartyoh.util.CalculatorUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * LBA (Location Based Alarm) 상태 관리 서비스 
 * 
 * @author jhnam
 */
@Controller
public class LbaStatusService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(LbaStatusService.class);
	/**
	 * prospective search
	 */
	private static ProspectiveSearchService prospectiveSearch = ProspectiveSearchServiceFactory.getProspectiveSearchService();
	
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
		// alarm 아이디 
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
		// alarm의 유효 기간이 유효한 지에 따라서 true, false : 이 부분에 대한 업데이트는 cron job으로 하루 한 번 업데이트 한다.
		entity.setProperty("use", DataUtils.toBool(map.get("use")));
		// 발생한 위치 기반 알람 이벤트 - in/out/in-out
		entity.setProperty("evt", map.get("evt"));
		
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
	
	/**
	 * LBAQueue에 들어온 데이터를 처리한다. 
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value = "/lba_status/execute_task", method = RequestMethod.POST)
	public void executeTask(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = request.getParameter("company");
		Key companyKey = KeyFactory.createKey("Company", company);
		String vehicle = request.getParameter("vehicle");
		float lattitude = DataUtils.toFloat(request.getParameter("lat"));
		float longitude = DataUtils.toFloat(request.getParameter("lng"));
		Date now = new Date();
		
		// VehicleId로 현재 활성화 상태인 LbaStatus를 찾아서 각각의 현재 상태와 이전 상태를 업데이트 해준다. 
		List<Entity> lbaStatuses = DatastoreUtils.findEntityList(companyKey, "LbaStatus", DataUtils.newMap(new String[] { "vehicle", "use" }, new Object[] { vehicle, true } ));
		for(Entity lbaStatus : lbaStatuses) {
			Entity location = DatastoreUtils.findEntity(companyKey, "Location", DataUtils.newMap("name", lbaStatus.getProperty("loc")));
			
			if(location == null)
				continue;
			
			String beforeStatus = (String)lbaStatus.getProperty("cur_status");
			lbaStatus.setProperty("cur_status", CalculatorUtils.contains(location, lattitude, longitude) ? GreenFleetConstant.LBA_EVENT_IN : GreenFleetConstant.LBA_EVENT_OUT);
			lbaStatus.setProperty("bef_status", beforeStatus);
			lbaStatus.setProperty("updated_at", now);
			this.checkEvent(lbaStatus, lattitude, longitude);
		}
		
		if(!lbaStatuses.isEmpty()) {
			DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
			ds.put(lbaStatuses);
		}
	}
	
	/**
	 * LbaStatus 정보로 알람을 보내야 하는지를 체크하여 조건에 맞으면 알람을 보냄 ...
	 * 
	 * @param lbaStatus
	 * @param lattitude
	 * @param longitude
	 */
	private void checkEvent(Entity lbaStatus, float lattitude, float longitude) {
		
		String evtTrg = (String)lbaStatus.getProperty("evt_trg");
		String beforeStatus = DataUtils.toNotNull(lbaStatus.getProperty("bef_status"));
		String currentStatus = DataUtils.toNotNull(lbaStatus.getProperty("cur_status"));
		String eventName = this.getEvent(evtTrg, beforeStatus, currentStatus);
		
		if(eventName != null) {
			lbaStatus.setProperty("evt", eventName);
			prospectiveSearch.match(lbaStatus, "LbaStatus");
		}
	}
	
	/**
	 * evtTrg, beforeStatus, currentStatus
	 * 
	 * @param evtTrg
	 * @param beforeStatus
	 * @param currentStatus
	 * @return
	 */
	private String getEvent(String evtTrg, String beforeStatus, String currentStatus) {
		
		if(GreenFleetConstant.LBA_EVENT_IN.equalsIgnoreCase(evtTrg)) {
			if(GreenFleetConstant.LBA_EVENT_OUT.equalsIgnoreCase(beforeStatus) && GreenFleetConstant.LBA_EVENT_IN.equalsIgnoreCase(currentStatus)) {
				return GreenFleetConstant.LBA_EVENT_IN;
			}
		} else if(GreenFleetConstant.LBA_EVENT_OUT.equalsIgnoreCase(evtTrg)) {
			if(GreenFleetConstant.LBA_EVENT_IN.equalsIgnoreCase(beforeStatus) && GreenFleetConstant.LBA_EVENT_OUT.equalsIgnoreCase(currentStatus)) {
				return GreenFleetConstant.LBA_EVENT_OUT;
			}
		} else if(GreenFleetConstant.LBA_EVENT_INOUT.equalsIgnoreCase(evtTrg)) {
			if(GreenFleetConstant.LBA_EVENT_OUT.equalsIgnoreCase(beforeStatus) && GreenFleetConstant.LBA_EVENT_IN.equalsIgnoreCase(currentStatus)) {
				return GreenFleetConstant.LBA_EVENT_IN;
			} else if(GreenFleetConstant.LBA_EVENT_IN.equalsIgnoreCase(beforeStatus) && GreenFleetConstant.LBA_EVENT_OUT.equalsIgnoreCase(currentStatus)) {
				return GreenFleetConstant.LBA_EVENT_OUT;
			}
		}
		
		return null;
	}	

}
