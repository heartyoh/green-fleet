package com.heartyoh.service;

import java.util.Calendar;
import java.util.Date;
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
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

@Controller
public class CheckinDataService extends EntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(CheckinDataService.class);

	@Override
	protected String getEntityName() {
		return "CheckinData";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return map.get("terminal_id") + "@" + map.get("datetime");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		Entity company = datastore.get((Key)map.get("_company_key"));

		String terminal_id = (String) map.get("terminal_id");
		String datetime = (String) map.get("datetime");

		entity.setProperty("terminal_id", terminal_id);
		entity.setProperty("datetime", SessionUtils.stringToDateTime(datetime, null, Integer.parseInt((String)company.getProperty("timezone"))));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {

		entity.setProperty("vehicle_id", stringProperty(map, "vehicle_id"));
		entity.setProperty("driver_id", stringProperty(map, "driver_id"));

		entity.setProperty("distance", doubleProperty(map, "distance"));
		entity.setProperty("running_time", intProperty(map, "running_time"));
		entity.setProperty("less_than_10km", intProperty(map, "less_than_10km"));
		entity.setProperty("less_than_20km", intProperty(map, "less_than_20km"));
		entity.setProperty("less_than_30km", intProperty(map, "less_than_30km"));
		entity.setProperty("less_than_40km", intProperty(map, "less_than_40km"));
		entity.setProperty("less_than_50km", intProperty(map, "less_than_50km"));
		entity.setProperty("less_than_60km", intProperty(map, "less_than_60km"));
		entity.setProperty("less_than_70km", intProperty(map, "less_than_70km"));
		entity.setProperty("less_than_80km", intProperty(map, "less_than_80km"));
		entity.setProperty("less_than_90km", intProperty(map, "less_than_90km"));
		entity.setProperty("less_than_100km", intProperty(map, "less_than_100km"));
		entity.setProperty("less_than_110km", intProperty(map, "less_than_110km"));
		entity.setProperty("less_than_120km", intProperty(map, "less_than_120km"));
		entity.setProperty("less_than_130km", intProperty(map, "less_than_130km"));
		entity.setProperty("less_than_140km", intProperty(map, "less_than_140km"));
		entity.setProperty("less_than_150km", intProperty(map, "less_than_150km"));
		entity.setProperty("less_than_160km", intProperty(map, "less_than_160km"));

		entity.setProperty("engine_start_time", SessionUtils.stringToDateTime((String)map.get("engine_start_time")));
		entity.setProperty("engine_end_time", SessionUtils.stringToDateTime((String)map.get("engine_end_time")));
		entity.setProperty("average_speed", doubleProperty(map, "average_speed"));
		entity.setProperty("max_speed", intProperty(map, "max_speed"));
		entity.setProperty("fuel_consumption", doubleProperty(map, "fuel_consumption"));
		entity.setProperty("fuel_efficiency", doubleProperty(map, "fuel_efficiency"));
		entity.setProperty("sudden_accel_count", intProperty(map, "sudden_accel_count"));
		entity.setProperty("sudden_brake_count", intProperty(map, "sudden_brake_count"));
		entity.setProperty("idle_time", intProperty(map, "idle_time"));
		entity.setProperty("eco_driving_time", intProperty(map, "eco_driving_time"));
		entity.setProperty("over_speed_time", intProperty(map, "over_speed_time"));
		entity.setProperty("co2_emissions", doubleProperty(map, "co2_emissions"));
		entity.setProperty("max_cooling_water_temp", doubleProperty(map, "max_cooling_water_temp"));
		entity.setProperty("avg_battery_volt", doubleProperty(map, "avg_battery_volt"));

		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/checkin_data/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/checkin_data/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/checkin_data/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/checkin_data", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
	
	@Override
	protected void saveEntity(Entity checkinObj, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		Key vehicleKey = KeyFactory.createKey(checkinObj.getParent(), "Vehicle", (String)checkinObj.getProperty("vehicle_id"));
		Entity vehicle = DatastoreUtils.findVehicle(vehicleKey);

		if(vehicle != null) {
			// 체크인 시점에 driver, terminal, total distance 정보를 업데이트한다.
			double totalMileage = DataUtils.toDouble(vehicle.getProperty("total_distance"));
			double distance = DataUtils.toDouble(checkinObj.getProperty("distance"));
			vehicle.setProperty("driver_id", checkinObj.getProperty("driver_id"));
			vehicle.setProperty("terminal_id", checkinObj.getProperty("terminal_id"));
			vehicle.setProperty("total_distance", totalMileage + distance);
			super.saveEntity(vehicle, map, datastore);
		}
		
		super.saveEntity(checkinObj, map, datastore);
	}	

	@Override
	protected void addFilter(Query q, String property, String value) {
		if("date".equals(property)) {
			long fromMillis = Long.parseLong(value);
			Calendar c = Calendar.getInstance();
			c.setTimeInMillis(fromMillis * 1000);
			Date fromDate = c.getTime();
			c.setTimeInMillis((fromMillis + (60 * 60 * 24)) * 1000);
			Date toDate = c.getTime();
			q.addFilter("datetime", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate);
			q.addFilter("datetime", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate);
		} else {			
			q.addFilter(property, FilterOperator.EQUAL, value);
		}
	}
}
