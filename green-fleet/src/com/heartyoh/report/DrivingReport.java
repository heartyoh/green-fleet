package com.heartyoh.report;

import java.util.ArrayList;
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

public class DrivingReport extends AbstractReporter {

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
		return this.averagefuelEffcc(params);
	}

	
	private List<Object> averagefuelEffcc(Map<String, Object> params)
			throws Exception {

		String durationStr = (String) params.get("duration");
		int duration = 12;

		if (!DataUtils.isEmpty(durationStr)) {
			duration = Integer.parseInt(durationStr);
		}

		Calendar c = Calendar.getInstance();
		String toDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH)
				+ "-28";
		c.add(Calendar.MONTH, -(duration - 7));
		String fromDateStr = c.get(Calendar.YEAR) + "-" + c.get(Calendar.MONTH)
				+ "-01";
		Date fromDate = DataUtils.toDate(fromDateStr,
				GreenFleetConstant.DEFAULT_DATE_FORMAT);
		Date toDate = DataUtils.toDate(toDateStr,
				GreenFleetConstant.DEFAULT_DATE_FORMAT);

		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("year, month, sum(run_dist) run_dist, sum(run_time) run_time, CONCAT(year, '-', month) yearmonth ");
		sql.append("from ");
		sql.append("vehicle_run_sum ");
		sql.append("where ");
		sql.append("company = :company and month_date >= :fromDate and month_date <= :toDate group by year, month order by month_date");

		Map<String, Object> paramMap = DataUtils.newMap("company",
				params.get("company"));
		paramMap.put("fromDate", fromDate);
		paramMap.put("toDate", toDate);
		List<?> items = DatasourceUtils.selectBySql(sql.toString(), paramMap);

		List<Object> results = new ArrayList<Object>();
		for (Object item : items) {
			results.add(item);
		}

		return results;

	}

}