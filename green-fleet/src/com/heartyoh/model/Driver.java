package com.heartyoh.model;

import java.util.Date;
import java.util.Set;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.codehaus.jackson.annotate.JsonIgnore;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable
public class Driver {
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	@Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String key;
	
	@JsonIgnore
	@Persistent
    private Company company;
	
	@JsonIgnore
    @Persistent
    private Set<Key> incidents;
	
	@Persistent
	private String name;
	@Persistent
	private String id;
	@Persistent
	private String division;
	@Persistent
	private String title;
	@Persistent
	private String imageClip;
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
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getDivision() {
		return division;
	}
	public void setDivision(String division) {
		this.division = division;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
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
	public Set<Key> getIncidents() {
		return incidents;
	}
	public void setIncidents(Set<Key> incidents) {
		this.incidents = incidents;
	}

}

//* [운전자 정보]
//* 성명, 사원 ID, 부서, 직함, 사진