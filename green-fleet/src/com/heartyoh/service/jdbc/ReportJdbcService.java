/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.util.Calendar;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.heartyoh.util.DataUtils;

/**
 * Report를 위한 Jdbc 서비스 
 * 
 * @author jhnam
 */
@Controller
public class ReportJdbcService extends JdbcEntityService {

	/**
	 * key names
	 */
	private static final String TABLE_NAME = "report";	
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {
		return null;
	}

	@RequestMapping(value = "/report/vehicle_group", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> vehicleGroupSummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String reportType = request.getParameter("report_type");
		
		// 차량 그룹별 운행정보 요약  
		if("run_summary".equalsIgnoreCase(reportType)) {
			String query = "select gv.group_id, gv.vehicle_id, vrs.run_time, vrs.run_dist, vrs.consmpt";
			query += " from vehicle_run_sum vrs, (select group_id, vehicle_id from vehicle_relation where company = ?) gv";
			query += " where gv.group_id= ? and vrs.company = ? and vrs.vehicle = gv.vehicle_id and vrs.year = ? and vrs.month = ?";
			
			String company = this.getCompany(request);
			String groupId = request.getParameter("group_id");
			String year = request.getParameter("year");
			String month = request.getParameter("month");
			
			if(DataUtils.isEmpty(year)) {
				Calendar c = Calendar.getInstance();
				year = "" + c.get(Calendar.YEAR);
				month = "" + c.get(Calendar.MONTH) + 1;
			}
			
			List<Map<String, Object>> items = this.executeQuery(query, DataUtils.newParams(company, groupId, company, year, month));
			return this.getResultSet(true, items.size(), items);
			
		// 차량 그룹별 ...
		} else if("".equalsIgnoreCase(reportType)) {			
			return this.getResultSet(false, 0, null);			
		} else		
			return this.getResultSet(false, 0, null);
	}
}
