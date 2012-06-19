/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;


/**
 * Driver Speed Sum 모델 
 * 
 * @author jhnam
 */
public class DriverSpeedSum extends AbstractEntity {

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
	
	public DriverSpeedSum() {		
	}
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param driver
	 * @param year
	 * @param month
	 */
	public DriverSpeedSum(String company, String driver, int year, int month) {
		this.company = company;
		this.driver = driver;
		this.year = year;
		this.month = month;		
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

	@Override
	public String getUniqueValue() {
		return this.company + "@" + this.driver + "@" + this.year + "@" + this.month;
	}
}
