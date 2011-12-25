package com.heartyoh.greenfleet.model;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;
import com.heartyoh.model.Company;

@PersistenceCapable
public class Incident {
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

	@Persistent
	private String id;
	
	@Persistent
	private String vehicle;
	@Persistent
	private String driver;

	@Persistent
	private Date incidentTime;
	@Persistent
	private double lattitude;
	@Persistent
	private double longitude;
	@Persistent
	private double impulse;
	@Persistent
	private String videoClip;

	@Persistent
	private Date createdAt;
	@Persistent
	private Date updatedAt;
	
	public Key getKey() {
		return key;
	}
	public void setKey(Key key) {
		this.key = key;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getVehicle() {
		return vehicle;
	}
	public void setVehicle(String vehicle) {
		this.vehicle = vehicle;
	}
	public String getDriver() {
		return driver;
	}
	public void setDriver(String driver) {
		this.driver = driver;
	}
	public Date getIncidentTime() {
		return incidentTime;
	}
	public void setIncidentTime(Date incidentTime) {
		this.incidentTime = incidentTime;
	}
	public double getLattitude() {
		return lattitude;
	}
	public void setLattitude(double lattitude) {
		this.lattitude = lattitude;
	}
	public double getLongitude() {
		return longitude;
	}
	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}
	public double getImpulse() {
		return impulse;
	}
	public void setImpulse(double impulse) {
		this.impulse = impulse;
	}
	public String getVideoClip() {
		return videoClip;
	}
	public void setVideoClip(String videoClip) {
		this.videoClip = videoClip;
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
