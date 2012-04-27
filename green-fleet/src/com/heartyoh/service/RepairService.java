/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Date;
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
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 차량 Maintenence 이력 서비스  
 * 
 * @author jonghonam
 */
@Controller
public class RepairService extends EntityService {

	@Override
	protected String getEntityName() {
		return "Repair";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		this.checkRepairDate(map);
		return map.get("vehicle_id") + "@" + map.get("repair_date");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		this.checkRepairDate(map);
		entity.setProperty("vehicle_id", map.get("vehicle_id"));
		entity.setProperty("repair_date", map.get("repair_date"));
		
		super.onCreate(entity, map, datastore);
	}
	
	private void checkRepairDate(Map<String, Object> map) {
		Object repairDateObj = map.get("repair_date");
		Object nextRepairDateObj = map.get("next_repair_date");
		
		if(!DataUtils.isEmpty(repairDateObj) && repairDateObj instanceof String)
			map.put("repair_date", SessionUtils.stringToDate((String)repairDateObj));
		
		if(!DataUtils.isEmpty(nextRepairDateObj) && nextRepairDateObj instanceof String)
			map.put("next_repair_date", SessionUtils.stringToDate((String)nextRepairDateObj));
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		this.checkRepairDate(map);
		// 수리 시간
		entity.setProperty("repair_time", map.get("repair_time"));
		// 다음 정비일 
		entity.setProperty("next_repair_date", map.get("next_repair_date"));
		// 수리시 주행거리
		entity.setProperty("repair_mileage", map.get("repair_mileage"));
		// 자동차 정비소  
		entity.setProperty("repair_shop", map.get("repair_shop"));
		// 자동차 수리사  
		entity.setProperty("repair_man", map.get("repair_man"));
		// 정비 가격 
		entity.setProperty("cost", map.get("cost"));
		// 수리 내용 
		entity.setProperty("content", map.get("content"));
		// 코멘트 
		entity.setProperty("comment", map.get("comment"));
		
		super.onSave(entity, map, datastore);
	}
	
	@RequestMapping(value = "/repair/alarm", method = RequestMethod.GET)
	public @ResponseBody
	String alarm(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Key companyKey = this.getCompanyKey(request);
		
		// 0. 쿼리 : 오늘 날짜로 정비 스케줄이 잡혀 있는 모든 Repair 조회
		List<Entity> impendingRepairs = this.findImpendingRepairs(companyKey);

		if(DataUtils.isEmpty(impendingRepairs))
			return this.getResultMsg(true, "No vehicles to repair exist!");
		
		try {
			AlarmUtils.alarmRepairs(impendingRepairs);
		} catch (Exception e) {
			return this.getResultMsg(false, e.getMessage());
		}
		
		return this.getResultMsg(true, "Repair alarms notified (" + impendingRepairs.size() + " count) successfully!");
	}
	
	@RequestMapping(value = "/repair/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/repair/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/repair/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/repair", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {		
		return super.retrieve(request, response);
	}
	
	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		String vehicleId = request.getParameter("vehicle_id");
		
		if(!DataUtils.isEmpty(vehicleId))
			q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);		
	}
	
	/**
	 * 정비 일정이 다가온 정보를 조회한다. 
	 * 
	 * @param companyKey
	 * @return
	 */
	private List<Entity> findImpendingRepairs(Key companyKey) {
		
		Query q = new Query(this.getEntityName());
		q.setAncestor(companyKey);
		
		long dateMillis = DataUtils.getTodayMillis();
		Date[] fromToDate = DataUtils.getFromToDate(dateMillis, 1, 3);
		q.addFilter("next_repair_date", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromToDate[0]);
		q.addFilter("next_repair_date", Query.FilterOperator.LESS_THAN_OR_EQUAL, fromToDate[1]);
		q.addSort("next_repair_date", SortDirection.DESCENDING);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		List<Entity> repairs = new ArrayList<Entity>();
		for(Entity repair : pq.asIterable()) {
			repairs.add(repair);
		}
		
		return repairs;
	}
}
