/**
 * 
 */
package com.heartyoh.service;

import java.io.IOException;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.prospectivesearch.ProspectiveSearchServiceFactory;
import com.heartyoh.util.AsyncUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * ProspectiveSearch에 대한 Match 결과를 처리하는 Servlet
 * 
 * @author jhnam
 */
public class ProspectiveSearchMatchServlet extends HttpServlet {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 1L;
	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(ProspectiveSearchMatchServlet.class);
	/**
	 * datastore service
	 */
	private static DatastoreService datastoreService = DatastoreServiceFactory.getDatastoreService();

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
	    if(logger.isInfoEnabled())
	    	logger.info("ProspectiveSearchMatchServlet doPost called!");
	    
		int resultsOffset = Integer.parseInt(request.getParameter("results_offset"));
	    int resultsCount = Integer.parseInt(request.getParameter("results_count"));
	    String [] reqSubIDs = request.getParameterValues("id");
	    
	    if (!DataUtils.isEmpty(request.getParameter("document"))) {
		    if(logger.isInfoEnabled())
		    	logger.info("Subscribe Id : " + reqSubIDs[0] + ", offset : " + resultsOffset + ", count : " + resultsCount);
		    
	    	Entity lbaStatus = ProspectiveSearchServiceFactory.getProspectiveSearchService().getDocument(request);
	    	// TODO lattitude, longitude를 추가해야 함...
	    	Entity alarmHist = this.alarm(lbaStatus, 0f, 0f);
	    	lbaStatus.setProperty("evt", null);
	    	datastoreService.put(lbaStatus);
	    	datastoreService.put(alarmHist);
	    }
	}
	
	/**
	 * 알람을 보냄
	 * 
	 * @param lbaStatus
	 * @param eventName
	 * @return
	 */
	private Entity alarm(Entity lbaStatus, float lattitude, float longitude) {
		
		Entity alarm = DatastoreUtils.findEntity(lbaStatus.getParent(), "Alarm", DataUtils.newMap("name", lbaStatus.getProperty("alarm")));
		
		if(alarm == null)
			return null;
		
		String company = lbaStatus.getParent().getName();
		String type = (String)alarm.getProperty("type");
		String[] receivers = DataUtils.toNotNull(alarm.getProperty("dest")).split(",");
		String eventName = (String)lbaStatus.getProperty("evt");
		String content = this.convertMessage((String)alarm.getProperty("msg"), eventName, lbaStatus);
		
		if(GreenFleetConstant.ALARM_MAIL.equalsIgnoreCase(type)) {
			StringBuffer subject = new StringBuffer();
			subject.append("Location Based Alarm [").append(alarm.getProperty("name")).append("] : Vehicle [").append(lbaStatus.getProperty("vehicle"));
			subject.append(eventName.equals(GreenFleetConstant.LBA_EVENT_IN) ? "] comes in to Location [" : "] comes out from Location [");
			subject.append(alarm.getProperty("loc")).append("]!\n");			
			try {
				AsyncUtils.addMailTaskToQueue(company, receivers, subject.toString(), content);
			} catch (Exception e) {
				logger.error("Failed to add email task to queue!", e);
			}
			
			return this.saveAlarmHistory(alarm, lbaStatus, lattitude, longitude);
			
		} else if(GreenFleetConstant.ALARM_XMPP.equalsIgnoreCase(type)) {
			try {
				AsyncUtils.addXmppTaskToQueue(company, receivers, content);
			} catch (Exception e) {
				logger.error("Failed to add xmpp task to queue!", e);
			}
			
			return this.saveAlarmHistory(alarm, lbaStatus, lattitude, longitude);
		}
		
		return null;
	}
	
	/**
	 * message를 치환 
	 * 
	 * @param message
	 * @param event
	 * @param lbaStatus
	 * @return
	 */
	private String convertMessage(String message, String event, Entity lbaStatus) {
		
		String vehicle = (String)lbaStatus.getProperty("vehicle");
		String alarmName = (String)lbaStatus.getProperty("alarm");
		String location = (String)lbaStatus.getProperty("loc");
		return message.replaceAll("\\{vehicle\\}", vehicle).replaceAll("\\{alarm\\}", alarmName).replaceAll("\\{location\\}", location).replaceAll("\\{event\\}", event.toUpperCase());		
	}	
	
	/**
	 * alarmHistory를 생성하여 리턴 
	 * 
	 * @param companyKey
	 * @param alarm
	 * @param lbaStatus
	 * @param eventName
	 * @return
	 */
	private Entity saveAlarmHistory(Entity alarm, Entity lbaStatus, float lattitude, float longitude) {
		
		String vehicle = (String)lbaStatus.getProperty("vehicle");
		String alarmName = (String)lbaStatus.getProperty("alarm");
		String datetimeStr = DataUtils.dateToString((Date)lbaStatus.getProperty("updated_at"), "yyyy-MM-dd HH:mm:ss");
		String idValue = vehicle + "@" + alarmName + "@" + datetimeStr;
		String eventName = (String)lbaStatus.getProperty("evt");
		Key alarmHistKey = KeyFactory.createKey(lbaStatus.getParent(), "AlarmHistory", idValue);
		Entity alarmHistory = new Entity(alarmHistKey);
		alarmHistory.setProperty("vehicle", vehicle);
		alarmHistory.setProperty("alarm", alarmName);
		alarmHistory.setProperty("loc", lbaStatus.getProperty("loc"));
		alarmHistory.setProperty("datetime", datetimeStr);
		alarmHistory.setProperty("event", eventName);
		alarmHistory.setProperty("lat", lattitude);
		alarmHistory.setProperty("lng", longitude);
		alarmHistory.setProperty("alarm_type", alarm.getProperty("type"));
		return alarmHistory;
	}
}
