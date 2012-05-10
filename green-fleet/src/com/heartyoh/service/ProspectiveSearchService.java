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
import com.heartyoh.model.Alarm;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.ConnectionManager;
import com.heartyoh.util.DataUtils;
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
		
	    if (DataUtils.isEmpty(request.getParameter("document")))
	    	return;
	    
    	Entity alarmHist = ProspectiveSearchServiceFactory.getProspectiveSearchService().getDocument(request);
    	try {
    		this.alarm(alarmHist);
    		if(logger.isInfoEnabled())
    			logger.info("Location Based Alarm (alarm:" + alarmHist.getProperty("alarm") + ", loc:" + alarmHist.getProperty("loc") + ", vehicle:" + alarmHist.getProperty("vehicle") + ", lat:" + alarmHist.getProperty("lat") + ", lng:" + alarmHist.getProperty("lng") + ") sended!");
    	} catch (Exception e) {
    		logger.info("Failed to send location based alarm (alarm:" + alarmHist.getProperty("alarm") + ", loc:" + alarmHist.getProperty("loc") + ", vehicle:" + alarmHist.getProperty("vehicle") + ", lat:" + alarmHist.getProperty("lat") + ", lng:" + alarmHist.getProperty("lng") + ") sended!", e);
    	}
	}
	
	/**
	 * 알람을 보냄
	 * 
	 * @param alarmHist
	 * @throws
	 */
	private void alarm(Entity alarmHist) throws Exception {
		
		Alarm alarm = new Alarm(alarmHist.getParent().getName(), (String)alarmHist.getProperty("alarm"));
		alarm = ConnectionManager.getInstance().getDml().select(alarm);
		
		if(alarm == null || DataUtils.isEmpty(alarm.getDest()))
			return;
				
		String[] receivers = alarm.getDest().split(",");
		String type = alarm.getType();
		String eventName = (String)alarmHist.getProperty("evt");
		String content = this.convertMessage(alarm.getMsg(), alarmHist);
		
		if(GreenFleetConstant.ALARM_MAIL.equalsIgnoreCase(type)) {
			StringBuffer subject = new StringBuffer();
			subject.append("Location Based Alarm [").append(alarm.getName()).append("] : Vehicle [").append(alarmHist.getProperty("vehicle"));
			subject.append(eventName.equals(GreenFleetConstant.LBA_EVENT_IN) ? "] comes in to Location [" : "] comes out from Location [");
			subject.append(alarm.getEvtName()).append("]!\n");
			AlarmUtils.sendMail(null, null, null, receivers, subject.toString(), false, content);
						
		} else if(GreenFleetConstant.ALARM_XMPP.equalsIgnoreCase(type)) {
			AlarmUtils.sendXmppMessage(receivers, content);
		}
		
		alarmHist.setUnindexedProperty("type", type);
		alarmHist.setProperty("send", "Y");
		DatastoreServiceFactory.getDatastoreService().put(alarmHist);
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
