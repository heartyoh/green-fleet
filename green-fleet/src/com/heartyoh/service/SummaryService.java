/**
 * 
 */
package com.heartyoh.service;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.datastore.Entity;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.DatastoreUtils;

/**
 * 서머리 서비스
 * 
 * @author jhnam
 */
@Controller
public class SummaryService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(SummaryService.class);
	
	/**
	 * 일일별 서머리는 모두 여기에 추가한다.
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/cron/summary/daily_summary", method = RequestMethod.GET)
	public @ResponseBody
	String dailySummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		DataUtils.checkHeader(request);
		
		// 모든 회사에 대해서 처리 
		List<Entity> companies = DatastoreUtils.findAllCompany();
		boolean success = true;
		String msg = "OK";
		
		for(Entity company : companies) {
			String companyId = (String)company.getProperty("id");
			try {
				// 1. 소모품 상태 업데이트 서머리	
				ConsumableService consumableStatusUpdate = new ConsumableService();
				consumableStatusUpdate.dailySummary(companyId);
			} catch (Exception e) {
				success = false;
				msg = "Failed to consumable daily summary!";
				logger.error(msg, e);
			}
		
			try {
				// 2. Vehicle, Driver 주행 서머리
				CheckinDataService runSummary = new CheckinDataService();
				runSummary.dailySummary(companyId);
			} catch (Exception e) {
				success = false;
				msg = "Failed to driving daily summary!";
				logger.error(msg, e);
			}
		}
		
		return "{ \"success\" : " + success + ", \"msg\" : \"" + msg + "\" }";
	}
	
	/**
	 * 주별 서머리 
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/cron/summary/weekly_summary", method = RequestMethod.GET)
	public @ResponseBody
	String weeklySummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		DataUtils.checkHeader(request);
		return null;
	}
	
	/**
	 * 월별 서머리
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/cron/summary/monthly_summary", method = RequestMethod.GET)
	public @ResponseBody
	String monthlySummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		DataUtils.checkHeader(request);
		
		// 모든 회사에 대해서 처리 
		List<Entity> companies = DatastoreUtils.findAllCompany();
		boolean success = true;
		String msg = "OK";
		
		for(Entity company : companies) {
			String companyId = (String)company.getProperty("id");		
			try {
				DatasourceUtils.updateVehicleEffcc(companyId);
			} catch(Exception e) {
				success = false;
				msg = "Failed to vehicle monthly summary!";
				logger.error(msg, e);
			}
		}
		
		return "{ \"success\" : " + success + ", \"msg\" : \"" + msg + "\" }";
	}
	
	/**
	 * 연별 서머리
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/cron/summary/yearly_summary", method = RequestMethod.GET)
	public @ResponseBody
	String yearlySummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		DataUtils.checkHeader(request);
		
		return null;
	}
}
