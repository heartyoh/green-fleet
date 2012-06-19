/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

import com.heartyoh.util.DataUtils;

/**
 * DriverRunSum Entity
 * 
 * @author jhnam
 */
public class DriverRunSum extends AbstractEntity {
	/**
	 * 운전자 아이디
	 */
	private String driver;	
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
	 * 급가속 횟수 
	 */
	private int sudAccelCnt;
	/**
	 * 급감속 횟수 
	 */
	private int sudBrakeCnt;
	/**
	 * 경제운전시간 
	 */
	private int ecoDrvTime;
	/**
	 * 과속시간 
	 */
	private int ovrSpdTime;
	/**
	 * 사고횟수 
	 */
	private int incCnt;
	
	
	/**
	 * 기본 생성자 
	 */
	public DriverRunSum() {
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param driver
	 * @param year
	 * @param month
	 */
	public DriverRunSum(String company, String driver, int year, int month) {
		this.company = company;
		this.driver = driver;
		this.year = year;
		this.month = month;		
		Date monthDate = DataUtils.toDate(this.year + "-" + (this.month < 10 ? "0" : "") + this.month + "-01");
		this.setMonthDate(monthDate);
	}

	public String getDriver() {
		return driver;
	}

	public void setDriver(String driver) {
		this.driver = driver;
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

	public int getSudAccelCnt() {
		return sudAccelCnt;
	}

	public void setSudAccelCnt(int sudAccelCnt) {
		this.sudAccelCnt = sudAccelCnt;
	}

	public int getSudBrakeCnt() {
		return sudBrakeCnt;
	}

	public void setSudBrakeCnt(int sudBrakeCnt) {
		this.sudBrakeCnt = sudBrakeCnt;
	}

	public int getEcoDrvTime() {
		return ecoDrvTime;
	}

	public void setEcoDrvTime(int ecoDrvTime) {
		this.ecoDrvTime = ecoDrvTime;
	}

	public int getOvrSpdTime() {
		return ovrSpdTime;
	}

	public void setOvrSpdTime(int ovrSpdTime) {
		this.ovrSpdTime = ovrSpdTime;
	}

	public int getIncCnt() {
		return incCnt;
	}

	public void setIncCnt(int incCnt) {
		this.incCnt = incCnt;
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

	@Override
	public String getUniqueValue() {
		return this.company + "@" + this.driver + "@" + this.year + "@" + this.month;
	}
}
