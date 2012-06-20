/**
 * 
 */
package com.heartyoh.service;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.heartyoh.model.Vehicle;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * DataInitialize Service
 * 
 * @author jhnam
 */
@Controller
public class CompanyInitializeService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(CompanyInitializeService.class);
	
	@RequestMapping(value = "/data_gen/init_company", method = RequestMethod.POST)
	public @ResponseBody	
	String initCompany(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		// String newCompany = request.getParameter("new_company");
		
		// * 기준정보 
		// 1. company 생성 
		// 2. code 생성 
		// 3. consumable code 생성
		// 4. driver 생성
		// 5. driver group 생성 
		// 6. driver relation 생성 
		// 7. vehicle 생성 
		// 8. vehicle group 생성 
		// 9. vehicle relation 생성 
		// 10. terminal 생성 
		
		// * 런타임 정보
		// 1. Track
		// 2. Incident
		// 3. CheckinData
		// 4. 차량별 운행현황 정보 
		// 5. 운전자별 운행현황 정보 
		// 6. 소모품 데이터 
		
		return null;
	}
	
	/**
	 * checkin data를 generate
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/data_gen/checkin", method = RequestMethod.GET)
	public @ResponseBody
	String generateCheckinData(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = DataUtils.getCompany(request);
		if(company == null)
			company = "palmvision";
		
		String yearMonthStr = request.getParameter("year_month");
		String fromDateStr = yearMonthStr + "-01";
		String toDateStr = yearMonthStr + (yearMonthStr.endsWith("2") ? "-28" : "-30");
		Date fromDate = DataUtils.toDate(fromDateStr, GreenFleetConstant.DEFAULT_DATE_FORMAT);
		Date toDate = DataUtils.toDate(toDateStr, GreenFleetConstant.DEFAULT_DATE_FORMAT);
		Date currentDate = fromDate;
		CheckinDataService checkinService = new CheckinDataService();
		List<Vehicle> vehicles = DatasourceUtils.findAllVehicles(company);
		
		try {
			while(DataUtils.between(currentDate, fromDate, toDate)) {
				for(Vehicle vehicle : vehicles) {
					String currentDateStr = 
							DataUtils.dateToString(currentDate, GreenFleetConstant.DEFAULT_DATE_FORMAT);
					Map<String, Object> data = this.randomGenCheckinData(currentDateStr, vehicle);
					String result = checkinService.create(data);
					logger.info("Vehicle [" + vehicle.getId() + "] Date [" + currentDateStr + "] - Checkin Service (" + result + ")");
				}
				currentDate = DataUtils.addDate(currentDate, 1);
			}
		} catch(Exception e) {
			logger.error("Failed to save checkin data!", e);
			return "{success : false, msg : " + e.getMessage() + "}";
		}
		
		return "{success : true, msg : success}";
	}
	
	/**
	 * Random하게 checkin 데이터를 생성한다. 
	 * 
	 * @param dateStr
	 * @param vehicle
	 * @return
	 * @throws Exception
	 */
	private Map<String, Object> randomGenCheckinData(String dateStr, Vehicle vehicle) throws Exception {
		
		String dateTimeStr = dateStr + " 14:50:00";
		String engineStartTimeStr = dateStr + " 09:30:00";
		String engineEndTimeStr = dateStr + " 14:30:00";
		String terminalId = "PT-" + vehicle.getId().substring(3);
		
		Map<String, Object> checkinData = DataUtils.newMap("company", vehicle.getCompany());
		checkinData.put("vehicle_id", vehicle.getId());
		checkinData.put("engine_start_time", engineStartTimeStr);
		checkinData.put("engine_end_time", engineEndTimeStr);
		checkinData.put("datetime", dateTimeStr);		
		checkinData.put("terminal_id", terminalId);
		checkinData.put("driver_id", vehicle.getDriverId());
		
		Random rand = new Random(System.currentTimeMillis());
		String distance = "" + (175 + rand.nextInt(35));
		checkinData.put("distance", distance);
		String runningTime = "" + (250 + rand.nextInt(35));
		checkinData.put("running_time", runningTime);
		String idleTime = "" + (25 + rand.nextInt(15));
		checkinData.put("idle_time", idleTime);
		String ecoDrvTime = "" + (25 + rand.nextInt(15));
		checkinData.put("eco_driving_time", ecoDrvTime);
		String overSpeedTime = "" + (20 + rand.nextInt(13));
		checkinData.put("over_speed_time", overSpeedTime);
		String averageSpeed = "" + (18 + rand.nextInt(20));
		checkinData.put("average_speed", averageSpeed);
		String maxSpeed = "" + (120 + rand.nextInt(30));
		checkinData.put("max_speed", maxSpeed);
		String fuelConsumption = "" + (10 + rand.nextInt(8));
		checkinData.put("fuel_consumption", fuelConsumption);
		String fuelEfficiency = "" + (8 + rand.nextInt(7));
		checkinData.put("fuel_efficiency", fuelEfficiency);
		String suddenAccelCount = "" + (17 + rand.nextInt(15));
		checkinData.put("sudden_accel_count", suddenAccelCount);
		String suddenBrakeCount = "" + (17 + rand.nextInt(15));
		checkinData.put("sudden_brake_count", suddenBrakeCount);
		String co2Emissions = "" + (79 + rand.nextInt(13));
		checkinData.put("co2_emissions", co2Emissions);
		String maxCoolingWaterTemp = "" + (30 + rand.nextInt(23));
		checkinData.put("max_cooling_water_temp", maxCoolingWaterTemp);
		String avgBatteryVolt = "" + (34 + rand.nextInt(21));
		checkinData.put("avg_battery_volt", avgBatteryVolt);
		
		for(int i = 1 ; i <= 16 ; i++) {
			checkinData.put("less_than_" + i + "0km", "" + rand.nextInt(40));
		}
		
		return checkinData;
	}
	
	/**
	 * checkin service 호출 
	 * 
	 * @param data
	 * @return
	 * @throws Exception
	 */
	/*private String invokeCheckin(String urlStr, Map<String, Object> data) throws Exception {
		
		URL url = new URL(urlStr);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setDoOutput(true);
        connection.setRequestMethod("POST");
        connection.setRequestProperty("use_intranet", "true");

        OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream());
        StringBuffer buffer = new StringBuffer();
        
        int idx = 0;
        Iterator<String> keyIter = data.keySet().iterator();
        
        while(keyIter.hasNext()) {
        	String key = keyIter.next();
        	String value = DataUtils.toString(data.get(key));
        	
        	if(!key.endsWith("_time"))
        		buffer.append(idx++ > 0 ? "&" : "").append(key).append("=").append(value);
        }
        
        String params = buffer.toString();
        writer.write(params);
        writer.close();
        return connection.getResponseMessage();
	}*/
}
