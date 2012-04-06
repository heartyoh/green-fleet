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
}
