/**
 * 
 */
package com.heartyoh.model;

/**
 * Alarm Vehicle Relation Entity
 * 
 * @author jhnam
 */
public class AlarmVehicleRelation extends AbstractEntity {

	/**
	 * alarm name
	 */
	private String alarmName;
	/**
	 * vehicle id
	 */
	private String vehicleId;
	
	/**
	 * 기본 생성자 
	 */
	public AlarmVehicleRelation() {		
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param alarmName
	 * @param vehicleId
	 */
	public AlarmVehicleRelation(String company, String alarmName, String vehicleId) {
		this.company = company;
		this.alarmName = alarmName;
		this.vehicleId = vehicleId;
	}

	public String getAlarmName() {
		return alarmName;
	}

	public void setAlarmId(String alarmName) {
		this.alarmName = alarmName;
	}

	public String getVehicleId() {
		return vehicleId;
	}

	public void setVehicleId(String vehicleId) {
		this.vehicleId = vehicleId;
	}
	
}
