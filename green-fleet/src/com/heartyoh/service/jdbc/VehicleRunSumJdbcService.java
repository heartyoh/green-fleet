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
 * 차량별 운행 정보 서비스
 * 
 * @author jhnam
 */

public class VehicleRunSumJdbcService extends JdbcEntityService {

	/**
	 * key names
	 */
	private static final String TABLE_NAME = "vehicle_run_sum";	
	/**
	 * select columns
	 */
	private static String[] SELECT_COLUMNS = new String[] { 
		"vehicle", "year", "month", "month_str", "run_time", 
		"run_dist", "consmpt", "co2_emss", "effcc", "oos_cnt", 
		"mnt_cnt", "mnt_time" };	
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {
		return null;
	}

	@RequestMapping(value = "/vehicle_run/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = {"/vehicle_run", "/m/data/vehicle_run.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;		
		
		int idx = 0;
		Map<Integer, Object> queryParams = new HashMap<Integer, Object>();
		StringBuffer query = new StringBuffer("select vehicle, year, month, run_time, run_dist, consmpt, co2_emss, effcc, oos_cnt, mnt_cnt, mnt_time, CONCAT_WS('-', year, month) month_str from vehicle_run_sum where company = ?");
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
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle"))) {
			query.append(" and vehicle = ?");
			queryParams.put(++idx, request.getParameter("vehicle"));
		}
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle_group"))) {
			query.append(" and vehicle in (select vehicle_id from vehicle_relation where company = ? and group_id = ?)");
			queryParams.put(++idx, company);
			queryParams.put(++idx, request.getParameter("vehicle_group"));
		}
		
		query.append(" order by year asc, month asc, vehicle asc");
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
			super.closeDB(rs, pstmt, conn);
		}		
		
		return this.getResultSet(true, items.size(), items);
	}
}
