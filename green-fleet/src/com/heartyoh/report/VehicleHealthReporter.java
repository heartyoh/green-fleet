/**
 * 
 */
package com.heartyoh.report;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.ConsumableCode;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * @author jhnam
 */
public class VehicleHealthReporter extends AbstractReporter {

	/**
	 * report id
	 */
	private static final String ID = "vehicle_health";
	/**
	 * input parameter names
	 */
	private static final String[] INPUT_NAMES = new String[] {
		"company", "health_type"
	};	
	/**
	 * output field names
	 */
	private static final String[] OUTPUT_NAMES = new String[] { "name", "summary" };
	/**
	 * 차량 상태 
	 */
	private static final String[] VEHICLE_STATUS = new String[] { 
		GreenFleetConstant.VEHICLE_HEALTH_H,
		GreenFleetConstant.VEHICLE_HEALTH_I,
		GreenFleetConstant.VEHICLE_HEALTH_O
	};
	
	@Override
	public String getId() {
		return ID;
	}
	
	@Override
	public String[] getOutputNames() {
		return OUTPUT_NAMES;
	}
	
	@Override
	public String[] getInputNames() {
		return INPUT_NAMES;
	}	

	@Override
	public List<Object> report(Map<String, Object> params) throws Exception {
		
		String healthType = params.containsKey("health_type") ? 
							(String)params.get("health_type") : "all";
		
		if("consumable_health".equalsIgnoreCase(healthType))
			return this.consumableHealth(params);
		
		List<Object> results = new ArrayList<Object>();
		
		if("age".equalsIgnoreCase(healthType) || "all".equalsIgnoreCase(healthType)) {
			Map<String, Object> items = DataUtils.newMap("name", "age");
			List<?> ageList = this.age(params);
			items.put("summary", ageList);
			results.add(items);			
		} 
		
		if("health".equalsIgnoreCase(healthType) || "all".equalsIgnoreCase(healthType)) {
			Map<String, Object> items = DataUtils.newMap("name", "health");
			List<?> healthList = this.health(params);
			items.put("summary", healthList);
			results.add(items);			
		}
		
		if("mileage".equalsIgnoreCase(healthType) || "all".equalsIgnoreCase(healthType)) {
			Map<String, Object> items = DataUtils.newMap("name", "mileage");
			List<?> mileageList = this.mileage(params);
			items.put("summary", mileageList);
			results.add(items);			
		}
		
		if("runtime".equalsIgnoreCase(healthType) || "all".equalsIgnoreCase(healthType)) {
			Map<String, Object> items = DataUtils.newMap("name", "runtime");
			List<?> runtimeList = this.runtime(params);
			items.put("summary", runtimeList);
			results.add(items);			
		}		
		
		return results;
	}

	/**
	 * 자동차 주행거리 서머리 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	private List<?> mileage(Map<String, Object> params) throws Exception {
		StringBuffer sql = new StringBuffer();
		sql.append("select name, value from ( ");
		sql.append("select name, count(id) as value from ");
		sql.append("(select id,  "); 
		sql.append("	case ");
		sql.append("		when total_distance >= 0 and total_distance <= 10000 ");
		sql.append("		then ' 0~10K' ");
		sql.append("		when total_distance > 10000 and total_distance <= 30000 ");
		sql.append("		then ' 10~30K' ");
		sql.append("		when total_distance > 30000 and total_distance <= 50000 ");
		sql.append("		then ' 30~50K' ");
		sql.append("		when total_distance > 50000 and total_distance <= 100000 ");
		sql.append("		then ' 50~100K' ");
		sql.append("		when total_distance > 100000 and total_distance < 200000 ");
		sql.append("		then '100~200K' ");
		sql.append("		else '200k~' ");
		sql.append("	end name ");
		sql.append("from vehicle where company = 'palmvision') a group by a.name ");
		sql.append(") t group by name asc");
		Map<String, Object> sqlParams = DataUtils.newMap("company", params.get("company"));
		return DatasourceUtils.selectBySql(sql.toString(), sqlParams);
	}
	
	/**
	 * 자동차 주행시간 서머리 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	private List<?> runtime(Map<String, Object> params) throws Exception {
		StringBuffer sql = new StringBuffer();
		sql.append("select name, value from ( ");
		sql.append("select name, count(id) as value from ");
		sql.append("(select id,  "); 
		sql.append("	case ");
		sql.append("		when total_run_time >= 0 and total_run_time <= 4500 ");
		sql.append("		then ' 0~4.5K' ");
		sql.append("		when total_run_time > 4500 and total_run_time <= 9000 ");
		sql.append("		then ' 4.5~9K' ");
		sql.append("		when total_run_time > 9000 and total_run_time <= 18000 ");
		sql.append("		then ' 9~18K' ");
		sql.append("		when total_run_time > 18000 and total_run_time <= 27000 ");
		sql.append("		then ' 18~27K' ");
		sql.append("		when total_run_time > 27000 and total_run_time < 45000 ");
		sql.append("		then '27~45K' ");
		sql.append("		else '45k~' ");
		sql.append("	end name ");
		sql.append("from vehicle where company = 'palmvision') a group by a.name ");
		sql.append(") t group by name asc");
		Map<String, Object> sqlParams = DataUtils.newMap("company", params.get("company"));
		return DatasourceUtils.selectBySql(sql.toString(), sqlParams);
	}	
	
	/**
	 * 차량 연수  
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	private List<?> age(Map<String, Object> params) throws Exception {		
		StringBuffer sql = new StringBuffer();
		sql.append("select name, count(value) value from (");
		sql.append("	select ");
		sql.append("		case ");
		sql.append("			when a.age >= 0 and a.age <= 1");
		sql.append("			then '0~1Y'");
		sql.append("			when a.age > 1 and a.age <= 2");
		sql.append("			then '1~2Y'");
		sql.append("			when a.age > 2 and a.age <= 3");
		sql.append("			then '2~3Y'");
		sql.append("			when a.age > 3 and a.age <= 5");
		sql.append("			then '3~5Y'");
		sql.append("			when a.age > 5 and a.age < 10");
		sql.append("			then '5~10Y'");
		sql.append("			else '10Y~'");
		sql.append("		end name, value ");
		sql.append("	from");
		sql.append("		(select (YEAR(CURDATE()) - birth_year) age, count(id) value from vehicle where company = :company group by birth_year) a");
		sql.append(") t group by t.name asc");
		Map<String, Object> sqlParams = DataUtils.newMap("company", params.get("company"));
		return DatasourceUtils.selectBySql(sql.toString(), sqlParams);
	}
	
	/**
	 * 차량 건강상태  
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	private List<?> health(Map<String, Object> params) throws Exception {		
		String sql = "select name, value from (select health_status name, count(id) value from vehicle where company = :company group by health_status) a";
		Map<String, Object> sqlParams = DataUtils.newMap("company", params.get("company"));		
		List<Map> items = DatasourceUtils.selectBySql(sql.toString(), sqlParams);
		
		if(items.size() < 3)
			this.adjustHealth(items);
		
		return items;
	}
	
	@SuppressWarnings("rawtypes")
	private void adjustHealth(List<Map> items) {
		
		boolean healthExist = false;
		boolean impendExist = false;
		boolean overdueExist = false;
		
		for(Object obj : items) {
			Map item = (Map)obj;
			String status = (String)item.get("name");
			
			if(GreenFleetConstant.VEHICLE_HEALTH_H.equalsIgnoreCase(status)) {
				healthExist = true;
			} else if(GreenFleetConstant.VEHICLE_HEALTH_I.equalsIgnoreCase(status)) {
				impendExist = true;
			} else if(GreenFleetConstant.VEHICLE_HEALTH_O.equalsIgnoreCase(status)) {
				overdueExist = true;
			}
		}
		
		if(!healthExist)
			this.addEmptyHealth(items, GreenFleetConstant.VEHICLE_HEALTH_H);
		
		if(!impendExist)
			this.addEmptyHealth(items, GreenFleetConstant.VEHICLE_HEALTH_I);
		
		if(!overdueExist)
			this.addEmptyHealth(items, GreenFleetConstant.VEHICLE_HEALTH_O);
	}
	
	/**
	 * 
	 * @param items
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	private void addEmptyHealth(List<Map> items, String status) {
		Map item = DataUtils.newMap("name", status);
		item.put("value", 0);
		items.add(item);
	}
		
	/**
	 * 소모품 건강상태 조회 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	private List<Object> consumableHealth(Map<String, Object> params) throws Exception {
		
		String company = (String)params.get("company");
		Key companyKey = KeyFactory.createKey("Company", company);
		List<Object> items = new ArrayList<Object>();
		List<ConsumableCode> consmCodes = DatasourceUtils.findAllConsumableCodes(company); 				
	
		for(ConsumableCode consmCode : consmCodes) {
			String consumableItem = consmCode.getName();
			Map<String, Object> item = DataUtils.newMap("consumable", consumableItem);
			List<Object> resultList = new ArrayList<Object>();
			item.put("summary", resultList);

			// 상태별로 소모품 개수 조회 
			for(String vehicleStatus : VEHICLE_STATUS) {
				resultList.add(this.getConsumableCountByStatus(companyKey, consumableItem, vehicleStatus));
			}
			
			items.add(item);
		}
		
		return items;
	}
	
	/**
	 * 소모품 별, 건강상태에 따른 소모품 개수를 조회  
	 * 
	 * @param companyKey
	 * @param consumableItem
	 * @param status
	 * @return
	 */
	private Map<String, Object> getConsumableCountByStatus(Key companyKey, String consumableItem, String status) {
		
		Map<String, Object> filters = DataUtils.newMap("consumable_item", consumableItem);
		filters.put("status", status);
		int healthCount = DatastoreUtils.totalCount(companyKey, "VehicleConsumable", filters);		
		Map<String, Object> result = DataUtils.newMap("name", status);
		result.put("value", healthCount);
		return result;		
	}
}
