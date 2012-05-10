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
	 * unique id
	 */
	private Long id;
	/**
	 * vehicle id
	 */
	private String driverId;
	/**
	 * vehicle group id
	 */
	private Long groupId;
	
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
	public DriverRelation(String company, Long groupId, String driverId) {
		this.company = company;
		this.groupId = groupId;
		this.driverId = driverId;
	}
	
	public Long getId() {
		return id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}
	
	public String getDriverId() {
		return driverId;
	}
	
	public void setDriverId(String driverId) {
		this.driverId = driverId;
	}
	
	public Long getGroupId() {
		return groupId;
	}
	
	public void setGroupId(Long groupId) {
		this.groupId = groupId;
	}	
}
