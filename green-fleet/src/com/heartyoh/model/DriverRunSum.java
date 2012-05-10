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
	 * 0 ~ 10km 속도 구간 
	 */
	private int spdLt10;
	/**
	 * 10 ~ 20km 속도 구간 
	 */	
	private int spdLt20;
	/**
	 * 20 ~ 30km 속도 구간 
	 */	
	private int spdLt30;
	/**
	 * 30 ~ 40km 속도 구간 
	 */	
	private int spdLt40;
	/**
	 * 40 ~ 50km 속도 구간 
	 */	
	private int spdLt50;
	/**
	 * 50 ~ 60km 속도 구간 
	 */	
	private int spdLt60;
	/**
	 * 60 ~ 70km 속도 구간 
	 */	
	private int spdLt70;
	/**
	 * 70 ~ 80km 속도 구간 
	 */	
	private int spdLt80;
	/**
	 * 80 ~ 90km 속도 구간 
	 */	
	private int spdLt90;
	/**
	 * 90 ~ 100km 속도 구간 
	 */	
	private int spdLt100;
	/**
	 * 100 ~ 110km 속도 구간 
	 */	
	private int spdLt110;
	/**
	 * 110 ~ 120km 속도 구간 
	 */	
	private int spdLt120;
	/**
	 * 120 ~ 130km 속도 구간 
	 */	
	private int spdLt130;
	/**
	 * 130 ~ 140km 속도 구간 
	 */	
	private int spdLt140;
	/**
	 * 140 ~ 150km 속도 구간 
	 */	
	private int spdLt150;
	/**
	 * 150 ~ 160km 속도 구간 
	 */	
	private int spdLt160;	
	
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

	public int getSpdLt10() {
		return spdLt10;
	}

	public void setSpdLt10(int spdLt10) {
		this.spdLt10 = spdLt10;
	}

	public int getSpdLt20() {
		return spdLt20;
	}

	public void setSpdLt20(int spdLt20) {
		this.spdLt20 = spdLt20;
	}

	public int getSpdLt30() {
		return spdLt30;
	}

	public void setSpdLt30(int spdLt30) {
		this.spdLt30 = spdLt30;
	}

	public int getSpdLt40() {
		return spdLt40;
	}

	public void setSpdLt40(int spdLt40) {
		this.spdLt40 = spdLt40;
	}

	public int getSpdLt50() {
		return spdLt50;
	}

	public void setSpdLt50(int spdLt50) {
		this.spdLt50 = spdLt50;
	}

	public int getSpdLt60() {
		return spdLt60;
	}

	public void setSpdLt60(int spdLt60) {
		this.spdLt60 = spdLt60;
	}

	public int getSpdLt70() {
		return spdLt70;
	}

	public void setSpdLt70(int spdLt70) {
		this.spdLt70 = spdLt70;
	}

	public int getSpdLt80() {
		return spdLt80;
	}

	public void setSpdLt80(int spdLt80) {
		this.spdLt80 = spdLt80;
	}

	public int getSpdLt90() {
		return spdLt90;
	}

	public void setSpdLt90(int spdLt90) {
		this.spdLt90 = spdLt90;
	}

	public int getSpdLt100() {
		return spdLt100;
	}

	public void setSpdLt100(int spdLt100) {
		this.spdLt100 = spdLt100;
	}

	public int getSpdLt110() {
		return spdLt110;
	}

	public void setSpdLt110(int spdLt110) {
		this.spdLt110 = spdLt110;
	}

	public int getSpdLt120() {
		return spdLt120;
	}

	public void setSpdLt120(int spdLt120) {
		this.spdLt120 = spdLt120;
	}

	public int getSpdLt130() {
		return spdLt130;
	}

	public void setSpdLt130(int spdLt130) {
		this.spdLt130 = spdLt130;
	}

	public int getSpdLt140() {
		return spdLt140;
	}

	public void setSpdLt140(int spdLt140) {
		this.spdLt140 = spdLt140;
	}

	public int getSpdLt150() {
		return spdLt150;
	}

	public void setSpdLt150(int spdLt150) {
		this.spdLt150 = spdLt150;
	}

	public int getSpdLt160() {
		return spdLt160;
	}

	public void setSpdLt160(int spdLt160) {
		this.spdLt160 = spdLt160;
	}	
}
