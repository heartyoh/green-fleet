/**
 * 
 */
package com.heartyoh.report;

import java.util.Date;

import com.heartyoh.model.Report;

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
	 * 리포트, 주기, 시작일, 종료일을 설정한다.
	 * 
	 * @param report
	 * @param cycle
	 * @param fromDate
	 * @param toDate
	 */
	public void setParameter(Report report, String cycle, Date fromDate, Date toDate);
			
	/**
	 * 리포트 쿼리 실행 
	 * 
	 * @throws Exception
	 */
	public void execute() throws Exception;

	/**
	 * 실행 결과를 대상자들에게 보낸다.
	 * 
	 * @throws Exception
	 */
	public void sendReport() throws Exception;
}
