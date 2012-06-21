/**
 * 
 */
package com.heartyoh.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;

/**
 * 서머리 서비스 : 서머리  
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
	@RequestMapping(value = "/summary/daily_summary", method = RequestMethod.GET)
	public @ResponseBody
	String dailySummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		this.checkCompany(request);
		
		try {
			// 1. 소모품 상태 업데이트 서머리	
			ConsumableService consumableStatusUpdate = new ConsumableService();
			consumableStatusUpdate.dailySummary(request, response);
		} catch (Exception e) {
			logger.error("Failed to consumable daily summary!", e);
		}
		
		try {
			// 2. Vehicle, Driver 주행 서머리
			CheckinDataService runSummary = new CheckinDataService();
			runSummary.dailySummary(request, response);
		} catch (Exception e) {
			logger.error("Failed to consumable daily summary!", e);
		}
		
		return "{ \"success\" : true, \"msg\" : \"OK\" }";
	}
	
	/**
	 * 주별 서머리 
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/summary/weekly_summary", method = RequestMethod.GET)
	public @ResponseBody
	String weeklySummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
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
	@RequestMapping(value = "/summary/monthly_summary", method = RequestMethod.GET)
	public @ResponseBody
	String monthlySummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		this.checkCompany(request);
		
		try {
			DatasourceUtils.updateVehicleEffcc(request.getParameter("company"));
		} catch(Exception e) {
			logger.error("Failed to vehicle monthly summary!", e);
		}
		
		return "{ \"success\" : true, \"msg\" : \"OK\" }";
	}
	
	/**
	 * 연별 서머리
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/summary/yearly_summary", method = RequestMethod.GET)
	public @ResponseBody
	String yearlySummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return null;
	}
	
	/**
	 * company 정보 존재 체크 
	 * 
	 * @param request
	 * @throws Exception
	 */
	private void checkCompany(HttpServletRequest request) throws Exception {
		if(DataUtils.isEmpty(request.getParameter("company")))
			throw new Exception("Request parameter [company] is required!");		
	}
}
