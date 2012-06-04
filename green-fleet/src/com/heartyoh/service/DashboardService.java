package com.heartyoh.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Dml;
import org.dbist.dml.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.datastore.Key;
import com.heartyoh.model.ConsumableCode;
import com.heartyoh.model.Vehicle;
import com.heartyoh.util.ConnectionManager;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.GreenFleetConstant;
import com.heartyoh.util.SessionUtils;

/**
 * Dashboard를 위한 컨트롤러 
 * 
 * @author jhnam
 */
@Controller
public class DashboardService {
	
	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);
	
	@RequestMapping(value = "/dashboard/health/consumable", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> consumableHealth(HttpServletRequest request, HttpServletResponse response) {
		
		Key companyKey = SessionUtils.getCompanyKey(request);
		List<Object> items = new ArrayList<Object>();
		List<ConsumableCode> consumableCodes = null;
		
		try {
			consumableCodes = DatasourceUtils.findAllConsumableCodes(companyKey.getName()); 				
		
			for(ConsumableCode consmCode : consumableCodes) {
				String consumableItem = consmCode.getName();
				Map<String, Object> item = DataUtils.newMap("consumable", consumableItem);
				List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
				item.put("summary", resultList);
				
				// healthy
				Map<String, Object> filters = 
						DataUtils.newMap(new String[] { "consumable_item", "status" }, 
								new Object[] { consumableItem, GreenFleetConstant.VEHICLE_HEALTH_H } );			
				int healthCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);		
				Map<String, Object> result1 = 
						DataUtils.newMap(new String[] { "name", "value" }, 
								new Object[] { GreenFleetConstant.VEHICLE_HEALTH_H, healthCount });
				resultList.add(result1);
				
				// impending
				filters.put("status", GreenFleetConstant.VEHICLE_HEALTH_I);
				int impendingCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);
				Map<String, Object> result2 = 
						DataUtils.newMap(new String[] { "name", "value" }, 
								new Object[] { GreenFleetConstant.VEHICLE_HEALTH_I, impendingCount });
				resultList.add(result2);
				
				// overdue
				filters.put("status", GreenFleetConstant.VEHICLE_HEALTH_O);
				int overdueCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);
				Map<String, Object> result3 = 
						DataUtils.newMap(new String[] { "name", "value" }, 
								new Object[] { GreenFleetConstant.VEHICLE_HEALTH_O, overdueCount });
				resultList.add(result3);
				
				items.add(item);
			}
		} catch(Exception e) {
			logger.error("Failed to get consumable health data!", e);
			return DataUtils.packResultDataset(false, 0, null);
		}
		
		return DataUtils.packResultDataset(true, items.size(), items);
	}
	
	@RequestMapping(value = "/dashboard/health/vehicle", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> vehicleHealths(HttpServletRequest request, HttpServletResponse response) {
		
		// TODO 여기 sql 문으로 로직 변경 필요 
		Key companyKey = SessionUtils.getCompanyKey(request);
		List<Object> items = new ArrayList<Object>();
		
		Map<String, Object> item1 = DataUtils.newMap("name", "health");
		List<Map<String, Object>> healthList = new ArrayList<Map<String, Object>>();
		item1.put("summary", healthList);
		items.add(item1);
		
		Map<String, Object> item2 = DataUtils.newMap("name", "age");
		List<Map<String, Object>> ageList = new ArrayList<Map<String, Object>>();
		item2.put("summary", ageList);
		items.add(item2);
		
		Map<String, Object> item3 = DataUtils.newMap("name", "mileage");
		List<Map<String, Object>> mileageList = new ArrayList<Map<String, Object>>();
		item3.put("summary", mileageList);
		items.add(item3);		
		
		int thisYear = DataUtils.getThisYear();
		
		// 0 : healthy, 1 : impending, 2 : overdue
		int[] healths = new int[] {0, 0, 0};
		// 0 : ~ 1Y, 1 : 1Y ~ 2Y, 2 : 2Y ~ 3Y, 3 : 3Y ~ 5Y, 4 : 5Y ~ 10Y, 5 : 10Y ~
		int[] ages = new int[] {0, 0, 0, 0, 0, 0};
		// 0 : ~ 10K, 1 : 10 ~ 30K, 2 : 30 ~ 50K, 3 : 50 ~ 100K, 4 : 100 ~ 200K, 5 : 200K ~ 
		int[] miles = new int[] {0, 0, 0, 0, 0, 0};
		
		Dml dml = ConnectionManager.getInstance().getDml();
		List<Vehicle> vehicles = null;
		try {
			Query q = new Query();
			q.addFilter("company", companyKey.getName());
			vehicles = dml.selectList(Vehicle.class, q);
		} catch (Exception e) {
			logger.error("Failed to vehicles health summary!", e);
			return DataUtils.newMap("sucess", false);
		}
		
		for(Vehicle vehicle : vehicles) {
			// 1. 건강상태 카운팅 ...
			String healthStatus = vehicle.getHealthStatus();
			this.calcHealthStatusCount(healthStatus, healths);
			
			// 2. 연식 카운팅 ...
			int birthYear = vehicle.getBirthYear();
			this.calcAgeCount(thisYear, birthYear, ages);
			
			// 3. 주행거리 카운팅 ...
			int mileage = (int)vehicle.getTotalDistance();
			this.calcMilesCount(mileage, miles);
		}
		
		this.setResultSetData(healthList, GreenFleetConstant.VEHICLE_HEALTH_H, healths[0]);
		this.setResultSetData(healthList, GreenFleetConstant.VEHICLE_HEALTH_I, healths[1]);
		this.setResultSetData(healthList, GreenFleetConstant.VEHICLE_HEALTH_O, healths[2]);
		
		this.setResultSetData(ageList, "~ 1Y", ages[0]);
		this.setResultSetData(ageList, "1Y ~ 2Y", ages[1]);
		this.setResultSetData(ageList, "2Y ~ 3Y", ages[2]);
		this.setResultSetData(ageList, "3Y ~ 5Y", ages[3]);
		this.setResultSetData(ageList, "5Y ~ 10Y", ages[4]);
		this.setResultSetData(ageList, "10Y ~", ages[5]);
		
		this.setResultSetData(mileageList, "~ 10K", miles[0]);
		this.setResultSetData(mileageList, "10K ~ 30K", miles[1]);
		this.setResultSetData(mileageList, "30K ~ 50K", miles[2]);
		this.setResultSetData(mileageList, "50K ~ 100K", miles[3]);
		this.setResultSetData(mileageList, "100K ~ 200K", miles[4]);
		this.setResultSetData(mileageList, "200K ~", miles[5]);
				
		return DataUtils.packResultDataset(true, items.size(), items);
	}
	
	/**
	 * health status 카운팅 
	 * 
	 * @param healthStatus
	 * @param statusIntArr
	 */
	private void calcHealthStatusCount(String healthStatus, int[] healths) {
		
		if(GreenFleetConstant.VEHICLE_HEALTH_H.equalsIgnoreCase(healthStatus)) {
			healths[0]++;
		} else if(GreenFleetConstant.VEHICLE_HEALTH_I.equalsIgnoreCase(healthStatus)) {
			healths[1]++;
		} else if(GreenFleetConstant.VEHICLE_HEALTH_O.equalsIgnoreCase(healthStatus)) {
			healths[2]++;
		}		
	}
	
	/**
	 * vehicle aging 카운팅
	 * 0 : ~ 1Y, 1 : 1Y ~ 2Y, 2 : 2Y ~ 3Y, 3 : 3Y ~ 5Y, 4 : 5Y ~ 10Y, 5 : 10Y ~
	 * 
	 * @param thisYear
	 * @param birthYear
	 * @param ages
	 */
	private void calcAgeCount(int thisYear, int birthYear, int[] ages) {
		
		int age = thisYear - birthYear;		
		
		if(age < 1) {
			ages[0] = ages[0] + 1;
		} else if(age >= 1 && age <= 2) {
			ages[1] = ages[1] + 1;
		} else if(age > 2 && age <= 3) {
			ages[2] = ages[2] + 1;
		} else if(age > 3 && age <= 5) {
			ages[3] = ages[3] + 1;
		} else if(age > 5 && age <= 10) {
			ages[4] = ages[4] + 1;
		} else if(age > 10) {
			ages[5] = ages[5] + 1;
		}
	}
	
	/**
	 * vehicle mileage 카운팅
	 * 0 : ~ 10K, 1 : 10 ~ 30K, 2 : 30 ~ 50K, 3 : 50 ~ 100K, 4 : 100 ~ 200K, 5 : 200K ~ 
	 * 
	 * @param mileage
	 * @param miles
	 */
	private void calcMilesCount(int mileage, int[] miles) {
        
		if(mileage <= 10000) {
			miles[0] = miles[0] + 1;
		} else if(mileage > 10000 && mileage <= 30000) {
			miles[1] = miles[1] + 1;
		} else if(mileage > 30000 && mileage <= 50000) {
			miles[2] = miles[2] + 1;
		} else if(mileage > 50000 && mileage <= 100000) {
			miles[3] = miles[3] + 1;
		} else if(mileage > 100000 && mileage <= 200000) {
			miles[4] = miles[4] + 1;
		} else if(mileage > 200000) {
			miles[5] = miles[5] + 1;
		}
	}
	
	/**
	 * result set data
	 * 
	 * @param list
	 * @param nameValue
	 * @param countValue
	 */
	private void setResultSetData(List<Map<String, Object>> list, String nameValue, Object countValue) {
		Map<String, Object> healthResult = DataUtils.newMap(new String[] { "name", "value" }, new Object[] { nameValue, countValue });
		list.add(healthResult);		
	}
}
