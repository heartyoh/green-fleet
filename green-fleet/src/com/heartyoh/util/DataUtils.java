/**
 * 
 */
package com.heartyoh.util;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;

import com.google.appengine.api.datastore.Entity;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;

/**
 * 데이터 핸들링을 위한 유틸리티 클래스
 * 
 * @author jhnam
 */
public class DataUtils {
	
	/**
	 * header를 체크해서 cron job 에서 호출된 것만 허용함  
	 * 
	 * @param request
	 * @throws Exception
	 */
	public static void checkHeader(HttpServletRequest request) throws Exception {
		// TODO cron job header를 체크해서 단지 cron으로만 실행시켜야 하는 경우 아래 주석 제거 ==> 운영 단계에서 필요 
		//String value = request.getHeader("X-AppEngine-Cron");		
		//if(DataUtils.isEmpty(value) || !value.equalsIgnoreCase("true"))
		//	throw new Exception("Just cron job is acceptable!");
	}
	
	/**
	 * company 정보를 request 객체에서 추출하여 리턴 
	 * 
	 * @param request
	 * @return
	 */
	public static String getCompany(HttpServletRequest request) {
		CustomUser user = SessionUtils.currentUser();
		return (user != null) ? user.getCompany() : request.getParameter("company");		
	}
	
	/**
	 * request parameter 정보를 Map으로 변환 
	 * 
	 * @param request
	 * @return
	 */
	public static Map<String, Object> toMap(HttpServletRequest request) {
		
		Map<String, Object> map = new HashMap<String, Object>();
		@SuppressWarnings("rawtypes")
		Enumeration e = request.getParameterNames();
		while (e.hasMoreElements()) {
			String name = (String) e.nextElement();
			map.put(name, request.getParameter(name));
		}
		return map;
	}
	
	/**
	 * filterStr 파싱 
	 * 
	 * @param filterStr
	 * @return
	 * @throws Exception
	 */
	public static List<Filter> parseFilters(String filterStr) throws Exception {
		
		if (filterStr != null) {
			List<Filter> filters = new ObjectMapper().readValue(filterStr, new TypeReference<List<Filter>>() {});
			return filters;
			
		} else {
			return null;
		}
	}
	
	/**
	 * sorterStr 파싱
	 * 
	 * @param sorterStr
	 * @return
	 * @throws Exception
	 */
	public static List<Sorter> parseSorters(String sorterStr) throws Exception {
		
		if (sorterStr != null) {
			List<Sorter> sorters = new ObjectMapper().readValue(sorterStr, new TypeReference<List<Sorter>>() {});
			return sorters;
		} else {
			return null;
		}
	}	

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
	
	/**
	 * Map을 생성하여 key, value를 추가한 뒤 리턴 
	 * @param key
	 * @param value
	 * @return
	 */
	public static Map<String, Object> newMap(String key, Object value) {
		Map<String, Object> filters = new HashMap<String, Object>();
		
		if(!isEmpty(key)) {
			filters.put(key, value);
		}
		
		return filters;
	}	

	/**
	 * value를 순서대로 1 부터 n까지 추가 ...
	 * 
	 * @param value
	 * @return
	 */
	public static Map<Integer, Object> newParams(Object ... values) {
		
		Map<Integer, Object> map = new HashMap<Integer, Object>();
		
		for(int i = 1 ; i <= values.length ; i++) {
			map.put(i, values[i - 1]);
		}
		
		return map;
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
	 * range로 list로 변환
	 * 
	 * @param values
	 * @return
	 */
	public static List<Object> toListByRange(Object... values) {
		List<Object> list = new ArrayList<Object>();
		
		for(int i = 0 ; i < values.length ; i++) {
			list.add(values[i]);
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
	 * strArr의 각 문자의 앞 뒤로 prefix, postfix를 붙이고 배열의 각 문자열 사이에 delimiter를 붙여서 문자열로 합쳐서 리턴 
	 * 
	 * @param strArr
	 * @param prefix
	 * @param postfix
	 * @param delimiter
	 * @return
	 */
	public static String concat(String[] strArr, String prefix, String postfix, String delimiter) {
		
		if(strArr == null || strArr.length == 0)
			return null;
		
		StringBuffer concatedStr = new StringBuffer();
		for(int i = 0 ; i < strArr.length ; i++) {
			if(i > 0)
				concatedStr.append(delimiter);
			
			if(postfix != null)
				concatedStr.append(prefix);
			
			concatedStr.append(strArr[i]);
			
			if(postfix != null)
				concatedStr.append(postfix);
		}
		
		return concatedStr.toString();
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
	 * 문자열을 format에 맞게 Date로 변환 
	 * 
	 * @param value
	 * @param format
	 * @return
	 */
	public static Date toDate(String value, String format) throws Exception {
		
		if(isEmpty(value))
			return null;
		
		DateFormat df = (format == null) ? new SimpleDateFormat("yyyy-MM-dd") : new SimpleDateFormat(format);
		return df.parse(value);
	}
	
	/**
	 * value를 java.sql.Date 객체로 변환 
	 * 
	 * @param value
	 * @param format
	 * @return
	 * @throws
	 */
	public static java.sql.Date toSqlDate(String value, String format) throws Exception {
		
		Date date = toDate(value, format);
		return (date == null) ? null : new java.sql.Date(date.getTime());
	}
	
	/**
	 * value를 Timestamp로 변환 
	 * 
	 * @param value
	 * @param format
	 * @return
	 * @throws Exception
	 */
	public static Timestamp toTimestamp(String value, String format) throws Exception {		
		Date date = toDate(value, format);
		return (date == null) ? null : new Timestamp(date.getTime());
	}
	
	/**
	 * 성공여부, 총 개수, 결과 셋 리스트를 결과 셋 Map으로 리턴  
	 * 
	 * @param success
	 * @param totalCount
	 * @param items
	 * @return
	 */
	public static Map<String, Object> packResultDataset(boolean success, int totalCount, Object items) {
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", success);
		result.put("total", totalCount);
		result.put("items", items);		
		return result;
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
	 * Date 객체를 format에 따라 문자열로 변환, format이 지정되지 않았다면 기본으로 'yyyy-MM-dd' 형식으로 변환한다. 
	 * 
	 * @param date
	 * @param format
	 * @return
	 */
	public static String dateToString(Date date, String format) {
		
		if(DataUtils.isEmpty(format))
			format = "yyyy-MM-dd";
		
		SimpleDateFormat formatter = new SimpleDateFormat (format);
		return formatter.format(date);
	}
	
	/**
	 * Date 객체를 timezone에 따라 변환하고 format 패턴 문자열로 변환하여 리턴, format이 지정되지 않았다면 기본으로 'yyyy-MM-dd' 형식으로 변환한다. 
	 * 
	 * @param date
	 * @param format
	 * @param timezone
	 * @return
	 */
	public static String dateToString(Date date, String format, int timezone) {
		
		if(DataUtils.isEmpty(format))
			format = "yyyy-MM-dd";
		
		date.setTime(date.getTime() + (timezone * 3600 * 1000));		
		SimpleDateFormat formatter = new SimpleDateFormat (format);
		return formatter.format(date);		
	}
	
	/**
	 * Date 객체를 company에 설정된 timezone에 따라 변환하고 format 패턴 문자열로 변환하여 리턴, format이 지정되지 않았다면 기본으로 'yyyy-MM-dd' 형식으로 변환한다. 
	 * 
	 * @param date
	 * @param format
	 * @param company
	 * @return
	 */
	public static String dateToString(Date date, String format, Entity company) {
		
		int timezone = 0;
		
		if(company != null && !DataUtils.isEmpty(company.getProperty("timezone"))) {
			timezone = DataUtils.toInt(company.getProperty("timezone"));
		}
		
		return dateToString(date, format, timezone);
	}
	
	/**
	 * 올해 값을 리턴한다.
	 * 
	 * @return
	 */
	public static int getThisYear() {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		return c.get(Calendar.YEAR);		
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
	
	/**
	 * 오늘 00:00 기준으로 넘어온 앞 뒤 날 수 조건을 추가한 From, To Date를 리턴한다.
	 *  
	 * @param beforeDateAmount
	 * @param afterDateAmount
	 * @return
	 */
	public static Date[] getFromToDateStToday(int beforeDateAmount, int afterDateAmount) {
		long millis = DataUtils.getTodayMillis();
		return getFromToDate(millis, beforeDateAmount, afterDateAmount);
	}
	
	/**
	 * stDate 기준으로 넘어온 앞 뒤 날 수 조건을 추가한 From, To Date를 리턴한다.
	 *  
	 * @param stDate
	 * @param beforeDateAmount
	 * @param afterDateAmount
	 * @return
	 */
	public static Date[] getFromToDate(Date stDate, int beforeDateAmount, int afterDateAmount) {
		return getFromToDate(stDate.getTime(), beforeDateAmount, afterDateAmount);
	}	
	
	/**
	 * date가 fromDate, toDate 사이에 있는지 체크
	 * 
	 * @param date
	 * @param fromDate
	 * @param toDate
	 * @return
	 */
	public static boolean between(Date date, Date fromDate, Date toDate) {
		
		boolean between = false;		
		
		if(fromDate != null && toDate == null) {
			between = date.equals(fromDate) || date.after(fromDate);
		} else if(fromDate == null && toDate != null) {
			between = date.equals(toDate) || date.before(toDate);
		} else if(fromDate != null && toDate != null) {
			between = (date.equals(fromDate) || date.after(fromDate)) && (date.equals(toDate) || date.before(toDate));
		}
		
		return between;
	}
	
	/**
	 * 오늘 날짜 기준으로 달력을 만들기 위한 첫번째 날짜와 마지막 날짜를 구하여 리턴 
	 * 
	 * @return
	 */
	public static Date[] getFirstLastDateOfMonth() {		
		return getFirstLastDate(DataUtils.getToday());
	}
	
	/**
	 * stDate 기준으로 달력을 만들기 위한 첫번째 날짜와 마지막 날짜를 구하여 리턴
	 *  
	 * @param stDate
	 * @return
	 */
	public static Date[] getFirstLastDate(Date stDate) {
		Date[] dates = new Date[2];
		Calendar cal= Calendar.getInstance();
		cal.setTime(stDate);
		int currentMonth = cal.get(Calendar.MONTH);
		int lastDayOfMonth = cal.getActualMaximum(Calendar.DAY_OF_MONTH);
		cal.set(Calendar.DAY_OF_MONTH, 1);		
		int today = cal.get(Calendar.DAY_OF_WEEK);
		int firstDay = cal.getActualMinimum(Calendar.DAY_OF_WEEK);
		cal.add(Calendar.DAY_OF_MONTH, firstDay - today);
		dates[0] = cal.getTime();
		
		cal.set(Calendar.MONTH, currentMonth);
		cal.set(Calendar.DAY_OF_MONTH, lastDayOfMonth);
		today = cal.get(Calendar.DAY_OF_WEEK);
		int lastDay = cal.getActualMaximum(Calendar.DAY_OF_WEEK);
		cal.add(Calendar.DAY_OF_MONTH, lastDay - today);
		dates[1] = cal.getTime();
		return dates;
	}
	
	/**
	 * 기준일 stDate 월의 첫째날(1일)을 구한다.
	 *  
	 * @param stDate
	 * @return
	 */
	public static Date getBeginDateOfMonth(Date stDate) {
		Calendar cal= Calendar.getInstance();
		cal.setTime(stDate);
		int firstDayOfMonth = cal.getActualMinimum(Calendar.DAY_OF_MONTH);
		cal.set(Calendar.DAY_OF_MONTH, firstDayOfMonth);
		return cal.getTime();		
	}
	
	/**
	 * 기준일 stDate 월의 마지막 날(28일 혹은 30일 혹은 31일)을 구한다.
	 * 
	 * @param stDate
	 * @return
	 */
	public static Date getEndDateOfMonth(Date stDate) {		
		Calendar cal= Calendar.getInstance();
		cal.setTime(stDate);
		int lastDayOfMonth = cal.getActualMaximum(Calendar.DAY_OF_MONTH);
		cal.set(Calendar.DAY_OF_MONTH, lastDayOfMonth);
		return cal.getTime();
	}	
}
