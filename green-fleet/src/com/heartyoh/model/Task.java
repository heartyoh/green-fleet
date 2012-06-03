/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

import com.heartyoh.util.DataUtils;

/**
 * Task 모델 
 * 
 * @author jhnam
 */
public class Task extends AbstractEntity {

	/**
	 * task id
	 */
	private long id;
	/**
	 * 제목  
	 */
	private String title;
	/**
	 * 시작일시 
	 */
	private Date startDate;
	/**
	 * 완료일시 
	 */
	private Date endDate;
	/**
	 * 하루종일 일정인지 여불 
	 */
	private boolean allDay;
	/**
	 * 카테고리 
	 */
	private String category;
	/**
	 * 
	 */
	private String reminder;
	/**
	 * 노트 
	 */
	private String notes;
	/**
	 * 장소 
	 */
	private String loc;
	/**
	 * link url
	 */
	private String url;
	/**
	 * 룰 
	 */
	private String rrule;
	
	public Task() {		
	}
	
	public Task(long id) {
		this.id = id;
	}
	
	public Task(String id) {
		if(!DataUtils.isEmpty(id))
			this.id = DataUtils.toLong(id);
	}	
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public boolean isAllDay() {
		return allDay;
	}

	public void setAllDay(boolean allDay) {
		this.allDay = allDay;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getReminder() {
		return reminder;
	}

	public void setReminder(String reminder) {
		this.reminder = reminder;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public String getLoc() {
		return loc;
	}

	public void setLoc(String loc) {
		this.loc = loc;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getRrule() {
		return rrule;
	}

	public void setRrule(String rrule) {
		this.rrule = rrule;
	}

	@Override
	public String getUniqueValue() {
		return this.id + "";
	}

}
