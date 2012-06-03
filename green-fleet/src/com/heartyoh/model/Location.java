/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

/**
 * Location Entity
 * 
 * @author jhnam
 */
public class Location extends AbstractEntity {

	/**
	 * vehicle group name
	 */
	private String name;
	/**
	 * vehicle group explanation
	 */
	private String expl;
	/**
	 * 위치 주소 
	 */
	private String addr;
	/**
	 * 위치의 반경
	 */
	private float rad;
	/**
	 * 위치 latitude
	 */
	private float lat;
	/**
	 * 위치 longitude
	 */
	private float lng;
	/**
	 * 위치 latitude 범위 중 위쪽 범위 
	 */
	private float latHi;
	/**
	 * 위치 latitude 범위 중 아래쪽 범위
	 */
	private float latLo;
	/**
	 * 위치 longitude 범위 중 위쪽 범위
	 */
	private float lngHi;
	/**
	 * 위치 longitude 범위 중 아래쪽 범위
	 */
	private float lngLo;
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
	public Location() {		
	}
	
	/**
	 * 키 생성자 
	 * 
	 * @param company
	 * @param name
	 */
	public Location(String company, String name) {
		this.company = company;
		this.name = name;
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param name
	 * @param expl
	 * @param addr
	 * @param rad
	 * @param lat
	 * @param lng
	 * @param latHi
	 * @param latLo
	 * @param lngHi
	 * @param lngLo
	 */
	public Location(String company, String name, String expl, String addr, float rad, float lat, float lng, float latHi, float latLo, float lngHi, float lngLo) {
		this.company = company;
		this.name = name;
		this.expl = expl;
		this.addr = addr;
		this.rad = rad;
		this.lat = lat;
		this.lng = lng;
		this.latHi = latHi;
		this.latLo = latLo;
		this.lngHi = lngHi;
		this.lngLo = lngLo;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getExpl() {
		return expl;
	}
	
	public void setExpl(String expl) {
		this.expl = expl;
	}
	
	public String getAddr() {
		return addr;
	}

	public void setAddr(String addr) {
		this.addr = addr;
	}

	public float getRad() {
		return rad;
	}

	public void setRad(float rad) {
		this.rad = rad;
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

	public float getLatHi() {
		return latHi;
	}

	public void setLatHi(float latHi) {
		this.latHi = latHi;
	}

	public float getLatLo() {
		return latLo;
	}

	public void setLatLo(float latLo) {
		this.latLo = latLo;
	}

	public float getLngHi() {
		return lngHi;
	}

	public void setLngHi(float lngHi) {
		this.lngHi = lngHi;
	}

	public float getLngLo() {
		return lngLo;
	}

	public void setLngLo(float lngLo) {
		this.lngLo = lngLo;
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
		if(this.createdAt == null)
			this.createdAt = new Date();
		
		if(this.updatedAt == null)
			this.updatedAt = new Date();
	}

	@Override
	public void beforeCreate() {
		if(this.createdAt == null)
			this.createdAt = new Date();
	}

	@Override
	public void beforeUpdate() {
		if(this.updatedAt == null)
			this.updatedAt = new Date();
	}
	
	@Override
	public String getUniqueValue() {
		return this.company + "@" + this.name;
	}	
}
