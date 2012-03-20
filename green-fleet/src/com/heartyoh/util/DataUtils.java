/**
 * 
 */
package com.heartyoh.util;

import java.util.Collection;
import java.util.Date;

/**
 * 데이터 핸들링을 위한 유틸리티 클래스
 * 
 * @author jhnam
 */
public class DataUtils {

	/**
	 * value에 대한 boolean 평가 
	 * 
	 * @param value
	 * @return
	 */
	public static boolean toBool(Object value) {
		if(value == null)
			return false;
		
		if(value instanceof Boolean) {
			return ((Boolean)value).booleanValue();
		} else {
			String str = value.toString();			
			return ("1".equalsIgnoreCase(str) || "on".equalsIgnoreCase(str) || "true".equalsIgnoreCase(str)) ? true : false; 
		}
	}
	
	/**
	 * value를 float값으로 변환 
	 * 
	 * @param value
	 * @return
	 */
	public static float toFloat(Object value) {
		return (!isEmpty(value)) ? ((value instanceof Float) ? ((Float)value).floatValue() : Float.parseFloat(value.toString())) : 0f;
	}
	
	/**
	 * value를 int값으로 변환
	 * 
	 * @param value
	 * @return
	 */
	public static int toInt(Object value) {
		return (!isEmpty(value)) ? ((value instanceof Integer) ? ((Integer)value).intValue() : Integer.parseInt(value.toString())) : 0;
	}
	
	/**
	 * value를 Date 객체로 변환
	 * 
	 * @param value
	 * @return
	 */
	public static Date toDate(Object value) {
		if(value instanceof String)
			return (isEmpty(value)) ? null : SessionUtils.stringToDate(value.toString());
		else if(value instanceof Date)
			return (Date)value;
		else
			return null;
	}
	
	/**
	 * value를 String형으로 변환 
	 * 
	 * @param value
	 * @return
	 */
	public static String toString(Object value) {
		return value != null ? value.toString() : null;
	}
	
	/**
	 * value를 String형으로 변환. null이면 ""를 리턴 
	 * @param value
	 * @return
	 */
	public static String toNotNullString(Object value) {
		return value != null ? value.toString() : "";
	}
		
	/**
	 * value값이 비었는지 체크 
	 * 
	 * @param value
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public static boolean isEmpty(Object value) {		
		if(value == null)
			return true;
		
		if(value instanceof Collection)
			return ((Collection)value).isEmpty();
		else 
			return value.toString().trim().isEmpty();
	}
	
	/**
	 * value가 null이라면 빈 값을, 그렇지 않으면 해당 오브젝트의 toString()을 리턴  
	 * 
	 * @param value
	 * @return
	 */
	public static String toNotNull(Object value) {
		return value != null ? value.toString() : "";
	}
}
