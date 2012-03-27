package com.heartyoh.service;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;

import com.google.appengine.api.xmpp.Presence;
import com.google.appengine.api.xmpp.PresenceType;
import com.google.appengine.api.xmpp.XMPPService;
import com.google.appengine.api.xmpp.XMPPServiceFactory;

/**
 * XMPP 사용자의 상태 변경 정보를 받아 처리하는 서블릿 
 * 
 * @author jhnam
 */
@Controller
public class XMPPPresenceServlet extends HttpServlet {
	
	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 3691052464658875399L;

	private static final Logger logger = LoggerFactory.getLogger(XMPPPresenceServlet.class);
	
	private static XMPPService xmppService = XMPPServiceFactory.getXMPPService();	
	
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request,response);
    }
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
    	Presence presence = xmppService.parsePresence(request);
        String from = presence.getFromJid().getId().split("/")[0];
        String to = presence.getToJid().getId();
        
        String body = "GreenFleet received XMPP Presence infomation => From : " + from + ", To : " + to + ", Presence : " + presence.getPresenceType();
        
        if(logger.isInfoEnabled())
        	logger.info(body);
        
        xmppService.sendPresence(presence.getFromJid(), PresenceType.AVAILABLE, presence.getPresenceShow(), presence.getStatus());
    }
}
