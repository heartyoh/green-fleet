/**
 * 
 */
package com.heartyoh.model;

/**
 * Driver & Driver Group Relation
 * 
 * @author jhnam
 */
public class DriverRelation extends AbstractEntity {

	/**
	 * vehicle id
	 */
	private String driverId;
	/**
	 * vehicle group id
	 */
	private String groupId;
	
	/**
	 * 기본 생성자 
	 */
	public DriverRelation() {	
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param groupId
	 * @param driverId
	 */
	public DriverRelation(String company, String groupId, String driverId) {
		this.company = company;
		this.groupId = groupId;
		this.driverId = driverId;
	}
	
	public String getDriverId() {
		return driverId;
	}
	
	public void setDriverId(String driverId) {
		this.driverId = driverId;
	}
	
	public String getGroupId() {
		return groupId;
	}
	
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	
	@Override
	public String getUniqueValue() {
		return this.company + "@" + this.groupId + "@" + driverId;
	}	
}
