package com.heartyoh.report;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;

public class EcoReporter extends AbstractReporter {

	/**
	 * report id
	 */
	private static final String ID = "eco";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { "eco_index" };
	/**
	 * parameter names
	 */
	private static final String[] PARAM_NAMES = new String[] { "company",
			"_today" };

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

		// select year, month, format(sum(effcc) / count(company), 2) as effcc,
		// format(sum(consmpt) / count(company), 2) as consmpt from
		// vehicle_run_sum where company='palmvision' and month_date >=
		// '2011-07-01' and month_date <= '2012-06-30' group by year, month

		StringBuffer sql = new StringBuffer();
		sql.append("select ");
		sql.append("year, month, format(sum(eco_index) / count(company), 2) eco_index, format(sum(eco_drv_time) / sum(run_time) * 100 / count(company), 2) eco_driving ");
		sql.append("from ");
		sql.append("vehicle_run_sum ");
		sql.append("where ");
		sql.append("company = :company and month_date >= :fromDate and month_date <= :toDate group by year, month");

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