/**
 * 
 */
package com.heartyoh.report;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

/**
 * Reporter interface
 * 
 * @author jhnam
 */
public interface IReporter {

	/**
	 * 리포트 아이디 
	 * 
	 * @return
	 */
	public String getId();
	
	/**
	 * 조회 필드명 리턴 
	 * 
	 * @return
	 */
	public String[] getOutputNames();
	
	/**
	 * 파라미터 명 리턴 
	 * 
	 * @return
	 */
	public String[] getInputNames();
		
	/**
	 * 파라미터를 받아 실행한 결과를 리턴 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	public List<Object> report(Map<String, Object> params) throws Exception;
	
	/**
	 * 파라미터를 받아 실행한 결과를 리턴 
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */
	public List<Object> report(HttpServletRequest request) throws Exception;
	
	/**
	 * report html content를 리턴 
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	public String getReportContent(Map<String, Object> params) throws Exception;
}
