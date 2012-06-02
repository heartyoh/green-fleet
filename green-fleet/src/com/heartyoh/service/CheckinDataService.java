package com.heartyoh.service;

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
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Transaction;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

@Controller
public class CheckinDataService extends EntityService {
	
	/**
	 * 키가 되는 시간 정보 컬럼 
	 */
	private static final String KEY_TIME_COLUMN = "engine_end_time";
	
	@Override
	protected String getEntityName() {
		return "CheckinData";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	private Date parseDate(String timeStr, int timezone) {
		if(DataUtils.isEmpty(timeStr))
			return null;
		
		return SessionUtils.stringToDateTime(timeStr, DEFAULT_DATE_TIME_FORMAT, timezone);
	}
	
	/**
	 * create, update 전에 request map으로 부터 문자열 시간 정보를 모두 타임존 적용하여 Date로 바꾼다.
	 */
	@Override
	protected void adjustRequestMap(DatastoreService datastore, Map<String, Object> map) throws Exception {
		String datetimeStr = (String)map.remove("datetime");
		String engineStartTimeStr = (String)map.remove("engine_start_time");
		String engineEndTimeStr = (String)map.remove(KEY_TIME_COLUMN);
		
		Entity company = datastore.get((Key)map.get("_company_key"));
		String timezoneStr = (String)company.getProperty("timezone");
		int timezone = Integer.parseInt(timezoneStr);
		
		map.put("datetime", this.parseDate(datetimeStr, timezone));
		map.put("engine_start_time", this.parseDate(engineStartTimeStr, timezone));
		map.put(KEY_TIME_COLUMN, this.parseDate(engineEndTimeStr, timezone));
	}	
	
	@Override
	protected String getIdValue(Map<String, Object> map) {
		String engineEndTimeStr = DataUtils.dateToString((Date)map.get(KEY_TIME_COLUMN), DEFAULT_DATE_TIME_FORMAT);
		return map.get("terminal_id") + "@" + engineEndTimeStr;
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("terminal_id", map.get("terminal_id"));
		entity.setProperty(KEY_TIME_COLUMN, map.get(KEY_TIME_COLUMN));
		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {

		entity.setProperty("vehicle_id", stringProperty(map, "vehicle_id"));
		entity.setProperty("driver_id", stringProperty(map, "driver_id"));
		entity.setProperty("engine_start_time", map.get("engine_start_time"));
		
		entity.setUnindexedProperty("distance", doubleProperty(map, "distance"));
		entity.setUnindexedProperty("running_time", intProperty(map, "running_time"));
		entity.setUnindexedProperty("average_speed", doubleProperty(map, "average_speed"));
		entity.setUnindexedProperty("max_speed", intProperty(map, "max_speed"));
		entity.setUnindexedProperty("fuel_consumption", doubleProperty(map, "fuel_consumption"));
		entity.setUnindexedProperty("fuel_efficiency", doubleProperty(map, "fuel_efficiency"));
		entity.setUnindexedProperty("sudden_accel_count", intProperty(map, "sudden_accel_count"));
		entity.setUnindexedProperty("sudden_brake_count", intProperty(map, "sudden_brake_count"));
		entity.setUnindexedProperty("idle_time", intProperty(map, "idle_time"));
		entity.setUnindexedProperty("eco_driving_time", intProperty(map, "eco_driving_time"));
		entity.setUnindexedProperty("over_speed_time", intProperty(map, "over_speed_time"));
		entity.setUnindexedProperty("co2_emissions", doubleProperty(map, "co2_emissions"));
		entity.setUnindexedProperty("max_cooling_water_temp", doubleProperty(map, "max_cooling_water_temp"));
		entity.setUnindexedProperty("avg_battery_volt", doubleProperty(map, "avg_battery_volt"));
		
		entity.setUnindexedProperty("less_than_10km", intProperty(map, "less_than_10km"));
		entity.setUnindexedProperty("less_than_20km", intProperty(map, "less_than_20km"));
		entity.setUnindexedProperty("less_than_30km", intProperty(map, "less_than_30km"));
		entity.setUnindexedProperty("less_than_40km", intProperty(map, "less_than_40km"));
		entity.setUnindexedProperty("less_than_50km", intProperty(map, "less_than_50km"));
		entity.setUnindexedProperty("less_than_60km", intProperty(map, "less_than_60km"));
		entity.setUnindexedProperty("less_than_70km", intProperty(map, "less_than_70km"));
		entity.setUnindexedProperty("less_than_80km", intProperty(map, "less_than_80km"));
		entity.setUnindexedProperty("less_than_90km", intProperty(map, "less_than_90km"));
		entity.setUnindexedProperty("less_than_100km", intProperty(map, "less_than_100km"));
		entity.setUnindexedProperty("less_than_110km", intProperty(map, "less_than_110km"));
		entity.setUnindexedProperty("less_than_120km", intProperty(map, "less_than_120km"));
		entity.setUnindexedProperty("less_than_130km", intProperty(map, "less_than_130km"));
		entity.setUnindexedProperty("less_than_140km", intProperty(map, "less_than_140km"));
		entity.setUnindexedProperty("less_than_150km", intProperty(map, "less_than_150km"));
		entity.setUnindexedProperty("less_than_160km", intProperty(map, "less_than_160km"));		

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
		
		Transaction txn = datastore.beginTransaction();		
		try {
			String monthStr = DataUtils.dateToString(new Date(), "yyyy-MM") + "-01";
			Entity vehicle = this.adjustVehicleData(checkinObj);
			Entity vehicleRunSum = this.adjustRunSumData(checkinObj, "VehicleRunSum", "vehicle", (String)checkinObj.getProperty("vehicle_id"), monthStr);
			Entity driverRunSum = this.adjustRunSumData(checkinObj, "DriverRunSum", "driver", (String)checkinObj.getProperty("driver_id"), monthStr);
			
			super.saveEntity(checkinObj, map, datastore);
			
			if(vehicle != null)
				super.saveEntity(vehicle, map, datastore);
			
			if(vehicleRunSum != null)
				super.saveEntity(vehicleRunSum, map, datastore);
			
			if(driverRunSum != null)
				super.saveEntity(driverRunSum, map, datastore);
			
			txn.commit();
			
		} catch (Exception e) {
			txn.rollback();
			throw e;
		}
	}
	
	private Entity adjustVehicleData(Entity checkinObj) throws Exception {
		
		Key vehicleKey = KeyFactory.createKey(checkinObj.getParent(), "Vehicle", (String)checkinObj.getProperty("vehicle_id"));
		Entity vehicle = DatastoreUtils.findVehicle(vehicleKey);

		if(vehicle != null) {
			// 체크인 시점에 driver, terminal, total distance 정보를 업데이트한다.
			double totalMileage = DataUtils.toDouble(vehicle.getProperty("total_distance"));
			double distance = DataUtils.toDouble(checkinObj.getProperty("distance"));
			vehicle.setProperty("driver_id", checkinObj.getProperty("driver_id"));
			vehicle.setProperty("terminal_id", checkinObj.getProperty("terminal_id"));
			vehicle.setProperty("total_distance", totalMileage + distance);
		}
		
		return vehicle;
	}
	
	private Entity adjustRunSumData(Entity checkinObj, String runSumEntityName, String keyWithPropName, String keyValueWithMonth, String monthStr) throws Exception {
		
		Key runSumKey = KeyFactory.createKey(checkinObj.getParent(), runSumEntityName, keyValueWithMonth + "@" + monthStr);
		Entity runSum = DatastoreUtils.findByKey(runSumKey);
		double cRunDist = 0;
		int cRunTime = 0;
		double cConsmpt = 0;
		double cCo2Emss = 0;
		double cEffcc = 0;
		
		// 체크인 시점에 RunSum 정보를 업데이트한다.
		if(runSum != null) {
			cRunDist = DataUtils.toDouble(checkinObj.getProperty("distance"));
			cRunTime = DataUtils.toInt(checkinObj.getProperty("running_time"));
			cConsmpt = DataUtils.toDouble(checkinObj.getProperty("fuel_consumption"));
			cCo2Emss = DataUtils.toDouble(checkinObj.getProperty("co2_emissions"));
			cEffcc = DataUtils.toDouble(checkinObj.getProperty("fuel_efficiency"));
		
		// 체크인 시점에 Vehicle/Driver RunSum 정보가 없다면 생성 ...
		} else {
			runSum = new Entity(runSumEntityName, checkinObj.getParent());
			runSum.setProperty(keyWithPropName, keyValueWithMonth);
			runSum.setProperty("month", SessionUtils.stringToDate(monthStr));
		}
		
		// RunSum 계산 
		double sRunDist = DataUtils.toDouble(runSum.getProperty("run_dist"));
		int sRunTime = DataUtils.toInt(runSum.getProperty("run_time"));
		double sConsmpt = DataUtils.toDouble(runSum.getProperty("consmpt"));
		double sCo2Emss = DataUtils.toDouble(runSum.getProperty("co2_emss"));
		double sEffcc = DataUtils.toDouble(runSum.getProperty("effcc"));
		
		runSum.setProperty("run_dist", cRunDist + sRunDist);
		runSum.setProperty("run_time", cRunTime + sRunTime);
		runSum.setProperty("consmpt", cConsmpt + sConsmpt);
		runSum.setProperty("co2_emss", cCo2Emss + sCo2Emss);
		runSum.setProperty("effcc", cEffcc + sEffcc);
		return runSum;
	}

	@Override
	protected void addFilter(Query q, String property, String value) {
		
		if("date".equals(property)) {
			long dateMillis = DataUtils.toLong(value);
			if(dateMillis > 1) {
				Date[] fromToDate = DataUtils.getFromToDate(dateMillis * 1000, 0, 1);
				q.addFilter(KEY_TIME_COLUMN, Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromToDate[0]);
				q.addFilter(KEY_TIME_COLUMN, Query.FilterOperator.LESS_THAN_OR_EQUAL, fromToDate[1]);
			}
		} else {
			q.addFilter(property, FilterOperator.EQUAL, value);
		}
	}
	
	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		
		String vehicleId = request.getParameter("vehicle_id");
		if(!DataUtils.isEmpty(vehicleId)) {
			q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
		}
		
		String fromDateStr = request.getParameter("from_date");
		String toDateStr = request.getParameter("to_date");
		
		if(!DataUtils.isEmpty(fromDateStr) && !DataUtils.isEmpty(toDateStr)) {
			q.addFilter(KEY_TIME_COLUMN, Query.FilterOperator.GREATER_THAN_OR_EQUAL, SessionUtils.stringToDate(fromDateStr));
			q.addFilter(KEY_TIME_COLUMN, Query.FilterOperator.LESS_THAN_OR_EQUAL, SessionUtils.stringToDate(toDateStr));
			
		} else if(!DataUtils.isEmpty(fromDateStr) && DataUtils.isEmpty(toDateStr)) {
			q.addFilter(KEY_TIME_COLUMN, Query.FilterOperator.GREATER_THAN_OR_EQUAL, SessionUtils.stringToDate(fromDateStr));
			
		} else if(DataUtils.isEmpty(fromDateStr) && !DataUtils.isEmpty(toDateStr)) {
			q.addFilter(KEY_TIME_COLUMN, Query.FilterOperator.LESS_THAN_OR_EQUAL, SessionUtils.stringToDate(toDateStr));
		}
	}
}
