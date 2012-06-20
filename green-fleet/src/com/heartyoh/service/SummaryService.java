/**
 * 
 */
package com.heartyoh.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * 서머리 서비스 : 서머리  
 * 
 * @author jhnam
 */
@Controller
public class SummaryService {

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
		
		// 1. 소모품 상태 업데이트 서머리	
		ConsumableService consumableStatusUpdate = new ConsumableService();
		consumableStatusUpdate.dailySummary(request, response);
		
		// 2. Vehicle, Driver 주행 서머리
		CheckinDataService runSummary = new CheckinDataService();
		runSummary.dailySummary(request, response);
		
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
		
		// TODO 한 달에 한 번 Vehicle 평균 연비, Eco Index 서머리 추가 필요 
		return null;
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
}
