package com.heartyoh.greenfleet.model;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable
public class Driver {
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;
	
	@Persistent
	private String name;
	@Persistent
	private String employeeId;
	@Persistent
	private String division;
	@Persistent
	private String title;
	@Persistent
	private String imageClip;
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmployeeId() {
		return employeeId;
	}
	public void setEmployeeId(String employeeId) {
		this.employeeId = employeeId;
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
	public Key getKey() {
		return key;
	}
	
}

//* [운전자 정보]
//* 성명, 사원 ID, 부서, 직함, 사진