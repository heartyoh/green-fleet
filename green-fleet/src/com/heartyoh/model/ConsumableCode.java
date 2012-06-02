/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

/**
 * Consumable Code 모델 
 * 
 * @author jhnam
 */
public class ConsumableCode extends AbstractEntity {

	/**
	 * 소모품명 
	 */
	private String name;
	/**
	 * 설명 
	 */
	private String expl;
	/**
	 * 초기 교체 마일리지 
	 */
	private int fstReplMileage;
	/**
	 * 초기 교체 월수  
	 */
	private int fstReplTime;
	/**
	 * 교체 마일리지
	 */
	private int replMileage;
	/**
	 * 교체 월수 
	 */
	private int replTime;
	/**
	 * 교체 단위  
	 */
	private String replUnit;
	/**
	 * 생성일 
	 */
	private Date createdAt;
	/**
	 * 수정일 
	 */
	private Date updatedAt;
	
	/**
	 * 기본 생성자
	 */
	public ConsumableCode() {
	}
	
	/**
	 * 생성자
	 * 
	 * @param company
	 * @param name
	 */
	public ConsumableCode(String company, String name) {
		this.company = company;
		this.name = name;
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

	public int getFstReplMileage() {
		return fstReplMileage;
	}

	public void setFstReplMileage(int fstReplMileage) {
		this.fstReplMileage = fstReplMileage;
	}

	public int getFstReplTime() {
		return fstReplTime;
	}

	public void setFstReplTime(int fstReplTime) {
		this.fstReplTime = fstReplTime;
	}

	public int getReplMileage() {
		return replMileage;
	}

	public void setReplMileage(int replMileage) {
		this.replMileage = replMileage;
	}

	public int getReplTime() {
		return replTime;
	}

	public void setReplTime(int replTime) {
		this.replTime = replTime;
	}

	public String getReplUnit() {
		return replUnit;
	}

	public void setReplUnit(String replUnit) {
		this.replUnit = replUnit;
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
		if(this.createdAt == null)
			this.createdAt = new Date();
		
		if(this.updatedAt == null)
			this.updatedAt = new Date();
	}

	@Override
	public void beforeCreate() {
		if(this.createdAt == null)
			this.createdAt = new Date();
	}

	@Override
	public void beforeUpdate() {
		if(this.updatedAt == null)
			this.updatedAt = new Date();
	}
	
	@Override
	public String getUniqueValue() {
		return this.company + "@" + name;
	}

}
