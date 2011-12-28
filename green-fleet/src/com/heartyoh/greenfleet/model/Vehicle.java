package com.heartyoh.greenfleet.model;

import java.util.Date;
import java.util.List;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.Order;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.codehaus.jackson.annotate.JsonIgnore;

import com.heartyoh.model.Company;

@PersistenceCapable
public class Vehicle {
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	@Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String key;
	
	@Persistent
    private Company company;
	
	@Persistent
	private String id;
	@Persistent
	private String registrationNumber;
	@Persistent
	private String manufacturer;
	@Persistent
	private String vehicleType;
	@Persistent
	private String birthYear;
	@Persistent
	private String ownershipType;
	@Persistent
	private String status;
	@Persistent
	private String imageClip;
	@Persistent
	private double totalDistance;
	@Persistent
	private double remainingFuel;
	@Persistent
	private double distanceSinceNewOil;
	@Persistent
	private String engineOilStatus;
	@Persistent
	private String fuelFilterStatus;
	@Persistent
	private String brakeOilStatus;
	@Persistent
	private String brakePedalStatus;
	@Persistent
	private String coolingWaterStatus;
	@Persistent
	private String timingBeltStatus;
	@Persistent
	private String sparkPlugStatus;
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
	public String getRegistrationNumber() {
		return registrationNumber;
	}
	public void setRegistrationNumber(String registrationNumber) {
		this.registrationNumber = registrationNumber;
	}
	public String getManufacturer() {
		return manufacturer;
	}
	public void setManufacturer(String manufacturer) {
		this.manufacturer = manufacturer;
	}
	public String getVehicleType() {
		return vehicleType;
	}
	public void setVehicleType(String vehicleType) {
		this.vehicleType = vehicleType;
	}
	public String getBirthYear() {
		return birthYear;
	}
	public void setBirthYear(String birthYear) {
		this.birthYear = birthYear;
	}
	public String getOwnershipType() {
		return ownershipType;
	}
	public void setOwnershipType(String ownershipType) {
		this.ownershipType = ownershipType;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getImageClip() {
		return imageClip;
	}
	public void setImageClip(String imageClip) {
		this.imageClip = imageClip;
	}
	public double getTotalDistance() {
		return totalDistance;
	}
	public void setTotalDistance(double totalDistance) {
		this.totalDistance = totalDistance;
	}
	public double getRemainingFuel() {
		return remainingFuel;
	}
	public void setRemainingFuel(double remainingFuel) {
		this.remainingFuel = remainingFuel;
	}
	public double getDistanceSinceNewOil() {
		return distanceSinceNewOil;
	}
	public void setDistanceSinceNewOil(double distanceSinceNewOil) {
		this.distanceSinceNewOil = distanceSinceNewOil;
	}
	public String getEngineOilStatus() {
		return engineOilStatus;
	}
	public void setEngineOilStatus(String engineOilStatus) {
		this.engineOilStatus = engineOilStatus;
	}
	public String getFuelFilterStatus() {
		return fuelFilterStatus;
	}
	public void setFuelFilterStatus(String fuelFilterStatus) {
		this.fuelFilterStatus = fuelFilterStatus;
	}
	public String getBrakeOilStatus() {
		return brakeOilStatus;
	}
	public void setBrakeOilStatus(String brakeOilStatus) {
		this.brakeOilStatus = brakeOilStatus;
	}
	public String getBrakePedalStatus() {
		return brakePedalStatus;
	}
	public void setBrakePedalStatus(String brakePedalStatus) {
		this.brakePedalStatus = brakePedalStatus;
	}
	public String getCoolingWaterStatus() {
		return coolingWaterStatus;
	}
	public void setCoolingWaterStatus(String coolingWaterStatus) {
		this.coolingWaterStatus = coolingWaterStatus;
	}
	public String getTimingBeltStatus() {
		return timingBeltStatus;
	}
	public void setTimingBeltStatus(String timingBeltStatus) {
		this.timingBeltStatus = timingBeltStatus;
	}
	public String getSparkPlugStatus() {
		return sparkPlugStatus;
	}
	public void setSparkPlugStatus(String sparkPlugStatus) {
		this.sparkPlugStatus = sparkPlugStatus;
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
//* [차량 정보]
//* 차량 ID, 등록번호, 제조사, 차종, 연식, 보유형태, 현황(운행중/대기중), 그림, 
//* 총운행거리, 남은 연료량,
//* 소모품관리 : 엔진오일, 오일교체 후 운행거리, 연료필터, 브레이크 오일, 브레이크 페달, 냉각수, 타이밍벨트, 점화플러그 - 관리자 업데이트
