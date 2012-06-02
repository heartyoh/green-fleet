/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;

/**
 * Report를 위한 Jdbc 서비스 
 * 
 * @author jhnam
 */
@Controller
public class ReportJdbcService extends JdbcEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(ReportJdbcService.class);	
	/**
	 * daily
	 */
	private static String DAILY_REPORT = "daily";
	/**
	 * weekly
	 */
	private static String WEEKLY_REPORT = "weekly";
	/**
	 * monthly
	 */
	private static String MONTHLY_REPORT = "monthly";
	
	@Override
	protected String getTableName() {
		return "report";
	}

	@Override
	protected Map<String, String> getColumnSvcFieldMap() {
		return null;
	}

	@RequestMapping(value = "/report/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/report/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = {"/report", "/m/data/report.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.retrieve(true, DataUtils.newMap("company", this.getCompany(request)), request, response);
	}
	
	@RequestMapping(value = "/report/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@RequestMapping(value = "/report/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/report/daily_report", method = RequestMethod.GET)
	public void dailyReport(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String company = this.getCompany(request);
		this.sendReport(company, DAILY_REPORT);
	}
	
	@RequestMapping(value = "/report/weekly_report", method = RequestMethod.GET)
	public void weeklyReport(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String company = this.getCompany(request);
		this.sendReport(company, WEEKLY_REPORT);
	}
	
	@RequestMapping(value = "/report/monthly_report", method = RequestMethod.GET)
	public void monthlyReport(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		String company = this.getCompany(request);
		this.sendReport(company, MONTHLY_REPORT);
	}
	
	/**
	 * daily, weekly, monthly 등의 주기로 리포트를 찾아서 설정된 사용자에게 리포트
	 * 
	 * @param company
	 * @param reportCycle
	 * @throws Exception
	 */
	private void sendReport(String company, String reportCycle) throws Exception {
		
		Connection conn = null;
		try {
			conn = this.getConnection();
			String query = "select name, send_to, expl from report where company = '" + company + "' and " + reportCycle + " = true"; 
			List<Map<String, Object>> reportList = this.executeQuery(query, null);
			if(reportList == null || reportList.isEmpty())
				return;
			
			for(Map<String, Object> report : reportList) {
				String reportName = (String)report.get("name");
				String reportTo = (String)report.get("send_to");
				String expl = (String)report.get("expl");
				String content = this.getReportContent(company, reportName, reportCycle);
				AlarmUtils.sendMail(null, null, reportTo, "", expl, true, content);
			}
		} catch(Exception e) {
			logger.error("Failed to send " + reportCycle + "!", e);
			
		} finally {
			super.closeConnection(conn);
		}
	}
	
	/**
	 * report content
	 * 
	 * @param company
	 * @param name
	 * @param reportCycle
	 * @return
	 * @throws Exception
	 */
	private String getReportContent(String company, String name, String reportCycle) throws Exception {
		
		if("vehicle_runtime".equalsIgnoreCase(name)) {
			// 1. daily
			
			// 2. weekly
			
			// 3. monthly
		}
		
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
		} else {
			return this.getResultSet(false, 0, null);
		}
	}
}
