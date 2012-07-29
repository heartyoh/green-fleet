/**
 * 
 */
package com.heartyoh.service;

import java.util.Calendar;
import java.util.Date;
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
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.model.Task;
import com.heartyoh.model.Vehicle;
import com.heartyoh.model.VehicleRunSum;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;
import com.heartyoh.util.SessionUtils;

/**
 * 차량 Maintenence 이력 서비스  
 * 
 * @author jonghonam
 */
@Controller
public class RepairService extends EntityService {

	@Override
	protected boolean useFilter() {
		return true;
	}
	
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
		if(map.containsKey("repair_time") && !DataUtils.isEmpty(map.get("repair_time"))) {			
			Object repairTime = map.get("repair_time");
			if(repairTime instanceof Integer) {
				entity.setProperty("repair_time", repairTime);
			} else if(repairTime instanceof String) {
				try {
					entity.setProperty("repair_time", Integer.parseInt(repairTime.toString()));
				} catch(Exception e) {
					entity.setProperty("repair_time", 0);
				}
			}
		} else {
			map.put("repair_time", 0);
		}
		
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
	
	@Override
	protected void saveEntity(Entity repair, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		Object nextRepairDateObj = repair.getProperty("next_repair_date");		
		
		// 다음 정비일이 설정되었다면 task와 연동
		if(repair.getProperty("task_id") == null) {
			if(nextRepairDateObj != null) {
				Date nextRepairDate = (Date)nextRepairDateObj;
				String company = repair.getParent().getName();
				String url = KeyFactory.keyToString(repair.getKey());
				Task task = new Task();
				task.setCategory(GreenFleetConstant.TASK_TYPE_MAINTENENCE);
				task.setAllDay(true);
				task.setCompany(company);
				task.setStartDate(nextRepairDate);
				task.setEndDate(nextRepairDate);
				task.setUrl(url);
				task.setTitle("Vehicle [" + repair.getProperty("vehicle_id") + "] maintenence");
				DatasourceUtils.upsertEntity(task);
				Map<String, Object> params = DataUtils.newMap("company", company);
				params.put("url", url);
				task = DatasourceUtils.findTask(params);
				repair.setProperty("task_id", task.getId());
			}
		} else {
			long taskId = (Long)repair.getProperty("task_id");
			Task task = DatasourceUtils.findTask(taskId);
			
			if(nextRepairDateObj != null) {
				Date nextRepairDate = (Date)nextRepairDateObj;
				task.setStartDate(nextRepairDate);
				task.setEndDate(nextRepairDate);
				DatasourceUtils.updateTask(task);
				
			} else {
				DatasourceUtils.daleteTask(task.getId());
				repair.removeProperty("task_id");
			}
		}
		
		this.updateVehicleRunSum(repair);
		datastore.put(repair);
	}
	
	/**
	 * vehicle_run_sum 테이블에 mnt_cnt, mnt_time 정보를 업데이트한다. 
	 * 
	 * @param repair
	 * @throws Exception
	 */
	private void updateVehicleRunSum(Entity repair) throws Exception {
		String vehicleId = (String)repair.getProperty("vehicle_id");
		int repairTime = (Integer)repair.getProperty("repair_time");
		Map<String, Object> params = DataUtils.newMap("company", repair.getParent().getName());
		Calendar c = Calendar.getInstance();
		int year = c.get(Calendar.YEAR);
		int month = c.get(Calendar.MONTH) + 1;
		params.put("vehicle", vehicleId);
		params.put("year", year);
		params.put("month", month);
		VehicleRunSum runSum = (VehicleRunSum)DatasourceUtils.findEntity(VehicleRunSum.class, params);
		
		if(runSum == null) {
			runSum = new VehicleRunSum(repair.getParent().getName(), vehicleId, year, month);			
		}
		
		int mntCnt = runSum.getMntCnt();
		int mntTime = runSum.getMntTime();
		
		runSum.setMntCnt(mntCnt + 1);
		runSum.setMntTime(mntTime + repairTime);
		DatasourceUtils.upsertEntity(runSum);
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
	
	@RequestMapping(value = "/repair/start", method = RequestMethod.POST)
	public @ResponseBody
	String startRepair(HttpServletRequest request, HttpServletResponse response) throws Exception {
				
		String company = this.getCompany(request);
		String vehicleId = request.getParameter("vehicle_id");
		
		// 0. 차량 조회. 존재하지 않다면 에러 
		Vehicle vehicle = DatasourceUtils.findVehicle(company, vehicleId);
		if(vehicle == null) {
			return this.getResultMsg(false, "Not found vehicle by id [" + vehicleId + "]!");
		}
		
		// 1. 차량 상태 Maint 상태이면 에러
		if(GreenFleetConstant.VEHICLE_STATUS_MAINT.equalsIgnoreCase(vehicle.getStatus())) {
			return this.getResultMsg(false, "Vehicle status already [" + GreenFleetConstant.VEHICLE_STATUS_MAINT + "]!");
		}
		
		// 2. 차량 수리 임시 정보 있는지 확인 
		Entity repairing = this.findRepairing(request);
		if(repairing != null) {
			return this.getResultMsg(false, "Vehicle [" + vehicleId + "] already repairing!");
		}
		
		// 3. 차량 수리 임시 정보 추가
		Key companyKey = this.getCompanyKey(request);
		repairing = new Entity(KeyFactory.createKey(companyKey, "Repairing", vehicleId));
		repairing.setProperty("vehicle_id", vehicleId);
		repairing.setProperty("repair_start_time", new Date());
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.put(repairing);
		
		// 4. 차량 상태 Maint로 수정
		vehicle.setStatus(GreenFleetConstant.VEHICLE_STATUS_MAINT);
		DatasourceUtils.updateVehicle(vehicle);
		return this.getResultMsg(true, "success");
	}
	
	@RequestMapping(value = "/repair/end", method = RequestMethod.POST)
	public @ResponseBody
	String endRepair(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String vehicleId = request.getParameter("vehicle_id");
		
		// 0. 차량 조회. 존재하지 않다면 에러 
		Vehicle vehicle = DatasourceUtils.findVehicle(company, vehicleId);
		if(vehicle == null) {
			return this.getResultMsg(false, "Not found vehicle by id [" + vehicleId + "]!");
		}
		
		// 1. 차량 수리 임시 정보 있는지 확인, 없다면 에러
		Entity repairing = this.findRepairing(request);
		if(repairing == null) {
			return this.getResultMsg(false, "Not found repairing data by vehicle id [" + vehicleId + "]!"); 
		}
		
		// 2. 차량 수리 정보 추가 
		Key companyKey = this.getCompanyKey(request);
		Map<String, Object> map = toMap(request);
		Date today = DataUtils.getToday();
		map.put("repair_date", today);
		String id = this.getIdValue(map);
		Entity repair = new Entity(KeyFactory.createKey(companyKey, this.getEntityName(), id));
		repair.setProperty("vehicle_id", vehicleId);
		repair.setProperty("repair_date", today);
		Date startTime = (Date)repairing.getProperty("repair_start_time");
		Date endTime = new Date();
		long repairTime = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
		repair.setProperty("repair_time", (int)repairTime);
		repair.setProperty("repair_mileage", vehicle.getTotalDistance());
		repair.setProperty("created_at", endTime);
		repair.setProperty("updated_at", endTime);
		// TODO content, next_repair_date
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.put(repair);
		
		// 3. 차량 수리 임시 정보 삭제
		datastore.delete(repairing.getKey());
				
		// 4. 차량 상태 '정차중'으로 변경
		vehicle.setStatus(GreenFleetConstant.VEHICLE_STATUS_IDLE);
		DatasourceUtils.updateVehicle(vehicle);
		return this.getResultMsg(true, "success");
	}
	
	private Entity findRepairing(HttpServletRequest request) throws Exception {		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("Repairing");
		q.setAncestor(this.getCompanyKey(request));
		String vehicleId = request.getParameter("vehicle_id");
		q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
		PreparedQuery pq = datastore.prepare(q);
		return pq.asSingleEntity();
	}
	
	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		String vehicleId = request.getParameter("vehicle_id");
		
		if(!DataUtils.isEmpty(vehicleId))
			q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
	}
}
