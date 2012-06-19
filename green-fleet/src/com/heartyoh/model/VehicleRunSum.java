/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

import com.heartyoh.util.DataUtils;

/**
 * VehicleRunSum Entity
 * 
 * @author jhnam
 */
public class VehicleRunSum extends AbstractEntity {

	/**
	 * 차량 아이디
	 */
	private String vehicle;	
	/**
	 * year
	 */
	private int year;
	/**
	 * month
	 */
	private int month;
	/**
	 * year-month
	 */
	private Date monthDate;
	/**
	 * 주행시간 
	 */
	private int runTime;
	/**
	 * 주행거리 
	 */
	private float runDist;
	/**
	 * 연료소모량 
	 */
	private float consmpt;
	/**
	 * CO2 배출량 
	 */
	private float co2Emss;
	/**
	 * 연비 
	 */
	private float effcc;
	/**
	 * 에코 지수 
	 */
	private int ecoIndex;
	/**
	 * 에코 지수 합 
	 */
	private int ecoIndexSum;
	/**
	 * 연비 합 
	 */
	private float effccSum;
	/**
	 * 이달의 총 서머리 횟수 : 에코 지수, 연비는 에코 지수 합, 연비 합과 서머리 횟수로 평균을 내서 계산 
	 */
	private int sumCount;	
	/**
	 * 고장 횟수 
	 */
	private int oosCnt;
	/**
	 * 정비 횟수 
	 */
	private int mntCnt;
	/**
	 * 정비 시간 
	 */
	private int mntTime;	
	
	/**
	 * 기본 생성자 
	 */
	public VehicleRunSum() {
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param vehicle
	 * @param year
	 * @param month
	 */
	public VehicleRunSum(String company, String vehicle, int year, int month) {
		this.company = company;
		this.vehicle = vehicle;
		this.year = year;
		this.month = month;		
		Date monthDate = DataUtils.toDate(this.year + "-" + (this.month < 10 ? "0" : "") + this.month + "-01");
		this.setMonthDate(monthDate);
	}

	public String getVehicle() {
		return vehicle;
	}

	public void setVehicle(String vehicle) {
		this.vehicle = vehicle;
	}
	
	public int getYear() {
		return year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	public int getMonth() {
		return month;
	}

	public void setMonth(int month) {
		this.month = month;
	}
	
	public Date getMonthDate() {
		return monthDate;
	}

	public void setMonthDate(Date monthDate) {
		this.monthDate = monthDate;
	}	

	public int getRunTime() {
		return runTime;
	}

	public void setRunTime(int runTime) {
		this.runTime = runTime;
	}

	public float getRunDist() {
		return runDist;
	}

	public void setRunDist(float runDist) {
		this.runDist = runDist;
	}

	public float getConsmpt() {
		return consmpt;
	}

	public void setConsmpt(float consmpt) {
		this.consmpt = consmpt;
	}

	public float getCo2Emss() {
		return co2Emss;
	}

	public void setCo2Emss(float co2Emss) {
		this.co2Emss = co2Emss;
	}

	public float getEffcc() {
		return effcc;
	}

	public void setEffcc(float effcc) {
		this.effcc = effcc;
	}
	
	public int getEcoIndex() {
		return ecoIndex;
	}

	public void setEcoIndex(int ecoIndex) {
		this.ecoIndex = ecoIndex;
	}

	public int getEcoIndexSum() {
		return ecoIndexSum;
	}

	public void setEcoIndexSum(int ecoIndexSum) {
		this.ecoIndexSum = ecoIndexSum;
	}

	public float getEffccSum() {
		return effccSum;
	}

	public void setEffccSum(float effccSum) {
		this.effccSum = effccSum;
	}

	public int getSumCount() {
		return sumCount;
	}

	public void setSumCount(int sumCount) {
		this.sumCount = sumCount;
	}

	public int getOosCnt() {
		return oosCnt;
	}

	public void setOosCnt(int oosCnt) {
		this.oosCnt = oosCnt;
	}

	public int getMntCnt() {
		return mntCnt;
	}

	public void setMntCnt(int mntCnt) {
		this.mntCnt = mntCnt;
	}

	public int getMntTime() {
		return mntTime;
	}

	public void setMntTime(int mntTime) {
		this.mntTime = mntTime;
	}

	@Override
	public String getUniqueValue() {
		return this.company + "@" + this.vehicle + "@" + this.year + "@" + this.month;
	}	
}
