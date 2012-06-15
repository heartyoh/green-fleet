/**
 * 
 */
package com.heartyoh.report;

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
public class FuelReporter extends AbstractReporter {

	/**
	 * report id
	 */
	private static final String ID = "fuel";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { "vehicle", "effcc" };	
	/**
	 * parameter names
	 */
	private static final String[] PARAM_NAMES = new String[] { "company", "_today" };
	
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
		return this.averagefuelEffcc(params);
	}
	
	/**
	 * 연비 Top 5
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	private List<Object> averagefuelEffcc(Map<String, Object> params) throws Exception {
				
		StringBuffer sql = new StringBuffer();
		sql.append("select a.vehicle, case when a.count = 0 then 0 else round((a.total / a.count), 2) end effcc ");
		sql.append("from (");
		sql.append("select vehicle, sum(effcc) as total, count(effcc) as count from vehicle_run_sum where company = :company and year = :year group by vehicle");
		sql.append(") a");
		
		Map<String, Object> paramMap = DataUtils.newMap("company", params.get("company"));
		int year = paramMap.containsKey("year") ? DataUtils.toInt(paramMap.get("year")) : Calendar.getInstance().get(Calendar.YEAR);
		paramMap.put("year", year);
		List<?> items = DatasourceUtils.selectBySql(sql.toString(), paramMap);
		
		List<Object> results = new ArrayList<Object>();
		for(Object item : items) {
			results.add(item);
		}
		return results;
	}

}
