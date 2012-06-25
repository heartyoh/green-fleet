/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

/**
 * Vehicle 모델 
 * 
 * @author jhnam
 */
public class Vehicle extends AbstractEntity {

	/**
	 * id
	 */
	private String id;
	/**
	 * driver id
	 */
	private String driverId;
	/**
	 * vehicle id
	 */
	private String terminalId;
	/**
	 * 차량번호 
	 */
	private String registrationNumber;
	/**
	 * 연식  
	 */
	private int birthYear;
	/**
	 * 제조사  
	 */
	private String manufacturer;
	/**
	 * 차량모델   
	 */
	private String vehicleModel;	
	/**
	 * 차량타입 
	 */
	private String vehicleType;
	/**
	 * 연료타입 - 디젤, 가솔린, 가스 
	 */
	private String fuelType;
	/**
	 * ownership type 
	 */
	private String ownershipType;
	/**
	 * 상태 - 주행중, 정차중, 수리중, 사고  
	 */
	private String status;
	/**
	 * 건강 상태  
	 */
	private String healthStatus;
	/**
	 * 총 주행거리  
	 */
	private float totalDistance;
	/**
	 * 총 주행시간
	 */
	private int totalRunTime;
	/**
	 * 남은 기름량  
	 */
	private float remainingFuel;
	/**
	 * 공인연비 
	 */
	private float officialEffcc;
	/**
	 * 평균연비 
	 */
	private float avgEffcc;
	/**
	 * 에코 지수
	 */
	private int ecoIndex;
	/**
	 * 경제 주행 비율 
	 */
	private int ecoRunRate;
	/**
	 * 차량 위치 : 위도 
	 */
	private float lat;
	/**
	 * 차량 위치 : 경도 
	 */
	private float lng;
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
	public Vehicle() {
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param id
	 */
	public Vehicle(String company, String id) {
		this.company = company;
		this.id = id;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getDriverId() {
		return driverId;
	}

	public void setDriverId(String driverId) {
		this.driverId = driverId;
	}

	public String getTerminalId() {
		return terminalId;
	}

	public void setTerminalId(String terminalId) {
		this.terminalId = terminalId;
	}

	public String getRegistrationNumber() {
		return registrationNumber;
	}

	public void setRegistrationNumber(String registrationNumber) {
		this.registrationNumber = registrationNumber;
	}

	public int getBirthYear() {
		return birthYear;
	}

	public void setBirthYear(int birthYear) {
		this.birthYear = birthYear;
	}

	public String getManufacturer() {
		return manufacturer;
	}

	public void setManufacturer(String manufacturer) {
		this.manufacturer = manufacturer;
	}

	public String getVehicleModel() {
		return vehicleModel;
	}

	public void setVehicleModel(String vehicleModel) {
		this.vehicleModel = vehicleModel;
	}

	public String getVehicleType() {
		return vehicleType;
	}

	public void setVehicleType(String vehicleType) {
		this.vehicleType = vehicleType;
	}

	public String getFuelType() {
		return fuelType;
	}

	public void setFuelType(String fuelType) {
		this.fuelType = fuelType;
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

	public String getHealthStatus() {
		return healthStatus;
	}

	public void setHealthStatus(String healthStatus) {
		this.healthStatus = healthStatus;
	}

	public float getTotalDistance() {
		return totalDistance;
	}

	public void setTotalDistance(float totalDistance) {
		this.totalDistance = totalDistance;
	}

	public int getTotalRunTime() {
		return totalRunTime;
	}

	public void setTotalRunTime(int totalRunTime) {
		this.totalRunTime = totalRunTime;
	}

	public float getOfficialEffcc() {
		return officialEffcc;
	}

	public void setOfficialEffcc(float officialEffcc) {
		this.officialEffcc = officialEffcc;
	}

	public float getAvgEffcc() {
		return avgEffcc;
	}

	public void setAvgEffcc(float avgEffcc) {
		this.avgEffcc = avgEffcc;
	}

	public int getEcoIndex() {
		return ecoIndex;
	}

	public void setEcoIndex(int ecoIndex) {
		this.ecoIndex = ecoIndex;
	}

	public int getEcoRunRate() {
		return ecoRunRate;
	}

	public void setEcoRunRate(int ecoRunRate) {
		this.ecoRunRate = ecoRunRate;
	}

	public float getRemainingFuel() {
		return remainingFuel;
	}

	public void setRemainingFuel(float remainingFuel) {
		this.remainingFuel = remainingFuel;
	}

	public float getLat() {
		return lat;
	}

	public void setLat(float lat) {
		this.lat = lat;
	}

	public float getLng() {
		return lng;
	}

	public void setLng(float lng) {
		this.lng = lng;
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
	public String getUniqueValue() {
		return this.company + "@" + this.id;
	}

	@Override
	public void beforeSave() {
		if(this.id == null) {
			this.createdAt = new Date();
			this.updatedAt = this.createdAt;
		} else {
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
}
