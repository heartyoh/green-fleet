/**
 * 
 */
package com.heartyoh.service;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.prospectivesearch.ProspectiveSearchServiceFactory;
import com.heartyoh.util.AlarmUtils;
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
		
		//int resultsOffset = Integer.parseInt(request.getParameter("results_offset"));
	    //int resultsCount = Integer.parseInt(request.getParameter("results_count"));
	    //String [] reqSubIDs = request.getParameterValues("id");
	    
	    if (!DataUtils.isEmpty(request.getParameter("document"))) {		    
	    	Entity alarmHist = ProspectiveSearchServiceFactory.getProspectiveSearchService().getDocument(request);
	    	try {
	    		this.alarm(alarmHist);
	    		datastoreService.put(alarmHist);
	    		
	    		if(logger.isInfoEnabled())
	    			logger.info("Location Based Alarm (alarm:" + alarmHist.getProperty("alarm") + ", loc:" + alarmHist.getProperty("loc") + ", vehicle:" + alarmHist.getProperty("vehicle") + ", lat:" + alarmHist.getProperty("lat") + ", lng:" + alarmHist.getProperty("lng") + ") sended!");
	    	} catch (Exception e) {
	    		logger.info("Failed to send location based alarm (alarm:" + alarmHist.getProperty("alarm") + ", loc:" + alarmHist.getProperty("loc") + ", vehicle:" + alarmHist.getProperty("vehicle") + ", lat:" + alarmHist.getProperty("lat") + ", lng:" + alarmHist.getProperty("lng") + ") sended!", e);
	    	}
	    }
	}
	
	/**
	 * 알람을 보냄
	 * 
	 * @param alarmHistory
	 * @return
	 */
	private void alarm(Entity alarmHistory) throws Exception {
		
		Entity alarm = DatastoreUtils.findEntity(alarmHistory.getParent(), "Alarm", DataUtils.newMap("name", alarmHistory.getProperty("alarm")));
		
		if(alarm == null)
			return;
		
		String type = (String)alarm.getProperty("type");
		String[] receivers = DataUtils.toNotNull(alarm.getProperty("dest")).split(",");
		String eventName = (String)alarmHistory.getProperty("evt");
		String content = this.convertMessage((String)alarm.getProperty("msg"), alarmHistory);
		
		if(GreenFleetConstant.ALARM_MAIL.equalsIgnoreCase(type)) {
			StringBuffer subject = new StringBuffer();
			subject.append("Location Based Alarm [").append(alarm.getProperty("name")).append("] : Vehicle [").append(alarmHistory.getProperty("vehicle"));
			subject.append(eventName.equals(GreenFleetConstant.LBA_EVENT_IN) ? "] comes in to Location [" : "] comes out from Location [");
			subject.append(alarm.getProperty("loc")).append("]!\n");
			AlarmUtils.sendMail(null, null, null, receivers, subject.toString(), false, content);
						
		} else if(GreenFleetConstant.ALARM_XMPP.equalsIgnoreCase(type)) {
			AlarmUtils.sendXmppMessage(receivers, content);
		}
		
		alarmHistory.setProperty("type", type);
		alarmHistory.setProperty("send", "Y");
	}
	
	/**
	 * message를 치환 
	 * 
	 * @param message
	 * @param alarmHistory
	 * @return
	 */
	private String convertMessage(String message, Entity alarmHistory) {
		
		String vehicle = (String)alarmHistory.getProperty("vehicle");
		String alarmName = (String)alarmHistory.getProperty("alarm");
		String location = (String)alarmHistory.getProperty("loc");
		String event = (String)alarmHistory.getProperty("evt");
		return message.replaceAll("\\{vehicle\\}", vehicle).replaceAll("\\{alarm\\}", alarmName).replaceAll("\\{location\\}", location).replaceAll("\\{event\\}", event.toUpperCase());
	}	
	
}
