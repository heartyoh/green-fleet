/**
 * 
 */
package com.heartyoh.model;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import net.sf.common.util.ValueUtils;

import org.codehaus.jackson.map.ObjectMapper;

/**
 * Abstract Entity
 * 
 * @author jhnam
 */
public abstract class AbstractEntity implements IEntity {

	/**
	 * company
	 */
	protected String company;
	
	/**
	 * company를 리턴 
	 * 
	 * @return
	 */
	public String getCompany() {
		return this.company;
	}
	
	/**
	 * company를 설정 
	 * 
	 * @param company
	 */
	public void setCompany(String company) {
		this.company = company;
	}
	
	/**
	 * 생성, 수정 전에 ...
	 */
	public void beforeSave() {		
	}
	
	/**
	 * 생성 전에 ...
	 */
	public void beforeCreate() {		
	}
	
	/**
	 * 수정 전에 ...
	 */
	public void beforeUpdate() {		
	}
	
	@Override
	public String toJson() throws Exception {
		return new ObjectMapper().writeValueAsString(this);
	}	
	
	/**
	 * entity를 selectFileds의 필드들을 Map으로 변환한다.
	 * 
	 * @param selectFields
	 * @return
	 */
	public Map<String, Object> toMap(String[] selectFields) {
		
		Map<String, Object> result = new HashMap<String, Object>();
		
		Field[] fields = this.getClass().getDeclaredFields();
		for(int i = 0 ; i < fields.length ; i++) {
			Field field = fields[i];
			String fieldName = field.getName();
			Class<?> fieldType = field.getType();
			boolean match = false;
			String delimFieldName = ValueUtils.toDelimited(fieldName, '_');
			
			if(selectFields != null) {
				for(int j = 0 ; j < selectFields.length ; j++) {
					if(delimFieldName.equalsIgnoreCase(selectFields[j])) {
						match = true;
						break;
					}
				}
			} else {
				match = true;
			}
			
			if(match) {
				String methodName = ((fieldType == Boolean.class) ? "is_" : "get_") + ValueUtils.toDelimited(fieldName, '_');
				methodName = ValueUtils.toCamelCase(methodName, '_');
				Object value = null;
				try {
					Method m = this.getClass().getMethod(methodName, null);
					value = m.invoke(this, null);
				} catch(Exception e) {		
				}
				
				result.put(delimFieldName, value);
			}
		}
		
		return result;
	}
	
}
