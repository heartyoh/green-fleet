/**
 * 
 */
package com.heartyoh.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
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
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.xmpp.Message;
import com.google.appengine.api.xmpp.MessageType;
import com.google.appengine.api.xmpp.XMPPService;
import com.google.appengine.api.xmpp.XMPPServiceFactory;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;

/**
 * XMPP Message 처리 서블릿 
 * 
 * @author jhnam
 */
public class XMPPMessageServlet extends HttpServlet {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 8106760150278798310L;

	private static final Logger logger = LoggerFactory.getLogger(XMPPMessageServlet.class);

	private static XMPPService xmppService = XMPPServiceFactory.getXMPPService();
	
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request,response);
    }
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		// 메세지 수신
        Message message = xmppService.parseMessage(request);
        MessageType mType = message.getMessageType();        
        
        if(MessageType.CHAT == mType) {
        	this.processChatMessage(message);
        } else if(MessageType.ERROR == mType) {
        	this.processErrorMessage(request, message);
        }
	}
    
	/**
	 * xmpp chat message를 처리한다. 
	 * 
	 * @param message
	 */
    private void processChatMessage(Message message) {
    	
    	if(logger.isInfoEnabled())
    		logger.info("GreenFleets received xmpp message from : " + message.getFromJid().getId().split("/")[0] + ", messageType " + message.getMessageType() + ", body : " + message.getBody());
    	
        String resMsg = this.getResMsg(message.getBody());
        
        if(!DataUtils.isEmpty(resMsg)) {
        	// 메세지 발신
        	try {
        		AlarmUtils.sendXmppMessage(message.getFromJid().getId().split("/")[0], resMsg);
        	} catch (Exception e) {
        		logger.error("Error when sending XMPP message!", e);
        	}
        }
    }
    
    /**
     * xmpp error message를 처리한다. 
     * 
     * @param request
     * @param message
     * @throws IOException
     */
    private void processErrorMessage(HttpServletRequest request, Message message) throws IOException {
    	
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		ServletInputStream inputStream = request.getInputStream();
		
		try {
			int next = inputStream.read();
			while (next > -1) {
				baos.write(next);
				next = inputStream.read();
			}
			baos.flush();
			
		} catch(Exception e) {
			logger.error("Error while receiving error stanza", e);
			
		} finally {
			if(baos != null)
				baos.close();
		}
		
		String msg = "Failed to send xmpp message! " + baos.toString();
		logger.error("Error stanza received : " + msg);    	
    }
    
	/**
	 * 특정한 메시지에는 응답 메시지를 리턴한다.
	 * 
	 * @param reqMsg
	 * @return
	 */
	private String getResMsg(String reqMsg) {
		
		if(DataUtils.isEmpty(reqMsg))
			return null;
		
		Key companyKey = this.parseCompanyKey(reqMsg);
		String resMsg = null;
		
		if(reqMsg.startsWith("health")) {
			resMsg = "Good!";
			
		// vehicles_to_repair company=vitizen
		} else if(reqMsg.startsWith("vehicles_to_repair")) {
			// 0. 쿼리 : 오늘 날짜로 정비 스케줄이 잡혀 있는 모든 Repair 조회
			List<Entity> uptoRepairs = this.findUptoRepairs(companyKey);
			
			if(DataUtils.isEmpty(uptoRepairs))
				return "No vehicle to repair!";
			
			resMsg = AlarmUtils.generateRepairAlarmContent(uptoRepairs, false);
			
		// consumables_to_replace company=vitizen
		} else if(reqMsg.startsWith("consumables_to_replace")) {
			// 1. 오늘 기준으로 앞 뒤로 하루를 주어 소모품 교체 리스트를 조회 
			List<Entity> uptoReplacements = this.findUptoReplace(companyKey);
			
			if(DataUtils.isEmpty(uptoReplacements))
				return "No consumables to replace!";
			
			resMsg = AlarmUtils.generateReplaceAlarmContent(uptoReplacements, false);			
		}
		
		return resMsg;
	}
	
	private Key parseCompanyKey(String reqMsg) {
		int idx = reqMsg.indexOf("company=");
		
		if (idx > 1) {
			String company = reqMsg.substring(idx + 8);
			return KeyFactory.createKey("Company", company);
		} else {
			return null;
		}
	}

	/**
	 * 정비 일정이 다가온 정보를 조회한다. 
	 * 
	 * @param companyKey
	 * @return
	 */	
	private List<Entity> findUptoRepairs(Key companyKey) {
		
		Query q = new Query("Repair");
		q.setAncestor(companyKey);
		
		long dateMillis = DataUtils.getTodayMillis();
		Date[] fromToDate = DataUtils.getFromToDate(dateMillis, 0, 1);
		q.addFilter("next_repair_date", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromToDate[0]);
		q.addFilter("next_repair_date", Query.FilterOperator.LESS_THAN_OR_EQUAL, fromToDate[1]);
		q.addSort("next_repair_date", SortDirection.DESCENDING);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		List<Entity> repairs = new ArrayList<Entity>();
		for(Entity repair : pq.asIterable()) {
			repairs.add(repair);
		}
		
		return repairs;
	}
	
	/**
	 * 소모품 교체 일정이 다가온 소모품 리스트를 조회한다. 조건은 health rate가 0.98 이상인 것들 대상으로 조회 
	 * 
	 * @param companyKey
	 * @return
	 */
	private List<Entity> findUptoReplace(Key companyKey) {
		
		Query q = new Query("VehicleConsumable");
		q.setAncestor(companyKey);
		
		q.addFilter("health_rate", Query.FilterOperator.GREATER_THAN_OR_EQUAL, 0.99f);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		List<Entity> consumables = new ArrayList<Entity>();
		for(Entity consumable : pq.asIterable()) {
			consumables.add(consumable);
		}
		
		return consumables;
	}	
}
