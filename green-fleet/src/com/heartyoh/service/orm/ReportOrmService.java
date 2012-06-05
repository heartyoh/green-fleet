/**
 * 
 */
package com.heartyoh.service.orm;

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

import com.heartyoh.model.IEntity;
import com.heartyoh.model.Report;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;

/**
 * Report Service
 * 
 * @author jhnam
 */
@Controller
public class ReportOrmService extends OrmEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(ReportOrmService.class);	
	/**
	 * key fields
	 */
	private static final String[] KEY_FILEDS = new String[] { "company", "name" };	
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
	public Class<?> getEntityClass() {
		return Report.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FILEDS;
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
	
	@RequestMapping(value = "/report", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/report/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@RequestMapping(value = "/report/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		
		Report report = (Report)entity;
		report.setDaily(DataUtils.toBool(request.getParameter("daily")));
		report.setWeekly(DataUtils.toBool(request.getParameter("weekly")));
		report.setMonthly(DataUtils.toBool(request.getParameter("monthly")));
		report.setExpl(request.getParameter("expl"));
		report.setName(request.getParameter("name"));
		report.setSendTo(request.getParameter("send_to"));
		
		report.beforeUpdate();
		return report;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new Report(this.getCompany(request), request.getParameter("name"));
		}
		
		entity.beforeCreate();
		return entity;
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
		try {
			String sql = "select name, send_to, expl from report where company = '" + company + "' and " + reportCycle + " = true"; 
			@SuppressWarnings("rawtypes")
			List<Map> reportList = dml.selectListBySql(sql, null, Map.class, 0, 0);
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
	Map<String, Object> summayByVehicleGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String reportType = request.getParameter("report_type");
		
		// 차량 그룹별 운행정보 요약  
		if("run_summary".equalsIgnoreCase(reportType)) {
			String query = "select gv.group_id, gv.vehicle_id, vrs.run_time, vrs.run_dist, vrs.consmpt";
			query += " from vehicle_run_sum vrs, (select group_id, vehicle_id from vehicle_relation where company = :company) gv";
			query += " where gv.group_id= :group_id and vrs.company = :company and vrs.vehicle = gv.vehicle_id and vrs.year = :year and vrs.month = :month";
			
			String company = this.getCompany(request);
			String groupId = request.getParameter("group_id");
			String year = request.getParameter("year");
			String month = request.getParameter("month");
			
			if(DataUtils.isEmpty(year)) {
				Calendar c = Calendar.getInstance();
				year = "" + c.get(Calendar.YEAR);
				month = "" + c.get(Calendar.MONTH) + 1;
			}
			
			Map<String, Object> params = DataUtils.newMap("company", company);
			params.put("group_id", groupId);
			params.put("year", year);
			params.put("month", month);
			
			try {
				@SuppressWarnings("rawtypes")
				List<Map> items = this.dml.selectListBySql(query, params, Map.class, 0, 0);
				return this.getResultSet(true, items.size(), items);
				
			} catch (Exception e) {
				logger.error("Failed to vehicle group summary!", e);
				return this.getResultSet(false, 0, null);
			}
			
		// 차량 그룹별 ...
		} else if("".equalsIgnoreCase(reportType)) {			
			return this.getResultSet(false, 0, null);
			
		} else {
			return this.getResultSet(false, 0, null);
		}
	}	
}
