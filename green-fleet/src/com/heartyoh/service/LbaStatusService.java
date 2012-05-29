/**
 * 
 */
package com.heartyoh.service;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
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
import com.google.appengine.api.datastore.Transaction;
import com.google.appengine.api.prospectivesearch.ProspectiveSearchService;
import com.google.appengine.api.prospectivesearch.ProspectiveSearchServiceFactory;
import com.heartyoh.model.Alarm;
import com.heartyoh.model.Location;
import com.heartyoh.util.CalculatorUtils;
import com.heartyoh.util.ConnectionManager;
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
		return map.get("vehicle") + "@" + map.get("alarm");
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
	 * 하루에 한번 모든 LbaStatus 엔티티의 use 데이터를 업데이트
	 * Alarm 정보에 유효 기간이 있는데 이 유효기간을 지났는지 안 지났는지 정보가 LbaStatus에 use 필드이다.  
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value = "/lba_status/update_use", method = RequestMethod.GET)	
	public void updateUse(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		if(logger.isInfoEnabled())
			logger.info("LbaStatus update_use started!");
		
		// 0. company key 추출 
		Key companyKey = this.getCompanyKey(request);	
		
		// 1. 모든 alarm을 조회 
		List<Alarm> alarmList = this.findAlarms(companyKey);
		
		// 2. 유효기간 체크 
		List<Entity> lbaStatusList = this.checkAvailablePeriod(companyKey, alarmList);
		
		// 3. 업데이트된 LbaStatus를 저장..., FIXME 변경 필요 - 각 alarm 마다 저장 및 커밋하도록 변경 ...
		if(!lbaStatusList.isEmpty()) {
			DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
			Transaction txn = ds.beginTransaction();
			
			try {
				ds.put(lbaStatusList);
				txn.commit();

				if(logger.isInfoEnabled())
					logger.info("LbaStatus update_use finished!");
			
			} catch(Exception e) {
				txn.rollback();
			}
		}
	}
	
	/**
	 * 유효기간 체크 
	 * 
	 * @param companyKey
	 * @param alarmList
	 * @return
	 * @throws Exception
	 */
	private List<Entity> checkAvailablePeriod(Key companyKey, List<Alarm> alarmList) throws Exception {
		
		List<Entity> lbaStatusList = new ArrayList<Entity>();
		
		// 2. 각 alarm에 대해서 유효기간 체크 
		for(Alarm alarm : alarmList) {
			
			if(alarm.isAlways())
				continue; 
			
			// Alarm 기준정보로 부터 오늘 날짜로 use 데이터 체크 
			Date fromDate = alarm.getFromDate();
			Date toDate = alarm.getToDate();
			
			if(fromDate == null && toDate == null)
				continue;
			
			// Alarm의 from_date, to_date로 오늘이 유효기간인지 체크 
			boolean use = DataUtils.between(DataUtils.getToday(), fromDate, toDate);
			
			// LbaStatus에 alarm, use 데이터를 찾아 use 데이터를 업데이트 
			Iterator<Entity> lbaStatuses = DatastoreUtils.findEntities(companyKey, this.getEntityName(), 
					DataUtils.newMap(new String[] { "alarm", "use" }, new Object[] { alarm.getName(), !use }));
			
			while(lbaStatuses.hasNext()) {
				Entity lbaStatus = lbaStatuses.next();
				lbaStatus.setProperty("use", use);
				lbaStatusList.add(lbaStatus);
			}
		}
		
		return lbaStatusList;
	}
	
	/**
	 * company정보로 모든 alarm을 조회 
	 * 
	 * @param companyKey
	 * @return
	 * @throws Exception
	 */
	private List<Alarm> findAlarms(Key companyKey) throws Exception {
		
		List<Alarm> alarmList = new ArrayList<Alarm>();
		Connection conn = null;
		Statement stmt = null;
		ResultSet rs = null;		
		
		try {
			conn = ConnectionManager.getInstance().getConnection();
			stmt = conn.createStatement();
			rs = stmt.executeQuery("select * from alarm where company = '" + companyKey.getName() + "'");
			while(rs.next()) {
				Alarm alarm = new Alarm(companyKey.getName(), rs.getString("name"));
				alarm.setAlways(rs.getBoolean("always"));
				java.sql.Date fromDate = rs.getDate("from_date");
				java.sql.Date toDate = rs.getDate("to_date");
				
				if(fromDate != null)
					alarm.setFromDate(new Date(fromDate.getTime()));
				
				if(toDate != null)
					alarm.setToDate(new Date(toDate.getTime()));				
				
				alarmList.add(alarm);
			}
			
		} catch (Exception e) {
			logger.error("Failed to find alarms!", e);
			throw e;
			
		} finally {
			this.closeConnection(rs, stmt, conn);
		}
				
		return alarmList;
	}
	
	/* orm의 경우 
	private List<Alarm> findAlarms(Key companyKey) throws Exception {
		Alarm alarm = new Alarm(companyKey.getName(), null);
		List<Alarm> alarmList = ConnectionManager.getInstance().getDml().selectList(Alarm.class, alarm);
		return alarmList;
	}*/	
	
	/**
	 * company, locationName으로 location 조회 
	 * 
	 * @param company
	 * @param locationName
	 * @return
	 * @throws Exception
	 */	
	private Location findLocation(String company, String locationName) throws Exception {
		
		Connection conn = null;
		Statement stmt = null;
		ResultSet rs = null;		
		Location location = null;
		
		try {
			conn = ConnectionManager.getInstance().getConnection();
			stmt = conn.createStatement();
			rs = stmt.executeQuery("select * from location where company = '" + company + "' and name = '" + locationName + "'");
			if(rs.next()) {
				location = new Location(company, locationName);
				location.setLatHi(rs.getFloat("lat_hi"));
				location.setLatLo(rs.getFloat("lat_lo"));
				location.setLngHi(rs.getFloat("lng_hi"));
				location.setLngLo(rs.getFloat("lng_lo"));
			}
			
		} catch (Exception e) {
			logger.error("Failed to find alarms!", e);
			throw e;
			
		} finally {
			this.closeConnection(rs, stmt, conn);
		}
		
		return location;
	}
	
	/**
	 * orm 경우 : company, locationName으로 location 조회 
	 * 
	 * @param company
	 * @param locationName
	 * @return
	 * @throws Exception
	 */
	/*private Location findLocation(String company, String locationName) throws Exception {
		Location location = new Location(company, locationName);
		location = ConnectionManager.getInstance().getDml().select(location);
		return location;
	}*/	
	
	/**
	 * connection close
	 * 
	 * @param rs
	 * @param stmt
	 * @param conn
	 */
	private void closeConnection(ResultSet rs, Statement stmt, Connection conn) {
		if(rs != null)
			try {
				rs.close();
			} catch (SQLException e) {
			}
		
		if(stmt != null)
			try {
				stmt.close();
			} catch (SQLException e) {
			}
		
		if(conn != null)
			try {
				conn.close();
			} catch (SQLException e) {
			}
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
		
		Key companyKey = this.getCompanyKey(request);
		String vehicle = request.getParameter("vehicle");
		float latitude = DataUtils.toFloat(request.getParameter("lat"));
		float longitude = DataUtils.toFloat(request.getParameter("lng"));
		Date now = new Date();
		
		// Vehicle로 현재 활성화 상태인 LbaStatus를 찾아서 각각의 현재 상태와 이전 상태를 업데이트 해준다. 
		List<Entity> lbaStatuses = DatastoreUtils.findEntityList(
				companyKey, "LbaStatus", DataUtils.newMap(new String[] { "vehicle", "use" }, new Object[] { vehicle, true } ));
		
		// lbaStatus 정보를 업데이트하고 이벤트가 발생했다면 alarm을 보내기 위해 Prospective Search를 match 시킨다.
		if(lbaStatuses.isEmpty())
			return;
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();
		
		for(Entity lbaStatus : lbaStatuses) {
			lbaStatus.setProperty("updated_at", now);
			String event = this.checkEvent(companyKey, lbaStatus, latitude, longitude);
			
			if(event != null) {
				Entity alarmHist = this.createAlarmHistory(lbaStatus, event, latitude, longitude);
				prospectiveSearch.match(alarmHist, "AlarmHistory", "", "/prospective/lba_alarm", "AlarmQueue", ProspectiveSearchService.DEFAULT_RESULT_BATCH_SIZE, true);
				ds.put(alarmHist);
			}
		}
		
		ds.put(lbaStatuses);
	}
	
	/**
	 * LbaStatus 정보로 알람을 보내야 하는지를 체크하고 어떤 이벤트인지 (IN/OUT) 혹은 변화가 없는지(NULL)를 리턴한다.
	 * 
	 * @param companyKey
	 * @param lbaStatus
	 * @param latitude
	 * @param longitude
	 * @return event
	 * @throws
	 */
	private String checkEvent(Key companyKey, Entity lbaStatus, float latitude, float longitude) throws Exception {
		
		Location location = this.findLocation(companyKey.getName(), (String)lbaStatus.getProperty("loc"));
		
		if(location == null)
			return null;
		
		String evtTrg = (String)lbaStatus.getProperty("evt_trg");
		String beforeStatus = (String)lbaStatus.getProperty("cur_status");
		String currentStatus = CalculatorUtils.contains(location, latitude, longitude) ? GreenFleetConstant.LBA_EVENT_IN : GreenFleetConstant.LBA_EVENT_OUT;
		lbaStatus.setProperty("cur_status", currentStatus);
		lbaStatus.setProperty("bef_status", beforeStatus);
		return this.getEvent(evtTrg, beforeStatus, currentStatus);
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
	
	/**
	 * alarmHistory를 생성하여 리턴 
	 * 
	 * @param lbaStatus
	 * @param eventName
	 * @param latitude
	 * @param longitude
	 * @return
	 */
	private Entity createAlarmHistory(Entity lbaStatus, String eventName, float latitude, float longitude) {
		
		String vehicle = (String)lbaStatus.getProperty("vehicle");
		String alarmName = (String)lbaStatus.getProperty("alarm");
		String datetimeStr = DataUtils.dateToString((Date)lbaStatus.getProperty("updated_at"), "yyyy-MM-dd HH:mm:ss");
		String idValue = vehicle + "@" + alarmName + "@" + datetimeStr; 
		Key alarmHistKey = KeyFactory.createKey(lbaStatus.getParent(), "AlarmHistory", idValue);
		Entity alarmHistory = new Entity(alarmHistKey);
		alarmHistory.setProperty("vehicle", vehicle);
		alarmHistory.setProperty("alarm", alarmName);
		alarmHistory.setProperty("loc", lbaStatus.getProperty("loc"));
		alarmHistory.setProperty("datetime", datetimeStr);
		alarmHistory.setUnindexedProperty("evt", eventName);
		alarmHistory.setUnindexedProperty("lat", latitude);
		alarmHistory.setUnindexedProperty("lng", longitude);
		alarmHistory.setProperty("send", "N");
		return alarmHistory;
	}
}
