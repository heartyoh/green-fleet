/**
 * 
 */
package com.heartyoh.report;

import java.util.HashMap;
import java.util.Map;

import com.heartyoh.model.Report;

/**
 * ReporterService
 * 
 * @author jhnam
 */
public class ReporterService {

	/**
	 * singleton
	 */
	private static ReporterService instance;
	/**
	 * 키 : reporter id, 값 : reporter class name
	 */
	private Map<String, String> reporterMappings = new HashMap<String, String>();
	
	public Map<String, String> getReporterMappings() {
		return this.reporterMappings;
	}
	
	public void setReporterMappings(Map<String, String> reporterMappings) {
		this.reporterMappings = reporterMappings;
	}
	
	private ReporterService() {		
	}
	
	public static ReporterService createInstance() {
		if(instance == null)
			instance = new ReporterService();
		
		return instance;
	}
	
	public static ReporterService getInstance() {
		if(instance == null)
			instance = new ReporterService();
		
		return instance;
	}
	
	public void covering(String company, String reportCycle, Report report) throws Exception {
		String reporterClass = this.reporterMappings.get(report.getId());
		Class<?> reporterKlazz = Class.forName(reporterClass);
		IReporter reporter = (IReporter)reporterKlazz.newInstance();
		reporter.setParameter(report, reportCycle, null, null);
		reporter.execute();
		reporter.sendReport();
	}
}
