package com.heartyoh.service;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Dml;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.Query;
import com.heartyoh.model.Vehicle;
import com.heartyoh.util.ConnectionManager;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.SessionUtils;

@Controller
public class TrackService extends EntityService {
	
	@Override
	protected String getEntityName() {
		return "Track";
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
		entity.setProperty("datetime", map.containsKey("datetime") ? 
				SessionUtils.stringToDateTime((String)map.get("datetime"), null, company) : map.get("_now"));
		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		String terminalId = (String) map.get("terminal_id");
		String[] vehicleDriverId = 
				DatasourceUtils.findVehicleDriverId(entity.getParent().getName(), terminalId);
		String velocity = (String) map.get("velocity");
		String lat = map.containsKey("lat") ? (String) map.get("lat") : "0";
		String lng = map.containsKey("lng") ? (String) map.get("lng") : "0";

		double dblLat = 0;
		double dblLng = 0;
		
		if (!DataUtils.isEmpty(lat)) {
			dblLat = Double.parseDouble(lat);
			entity.setProperty("lat", dblLat);
		}
		
		if (!DataUtils.isEmpty(lng)) {
			dblLng = Double.parseDouble(lng);
			entity.setProperty("lng", dblLng);
		}
		
		if(dblLat == 0 && dblLng == 0)
			throw new Exception("Both of latitude & longitude values are 0. It might meant to be non stable status of blackbox.");
		
		// 위치 기반 서비스 알림 비동기 처리 --> 실시간 처리로...
		// AsyncUtils.addLbaTaskToQueue(entity.getParent().getName(), vehicle_id, dblLatitude, dblLongitude);
		
		entity.setProperty("terminal_id", terminalId);
		entity.setProperty("vehicle_id", vehicleDriverId[0]);
		entity.setProperty("driver_id", vehicleDriverId[1]);
		entity.setProperty("velocity", velocity);

		super.onSave(entity, map, datastore);
	}
	
	@Override
	protected void saveEntity(Entity trackObj, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		Vehicle vehicle = 
				DatasourceUtils.findVehicle(trackObj.getParent().getName(), (String)trackObj.getProperty("vehicle_id"));
		
		if(vehicle != null) {
			vehicle.setLat(DataUtils.toFloat(trackObj.getProperty("lat")));
			vehicle.setLng(DataUtils.toFloat(trackObj.getProperty("lng")));
			DatasourceUtils.updateVehicle(vehicle);
		}
		
		datastore.put(trackObj);
	}

	@RequestMapping(value = "/track/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/track/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/track/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = {"/track", "/m/data/track"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrievex(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
	
	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		// TODO 이 메소드는 제거해도 됨, 아래 addFilter에서 같은 로직을 수행
		// 혹시 다른 쪽에 영향을 줄지 몰라 일단 놔 둠 
		String date = request.getParameter("date");
		if(!DataUtils.isEmpty(date)) {
			this.addDateFilter(q, date);
		}		
	}
	
	@Override
	protected void addFilter(Query q, String property, Object value) {
		if("date".equalsIgnoreCase(property)) {
			this.addDateFilter(q, value);
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
}
