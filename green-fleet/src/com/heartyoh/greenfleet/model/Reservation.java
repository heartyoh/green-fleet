package com.heartyoh.greenfleet.model;

import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

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
}
