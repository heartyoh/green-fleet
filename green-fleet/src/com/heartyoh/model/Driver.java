/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

/**
 * Driver Model
 * 
 * @author jhnam
 */
public class Driver extends AbstractEntity {
	/**
	 * driver name
	 */
	private String id;
	/**
	 * driver name
	 */
	private String name;
	/**
	 * 직책 
	 */
	private String title;
	/**
	 * 부서 
	 */
	private String division;
	/**
	 * social_id
	 */
	private String socialId;
	/**
	 * phone_no_1
	 */
	private String phoneNo1;
	/**
	 * phone_no_2
	 */
	private String phoneNo2;
	/**
	 * image_clip
	 */
	private String imageClip;
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
	public Driver() {		
	}
	
	/**
	 * 생성자
	 * 
	 * @param company
	 * @param id
	 */
	public Driver(String company, String id) {
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

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDivision() {
		return division;
	}

	public void setDivision(String division) {
		this.division = division;
	}

	public String getSocialId() {
		return socialId;
	}

	public void setSocialId(String socialId) {
		this.socialId = socialId;
	}

	public String getPhoneNo1() {
		return phoneNo1;
	}

	public void setPhoneNo1(String phoneNo1) {
		this.phoneNo1 = phoneNo1;
	}

	public String getPhoneNo2() {
		return phoneNo2;
	}

	public void setPhoneNo2(String phoneNo2) {
		this.phoneNo2 = phoneNo2;
	}

	public String getImageClip() {
		return imageClip;
	}

	public void setImageClip(String imageClip) {
		this.imageClip = imageClip;
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
		if(this.createdAt == null) {
			this.createdAt = new Date();
		} 
		
		if(this.updatedAt == null) {
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
	public String getUniqueValue() {
		return this.company + "@" + this.id;
	}	
}
