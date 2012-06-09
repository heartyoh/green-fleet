/**
 * 
 */
package com.heartyoh.util;

import java.util.List;
import java.util.Map;

import org.dbist.dml.Dml;
import org.dbist.dml.Query;

import com.heartyoh.model.Alarm;
import com.heartyoh.model.ConsumableCode;
import com.heartyoh.model.Vehicle;

/**
 * Datasource Utils
 * 
 * @author jhnam
 */
public class DatasourceUtils {

	/**
	 * dml
	 */
	private static Dml dml = ConnectionManager.getInstance().getDml();	
	
	/**
	 * companyKey, vehicleId로 Vehicle을 찾아 리턴
	 * 
	 * @param companyKey
	 * @param id
	 * @return
	 * @throws Exception
	 */
	public static Vehicle findVehicle(String company, String vehicleId) throws Exception {
		Vehicle vehicle = new Vehicle(company, vehicleId);
		return dml.select(vehicle);
	}
	
	/**
	 * company의 모든 vehicle list를 찾아 리턴 
	 * 
	 * @param company
	 * @return
	 * @throws Exception
	 */
	public static List<Vehicle> findAllVehicles(String company) throws Exception {
		Query q = new Query();
		q.addFilter("company", company);
		List<Vehicle> vehicles = dml.selectList(Vehicle.class, q);
		return vehicles;
	}
	
	/**
	 * update vehicle
	 * 
	 * @param vehicle
	 * @throws Exception
	 */
	public static void updateVehicle(Vehicle vehicle) throws Exception {
		vehicle.beforeUpdate();
		dml.update(vehicle);
	}
	
	/**
	 * terminalId로 부터 매핑된 vehicleId, driverId를 찾아 리턴 
	 * 
	 * @param company
	 * @param terminalId
	 * @return 0'th index : vehicle_id, 1'th index : driver_id
	 * @throws Exception
	 */
	public static String[] findVehicleDriverId(String company, String terminalId) throws Exception {
		String sql = "select id, driver_id from vehicle where id = (select vehicle_id from terminal where company = :company and id = :terminal_id)";
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("terminal_id", terminalId);
		Map<?, ?> data = dml.selectBySql(sql, params, Map.class);
		
		if(data == null || data.size() == 0)
			return new String[] {"", ""};
		else
			return new String[] { (String)data.get("id"), (String)data.get("driver_id") };
	}
	
	/**
	 * consumable code list를 모두 조회 
	 * 
	 * @param company
	 * @return
	 * @throws Exception
	 */
	public static List<ConsumableCode> findAllConsumableCodes(String company) throws Exception {
		Query q = new Query();
		q.addFilter("company", company);
		List<ConsumableCode> consumbaleCodes = dml.selectList(ConsumableCode.class, q);
		return consumbaleCodes;
	}
	
	/**
	 * company, alarmName으로 alarm 조회 
	 * 
	 * @param company
	 * @param alarmName
	 * @return
	 * @throws Exception
	 */
	public static Alarm findAlarm(String company, String alarmName) throws Exception {
		Alarm alarm = new Alarm(company, alarmName);
		return dml.select(alarm);		
	}
	
	/**
	 * company, vehicleId와 현재 위치, 이전 위치로 검색하여 매칭되는 알람을 조회
	 * 
	 * @param company
	 * @param vehicleId
	 * @param currentLat
	 * @param currentLng
	 * @param prevLat
	 * @param prevLng
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	public static List<Map> findAlarmLocation(String company, String vehicleId, float currentLat, float currentLng, float prevLat, float prevLng) throws Exception {
		
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("vehicle_id", vehicleId);
		params.put("current_lat", currentLat);
		params.put("current_lng", currentLng);
		params.put("prev_lat", prevLat);
		params.put("prev_lng", prevLng);
		return dml.selectListBySqlPath("com/heartyoh/util/LbaQuery.sql", params, Map.class, 0, 0);
	}
	
}
