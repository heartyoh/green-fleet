package com.heartyoh.service;

import java.util.Calendar;
import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Dml;
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
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.model.DriverRunSum;
import com.heartyoh.model.DriverSpeedSum;
import com.heartyoh.model.Vehicle;
import com.heartyoh.model.VehicleRunSum;
import com.heartyoh.model.VehicleSpeedSum;
import com.heartyoh.util.ConnectionManager;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.GreenFleetConstant;
import com.heartyoh.util.SessionUtils;

@Controller
public class CheckinDataService extends EntityService {
	
	/**
	 * 키가 되는 시간 정보 컬럼 
	 */
	private static final String KEY_TIME_COLUMN = "engine_end_time";
	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(CheckinDataService.class);	
	
	@Override
	protected String getEntityName() {
		return "CheckinData";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	/**
	 * date 형태의 문자열 데이터를 Date 객체로 변경 
	 * 
	 * @param timeStr
	 * @param timezone
	 * @return
	 */
	private Date parseDate(String timeStr, int timezone) {
		if(DataUtils.isEmpty(timeStr))
			return null;
		
		return SessionUtils.stringToDateTime(timeStr, GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT, timezone);
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
		String engineEndTimeStr = DataUtils.dateToString((Date)map.get(KEY_TIME_COLUMN), GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT);
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
		entity.setProperty("datetime", map.get("datetime"));
		
		entity.setUnindexedProperty("distance", doubleProperty(map, "distance"));
		entity.setUnindexedProperty("running_time", intProperty(map, "running_time"));
		entity.setUnindexedProperty("idle_time", intProperty(map, "idle_time"));
		entity.setUnindexedProperty("eco_driving_time", intProperty(map, "eco_driving_time"));
		entity.setUnindexedProperty("average_speed", doubleProperty(map, "average_speed"));
		entity.setUnindexedProperty("max_speed", intProperty(map, "max_speed"));
		entity.setUnindexedProperty("fuel_consumption", doubleProperty(map, "fuel_consumption"));
		entity.setUnindexedProperty("fuel_efficiency", doubleProperty(map, "fuel_efficiency"));
		entity.setUnindexedProperty("sudden_accel_count", intProperty(map, "sudden_accel_count"));
		entity.setUnindexedProperty("sudden_brake_count", intProperty(map, "sudden_brake_count"));
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
	protected void saveEntity(Entity checkin, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		try {			
			Calendar today = Calendar.getInstance();
			int year = today.get(Calendar.YEAR);
			int month = today.get(Calendar.MONTH) + 1;
			Dml dml = ConnectionManager.getInstance().getDml();
			
			// 1. 체크인 정보를 Vehicle 마스터 데이터에 반영  
			Vehicle vehicle = this.adjustVehicleData(dml, checkin);
			
			// 2. 체크인 정보를 Vehicle 주행 서머리 정보에 반영 
			VehicleRunSum vrs = this.adjustVehicleRunSum(dml, checkin, year, month);
			
			// 3. 체크인 정보를 Driver 주행 서머리 정보에 반영
			DriverRunSum drs = this.adjustDriverRunSum(dml, checkin, year, month);
			
			// 4. 체크인 정보를 Vehicle 속도 서머리 정보에 반영 
			VehicleSpeedSum vss = this.adjustVehicleSpeedSum(dml, checkin, year, month);
			
			// 5. 체크인 정보를 Driver 속도 서머리 정보에 반영
			DriverSpeedSum dss = this.adjustDriverSpeedSum(dml, checkin, year, month);
			
			if(vehicle != null) {
				vehicle.beforeUpdate();
				dml.update(vehicle);
			}
			
			if(vrs != null)
				dml.upsert(vrs);
			
			if(drs != null)
				dml.upsert(drs);
			
			if(vss != null)
				dml.upsert(vss);
			
			if(dss != null)
				dml.upsert(dss);
			
			// 4. 체크인 데이터를 저장 
			super.saveEntity(checkin, map, datastore);			
			
		} catch (Exception e) {
			logger.error("Failed to save checkin data!", e);
			throw e;
		}
	}

	/**
	 * 체크인 정보에 대해서 Vehicle 마스터 정보에 반영 (주행거리)
	 * 
	 * @param dml
	 * @param checkin
	 * @return
	 * @throws Exception
	 */
	private Vehicle adjustVehicleData(Dml dml, Entity checkin) throws Exception {		
		String company = checkin.getParent().getName();
		String vehicleId = (String)checkin.getProperty("vehicle_id");
		Vehicle vehicle = new Vehicle(company, vehicleId);
		vehicle = dml.select(vehicle);
		
		if(vehicle != null) {
			// 체크인 시점에 주행거리를 업데이트한다.
			float newTotalDist = vehicle.getTotalDistance();
			newTotalDist += DataUtils.toFloat(checkin.getProperty("distance"));
			vehicle.setTotalDistance(newTotalDist);
			
			// 차량 정보의 공인연비, 평균 연비로 에코 지수를 계산하여 checkin 데이터에 추가 
			float avgEffcc = DataUtils.toFloat(checkin.getProperty("fuel_efficiency"));
			float officialEffcc = vehicle.getOfficialEffcc();
			if(officialEffcc > 0) {
				int ecoIndex = Math.round((avgEffcc / officialEffcc) * 100);
				checkin.setUnindexedProperty("eco_index", ecoIndex);
			}
		}
		
		return vehicle;
	}
	
	/**
	 * Vehicle 주행 서머리 정보에 반영 
	 *  
	 * @param dml
	 * @param checkin
	 * @param year
	 * @param month
	 * @return
	 * @throws Exception
	 */
	private VehicleRunSum adjustVehicleRunSum(Dml dml, Entity checkin, int year, int month) throws Exception {
		
		String company = checkin.getParent().getName();
		String vehicleId = (String)checkin.getProperty("vehicle_id");
		VehicleRunSum runSum = new VehicleRunSum(company, vehicleId, year, month);
		
		try {
			runSum = dml.select(runSum);
		} catch(Exception e) {
			runSum = new VehicleRunSum(company, vehicleId, year, month);
		}
		
		if(runSum == null)
			runSum = new VehicleRunSum(company, vehicleId, year, month);
		
		// 체크인 시점에 RunSum 정보를 업데이트한다.		
		float cRunDist = DataUtils.toFloat(checkin.getProperty("distance"));
		int cRunTime = DataUtils.toInt(checkin.getProperty("running_time"));
		float cConsmpt = DataUtils.toFloat(checkin.getProperty("fuel_consumption"));
		float cCo2Emss = DataUtils.toFloat(checkin.getProperty("co2_emissions"));		
		float cEffccSum = DataUtils.toFloat(checkin.getProperty("fuel_efficiency"));
		int cEcoIndexSum = DataUtils.toInt(checkin.getProperty("eco_index"));
		
		runSum.setRunDist(cRunDist + runSum.getRunDist());
		runSum.setRunTime(cRunTime + runSum.getRunTime());
		runSum.setConsmpt(cConsmpt + runSum.getConsmpt());
		runSum.setCo2Emss(cCo2Emss + runSum.getCo2Emss());
		runSum.setEffccSum(cEffccSum + runSum.getEffccSum());
		runSum.setEcoIndexSum(cEcoIndexSum + runSum.getEcoIndexSum());
		runSum.setSumCount(runSum.getSumCount() + 1);
		
		// 평균연비 계산 
		float effcc = (float)(runSum.getEffccSum() / runSum.getSumCount());
		runSum.setEffcc(effcc);
		
		// 에코지수 계산 
		int ecoIndex = Math.round(runSum.getEcoIndexSum() / runSum.getSumCount());
		runSum.setEcoIndex(ecoIndex);
		
		return runSum;
	}
	
	/**
	 * Driver 주행 서머리 정보에 반영
	 * 
	 * @param dml
	 * @param checkin
	 * @param year
	 * @param month
	 * @return
	 * @throws Exception
	 */
	private DriverRunSum adjustDriverRunSum(Dml dml, Entity checkin, int year, int month) throws Exception {
		
		String company = checkin.getParent().getName();
		String driverId = (String)checkin.getProperty("driver_id");
		DriverRunSum runSum = new DriverRunSum(company, driverId, year, month);
		
		try {
			runSum = dml.select(runSum);
		} catch(Exception e) {
			runSum = new DriverRunSum(company, driverId, year, month);
		}
		
		if(runSum == null)
			runSum = new DriverRunSum(company, driverId, year, month);
		
		// 체크인 시점에 RunSum 정보를 업데이트한다.		
		float cRunDist = DataUtils.toFloat(checkin.getProperty("distance"));
		int cRunTime = DataUtils.toInt(checkin.getProperty("running_time"));
		float cConsmpt = DataUtils.toFloat(checkin.getProperty("fuel_consumption"));
		float cCo2Emss = DataUtils.toFloat(checkin.getProperty("co2_emissions"));
		float cEffccSum = DataUtils.toFloat(checkin.getProperty("fuel_efficiency"));
		int cEcoIndexSum = DataUtils.toInt(checkin.getProperty("eco_index"));
		
		runSum.setRunDist(cRunDist + runSum.getRunDist());
		runSum.setRunTime(cRunTime + runSum.getRunTime());
		runSum.setConsmpt(cConsmpt + runSum.getConsmpt());
		runSum.setCo2Emss(cCo2Emss + runSum.getCo2Emss());
		runSum.setEffccSum(cEffccSum + runSum.getEffccSum());
		runSum.setEcoIndexSum(cEcoIndexSum + runSum.getEcoIndexSum());
		runSum.setSumCount(runSum.getSumCount() + 1);
		
		// 평균연비 계산 
		float effcc = (float)(runSum.getEffccSum() / runSum.getSumCount());
		runSum.setEffcc(effcc);
		
		// 에코지수 계산 
		int ecoIndex = Math.round(runSum.getEcoIndexSum() / runSum.getSumCount());
		runSum.setEcoIndex(ecoIndex);
		
		return runSum;
	}
	
	/**
	 * 차량 속도 서머리 테이블에 반영 
	 * 
	 * @param dml
	 * @param checkin
	 * @param year
	 * @param month
	 * @return
	 * @throws Exception
	 */
	private VehicleSpeedSum adjustVehicleSpeedSum(Dml dml, Entity checkin, int year, int month) throws Exception {
		
		String company = checkin.getParent().getName();
		String vehicleId = (String)checkin.getProperty("vehicle_id");
		VehicleSpeedSum speedSum = new VehicleSpeedSum(company, vehicleId, year, month);
		
		try {
			speedSum = dml.select(speedSum);
		} catch(Exception e) {
			speedSum = new VehicleSpeedSum(company, vehicleId, year, month);
		}
		
		if(speedSum == null)
			speedSum = new VehicleSpeedSum(company, vehicleId, year, month);
		
		speedSum.setSpdLt10(DataUtils.toInt(checkin.getProperty("less_than_10km")) + speedSum.getSpdLt10());
		speedSum.setSpdLt20(DataUtils.toInt(checkin.getProperty("less_than_20km")) + speedSum.getSpdLt20());
		speedSum.setSpdLt30(DataUtils.toInt(checkin.getProperty("less_than_30km")) + speedSum.getSpdLt30());
		speedSum.setSpdLt40(DataUtils.toInt(checkin.getProperty("less_than_40km")) + speedSum.getSpdLt40());
		speedSum.setSpdLt50(DataUtils.toInt(checkin.getProperty("less_than_50km")) + speedSum.getSpdLt50());
		speedSum.setSpdLt60(DataUtils.toInt(checkin.getProperty("less_than_60km")) + speedSum.getSpdLt60());
		speedSum.setSpdLt70(DataUtils.toInt(checkin.getProperty("less_than_70km")) + speedSum.getSpdLt70());
		speedSum.setSpdLt80(DataUtils.toInt(checkin.getProperty("less_than_80km")) + speedSum.getSpdLt80());
		speedSum.setSpdLt90(DataUtils.toInt(checkin.getProperty("less_than_90km")) + speedSum.getSpdLt90());
		speedSum.setSpdLt100(DataUtils.toInt(checkin.getProperty("less_than_100km")) + speedSum.getSpdLt100());
		speedSum.setSpdLt110(DataUtils.toInt(checkin.getProperty("less_than_110km")) + speedSum.getSpdLt110());
		speedSum.setSpdLt120(DataUtils.toInt(checkin.getProperty("less_than_120km")) + speedSum.getSpdLt120());
		speedSum.setSpdLt130(DataUtils.toInt(checkin.getProperty("less_than_130km")) + speedSum.getSpdLt130());
		speedSum.setSpdLt140(DataUtils.toInt(checkin.getProperty("less_than_140km")) + speedSum.getSpdLt140());
		speedSum.setSpdLt150(DataUtils.toInt(checkin.getProperty("less_than_150km")) + speedSum.getSpdLt150());
		speedSum.setSpdLt160(DataUtils.toInt(checkin.getProperty("less_than_160km")) + speedSum.getSpdLt160());
		return speedSum;
	}
	
	/**
	 * 운전자 속도 서머리 테이블에 반영 
	 * 
	 * @param dml
	 * @param checkin
	 * @param year
	 * @param month
	 * @return
	 * @throws Exception
	 */
	private DriverSpeedSum adjustDriverSpeedSum(Dml dml, Entity checkin, int year, int month) throws Exception {
		
		String company = checkin.getParent().getName();
		String driverId = (String)checkin.getProperty("driver_id");
		DriverSpeedSum speedSum = new DriverSpeedSum(company, driverId, year, month);
		
		try {
			speedSum = dml.select(speedSum);
		} catch(Exception e) {
			speedSum = new DriverSpeedSum(company, driverId, year, month);
		}
		
		if(speedSum == null)
			speedSum = new DriverSpeedSum(company, driverId, year, month);
		
		speedSum.setSpdLt10(DataUtils.toInt(checkin.getProperty("less_than_10km")) + speedSum.getSpdLt10());
		speedSum.setSpdLt20(DataUtils.toInt(checkin.getProperty("less_than_20km")) + speedSum.getSpdLt20());
		speedSum.setSpdLt30(DataUtils.toInt(checkin.getProperty("less_than_30km")) + speedSum.getSpdLt30());
		speedSum.setSpdLt40(DataUtils.toInt(checkin.getProperty("less_than_40km")) + speedSum.getSpdLt40());
		speedSum.setSpdLt50(DataUtils.toInt(checkin.getProperty("less_than_50km")) + speedSum.getSpdLt50());
		speedSum.setSpdLt60(DataUtils.toInt(checkin.getProperty("less_than_60km")) + speedSum.getSpdLt60());
		speedSum.setSpdLt70(DataUtils.toInt(checkin.getProperty("less_than_70km")) + speedSum.getSpdLt70());
		speedSum.setSpdLt80(DataUtils.toInt(checkin.getProperty("less_than_80km")) + speedSum.getSpdLt80());
		speedSum.setSpdLt90(DataUtils.toInt(checkin.getProperty("less_than_90km")) + speedSum.getSpdLt90());
		speedSum.setSpdLt100(DataUtils.toInt(checkin.getProperty("less_than_100km")) + speedSum.getSpdLt100());
		speedSum.setSpdLt110(DataUtils.toInt(checkin.getProperty("less_than_110km")) + speedSum.getSpdLt110());
		speedSum.setSpdLt120(DataUtils.toInt(checkin.getProperty("less_than_120km")) + speedSum.getSpdLt120());
		speedSum.setSpdLt130(DataUtils.toInt(checkin.getProperty("less_than_130km")) + speedSum.getSpdLt130());
		speedSum.setSpdLt140(DataUtils.toInt(checkin.getProperty("less_than_140km")) + speedSum.getSpdLt140());
		speedSum.setSpdLt150(DataUtils.toInt(checkin.getProperty("less_than_150km")) + speedSum.getSpdLt150());
		speedSum.setSpdLt160(DataUtils.toInt(checkin.getProperty("less_than_160km")) + speedSum.getSpdLt160());
		return speedSum;
	}
	
	@Override
	protected void addFilter(Query q, String property, Object value) {
		
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
