/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.util.DataUtils;

/**
 * @author jhnam
 *
 */

public class DriverRunJdbcService extends JdbcEntityService {
	
	/**
	 * key names
	 */
	private static final String TABLE_NAME = "driver_run_sum";	
	/**
	 * select columns
	 */
	private static String[] SELECT_COLUMNS = new String[] { 
		"driver", "year", "month", "month_str", "run_time", "run_dist", 
		"consmpt", "co2_emss", "effcc", "sud_accel_cnt", "sud_brake_cnt", "eco_drv_time", 
		"ovr_spd_time", "inc_cnt", "spd_lt10", "spd_lt20", "spd_lt30", "spd_lt40", 
		"spd_lt50", "spd_lt60", "spd_lt70", "spd_lt80", "spd_lt90", "spd_lt100", 
		"spd_lt110", "spd_lt120", "spd_lt130", "spd_lt140", "spd_lt150", "spd_lt160" };	
	
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {		
		return null;
	}

	@RequestMapping(value = "/driver_run/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = {"/driver_run", "/m/data/driver_run.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		String company = this.getCompany(request);
		
		int idx = 0;
		Map<Integer, Object> queryParams = new HashMap<Integer, Object>();
		StringBuffer query = new StringBuffer("select *, CONCAT_WS('-', year, month) month_str from driver_run_sum where company = ?");
		queryParams.put(++idx, company);
		
		if(!DataUtils.isEmpty(request.getParameter("from_year")) && !DataUtils.isEmpty(request.getParameter("from_month"))) {
			String fromDate = request.getParameter("from_year") + "-" + request.getParameter("from_month") + "-01";
			query.append(" and month_date >= STR_TO_DATE(?, '%Y-%m-%d')");
			queryParams.put(++idx, fromDate);
		}
		
		if(!DataUtils.isEmpty(request.getParameter("to_year")) && !DataUtils.isEmpty(request.getParameter("to_month"))) {
			String toDate = request.getParameter("to_year") + "-" + request.getParameter("to_month") + "-01";
			query.append(" and month_date <= STR_TO_DATE(?, '%Y-%m-%d')");
			queryParams.put(++idx, toDate);
		}
		
		if(!DataUtils.isEmpty(request.getParameter("driver"))) {
			query.append(" and driver = ?");
			queryParams.put(++idx, request.getParameter("driver"));
		}
		
		if(!DataUtils.isEmpty(request.getParameter("driver_group"))) {
			query.append(" and driver in (select driver_id from driver_relation where company = ? and group_id = ?)");
			queryParams.put(++idx, company);
			queryParams.put(++idx, request.getParameter("driver_group"));
		}
		
		query.append(" order by year asc, month asc, driver asc");
		List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();

		try {
			conn = this.getConnection();			
			pstmt = conn.prepareStatement(query.toString());
			
			for(int i = 1 ; i <= idx ; i++) {
				pstmt.setObject(i, queryParams.get(i));
			}
			
			rs = pstmt.executeQuery();
			String[] select = DataUtils.isEmpty(request.getParameterValues("select")) ? SELECT_COLUMNS : request.getParameterValues("select");
			
			while(rs.next()) {
				Map<String, Object> record = new HashMap<String, Object>();
				
				for(int i = 0 ; i < select.length ; i++) {
					record.put(select[i], rs.getObject(select[i]));
				}
				
				items.add(record);
			}
			
		} catch (Exception e) {
			return this.getResultSet(false, 0, null);
			
		} finally {
			this.closeDB(rs, pstmt, conn);
		}			
		
		return this.getResultSet(true, items.size(), items);
	}
	
	@RequestMapping(value = "/driver_run/speed", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveSpeed(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return this.retrieve(request, response);
	}	
}
