/**
 * 
 */
package com.heartyoh.report;

import java.util.List;
import java.util.Map;

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
	 * 조회 필드명 
	 * 
	 * @return
	 */
	public String[] getSelectFields();
	
	/**
	 * 조회 필드명과 매핑되는 조회 필드 타입  
	 * 
	 * @return
	 */
	public int[] getFieldTypes();
	
	/**
	 * parameter 설정 
	 * 
	 * @param params
	 */
	public void setParameter(Map<String, Object> params);
	
	/**
	 * 결과를 생성하여 리턴 
	 * 
	 * @return
	 * @throws Exception
	 */
	public List<Map<String, Object>> report() throws Exception;
}
