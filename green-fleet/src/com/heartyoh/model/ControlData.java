package com.heartyoh.model;

import java.util.Date;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.codehaus.jackson.annotate.JsonIgnore;

@PersistenceCapable
public class ControlData {
	 /* 운행일, 운전자, 차량 ID, 차종, 등록번호, 
	 * 
	 * 운전시작시간, 운전종료시간, 운행거리, 운행시간, 평균속도, 최고속도, 운행정보
	 * 
	 * 급가속 횟수, 급감속 횟수, 경제 운전 비율, 연비 - 운전 습관
	 * 
	 * 위험발생시각, 위험발생위치, 충격량, 동영상 - 이벤트 정보
	 */
	
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	@Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String key;

	@JsonIgnore
	@Persistent
    private Company company;
	
	@Persistent
	private Date date;
	@Persistent
	private String driver;
	@Persistent
	private String vehicle;
	@Persistent
	private Date startTime;
	@Persistent
	private Date endTime;
	@Persistent
	private double distance;
	@Persistent
	private double runningTime;
	@Persistent
	private double averageSpeed;
	@Persistent
	private double highestSpeed;
	@Persistent
	private double suddenAccelCount;
	@Persistent
	private double suddenBrakeCount;
	@Persistent
	private double econoDrivingRatio;
	@Persistent
	private double fuelEfficiency;

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
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public String getDriver() {
		return driver;
	}
	public void setDriver(String driver) {
		this.driver = driver;
	}
	public String getVehicle() {
		return vehicle;
	}
	public void setVehicle(String vehicle) {
		this.vehicle = vehicle;
	}
	public Date getStartTime() {
		return startTime;
	}
	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}
	public Date getEndTime() {
		return endTime;
	}
	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}
	public double getDistance() {
		return distance;
	}
	public void setDistance(double distance) {
		this.distance = distance;
	}
	public double getRunningTime() {
		return runningTime;
	}
	public void setRunningTime(double runningTime) {
		this.runningTime = runningTime;
	}
	public double getAverageSpeed() {
		return averageSpeed;
	}
	public void setAverageSpeed(double averageSpeed) {
		this.averageSpeed = averageSpeed;
	}
	public double getHighestSpeed() {
		return highestSpeed;
	}
	public void setHighestSpeed(double highestSpeed) {
		this.highestSpeed = highestSpeed;
	}
	public double getSuddenAccelCount() {
		return suddenAccelCount;
	}
	public void setSuddenAccelCount(double suddenAccelCount) {
		this.suddenAccelCount = suddenAccelCount;
	}
	public double getSuddenBrakeCount() {
		return suddenBrakeCount;
	}
	public void setSuddenBrakeCount(double suddenBrakeCount) {
		this.suddenBrakeCount = suddenBrakeCount;
	}
	public double getEconoDrivingRatio() {
		return econoDrivingRatio;
	}
	public void setEconoDrivingRatio(double econoDrivingRatio) {
		this.econoDrivingRatio = econoDrivingRatio;
	}
	public double getFuelEfficiency() {
		return fuelEfficiency;
	}
	public void setFuelEfficiency(double fuelEfficiency) {
		this.fuelEfficiency = fuelEfficiency;
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
