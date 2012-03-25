package com.heartyoh.service;

import java.util.ArrayList;
import java.util.HashMap;
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
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.CustomUser;
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
	
	@RequestMapping(value = "/dashboard/consumable/health", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> consumableHealth(HttpServletRequest request, HttpServletResponse response) {
		
		Key companyKey = this.getCompanyKey(request);
		List<Object> items = new ArrayList<Object>();
		Iterator<Entity> consumables = DatastoreUtils.findEntities(companyKey, "ConsumableCode", null);
		
		while(consumables.hasNext()) {
			Entity consumable = consumables.next();
			String consumableItem = (String)consumable.getProperty("name");
			Map<String, Object> item = DataUtils.newMap("consumable", consumableItem);
			List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
			item.put("summary", resultList);
			
			Map<String, Object> filters = DataUtils.newMap(new String[] { "consumable_item", "status" }, new Object[] { consumableItem, GreenFleetConstant.VEHICLE_HEALTH_H } );			
			int healthCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);		
			Map<String, Object> result1 = DataUtils.newMap(new String[] { "name", "count" }, new Object[] { GreenFleetConstant.VEHICLE_HEALTH_H, healthCount });
			resultList.add(result1);
			
			filters.put("status", GreenFleetConstant.VEHICLE_HEALTH_I);
			int impendingCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);
			Map<String, Object> result2 = DataUtils.newMap(new String[] { "name", "count" }, new Object[] { GreenFleetConstant.VEHICLE_HEALTH_I, impendingCount });
			resultList.add(result2);
			
			filters.put("status", GreenFleetConstant.VEHICLE_HEALTH_O);
			int overdueCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);
			Map<String, Object> result3 = DataUtils.newMap(new String[] { "name", "count" }, new Object[] { GreenFleetConstant.VEHICLE_HEALTH_O, overdueCount });
			resultList.add(result3);
			
			items.add(item);
		}
		
		return packResultDataset(true, 3, items);
	}
	
	private Key getCompanyKey(HttpServletRequest request) {
		CustomUser user = SessionUtils.currentUser();
		String company = (user != null) ? user.getCompany() : request.getParameter("company");
		return KeyFactory.createKey("Company", company);
	}
	
	private Map<String, Object> packResultDataset(boolean success, int totalCount, Object items) {
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", success);
		result.put("total", totalCount);
		result.put("items", items);		
		return result;
	}	
}
