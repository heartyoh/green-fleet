package com.heartyoh.report;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 *  운행 시간/거리 관련 리포터 
 * 
 */

public class DrivingReporter extends AbstractReporter {

	/**
	 * report id
	 */
	private static final String ID = "driving";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { "run_time", "run_dist" };
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
		return this.runTimeRunDist(params);
	}

	/**
	 * 주행거리 - 주행시간 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	private List<Object> runTimeRunDist(Map<String, Object> params) throws Exception {

		Map<String, Object> paramMap = DataUtils.newMap("company", params.get("company"));
		Date[] fromToDate = this.parseFromToDate(params);
		
		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("	year, month, sum(run_dist) run_dist, sum(run_time) run_time, CONCAT(year, '-', month) yearmonth ");
		sql.append("from ");
		sql.append("	vehicle_run_sum ");
		sql.append("where ");
		sql.append("	company = :company ");

		if(fromToDate != null) {
			sql.append("and month_date >= :fromDate and month_date <= :toDate ");
			paramMap.put("fromDate", fromToDate[0]);
			paramMap.put("toDate", fromToDate[1]);
		} 
		
		sql.append("group by year, month order by month_date");		
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