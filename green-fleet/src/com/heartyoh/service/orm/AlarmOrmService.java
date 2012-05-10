/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.dbist.dml.Query;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.Alarm;
import com.heartyoh.model.AlarmVehicleRelation;
import com.heartyoh.model.IEntity;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;

/**
 * Alarm 관리 서비스
 * 
 * @author jhnam
 */
@Controller
public class AlarmOrmService extends OrmEntityService {

	/**
	 * key fields
	 */
	private String[] keyFields = new String[] { "company", "name" };
	
	@Override
	public Class<?> getEntityClass() {
		return Alarm.class;
	}

	@Override
	public String[] getKeyFields() {
		return this.keyFields;
	}

	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		query.addOrder("updated_at", false);
		return query;
	}

	@RequestMapping(value = "/alarm/import", method = RequestMethod.POST)
	public void imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.imports(request, response);
	}
	
	@RequestMapping(value = "/alarm/delete", method = RequestMethod.POST)
	public void delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.delete(request, response);
	}
	
	@RequestMapping(value = "/alarm", method = RequestMethod.GET)
	public void retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.retrieveByPaging(request, response);
	}
	
	@RequestMapping(value = "/alarm/save", method = RequestMethod.POST)
	public void save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.save(request, response);
	}
	
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/alarm/find", method = RequestMethod.GET)
	public void find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String name = request.getParameter("name");
		String query = "select * from alarm where company = :company and name = :name";
		Map<String, Object> paramMap = DataUtils.newMap(new String[] { "company", "name" }, new Object[] { company, name } );
		@SuppressWarnings("rawtypes")
		Map result = this.dml.selectBySql(query, paramMap, Map.class);
		result.put("vehicles", this.findVehicleRelation(company, name));
		result.put("success", true);
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println(new ObjectMapper().writeValueAsString(result));		
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
		
		// 3. lba status 삭제 
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		this.deleteLbaStatus(datastore, alarm);
		return alarm;
	}
	
	@Override
	public IEntity save(HttpServletRequest request) throws Exception {
		
		// 1. save alarm
		Alarm alarm = (Alarm)super.save(request);
		
		// 2. save alarm & vehicles relation
		String[] vehicles = DataUtils.isEmpty(request.getParameter("vehicles")) ? null : request.getParameter("vehicles").split(",");
		this.saveVehicleRelation(alarm, vehicles);
		
		// 3. save lba status 
		this.saveLbaStatus(alarm, vehicles);	
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
	private void createVehicleRelation(Alarm alarm ,String[] vehicles) throws Exception {
		
		List<AlarmVehicleRelation> list = new ArrayList<AlarmVehicleRelation>();
		for(int i = 0 ; i < vehicles.length ; i++) {
			AlarmVehicleRelation rel = new AlarmVehicleRelation(alarm.getCompany(), alarm.getName(), vehicles[i]);
			list.add(rel);
		}
		
		if(!list.isEmpty())
			this.dml.insertBatch(list);
	}
	
	/**
	 * lbaStatus 저장 
	 * 
	 * @param alarm
	 * @param vehicles
	 * @throws Exception
	 */
	private void saveLbaStatus(Alarm alarm, String[] vehicles) throws Exception {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		// Alarm 저장하기 전에 Alarm과 관계된 LbaStatus 정보를 추가 또는 갱신한다. lbaStatus 삭제 후 재 생성 
		this.deleteLbaStatus(datastore, alarm);
		this.createLbaStatus(datastore, alarm, vehicles);
	}
	
	/**
	 * Alarm과 관련된 LbaStatus 리스트를 생성 
	 * 
	 * @param datastore
	 * @param alarm
	 * @param vehicles
	 * @throws Exception
	 */
	private void createLbaStatus(DatastoreService datastore, Alarm alarm, String[] vehicles) throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", alarm.getCompany());
		List<Entity> lbaStatusList = new ArrayList<Entity>();
		Date now = new Date();
		
		for(int i = 0 ; i < vehicles.length ; i++) {
			Entity lbaStatus = this.newLbaStatus(companyKey, alarm, vehicles[i]);
			lbaStatus.setUnindexedProperty("updated_at", now);
			lbaStatusList.add(lbaStatus);			
		}
		
		datastore.put(lbaStatusList);
	}
	
	/**
	 * LbaStatus Entity를 생성 
	 * 
	 * @param companyKey
	 * @param alarm
	 * @param vehicle
	 * @return
	 */
	private Entity newLbaStatus(Key companyKey, Alarm alarm, String vehicle) {
		
		Entity lbaStatus = new Entity(KeyFactory.createKey(companyKey, "LbaStatus", vehicle + "@" + alarm.getName()));
		lbaStatus.setProperty("vehicle", vehicle);
		lbaStatus.setProperty("alarm", alarm.getName());
		lbaStatus.setProperty("loc", alarm.getEvtName());
		lbaStatus.setProperty("evt_trg", alarm.getEvtTrg());
		lbaStatus.setProperty("bef_status", "");
		lbaStatus.setProperty("cur_status", "");
		// always가 체크되어 있으면 true 아니면 오늘이 from_date, to_date 사이에 있는지 확인 
		boolean use = alarm.isAlways() ? true : DataUtils.between(DataUtils.getToday(), alarm.getFromDate(), alarm.getToDate());
		lbaStatus.setProperty("use", use);
		return lbaStatus;
	}	
	
	/**
	 * Alarm과 관련된 LbaStatus를 찾아 삭제 
	 * 
	 * @param datastore
	 * @param alarm
	 * @throws Exception
	 */
	private void deleteLbaStatus(DatastoreService datastore, Alarm alarm) throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", alarm.getCompany());
		List<Entity> lbaStatusList = DatastoreUtils.findEntityList(companyKey, "LbaStatus", DataUtils.newMap("alarm", alarm.getName()));
		
		if(DataUtils.isEmpty(lbaStatusList))
			return;
		
		List<Key> keysToDel = new ArrayList<Key>();
		for(Entity lbaStatus : lbaStatusList)
			keysToDel.add(lbaStatus.getKey());
		
		datastore.delete(keysToDel);
	}
	
}
