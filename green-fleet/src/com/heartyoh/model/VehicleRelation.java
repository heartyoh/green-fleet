/**
 * 
 */
package com.heartyoh.model;

/**
 * Vehicle & Vehicle Group Relation Entity
 * 
 * @author jhnam
 */
public class VehicleRelation extends AbstractEntity {

	/**
	 * unique id
	 */
	private Long id;
	/**
	 * vehicle id
	 */
	private String vehicleId;
	/**
	 * vehicle group id
	 */
	private Long groupId;
	
	/**
	 * 기본 생성자 
	 */
	public VehicleRelation() {	
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param groupId
	 * @param vehicleId
	 */
	public VehicleRelation(String company, Long groupId, String vehicleId) {
		this.company = company;
		this.groupId = groupId;
		this.vehicleId = vehicleId;
	}
	
	public Long getId() {
		return id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}
	
	public String getVehicleId() {
		return vehicleId;
	}
	
	public void setVehicleId(String vehicleId) {
		this.vehicleId = vehicleId;
	}
	
	public Long getGroupId() {
		return groupId;
	}
	
	public void setGroupId(Long groupId) {
		this.groupId = groupId;
	}
}
