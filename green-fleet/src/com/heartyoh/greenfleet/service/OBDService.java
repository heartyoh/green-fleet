package com.heartyoh.greenfleet.service;

import java.io.Writer;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.service.FileService;

@Controller
public class OBDService {
	private static final Logger logger = LoggerFactory.getLogger(FileService.class);
	private DatastoreService datastoreService = DatastoreServiceFactory.getDatastoreService();

	@RequestMapping(value = "/data/obddata.json", method = RequestMethod.GET)
	public @ResponseBody List<Map<String, Object>> getObdData(HttpServletRequest request, HttpServletResponse response) {
		return null;
	}
	
	/*
	 * [차량 정보]
	 * 차량 ID, 등록번호, 제조사, 차종, 연식, 보유형태, 현황(운행중/대기중), 그림, 
	 * 총운행거리, 남은 연료량,
	 * 소모품관리 : 엔진오일, 오일교체 후 운행거리, 연료필터, 브레이크 오일, 브레이크 페달, 냉각수, 타이밍벨트, 점화플러그 - 관리자 업데이트
	 * 
	 * [운전자 정보]
	 * 성명, 사원 ID, 부서, 직함, 사진
	 * 
	 * [차량 예약 정보]
	 * 운행 예약일,
	 * 운전자,
	 * 차종/차량 ID, 
	 * 차량 인도 장소,
	 * 목적지 / 용도,
	 * 상태 : 예약 완료 등 불가 사유
	 * 
	 * [운전자기준 관제 정보]
	 * 운전일
	 * 차량 ID
	 * 차종
	 * 등록번호
	 * 
	 * 운전시작시간, 운전종료시간, 운행거리, 운행시간, 평균속도, 최고속도, 운행정보(맵, GPS, 이벤트 발생 장소 표시) 
	 * 
	 * 급가속 횟수, 급감속횟수, 경제 운전 비율, 연비 - 운전습관
	 * 
	 * 위험발생시각, 위험발생위치, 충격량, 동영상 - 이벤트 정보
	 * 
	 * 운전자별 누적 운행거리
	 * 
	 * [차량기준 관제 정보]
	 * 
	 * 운행일, 운전자, 차량 ID, 차종, 등록번호, 
	 * 
	 * 운전시작시간, 운전종료시간, 운행거리, 운행시간, 평균속도, 최고속도, 운행정보
	 * 
	 * 급가속 횟수, 급감속 횟수, 경제 운전 비율, 연비 - 운전 습관
	 * 
	 * 위험발생시각, 위험발생위치, 충격량, 동영상 - 이벤트 정보
	 * 
	 * 
	 */
	
	@RequestMapping(value = "/data/obddata", method = RequestMethod.POST)
	public @ResponseBody String postObdData(@RequestBody Map<String, Object> data, HttpServletRequest request, HttpServletResponse response) {
//		String vehicle = request.getParameter("vehicle");
//		String speed = req.getParameter("speed");
//		String gas = req.getParameter("gas");
//		String tirePressure = req.getParameter("tirePressure");
//		String longitude = req.getParameter("longitude");
//		String latitude = req.getParameter("latitude");
//
//		Date now = new Date();
//
//		Key key = KeyFactory.createKey("Vehicle", vehicle);
//
//		Entity obd = new Entity("OBD", key);
//		obd.setProperty("vehicle", vehicle);
//		obd.setProperty("speed", speed);
//		obd.setProperty("gas", gas);
//		obd.setProperty("tirePressure", tirePressure);
//		obd.setProperty("longitude", longitude); // 126°58'40.63"E
//		obd.setProperty("latitude", latitude); // 37°33'58.87"N
//		obd.setProperty("time", now);
//
//		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
//		datastore.put(obd);
//
//		resp.setStatus(HttpServletResponse.SC_OK);
//		resp.setContentType("application/json");
//		Writer writer = resp.getWriter();
//		writer.write("{success:true}");
//		writer.flush();
		return "";
	}
}
