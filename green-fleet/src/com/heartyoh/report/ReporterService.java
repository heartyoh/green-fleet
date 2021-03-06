/**
 * 
 */
package com.heartyoh.report;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;

import com.heartyoh.model.Report;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;

/**
 * ReporterService
 * 
 * @author jhnam
 */
@Controller
public class ReporterService {

	/**
	 * singleton
	 */
	private static ReporterService instance;
	/**
	 * 키 : reporter id, 값 : reporter class name
	 */
	private Map<String, String> reporterMappings = new HashMap<String, String>();
	
	/**
	 * reporter id - reporter class 매핑 맵 리턴 
	 * 
	 * @return
	 */
	public Map<String, String> getReporterMappings() {
		return this.reporterMappings;
	}
	
	/**
	 * reporter id - reporter class 매핑 맵 설정 
	 * 
	 * @param reporterMappings
	 */
	public void setReporterMappings(Map<String, String> reporterMappings) {
		this.reporterMappings = reporterMappings;
	}
	
	/**
	 * private 생성자 
	 */
	private ReporterService() {		
	}
	
	/**
	 * for singleton
	 * 
	 * @return
	 */
	public static ReporterService createInstance() {
		if(instance == null)
			instance = new ReporterService();
		
		return instance;
	}
	
	/**
	 * singleton
	 * 
	 * @return
	 */
	public static ReporterService getInstance() {
		if(instance == null)
			instance = new ReporterService();
		
		return instance;
	}
	
	/**
	 * 주기적으로 관리자에게 리포트 
	 * 
	 * @param request
	 * @param company
	 * @param reportCycle
	 * @param report
	 * @throws Exception
	 */
	public void reportCyclic(HttpServletRequest request, String company, String reportCycle, Report report) throws Exception {
				
		String reporterClass = this.reporterMappings.get(report.getId());
		Class<?> reporterKlazz = Class.forName(reporterClass);
		IReporter reporter = (IReporter)reporterKlazz.newInstance();
		Map<String, Object> params = DataUtils.newMap("_report_cycle", reportCycle);
		params.put("_today", DataUtils.getToday());
		params.put("_report", report);
		params.put("company", company);
		String content = reporter.getReportContent(params);
		
		if(content != null) {
			String sendTo = report.getSendTo();
			if(DataUtils.isEmpty(sendTo))
				return;
		
			String[] receivers = sendTo.split(",");
			AlarmUtils.sendHtmlAttachMail(null, null, null, receivers, report.getName(), content);
		}
	}
	
	/**
	 * params로 부터 해당 Reporter를 찾아 실행한 후 결과를 리턴 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> reportData(Map<String, Object> params) throws Exception {
		
		String reporterId = (String)params.get("id");
		String reporterClass = this.reporterMappings.get(reporterId);
		Class<?> reporterKlazz = Class.forName(reporterClass);
		IReporter reporter = (IReporter)reporterKlazz.newInstance();
		List<Object> results = reporter.report(params);
		return DataUtils.packResultDataset(true, results.size(), results);
	}	
}
