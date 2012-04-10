/**
 * 
 */
package com.heartyoh.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.prospectivesearch.ProspectiveSearchServiceFactory;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * Prospective Search 서비스 컨트롤러
 * 
 * @author jhnam
 */
@Controller
public class ProspectiveSearchService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(ProspectiveSearchService.class);
	
	/**
	 * location baased alarm을 처리한다. 
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value = "/prospective/lba_alarm", method = RequestMethod.POST)
	public void lbaAlarm(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
	    if (!DataUtils.isEmpty(request.getParameter("document"))) {
	    	Entity alarmHist = ProspectiveSearchServiceFactory.getProspectiveSearchService().getDocument(request);
	    	try {
	    		this.alarm(alarmHist);
	    		DatastoreServiceFactory.getDatastoreService().put(alarmHist);
	    		
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
