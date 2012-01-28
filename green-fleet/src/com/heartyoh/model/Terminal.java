package com.heartyoh.model;

import java.util.Date;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.codehaus.jackson.annotate.JsonIgnore;

@PersistenceCapable
public class Terminal {
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	@Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String key;
	
	@JsonIgnore
	@Persistent
    private Company company;
	
	@Persistent
	private String id;
	@Persistent
	private String serialNo;
	@Persistent
	private Date buyingDate;
	@Persistent
	private String imageClip;
	@Persistent
	private String comment;
	@Persistent
	private Date createdAt;
	@Persistent
	private Date updatedAt;
	
	public String getKey() {
		return key;
	}
	public void setKey(String key) {
		this.key = key;
	}
	public Company getCompany() {
		return company;
	}
	public void setCompany(Company company) {
		this.company = company;
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
	public Date getBuyingDate() {
		return buyingDate;
	}
	public void setBuyingDate(Date buyingDate) {
		this.buyingDate = buyingDate;
	}
	public String getImageClip() {
		return imageClip;
	}
	public void setImageClip(String imageClip) {
		this.imageClip = imageClip;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
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
}
