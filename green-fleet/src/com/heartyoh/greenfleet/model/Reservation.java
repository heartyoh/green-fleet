package com.heartyoh.greenfleet.model;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;
import com.heartyoh.model.Company;

//* [차량 예약 정보]
//* 운행 예약일,
//* 운전자,
//* 차종/차량 ID, 
//* 차량 인도 장소,
//* 목적지 / 용도,
//* 상태 : 예약 완료 등 불가 사유

@PersistenceCapable
public class Reservation {
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent
	private Company company;

	@Persistent
	private String id;
	@Persistent
	private Date reservedDate;
	@Persistent
	private String driver;
	@Persistent
	private String vehicle;
	@Persistent
	private String vehicleType;
	@Persistent
	private String deliveryPlace;
	@Persistent
	private String destination;
	@Persistent
	private String purpose;
	@Persistent
	private String status;
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

	public Date getReservedDate() {
		return reservedDate;
	}

	public void setReservedDate(Date reservedDate) {
		this.reservedDate = reservedDate;
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

	public String getVehicleType() {
		return vehicleType;
	}

	public void setVehicleType(String vehicleType) {
		this.vehicleType = vehicleType;
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
}
