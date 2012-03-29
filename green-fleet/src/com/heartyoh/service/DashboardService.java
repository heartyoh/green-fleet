package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.heartyoh.util.DataUtils;
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
	
	@RequestMapping(value = "/dashboard/health/consumable", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> consumableHealth(HttpServletRequest request, HttpServletResponse response) {
		
		Key companyKey = SessionUtils.getCompanyKey(request);
		List<Object> items = new ArrayList<Object>();
		Iterator<Entity> consumables = DatastoreUtils.findEntities(companyKey, "ConsumableCode", null);
		
		while(consumables.hasNext()) {
			Entity consumable = consumables.next();
			String consumableItem = (String)consumable.getProperty("name");
			Map<String, Object> item = DataUtils.newMap("consumable", consumableItem);
			List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
			item.put("summary", resultList);
			
			// healthy
			Map<String, Object> filters = DataUtils.newMap(new String[] { "consumable_item", "status" }, new Object[] { consumableItem, GreenFleetConstant.VEHICLE_HEALTH_H } );			
			int healthCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);		
			Map<String, Object> result1 = DataUtils.newMap(new String[] { "name", "value" }, new Object[] { GreenFleetConstant.VEHICLE_HEALTH_H, healthCount });
			resultList.add(result1);
			
			// impending
			filters.put("status", GreenFleetConstant.VEHICLE_HEALTH_I);
			int impendingCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);
			Map<String, Object> result2 = DataUtils.newMap(new String[] { "name", "value" }, new Object[] { GreenFleetConstant.VEHICLE_HEALTH_I, impendingCount });
			resultList.add(result2);
			
			// overdue
			filters.put("status", GreenFleetConstant.VEHICLE_HEALTH_O);
			int overdueCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);
			Map<String, Object> result3 = DataUtils.newMap(new String[] { "name", "value" }, new Object[] { GreenFleetConstant.VEHICLE_HEALTH_O, overdueCount });
			resultList.add(result3);
			
			items.add(item);
		}
		
		return DataUtils.packResultDataset(true, items.size(), items);
	}
	
	@RequestMapping(value = "/dashboard/health/vehicle", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> vehicleHealths(HttpServletRequest request, HttpServletResponse response) {
		
		Key companyKey = SessionUtils.getCompanyKey(request);
		List<Object> items = new ArrayList<Object>();
		
		/*Map<String, Object> item1 = DataUtils.newMap("name", "health");
		List<Map<String, Object>> resultList = this.vehicleHealth(companyKey);
		item1.put("summary", resultList);
		items.add(item1);*/
		
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
		
		Iterator<Entity> vehicles = DatastoreUtils.findEntities(companyKey, "Vehicle", null);
		while(vehicles.hasNext()) {
			Entity vehicle = vehicles.next();
			
			// 1. 건강상태 카운팅 ...
			String healthStatus = (String)vehicle.getProperty("health_status");
			this.calcHealthStatusCount(healthStatus, healths);
			
			// 2. 연식 카운팅 ...
			int birthYear = (int)DataUtils.toFloat(vehicle.getProperty("birth_year"));
			this.calcAgeCount(thisYear, birthYear, ages);
			
			// 3. 주행거리 카운팅 ...
			int mileage = (int)DataUtils.toFloat(vehicle.getProperty("total_distance"));
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
	
	/*private List<Map<String, Object>> vehicleHealth(Key companyKey) {
		
		// 1. vehicle health status 
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
		
		// 1-1. healthy
		Map<String, Object> filters = DataUtils.newMap("health_status", GreenFleetConstant.VEHICLE_HEALTH_H);
		int healthCount = DatastoreUtils.totalCount(companyKey, "Vehicle", filters);
		Map<String, Object> result1 = DataUtils.newMap(new String[] { "name", "count" }, new Object[] { GreenFleetConstant.VEHICLE_HEALTH_H, healthCount });
		resultList.add(result1);
		
		// 1-2. impending
		filters.put("health_status", GreenFleetConstant.VEHICLE_HEALTH_I);
		int impendingCount = DatastoreUtils.totalCount(companyKey, "Vehicle", filters);
		Map<String, Object> result2 = DataUtils.newMap(new String[] { "name", "count" }, new Object[] { GreenFleetConstant.VEHICLE_HEALTH_I, impendingCount });
		resultList.add(result2);
		
		// 1-3. overdue
		filters.put("health_status", GreenFleetConstant.VEHICLE_HEALTH_O);
		int overdueCount = DatastoreUtils.totalCount(companyKey, "Vehicle", filters);
		Map<String, Object> result3 = DataUtils.newMap(new String[] { "name", "count" }, new Object[] { GreenFleetConstant.VEHICLE_HEALTH_O, overdueCount });
		resultList.add(result3);
		
		return resultList;
	}*/
}
