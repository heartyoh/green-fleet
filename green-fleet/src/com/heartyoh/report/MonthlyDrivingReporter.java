/**
 * 
 */
package com.heartyoh.report;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * 월간 주행 리포트 
 * 
 * @author jhnam
 */
public class MonthlyDrivingReporter extends AbstractReporter {

	/**
	 * report id
	 */
	private static final String ID = "monthly_driving_log";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { 
		"vehicle_id", 
		"reg_no",
		"driver_id",
		"driver_name",
		"run_time", 
		"run_dist", 
		"consmpt",
		"effcc" };
	
	/**
	 * parameter names
	 */
	private static final String[] PARAM_NAMES = new String[] { "company", "duration" };
	
	@Override
	public String getId() {
		return ID;
	}
	
	@Override
	public String[] getOutputNames() {
		return SELECT_FILEDS;
	}
	
	@Override
	public String[] getInputNames() {
		return PARAM_NAMES;
	}	

	@Override
	public List<Object> report(Map<String, Object> params) throws Exception {
		
		String company = (String)params.get("company");
		String durationStr = (String)params.get("duration");
		int duration = 6;
		
		if(!DataUtils.isEmpty(durationStr)) {
			duration = Integer.parseInt(durationStr);
		} 
		
		Calendar c = Calendar.getInstance();
		String toDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH) + "-28";
		c.add(Calendar.MONTH, -(duration - 1));
		String fromDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH) + "-01";		
		Date fromDate = DataUtils.toDate(fromDateStr, GreenFleetConstant.DEFAULT_DATE_FORMAT);
		Date toDate = DataUtils.toDate(toDateStr, GreenFleetConstant.DEFAULT_DATE_FORMAT);
		List<Object> results = new ArrayList<Object>();
		Map<String, Object> totalItems = new HashMap<String, Object>();
		
		// 1. driving
		@SuppressWarnings("rawtypes")
		List<Map> drivingList = this.getMonthlyDriving(company, fromDate, toDate);
		totalItems.put("driving", drivingList);
		
		// 2. consumable		
		List<Object> consumableList = this.getMonthlyConsumable(company, fromDate, toDate);
		totalItems.put("consumable", consumableList);
		
		// 3. maint
		@SuppressWarnings("rawtypes")
		List<Map> maintList = this.getMonthlyMaint(company, fromDate, toDate);
		totalItems.put("maint", maintList);
		results.add(totalItems);
		return results;
	}
	
	@SuppressWarnings("rawtypes")
	private List<Map> getMonthlyDriving(String company, Date fromDate, Date toDate) throws Exception {
		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("year, month, sum(run_dist) run_dist, sum(run_time) run_time, sum(consmpt) consmpt, sum(effcc) effcc ");
		sql.append("from ");
		sql.append("vehicle_run_sum "); 
		sql.append("where ");
		sql.append("company = :company and month_date >= :from_date and month_date <= :to_date group by year, month order by month_date");
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("from_date", fromDate);
		params.put("to_date", toDate);
		return DatasourceUtils.selectBySql(sql.toString(), params);
	}
	
	@SuppressWarnings("rawtypes")
	private List<Map> getMonthlyMaint(String company, Date fromDate, Date toDate) throws Exception {		
		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("year, month, sum(mnt_cnt) count ");
		sql.append("from ");
		sql.append("vehicle_run_sum ");
		sql.append("where ");
		sql.append("company = :company and month_date >= :from_date and month_date <= :to_date group by year, month order by month_date");
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("from_date", fromDate);
		params.put("to_date", toDate);
		return DatasourceUtils.selectBySql(sql.toString(), params);		
	}
	
	private List<Object> getMonthlyConsumable(String company, Date fromDate, Date toDate) throws Exception {
		// TODO 
		return new ArrayList<Object>();
	}	
}
