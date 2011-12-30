package com.heartyoh.model;

import java.util.Date;
import java.util.List;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable
public class ControlData {
	 /* 운행일, 운전자, 차량 ID, 차종, 등록번호, 
	 * 
	 * 운전시작시간, 운전종료시간, 운행거리, 운행시간, 평균속도, 최고속도, 운행정보
	 * 
	 * 급가속 횟수, 급감속 횟수, 경제 운전 비율, 연비 - 운전 습관
	 * 
	 * 위험발생시각, 위험발생위치, 충격량, 동영상 - 이벤트 정보
	 */
	
	@PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;

	@Persistent
	private Date date;
	@Persistent
	private String driver;
	@Persistent
	private String vehicle;
	@Persistent
	private Date startTime;
	@Persistent
	private Date endTime;
	@Persistent
	private double distance;
	@Persistent
	private double runningTime;
	@Persistent
	private double averageSpeed;
	@Persistent
	private double highestSpeed;
	@Persistent
	private double suddenAccelCount;
	@Persistent
	private double suddenBrakeCount;
	@Persistent
	private double econoDrivingRatio;
	@Persistent
	private double fuelEfficiency;
	@Persistent
	private List<Incident> incidents;
}
