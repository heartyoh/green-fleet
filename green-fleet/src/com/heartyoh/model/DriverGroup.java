/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

/**
 * DriverGroup Entity
 * 
 * @author jhnam
 */
public class DriverGroup extends AbstractEntity {

	/**
	 * auto increment id
	 */
	private Long id;
	/**
	 * vehicle group name
	 */
	private String name;
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
	public DriverGroup() {		
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param name
	 * @param expl
	 */
	public DriverGroup(String company, String name, String expl) {
		this.company = company;
		this.name = name;
		this.expl = expl;
	}
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
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
	
}
