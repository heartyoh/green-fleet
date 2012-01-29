package com.heartyoh.model;

import java.util.Date;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.codehaus.jackson.annotate.JsonIgnore;


@PersistenceCapable
public class Incident {
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	@Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String key;

	@JsonIgnore
	@Persistent
    private Company company;
	
	@Persistent
	private String vehicle;
	
	@Persistent
	private String driver;

	@Persistent
	private String terminal;

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
	private double impulseThreshold;
	@Persistent
	private boolean obdConnected;
	@Persistent
	private double engineTemp;
	@Persistent
	private double engineTempThreshold;
	@Persistent
	private double remainingFuel;
	@Persistent
	private double fuelThreshold;

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
	public String getTerminal() {
		return terminal;
	}
	public void setTerminal(String terminal) {
		this.terminal = terminal;
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
	public double getImpulseThreshold() {
		return impulseThreshold;
	}
	public void setImpulseThreshold(double impulseThreshold) {
		this.impulseThreshold = impulseThreshold;
	}
	public boolean isObdConnected() {
		return obdConnected;
	}
	public void setObdConnected(boolean obdConnected) {
		this.obdConnected = obdConnected;
	}
	public double getEngineTemp() {
		return engineTemp;
	}
	public void setEngineTemp(double engineTemp) {
		this.engineTemp = engineTemp;
	}
	public double getEngineTempThreshold() {
		return engineTempThreshold;
	}
	public void setEngineTempThreshold(double engineTempThreshold) {
		this.engineTempThreshold = engineTempThreshold;
	}
	public double getRemainingFuel() {
		return remainingFuel;
	}
	public void setRemainingFuel(double remainingFuel) {
		this.remainingFuel = remainingFuel;
	}
	public double getFuelThreshold() {
		return fuelThreshold;
	}
	public void setFuelThreshold(double fuelThreshold) {
		this.fuelThreshold = fuelThreshold;
	}

}
