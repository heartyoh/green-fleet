/**
 * 
 */
package com.heartyoh.report;

import java.util.Date;
import java.util.List;
import java.util.Map;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.heartyoh.model.Report;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 일일 주행일지 리포터 : 운전자 ID, 운전자, 차량 ID, 차량번호, 주행거리, 주행시간, 연료소모량, 연비 
 * 
 * @author jhnam
 */
public class DailyDrivingReporter implements IReporter {

	/**
	 * report id
	 */
	private static final String ID = "daily_driving_log";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { 
		"vehicle_id", 
		"driver_id", 
		"running_time", 
		"distance", 
		"fuel_efficiency" };
	/**
	 * report name
	 */
	private Report report;	
	/**
	 * fromDate
	 */
	private Date fromDate;
	/**
	 * toDate
	 */
	private Date toDate;
	/**
	 * items
	 */
	private List<Map<String, Object>> results;
	
	@Override
	public String getId() {
		return ID;
	}

	@Override
	public void setParameter(Report report, String cycle, Date fromDate, Date toDate) {
		this.report = report;
	}

	/**
	 * 기간 설정 
	 */
	private void setPeriod() {
		if(fromDate == null) {
			Date[] fromToDate = DataUtils.getFromToDateStToday(-2, -1);
			this.fromDate = fromToDate[0];
			this.toDate = fromToDate[1];
		}		
	}
	
	@Override
	public void execute() throws Exception{
		
		DatastoreService datastoreService = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = KeyFactory.createKey("Company", this.report.getCompany());
		Query q = new Query("CheckinData");
		q.setAncestor(companyKey);	
		this.setPeriod();
		q.addFilter("engine_end_time", Query.FilterOperator.GREATER_THAN_OR_EQUAL, this.fromDate);
		q.addFilter("engine_end_time", Query.FilterOperator.LESS_THAN_OR_EQUAL, this.toDate);		
		PreparedQuery pq = datastoreService.prepare(q);
		
		for(Entity consumable : pq.asIterable()) {
			Map<String, Object> map = SessionUtils.cvtEntityToMap(consumable, SELECT_FILEDS);
			this.results.add(map);
		}		
	}

	@Override
	public void sendReport() throws Exception {
		String content = this.createContent();
		String[] receiverEmails = this.report.getSendTo().split(",");
		AlarmUtils.sendMail(null, null, null, receiverEmails, this.report.getName(), true, content);
	}
	
	/**
	 * 메일 내용을 생성 
	 * 
	 * @return
	 */
	private String createContent() {
		
		StringBuffer content = new StringBuffer();		
		content.append("<h1 align='center'>");		
		content.append("Daily driving log by drivers");
		content.append("</h1><br><br>");
		
		if(!this.results.isEmpty()) {
			content.append("<table border='1' align='center'>");
			content.append("<tr>");
			content.append("<td>Driver ID</td>");
			content.append("<td>Driver Name</td>");
			content.append("<td>Vehicle Id</td>");
			content.append("<td>Vehicle No.</td>");
			content.append("<td>Running Time</td>");
			content.append("<td>Distance</td><td>Fuel Efficiency</td>");
			content.append("</tr>");
			
			for(Map<String, Object> checkinData : this.results) {
				String vehicleId = (String)checkinData.get("vehicle_id");
				String driverId = (String)checkinData.get("driver_id");
				// TODO vehicleId, driverId로 vehicle No. driver name을 조회하여 추가 
				content.append("<tr>");
				content.append("<td>").append(driverId).append("</td>");
				content.append("<td>").append("").append("</td>");
				content.append("<td>").append(vehicleId).append("</td>");
				content.append("<td>").append("").append("</td>");
				content.append("<td align='right'>").append(checkinData.get("running_time")).append("</td>");
				content.append("<td align='right'>").append(checkinData.get("distance")).append("</td>");
				content.append("<td align='center'>").append(checkinData.get("fuel_efficiency")).append("</td>");
				content.append("</tr>");				
			}
			
			content.append("</table>");
			
		} else {
			content.append("There is no data to report!");
		}
		
		return content.toString();
	}
}
