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
		} else if("effcc_trend".equalsIgnoreCase(type)) {
			return this.effccTrend(params);
		} else if("effcc_consmpt".equalsIgnoreCase(type)) {
			return this.effccConsmpt(params);
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
		
		// category - driver || vehicle
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
		
		Map<String, Object> paramMap = DataUtils.newMap("company", params.get("company"));
		Date fromToDate[] = this.parseFromToDate(params);
		
		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("	year, month, round(sum(effcc) / count(company), 2) effcc, ");
		sql.append("	round(sum(consmpt) / count(company), 2) consmpt, ");
		sql.append("	CONCAT(year, '-', month) yearmonth ");
		sql.append("from ");
		sql.append("	vehicle_run_sum ");
		sql.append("where ");
		sql.append("	company = :company ");
		
		if(fromToDate != null) {
			sql.append("and month_date >= :fromDate and month_date <= :toDate ");
			paramMap.put("fromDate", fromToDate[0]);
			paramMap.put("toDate", fromToDate[1]);
		} 
		
		sql.append("group by year, month");
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
	private List<Object> effccConsmpt(Map<String, Object> params) throws Exception {
		
		Map<String, Object> paramMap = DataUtils.newMap("company", params.get("company"));
		Date fromToDate[] = this.parseFromToDate(params);
		
		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("	year, month, round(sum(effcc) / count(company), 2) effcc, ");
		sql.append("	round(sum(consmpt) / count(company), 2) consmpt, ");
		sql.append("	CONCAT(year, '-', month) yearmonth ");
		sql.append("from ");
		sql.append("	vehicle_run_sum ");
		sql.append("where ");
		sql.append("	company = :company ");
		
		if(fromToDate != null) {
			sql.append("and month_date >= :fromDate and month_date <= :toDate ");
			paramMap.put("fromDate", fromToDate[0]);
			paramMap.put("toDate", fromToDate[1]);
		} 
		
		sql.append("group by vehicle, year, month");
		List<?> items = DatasourceUtils.selectBySql(sql.toString(), paramMap);
		return (List<Object>)items;
	}	
	
	/**
	 * 파라미터로 부터 from date, to date 파싱하여 리턴 
	 *  
	 * @param params
	 * @return
	 * @throws Exception
	 */
	private Date[] parseFromToDate(Map<String, Object> params) throws Exception {
		
		String durationStr = (String)params.get("duration");
		if(!DataUtils.isEmpty(durationStr) && "-1".equalsIgnoreCase(durationStr)) {
			return null;
		}
		
		String fromDateStr = null;
		String toDateStr = null;
		
		if(!DataUtils.isEmpty(params.get("from_year"))) {
			String fromYearStr = (String)params.get("from_year");
			String fromMonthStr = (String)params.get("from_month");
			fromDateStr = fromYearStr + "-" + fromMonthStr + "-01";
		}
		
		if(!DataUtils.isEmpty(params.get("to_year"))) {
			String toYearStr = (String)params.get("to_year");
			String toMonthStr = (String)params.get("to_month");
			toDateStr = toYearStr + "-" + toMonthStr + "-28";
		}
		
		if(DataUtils.isEmpty(fromDateStr) && DataUtils.isEmpty(toDateStr)) {
			int duration = DataUtils.isEmpty(durationStr) ? 12 : Integer.parseInt(durationStr);
			Calendar c = Calendar.getInstance();
			toDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH) + "-28";
			c.add(Calendar.MONTH, -(duration - 1));
			fromDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH) + "-01";
			
		} else if(!DataUtils.isEmpty(fromDateStr) && DataUtils.isEmpty(toDateStr)) {
			Calendar c = Calendar.getInstance();
			toDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH) + "-28";
			
		} else if(DataUtils.isEmpty(fromDateStr) && !DataUtils.isEmpty(toDateStr)) {
			int duration = DataUtils.isEmpty(durationStr) ? 12 : Integer.parseInt(durationStr);
			Calendar c = Calendar.getInstance();
			c.add(Calendar.MONTH, -(duration - 1));
			fromDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH) + "-01";
		}
		
		Date fromToDate[] = new Date[2];
		fromToDate[0] = fromDateStr == null ? null : DataUtils.toDate(fromDateStr, GreenFleetConstant.DEFAULT_DATE_FORMAT);
		fromToDate[1] = toDateStr == null ? null : DataUtils.toDate(toDateStr, GreenFleetConstant.DEFAULT_DATE_FORMAT);
		return fromToDate;
	}

}
