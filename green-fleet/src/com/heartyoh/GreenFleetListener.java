/**
 * 
 */
package com.heartyoh;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.appengine.api.prospectivesearch.FieldType;
import com.google.appengine.api.prospectivesearch.ProspectiveSearchService;
import com.google.appengine.api.prospectivesearch.ProspectiveSearchServiceFactory;

/**
 * GreenFleet의 listener 클래스 
 * 
 * @author jhnam
 */
public class GreenFleetListener implements ServletContextListener {

	private static final Logger logger = LoggerFactory.getLogger(GreenFleetListener.class);

	@Override
	public void contextInitialized(ServletContextEvent event) {
		
		if(logger.isInfoEnabled())
			logger.info("GreenFleetListener initialized...");

		ProspectiveSearchService prospectiveSearch = ProspectiveSearchServiceFactory.getProspectiveSearchService();
	    String topic = "AlarmHistory";
	    String subscriptionId = "SearchBySendFlag";
	    long leaseTimeInMilliseconds = 24 * 60 * 60 * 1000;
	    String query = "send:N";

	    Map<String, FieldType> schema = new HashMap<String, FieldType>();
	    schema.put("send", FieldType.STRING);
	    prospectiveSearch.subscribe(
	        topic,
	        subscriptionId,
	        leaseTimeInMilliseconds,
	        query,
	        schema);
	    
	    if(logger.isInfoEnabled())
	    	logger.info("GreenFleetListener topic 'LbaStatus' saved!");
	}
	
	@Override
	public void contextDestroyed(ServletContextEvent event) {
		
		if(logger.isInfoEnabled())
			logger.info("GreenFleetListener destroyed...");
	}
}
