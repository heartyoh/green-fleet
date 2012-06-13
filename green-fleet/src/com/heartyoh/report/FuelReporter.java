/**
 * 
 */
package com.heartyoh.report;

import java.sql.Types;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;

/**
 * 연료/연비 관련 리포터 
 * 
 * @author jhnam
 */
public class FuelReporter implements IReporter {

	/**
	 * report id
	 */
	private static final String ID = "fuel";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { "vehicle", "effcc" };
	
	/**
	 * select fields
	 */
	private static final int[] FIELD_TYPES = new int[] { Types.VARCHAR, Types.DOUBLE };
	
	/**
	 * parameters
	 */
	private Map<String, Object> params;		
	
	@Override
	public String getId() {
		return ID;
	}
	
	@Override
	public String[] getSelectFields() {
		return SELECT_FILEDS;
	}

	@Override
	public int[] getFieldTypes() {
		return FIELD_TYPES;
	}
	
	@Override
	public void setParameter(Map<String, Object> params) {
		this.params = params;
	}

	@Override
	public List<Map<String, Object>> report() throws Exception {
		return this.averagefuelEffcc();
	}
	
	/**
	 * 연비 Top 5
	 * 
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	private List<Map<String, Object>> averagefuelEffcc() throws Exception {
		
		List<Map<String, Object>> results = new ArrayList<Map<String, Object>>();
		StringBuffer sql = new StringBuffer();
		sql.append("select a.vehicle, case when a.count = 0 then 0 else (a.total / a.count) end effcc ");
		sql.append("from (");
		sql.append("select vehicle, sum(effcc) as total, count(effcc) as count from vehicle_run_sum where company = :company and year = :year group by vehicle");
		sql.append(") a");
		
		Map<String, Object> paramMap = DataUtils.newMap("company", this.params.get("company"));
		int year = paramMap.containsKey("year") ? DataUtils.toInt(paramMap.get("year")) : Calendar.getInstance().get(Calendar.YEAR);
		paramMap.put("year", year);
		List<Map> items = DatasourceUtils.selectBySql(sql.toString(), paramMap);
		for(Map item : items) {
			results.add((Map<String, Object>)item);
		}
		return results;
	}

}
