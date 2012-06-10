/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

/**
 * Report 모델 
 * 
 * @author jhnam
 */
public class Report extends AbstractEntity {

	/**
	 * 리포트 아이디 
	 */
	private String id;
	/**
	 * 리포트 이름
	 */
	private String name;
	/**
	 * daily 리포트 여부 
	 */
	private boolean daily;
	/**
	 * weekly 리포트 여부 
	 */
	private boolean weekly;
	/**
	 * monthly 리포트 여불 
	 */
	private boolean monthly;
	/**
	 * 리포트를 보낼 대상 
	 */
	private String sendTo;
	/**
	 * 설명 
	 */
	private String expl;	
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
	public Report() {		
	}
	
	/**
	 * 키 생성자 
	 * 
	 * @param company
	 * @param id
	 */
	public Report(String company, String id) {
		this.company = company;
		this.id = id;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public boolean isDaily() {
		return daily;
	}

	public void setDaily(boolean daily) {
		this.daily = daily;
	}

	public boolean isWeekly() {
		return weekly;
	}

	public void setWeekly(boolean weekly) {
		this.weekly = weekly;
	}

	public boolean isMonthly() {
		return monthly;
	}

	public void setMonthly(boolean monthly) {
		this.monthly = monthly;
	}

	public String getSendTo() {
		return sendTo;
	}

	public void setSendTo(String sendTo) {
		this.sendTo = sendTo;
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
		return this.company + "@" + this.id;
	}

}
