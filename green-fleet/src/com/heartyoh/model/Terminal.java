/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

/**
 * Terminal 모델 
 * 
 * @author jhnam
 */
public class Terminal extends AbstractEntity {

	/**
	 * id
	 */
	private String id;
	/**
	 * serial no
	 */
	private String serialNo;
	/**
	 * vehicle id
	 */
	private String vehicleId;
	/**
	 * 구매일 
	 */
	private Date buyingDate;
	/**
	 * 설명 
	 */
	private String comment;	
	
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
	
	public Terminal() {		
	}
	
	public Terminal(String company, String id)  {
		this.company = company;
		this.id = id;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getSerialNo() {
		return serialNo;
	}

	public void setSerialNo(String serialNo) {
		this.serialNo = serialNo;
	}

	public String getVehicleId() {
		return vehicleId;
	}

	public void setVehicleId(String vehicleId) {
		this.vehicleId = vehicleId;
	}

	public Date getBuyingDate() {
		return buyingDate;
	}

	public void setBuyingDate(Date buyingDate) {
		this.buyingDate = buyingDate;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
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
