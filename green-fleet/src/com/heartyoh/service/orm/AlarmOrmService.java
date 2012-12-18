/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.Alarm;
import com.heartyoh.model.AlarmVehicleRelation;
import com.heartyoh.model.IEntity;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * Alarm 관리 서비스
 * 
 * @author jhnam
 */
@Controller
public class AlarmOrmService extends OrmEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(AlarmOrmService.class);
	/**
	 * prospective search
	 */
	//private static ProspectiveSearchService prospectiveSearch = ProspectiveSearchServiceFactory.getProspectiveSearchService();	
	/**
	 * key fields
	 */
	private static final String[] KEY_FILEDS = new String[] { "company", "name" };
	
	@Override
	public Class<?> getEntityClass() {
		return Alarm.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FILEDS;
	}

	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		Query query = super.getRetrieveQuery(request);
		query.addOrder("updated_at", false);
		return query;
	}

	@RequestMapping(value = "/alarm/import", method = RequestMethod.POST)
	public @ResponseBody 
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/alarm/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/alarm", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.retrieveByPaging(request, response);
	}
	
	@RequestMapping(value = "/alarm/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/alarm/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String company = this.getCompany(request);
		String name = request.getParameter("name");
		
		try {
			Map<String, Object> item = super.find(request, response);
			item.put("success", true);
			item.put("vehicles", this.findVehicleRelation(company, name));
			return item;
			
		} catch(Exception e) {
			return DataUtils.newMap(new String[] { "result", "msg" }, new Object[] { false, "Failed to find -" + e.getMessage() }); 
		}
 	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		
		Alarm alarm = (Alarm)entity;
		alarm.setType(request.getParameter("type"));
		alarm.setEvtType(request.getParameter("evt_type"));
		alarm.setEvtName(request.getParameter("evt_name"));
		alarm.setEvtTrg(request.getParameter("evt_trg"));
		alarm.setAlways(DataUtils.toBool(request.getParameter("always")));
		alarm.setEnabled(DataUtils.toBool(request.getParameter("enabled")));
		alarm.setFromDate(DataUtils.toDate(request.getParameter("from_date")));
		alarm.setToDate(DataUtils.toDate(request.getParameter("to_date")));
		alarm.setDest(request.getParameter("dest"));
		alarm.setMsg(request.getParameter("msg"));
		
		alarm.beforeUpdate();
		return alarm;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new Alarm(this.getCompany(request), request.getParameter("name"));
		}
		
		entity.beforeCreate();
		return entity;
	}
	
	@Override
	public IEntity delete(HttpServletRequest request) throws Exception {
		
		// 1. alarm 삭제 
		Alarm alarm = (Alarm)super.delete(request);
		
		// 2. alarm & vehicles relation 삭제 
		this.deleteVehicleRelation(alarm);
		
		return alarm;
	}
	
	@Override
	public IEntity save(HttpServletRequest request) throws Exception {
		
		// 1. save alarm
		Alarm alarm = (Alarm)super.save(request);
		
		// 2. save alarm & vehicles relation
		String[] vehicles = DataUtils.isEmpty(request.getParameter("vehicles")) ? null : request.getParameter("vehicles").split(",");
		this.saveVehicleRelation(alarm, vehicles);
		
		return alarm;
	}
	
	/**
	 * alarm id로 alarm과 관계된 vehicles를 찾아 리턴  
	 * 
	 * @param company
	 * @param alarmName
	 * @return
	 * @throws
	 */
	private String findVehicleRelation(String company, String alarmName) throws Exception {
		
		Map<String, Object> paramMap = new HashMap<String, Object>();
		paramMap.put("company", company);
		paramMap.put("name", alarmName);
		String query = "select vehicle_id from alarm_vehicle_relation where company = :company and alarm_name = :name";
		
		@SuppressWarnings("rawtypes")
		List<Map> vehicleRelList = this.dml.selectListBySql(query, paramMap, Map.class, 0, 0);
		boolean isFirst = true;
		StringBuffer vehicleIds = new StringBuffer();
		
		for(@SuppressWarnings("rawtypes") Map vehicleRel : vehicleRelList) {
			if(isFirst) {
				isFirst = false;
			} else {
				vehicleIds.append(",");
			}
			
			vehicleIds.append(vehicleRel.get("vehicle_id"));
		}
		
		return vehicleIds.toString();
	}	
	
	/**
	 * alarm vehicle relation 저장 
	 * 
	 * @param alarm
	 * @param vehicles
	 * @throws Exception
	 */
	private void saveVehicleRelation(Alarm alarm, String[] vehicles) throws Exception {
		
		// 1. alarm & vehicle relation 삭제  
		this.deleteVehicleRelation(alarm);
		
		if(DataUtils.isEmpty(vehicles))
			return;

		// 2. alarm vehicle relation 생성
		this.createVehicleRelation(alarm, vehicles);
	}
	
	/**
	 * alarm & vehicle relation 삭제 
	 * 
	 * @param alarm
	 * @throws Exception
	 */
	private void deleteVehicleRelation(Alarm alarm) throws Exception {
		this.dml.deleteList(AlarmVehicleRelation.class, new AlarmVehicleRelation(alarm.getCompany(), alarm.getName(), null));
	}
	
	/**
	 * alarm & vehicle relation 생성 
	 * 
	 * @param alarm
	 * @param vehicles
	 * @throws Exception
	 */
	private void createVehicleRelation(Alarm alarm, String[] vehicles) throws Exception {
		
		List<AlarmVehicleRelation> list = new ArrayList<AlarmVehicleRelation>();
		for(int i = 0 ; i < vehicles.length ; i++) {
			AlarmVehicleRelation rel = new AlarmVehicleRelation(alarm.getCompany(), alarm.getName(), vehicles[i]);
			list.add(rel);
		}
		
		if(!list.isEmpty())
			this.dml.insertBatch(list);
	}
	
	@RequestMapping(value = "/alarm/send/lba", method = RequestMethod.POST)
	public void sendLba(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = request.getParameter("company");
		String vehicle = request.getParameter("vehicle");
		String alarm = request.getParameter("alarm");
		String location = request.getParameter("location");
		String eventType = request.getParameter("event_type");
		String lat = request.getParameter("lat");
		String lng = request.getParameter("lng");
		String dateTime = request.getParameter("datetime");	
		Entity alarmHist = this.createAlarmHistory(company, vehicle, alarm, location, eventType, lat, lng, dateTime);		
		this.lbaAlarm(alarmHist);
		DatastoreServiceFactory.getDatastoreService().put(alarmHist);
		//prospectiveSearch.match(alarmHist, "AlarmHistory", "", "/prospective/lba_alarm", "AlarmQueue", ProspectiveSearchService.DEFAULT_RESULT_BATCH_SIZE, true);
	}
	
	/**
	 * 알람을 보냄
	 * 
	 * @param alarmHist
	 * @throws
	 */
	private void lbaAlarm(Entity alarmHist) throws Exception {
		
		Alarm alarm = DatasourceUtils.findAlarm(alarmHist.getParent().getName(), (String)alarmHist.getProperty("alarm"));
		if(alarm == null || DataUtils.isEmpty(alarm.getDest()))
			return;
		
		String[] receivers = alarm.getDest().split(",");
		String type = alarm.getType();
		String eventName = (String)alarmHist.getProperty("evt");
		String content = this.convertMessage(alarm.getMsg(), alarmHist);
		
		if(GreenFleetConstant.ALARM_MAIL.equalsIgnoreCase(type)) {
			StringBuffer subject = new StringBuffer();
			subject.append("Location Based Alarm [").append(alarm.getName()).append("] : Vehicle [").append(alarmHist.getProperty("vehicle"));
			subject.append(eventName.equals(GreenFleetConstant.LBA_EVENT_IN) ? "] comes in to Location [" : "] comes out from Location [");
			subject.append(alarm.getEvtName()).append("]!\n");
			AlarmUtils.sendMail(null, null, null, receivers, subject.toString(), false, content);
						
		} else if(GreenFleetConstant.ALARM_XMPP.equalsIgnoreCase(type)) {
			AlarmUtils.sendXmppMessage(receivers, content);
		}
		
		alarmHist.setUnindexedProperty("type", type);
		alarmHist.setProperty("send", "Y");		
	}	
	
	/**
	 * message를 치환 
	 * 
	 * @param message
	 * @param alarmHistory
	 * @return
	 */
	private String convertMessage(String message, Entity alarmHistory) {		
		String vehicle = (String)alarmHistory.getProperty("vehicle");
		String alarmName = (String)alarmHistory.getProperty("alarm");
		String location = (String)alarmHistory.getProperty("loc");
		String event = (String)alarmHistory.getProperty("evt");
		return message.replaceAll("\\{vehicle\\}", vehicle).replaceAll("\\{alarm\\}", alarmName).replaceAll("\\{location\\}", location).replaceAll("\\{event\\}", event.toUpperCase());
	}
	
	/**
	 * alarmHistory를 생성하여 리턴 
	 * 
	 * @param company
	 * @param vehicle
	 * @param alarmName
	 * @param locName
	 * @param eventName
	 * @param lat
	 * @param lng
	 * @param datetime
	 * @return
	 */
	private Entity createAlarmHistory(String company, String vehicle, String alarmName, String locName, String eventName, String lat, String lng, String datetimeStr) {
		
		String idValue = vehicle + "@" + alarmName + "@" + datetimeStr;
		Key companyKey = KeyFactory.createKey("Company", company);
		Key alarmHistKey = KeyFactory.createKey(companyKey, "AlarmHistory", idValue);
		Entity alarmHistory = new Entity(alarmHistKey);
		alarmHistory.setProperty("vehicle", vehicle);
		alarmHistory.setProperty("alarm", alarmName);
		alarmHistory.setProperty("loc", locName);
		try {
			alarmHistory.setProperty("datetime", DataUtils.toDate(datetimeStr, GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT));
		} catch(Exception e) {
			alarmHistory.setProperty("datetime", datetimeStr);
		}
		alarmHistory.setUnindexedProperty("evt", eventName);
		alarmHistory.setUnindexedProperty("lat", lat);
		alarmHistory.setUnindexedProperty("lng", lng);
		alarmHistory.setProperty("send", "N");
		return alarmHistory;
	}	
	
	@RequestMapping(value = "/alarm/send/mail", method = RequestMethod.POST)
	public void sendMail(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String[] receivers = request.getParameterValues("receivers");
		String message = request.getParameter("message");
		String subject = DataUtils.isEmpty(request.getParameter("subject")) ? "GreenFleet Email Alarm!" : request.getParameter("subject");
		String contentType = DataUtils.isEmpty(request.getParameter("contentType")) ? "text" : request.getParameter("contentType");
		boolean htmlType = "html".equalsIgnoreCase(contentType);
		
		try {
			AlarmUtils.sendMail(null, null, null, receivers, subject, htmlType, message);
		} catch (Exception e) {
			logger.error("Failed to send mail!", e);
		}
	}
	
	@RequestMapping(value = "/alarm/send/xmpp", method = RequestMethod.POST)
	public void sendXmpp(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String[] receivers = request.getParameterValues("receivers");
		String message = request.getParameter("message");
		
		try {
			AlarmUtils.sendXmppMessage(receivers, message);
		} catch (Exception e) {
			logger.error("Failed to send xmpp!", e);
		}
	}
	
	@RequestMapping(value = "/alarm/send/push", method = RequestMethod.POST)
	public void sendPush(HttpServletRequest request, HttpServletResponse response) throws Exception {
		// TODO
	}
	
	@Override
	protected boolean useFilter() {
		return true;
	}
	
}
