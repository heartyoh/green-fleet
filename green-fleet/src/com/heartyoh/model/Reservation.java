/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

import com.heartyoh.util.GUIDGenerator;

/**
 * 예약 
 * 
 * @author jhnam
 */
public class Reservation extends AbstractEntity {

	/**
	 * id
	 */
	private String id;
	/**
	 * 차량 Id
	 */
	private String vehicleId;
	/**
	 * 예약시작일시 
	 */
	private Date startDate;
	/**
	 * 예약완료일시 
	 */
	private Date endDate;
	/**
	 * 차량타입 
	 */
	private String vehicleType;
	/**
	 * 운전자 Id
	 */
	private String driverId;
	/**
	 * 탁송장소 
	 */
	private String deliveryPlace;
	/**
	 * 목적지 
	 */
	private String destination;
	/**
	 * 목적 
	 */
	private String purpose;
	/**
	 * 상태 
	 */
	private String status;
	/**
	 * 생성일시  
	 */
	private Date createdAt;
	/**
	 * 수정일시 
	 */
	private Date updatedAt;

	public Reservation() {		
	}
	
	public Reservation(String id) {
		this.id = id;
	}
	
	public Reservation(String company, String vehicleId, Date startDate, Date endDate) {
		this.company = company;
		this.vehicleId = vehicleId;
		this.startDate = startDate;
		this.endDate = endDate;
	}
	
	@Override
	public String getUniqueValue() {
		return "" + this.id;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getVehicleId() {
		return vehicleId;
	}

	public void setVehicleId(String vehicleId) {
		this.vehicleId = vehicleId;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public String getVehicleType() {
		return vehicleType;
	}

	public void setVehicleType(String vehicleType) {
		this.vehicleType = vehicleType;
	}

	public String getDriverId() {
		return driverId;
	}

	public void setDriverId(String driverId) {
		this.driverId = driverId;
	}

	public String getDeliveryPlace() {
		return deliveryPlace;
	}

	public void setDeliveryPlace(String deliveryPlace) {
		this.deliveryPlace = deliveryPlace;
	}

	public String getDestination() {
		return destination;
	}

	public void setDestination(String destination) {
		this.destination = destination;
	}

	public String getPurpose() {
		return purpose;
	}

	public void setPurpose(String purpose) {
		this.purpose = purpose;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
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
		
		if(this.id == null)
			this.id = GUIDGenerator.nextGUID();
		
		if(this.createdAt == null)
			this.createdAt = new Date();
		
		if(this.updatedAt == null)
			this.updatedAt = new Date();
	}

	@Override
	public void beforeCreate() {
		if(this.id == null)
			this.id = GUIDGenerator.nextGUID();
		
		if(this.createdAt == null)
			this.createdAt = new Date();
	}

	@Override
	public void beforeUpdate() {
		if(this.updatedAt == null)
			this.updatedAt = new Date();
	}	
	
}
