package com.heartyoh.model;

import java.util.Date;
import java.util.List;

import javax.jdo.annotations.Extension;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.Order;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.codehaus.jackson.annotate.JsonIgnore;

import com.heartyoh.greenfleet.model.Driver;
import com.heartyoh.greenfleet.model.Vehicle;

@PersistenceCapable
public class Company {
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	@Extension(vendorName="datanucleus", key="gae.encoded-pk", value="true")
    private String key;

	@Persistent
	private String id;

	@JsonIgnore
	@Persistent(mappedBy = "company")
	@Order(extensions = @Extension(vendorName="datanucleus", key="list-ordering", value="id asc"))
    private List<Driver> drivers;
	
	@JsonIgnore
	@Persistent(mappedBy = "company")
	@Order(extensions = @Extension(vendorName="datanucleus", key="list-ordering", value="id asc"))
    private List<Vehicle> vehicles;
	
	@Persistent
	private String name;

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

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Date getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Date updatedAt) {
		this.updatedAt = updatedAt;
	}

	public List<Driver> getDrivers() {
		return drivers;
	}

	public void setDrivers(List<Driver> drivers) {
		this.drivers = drivers;
	}

	public List<Vehicle> getVehicles() {
		return vehicles;
	}

	public void setVehicles(List<Vehicle> vehicles) {
		this.vehicles = vehicles;
	}

}
