package com.heartyoh.service;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.model.Vehicle;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;
import com.heartyoh.util.SessionUtils;

@Controller
public class IncidentService extends EntityService {
	
	@Override
	protected String getEntityName() {
		return "Incident";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		if(!map.containsKey("datetime")) {
			DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			map.put("datetime", df.format(new Date()));
		}
		
		return map.get("terminal_id") + "@" + map.get("datetime");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		Entity company = datastore.get((Key)map.get("_company_key"));		
		entity.setProperty("terminal_id", map.get("terminal_id"));
		Date datetime = SessionUtils.stringToDateTime((String)map.get("datetime"), null, company);
		entity.setProperty("datetime", datetime);
		entity.setProperty("confirm", false);
		
		if(map.containsKey("terminal_id")) {
			// Terminal ID로 부터 Vehicle ID, Driver ID를 매핑테이블로 부터 찾는다.
			String terminalId = (String)map.get("terminal_id");
			String[] vehicleDriverId = 
					DatasourceUtils.findVehicleDriverId(entity.getParent().getName(), terminalId);
			
			if(vehicleDriverId != null && !DataUtils.isEmpty(vehicleDriverId[0]))
				map.put("vehicle_id", vehicleDriverId[0]);
			
			if(vehicleDriverId != null && !DataUtils.isEmpty(vehicleDriverId[1]))
				map.put("driver_id", vehicleDriverId[1]);
		} 
		
		// indexed properties
		if (entity.getProperty("vehicle_id") == null)
			entity.setProperty("vehicle_id", stringProperty(map, "vehicle_id"));
		
		if (entity.getProperty("driver_id") == null)
			entity.setProperty("driver_id", stringProperty(map, "driver_id"));
		
		if (map.get("lat") != null)
			entity.setProperty("lat", doubleProperty(map, "lat"));		
		if (map.get("lng") != null)
			entity.setProperty("lng", doubleProperty(map, "lng"));		

		super.onCreate(entity, map, datastore);
		
		// 사고 알람은 사고가 발생했을 경우에만 보낸다.
		this.alarmIncident(entity);		
	}

	@Override
	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request) throws IOException {
		String video_file = saveFile(request, (MultipartFile) map.get("video_file"));
		if(video_file != null) {
			entity.setProperty("video_clip", video_file);
		}

		super.postMultipart(entity, map, request);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		entity.setProperty("obd_connected", DataUtils.toBool(map.get("obd_connected")));
		entity.setProperty("confirm", DataUtils.toBool(map.get("confirm")));
		if (map.get("velocity") != null)
			entity.setProperty("velocity", doubleProperty(map, "velocity"));
		
		// unindexed properties
		if (map.get("impulse_abs") != null)
			entity.setUnindexedProperty("impulse_abs", doubleProperty(map, "impulse_abs"));
		if (map.get("impulse_x") != null)
			entity.setUnindexedProperty("impulse_x", doubleProperty(map, "impulse_x"));
		if (map.get("impulse_y") != null)
			entity.setUnindexedProperty("impulse_y", doubleProperty(map, "impulse_y"));
		if (map.get("impulse_z") != null)
			entity.setUnindexedProperty("impulse_z", doubleProperty(map, "impulse_z"));
		if (map.get("impulse_threshold") != null)
			entity.setUnindexedProperty("impulse_threshold", doubleProperty(map, "impulse_threshold"));
		if (map.get("engine_temp") != null)
			entity.setUnindexedProperty("engine_temp", doubleProperty(map, "engine_temp"));
		if (map.get("engine_temp_threshold") != null)
			entity.setUnindexedProperty("engine_temp_threshold", doubleProperty(map, "engine_temp_threshold"));		

		super.onSave(entity, map, datastore);		
	}
	
	/**
	 * 관리자에게 사고 알람을 보낸다.
	 * 
	 * @param incident
	 */
	private void alarmIncident(Entity incident) {
		try {
			if(DataUtils.isEmpty(incident.getProperty("vehicle_id")))
				return;
			
			Vehicle vehicle = DatasourceUtils.findVehicle(incident.getParent().getName(), (String)incident.getProperty("vehicle_id"));
			
			if(vehicle == null)
				return;
						
			AlarmUtils.alarmIncidents(vehicle, incident);
		} catch(Exception e) {
			
		}
	}
	
	@Override
	protected void saveEntity(Entity incident, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		datastore.put(incident);
		
		// 관련 차량의 정보를 가져와서 차량 상태 업데이트...
		Vehicle vehicle = DatasourceUtils.findVehicle(incident.getParent().getName(), (String)incident.getProperty("vehicle_id"));
		
		if(vehicle == null)
			return;		
		
		String vehiclePrvStatus = vehicle.getStatus();		
		if(DataUtils.toBool(incident.getProperty("confirm"))) {
			/*
			 * 만약, 이 Incident의 컨펌 정보가 off이면, 차량의 상태는 무조건 Incident이며,
			 * 컨펌정보가 on이면, 컨펌정보가 off인 Incident 리스트를 가져와서 하나라도 남아있으면, 차량의 상태는 Incident가 된다.
			 * 따라서, 아래에서는 관련 차량의 Incident 정보중 아직 컨펌되지 않은 리스트를 가져온다.
			 */			
			Query q = new Query("Incident");
			q.setAncestor(incident.getParent());
			q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicle.getId());
			q.addFilter("confirm", FilterOperator.NOT_EQUAL, true);		
			PreparedQuery pq = datastore.prepare(q);
			int incidentsCount = pq.countEntities(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));
			vehicle.setStatus(incidentsCount > 0 ? GreenFleetConstant.VEHICLE_STATUS_INCIDENT : GreenFleetConstant.VEHICLE_STATUS_RUNNING);			
		} else {
			vehicle.setStatus(GreenFleetConstant.VEHICLE_STATUS_INCIDENT);
		}
		
		if(!vehicle.getStatus().equalsIgnoreCase(vehiclePrvStatus))
			DatasourceUtils.updateVehicle(vehicle);
	}	

	@RequestMapping(value = "/incident/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/incident/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/incident/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}
	
	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		// tablet 쪽에서 호출시 그냥 parameter로 넘김, 수정시 삭제 
		if(!DataUtils.isEmpty(request.getParameter("vehicle_id"))) {
			q.addFilter("vehicle_id", FilterOperator.EQUAL, request.getParameter("vehicle_id"));
		}
	}

	@Override
	protected void addFilter(Query q, String property, Object value) {
		if("date".equalsIgnoreCase(property)) {
			this.addDateFilter(q, value);
		} else if("confirm".equalsIgnoreCase(property)) {
			super.addFilter(q, property, DataUtils.toBool(value));
		} else {
			super.addFilter(q, property, value);
		}
	}
	
	/**
	 * 일자로 검색하는 경우 ...
	 * 
	 * @param q
	 * @param value
	 */
	private void addDateFilter(Query q, Object value) {
		
		if(DataUtils.isEmpty(value))
			return;
		
		long dateMillis = DataUtils.toLong(value);
		if(dateMillis > 1) {
			Date[] fromToDate = DataUtils.getFromToDate(dateMillis * 1000, 0, 1);
			q.addFilter("datetime", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromToDate[0]);
			q.addFilter("datetime", Query.FilterOperator.LESS_THAN_OR_EQUAL, fromToDate[1]);
		}		
	}

	@RequestMapping(value = {"/incident", "/m/data/incident.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
}
