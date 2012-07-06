/**
 * 
 */
package com.heartyoh.report;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;

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
	private static final String[] PARAM_NAMES = new String[] { "company", "_today", "type" };
	
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
		
		String type = (String)params.get("type");
		
		if(DataUtils.isEmpty(type)) {
			return null;
		} else if("report".equalsIgnoreCase(type) || "effcc_trend".equalsIgnoreCase(type) || "effcc_consmpt".equalsIgnoreCase(type)) {
			return this.effccTrend(params);
		} else if("top5".equalsIgnoreCase(type)) {
			return this.effccTop5(params);
		} else {
			return null;
		}
	}
	
	/**
	 * 연비 Top 5
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	private List<Object> effccTop5(Map<String, Object> params) throws Exception {
		
		String category = params.containsKey("category") ? (String)params.get("category") : "vehicle";
		String table = category + "_run_sum";
		StringBuffer sql = new StringBuffer("select ");
		sql.append("a.").append(category).append(", case when a.count = 0 then 0 else round((a.total / a.count), 2) end effcc ");
		sql.append("from (");
		sql.append("	select ");
		sql.append("		").append(category).append(", sum(effcc) as total, count(effcc) as count ");
		sql.append("	from ");
		sql.append("		").append(table).append(" where company = :company and year = :year group by ").append(category);
		sql.append(") a order by effcc desc limit 0, 5");
		
		Map<String, Object> paramMap = DataUtils.newMap("company", params.get("company"));
		int year = paramMap.containsKey("year") ? DataUtils.toInt(paramMap.get("year")) : Calendar.getInstance().get(Calendar.YEAR);
		paramMap.put("year", year);
		List<?> items = DatasourceUtils.selectBySql(sql.toString(), paramMap);
		return (List<Object>)items;
	}
	
	/**
	 * 연비 추이 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	private List<Object> effccTrend(Map<String, Object> params) throws Exception {
		
		String durationStr = (String)params.get("duration");
		int duration = 12;
		
		if(!DataUtils.isEmpty(durationStr)) {
			duration = Integer.parseInt(durationStr);
		}
		
		Calendar c = Calendar.getInstance();
		String toDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH) + "-28";
		c.add(Calendar.MONTH, -(duration - 1));
		String fromDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH) + "-01";		
		Date fromDate = DataUtils.toDate(fromDateStr, GreenFleetConstant.DEFAULT_DATE_FORMAT);
		Date toDate = DataUtils.toDate(toDateStr, GreenFleetConstant.DEFAULT_DATE_FORMAT);
					
		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("year, month, round(sum(effcc) / count(company), 2) effcc, round(sum(consmpt) / count(company), 2) consmpt, CONCAT(year, '-', month) yearmonth ");
		sql.append("from ");
		sql.append("vehicle_run_sum ");
		sql.append("where ");
		sql.append("company = :company and month_date >= :fromDate and month_date <= :toDate group by year, month");
		
		Map<String, Object> paramMap = DataUtils.newMap("company", params.get("company"));
		paramMap.put("fromDate", fromDate);
		paramMap.put("toDate", toDate);
		List<?> items = DatasourceUtils.selectBySql(sql.toString(), paramMap);
		return (List<Object>)items;	
	}

}
