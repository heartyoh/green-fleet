/**
 * 
 */
package com.heartyoh.util;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
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
	 * array를 List로 변환 
	 * 
	 * @param values
	 * @return
	 */
	public static List<Object> toList(Object[] values) {
		List<Object> list = new ArrayList<Object>();
		
		if(values != null && values.length > 0) {
			for(int i = 0 ; i < values.length ; i++) {
				list.add(values[i]);
			}
		}
		
		return list;
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
	 * value를 long값으로 변환 
	 * 
	 * @param value
	 * @return
	 */
	public static long toLong(Object value) {
		return (!isEmpty(value)) ? ((value instanceof Long) ? ((Long)value).longValue() : Long.parseLong(value.toString())) : 0l;
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
	 * 오늘 날짜의 00:00:00 시간을 Date형으로 반환한다.
	 * 
	 * @return
	 */
	public static Date getToday() {
		SimpleDateFormat formatter = new SimpleDateFormat ("yyyy-MM-dd");
		String todayStr = formatter.format (new Date());
		return SessionUtils.stringToDate(todayStr);		
	}
	
	/**
	 * 오늘 날짜의 00:00:00 시간을 long 타입으로 반환한다.
	 * 
	 * @return
	 */	
	public static long getTodayMillis() {
		return getToday().getTime();
	}
	
	/**
	 * date에 amount 만큼의 일수를 더한 Date 값을 리턴 
	 * 
	 * @param date
	 * @param amount
	 * @return
	 */
	public static Date addDate(Date date, int amount) {
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		c.add(Calendar.DATE, amount);
		return c.getTime();
	}
	
	/**
	 * standardTimeMillis를 기준으로 beforeDateAmount 일 전 afterDateAmount 일 후 날짜를 리턴
	 * beforeDateAmount, afterDateAmount는 모두 0보다 커야한다.
	 * 
	 * @param standardTimeMillis  
	 * @param beforeDateAmount 0보다 작은 값이면 0으로 강제 세팅
	 * @param afterDateAmount 1보다 작은 값이며 1로 강제 세팅
	 * @return
	 */
	public static Date[] getFromToDate(long standardTimeMillis, int beforeDateAmount, int afterDateAmount) {
		
		if(beforeDateAmount < 0)
			beforeDateAmount = 0;
		
		if(afterDateAmount < 1)
			afterDateAmount = 1;
		
		Calendar c = Calendar.getInstance();
		c.setTimeInMillis(standardTimeMillis - (60 * 60 * 24 * 1000 * beforeDateAmount));
		Date fromDate = c.getTime();
		
		long toTimeMillis = standardTimeMillis + (60 * 60 * 24 * 1000 * afterDateAmount);
		c.setTimeInMillis(toTimeMillis);
		Date toDate = c.getTime();
		
		return new Date[] {fromDate, toDate};
	}
}
