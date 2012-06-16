/**
 * 
 */
package com.heartyoh.util;

/**
 * 상수 정의 클래스
 * 
 * @author jhnam
 */
public class GreenFleetConstant {

	/**
	 * 소모품 교체 단위 - Mileage
	 */
	public static final String REPL_UNIT_MILEAGE = "Mileage";
	/**
	 * 소모품 교체 단위 - Time
	 */
	public static final String REPL_UNIT_TIME = "Time";
	/**
	 * 소모품 교체 단위 - Mileage & Time
	 */
	public static final String REPL_UNIT_MILEAGE_TIME = "MileageTime";
	
	/**
	 * 차량 상태 - 주행 중 
	 */
	public static final String VEHICLE_STATUS_RUNNING = "Running";
	/**
	 * 차량 상태 - 사고 
	 */
	public static final String VEHICLE_STATUS_INCIDENT = "Incident";
	/**
	 * 차량 상태 - 정차 중 
	 */
	public static final String VEHICLE_STATUS_IDLE = "Idle";
	/**
	 * 차량 상태 - 정비 중 
	 */
	public static final String VEHICLE_STATUS_MAINT = "Maint";	
	
	/**
	 * 차량 건강 상태 : 건강 
	 */
	public static final String VEHICLE_HEALTH_H = "Healthy";
	/**
	 * 차량 건강 상태 : 교체 임박 
	 */
	public static final String VEHICLE_HEALTH_I = "Impending";
	/**
	 * 차량 건강 상태 : 교체 기간 지남 
	 */
	public static final String VEHICLE_HEALTH_O = "Overdue";
	
	/**
	 * Location Based Alarm Event : IN (When arrived at the location)
	 */
	public static final String LBA_EVENT_IN = "in";
	/**
	 * Location Based Alarm Event : OUT (When leaved the location)
	 */
	public static final String LBA_EVENT_OUT = "out";
	/**
	 * Location Based Alarm Event : INOUT (When arrived or leaved the location)
	 */
	public static final String LBA_EVENT_INOUT = "in-out";
	
	/**
	 * ALRM - XMPP
	 */
	public static final String ALARM_XMPP = "xmpp";
	/**
	 * ALRM - MAIL
	 */
	public static final String ALARM_MAIL = "mail";
	/**
	 * ALRM - SMS
	 */
	public static final String ALARM_SMS = "sms";
	
	/**
	 * Default date format : yyyy-MM-dd
	 */
	public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
	
	/**
	 * Default datetime format : yyyy-MM-dd HH:mm:ss
	 */
	public static final String DEFAULT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
	
	/**
	 * TASK TYPE - 정비 
	 */
	public static final String TASK_TYPE_MAINTENENCE = "1";
	/**
	 * TASK TYPE - 소모품  
	 */
	public static final String TASK_TYPE_CONSUMABLES = "2";
	/**
	 * TASK TYPE - 예약 
	 */
	public static final String TASK_TYPE_RESERVATION = "3";
	/**
	 * TASK TYPE - 일반 태스크 
	 */
	public static final String TASK_TYPE_TASK = "4";
}
