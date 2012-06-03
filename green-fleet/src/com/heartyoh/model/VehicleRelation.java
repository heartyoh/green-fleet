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
	 * vehicle id
	 */
	private String vehicleId;
	/**
	 * vehicle group id
	 */
	private String groupId;
	
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
	public VehicleRelation(String company, String groupId, String vehicleId) {
		this.company = company;
		this.groupId = groupId;
		this.vehicleId = vehicleId;
	}
	
	public String getVehicleId() {
		return vehicleId;
	}
	
	public void setVehicleId(String vehicleId) {
		this.vehicleId = vehicleId;
	}
	
	public String getGroupId() {
		return groupId;
	}
	
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	
	@Override
	public String getUniqueValue() {
		return this.company + "@" + this.groupId + "@" + this.vehicleId;
	}		
}
