/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

/**
 * Alarm Entity
 * 
 * @author jhnam
 */
public class Alarm extends AbstractEntity {

	/**
	 * alarm name 
	 */
	private String name;
	/**
	 * 이벤트 발생시에 어떤 타입으로 알람을 보낼 건지 ... : xmpp, mail, sms, ...
	 */
	private String type;
	/**
	 * event type : 어떤 이벤트에 대한 알람인지... location, incident, ...
	 */
	private String evtType;
	/**
	 * event name : event 이름 
	 */
	private String evtName;
	/**
	 * 이벤트 트리거 : event trigger 
	 */
	private String evtTrg;
	/**
	 * 알람 유효 기간 From 
	 */
	private Date fromDate;
	/**
	 * 알람 유효 기간 To
	 */
	private Date toDate;
	/**
	 * 알람 유효 기간 항상  
	 */
	private Boolean always;
	/**
	 * 알람 유효여부 
	 */
	private Boolean enabled;
	/**
	 * 알람 대상 사용자 email
	 */
	private String dest;
	/**
	 * 알람 메시지 
	 */
	private String msg;
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
	public Alarm() {		
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param name
	 */
	public Alarm(String company, String name) {
		this.company = company;
		this.name = name;
	}
		
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	public String getEvtType() {
		return evtType;
	}
	
	public void setEvtType(String evtType) {
		this.evtType = evtType;
	}
	
	public String getEvtName() {
		return evtName;
	}
	
	public void setEvtName(String evtName) {
		this.evtName = evtName;
	}	
	
	public String getEvtTrg() {
		return evtTrg;
	}
	
	public void setEvtTrg(String evtTrg) {
		this.evtTrg = evtTrg;
	}
	
	public Date getFromDate() {
		return fromDate;
	}
	
	public void setFromDate(Date fromDate) {
		this.fromDate = fromDate;
	}
	
	public Date getToDate() {
		return toDate;
	}
	
	public void setToDate(Date toDate) {
		this.toDate = toDate;
	}
	
	public Boolean isAlways() {
		return always;
	}
	
	public void setAlways(Boolean always) {
		this.always = always;
	}
	
	public Boolean isEnabled() {
		return this.enabled;
	}
	
	public void setEnabled(Boolean enabled) {
		this.enabled = enabled;
	}
	
	public String getDest() {
		return dest;
	}
	
	public void setDest(String dest) {
		this.dest = dest;
	}
	
	public String getMsg() {
		return msg;
	}
	
	public void setMsg(String msg) {
		this.msg = msg;
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
		return this.company + "@" + this.name;
	}
}
