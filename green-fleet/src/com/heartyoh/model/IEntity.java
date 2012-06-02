/**
 * 
 */
package com.heartyoh.model;

import java.util.Map;

/**
 * @author jhnam
 */
public interface IEntity {
	
	/**
	 * company를 리턴 
	 * 
	 * @return
	 */
	public String getCompany();
	
	/**
	 * company를 설정 
	 * 
	 * @param company
	 */
	public void setCompany(String company);
	
	/**
	 * entity의 unique value를 리턴 
	 * 
	 * @return
	 */
	public String getUniqueValue();	
	
	/**
	 * 생성, 수정 전에 ...
	 */
	public void beforeSave();
	
	/**
	 * 생성 전에 ...
	 */
	public void beforeCreate();
	
	/**
	 * 수정 전에 ...
	 */
	public void beforeUpdate();
	
	/**
	 * 자신을 JSON으로 변환하여 리턴 
	 * 
	 * @return
	 * @throws
	 */
	public String toJson() throws Exception;
	
	/**
	 * entity를 selectFileds의 필드들을 Map으로 변환한다.
	 * 
	 * @param selectFields
	 * @return
	 */
	public Map<String, Object> toMap(String[] selectFields);	
}
