/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

import org.codehaus.jackson.map.ObjectMapper;

/**
 * VehicleGroup Entity
 * 
 * @author jhnam
 */
public class VehicleGroup extends AbstractEntity {

	/**
	 * vehicle group id
	 */
	private String id;
	/**
	 * vehicle group explanation
	 */
	private String expl;
	/**
	 * 생성시간 
	 */
	private Date createdAt;
	/**
	 * 수정시간
	 */
	private Date updatedAt;
	
	/**
	 * 기본 생성자
	 */
	public VehicleGroup() {		
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param id
	 * @param expl
	 */
	public VehicleGroup(String company, String id, String expl) {
		this.company = company;
		this.id = id;
		this.expl = expl;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	public String getExpl() {
		return expl;
	}
	
	public void setExpl(String expl) {
		this.expl = expl;
	}
	
	public Date getCreatedAt() {
		return createdAt;
	}
	
	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}
	
	public Date getUpdatedAt() {
		return updatedAt;
	}
	
	public void setUpdatedAt(Date updatedAt) {
		this.updatedAt = updatedAt;
	}
	
	@Override
	public void beforeSave() {
		if(this.id == null) {
			this.createdAt = new Date();
			this.updatedAt = this.createdAt;
		} else {
			this.updatedAt = new Date();
		}		
	}

	@Override
	public void beforeCreate() {
		this.createdAt = new Date();
	}

	@Override
	public void beforeUpdate() {
		this.updatedAt = new Date();
	}

	@Override
	public String toJson() throws Exception {
		return new ObjectMapper().writeValueAsString(this);
	}
	
	@Override
	public String getUniqueValue() {
		return this.company + "@" + this.id;
	}	
}
