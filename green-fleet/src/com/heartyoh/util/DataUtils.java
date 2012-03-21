/**
 * 
 */
package com.heartyoh.util;

import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * 데이터 핸들링을 위한 유틸리티 클래스
 * 
 * @author jhnam
 */
public class DataUtils {

	/**
	 * keys, values를 받아서 Map에 key, value 쌍으로 담아 리턴 
	 * 
	 * @param keys
	 * @param values
	 * @return
	 */
	public static Map<String, Object> newMap(String[] keys, Object[] values) {
		Map<String, Object> filters = new HashMap<String, Object>();
		
		if(keys != null && keys.length > 0) {
			for(int i = 0 ; i < keys.length ; i++) {
				filters.put(keys[i], values[i]);
			}
		}
		
		return filters;
	}
	
	public static Map<String, Object> newMap(String key, Object value) {
		Map<String, Object> filters = new HashMap<String, Object>();
		
		if(!isEmpty(key)) {
			filters.put(key, value);
		}
		
		return filters;
	}	
	
	/**
	 * value에 대한 boolean 평가 
	 * 
	 * @param value
	 * @return
	 */
	public static boolean toBool(Object value) {
		
		if(isEmpty(value))
			return false;
		
		if(value instanceof Boolean) {
			return ((Boolean)value).booleanValue();
		} else if(value instanceof Number) {
			Number no = (Number)value;
			return (no.intValue() > 0) ? true : false;
		} else {
			String str = value.toString();			
			return ("on".equalsIgnoreCase(str) || "true".equalsIgnoreCase(str)) ? true : false; 
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
	 * value를 double값으로 변환 
	 * 
	 * @param value
	 * @return
	 */
	public static double toDouble(Object value) {
		return (!isEmpty(value)) ? ((value instanceof Double) ? ((Double)value).doubleValue() : Double.parseDouble(value.toString())) : 0d;
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
		else if(value instanceof Calendar)
			return ((Calendar)value).getTime();
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
	 * 
	 * @param value
	 * @return
	 */
	public static String toNotNull(Object value) {
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
	 * date에 amount 만큼의 일수를 더한 Date 값을 리턴 
	 * 
	 * @param date
	 * @param amount
	 * @return
	 */
	public static Date add(Date date, int amount) {
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		c.add(Calendar.DATE, amount);
		return c.getTime();
	}
}
