package com.heartyoh.service;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.appengine.api.xmpp.Presence;
import com.google.appengine.api.xmpp.PresenceType;
import com.google.appengine.api.xmpp.XMPPService;
import com.google.appengine.api.xmpp.XMPPServiceFactory;
import com.heartyoh.util.AlarmUtils;

/**
 * XMPP 사용자의 상태 변경 정보를 받아 처리하는 서블릿 
 * 
 * @author jhnam
 */
public class XMPPPresenceServlet extends HttpServlet {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -3448893775180289649L;
	
	private static final Logger logger = LoggerFactory.getLogger(XMPPPresenceServlet.class);
	
	private static XMPPService xmppService = XMPPServiceFactory.getXMPPService();	
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        doPost(request,response);
    }
 
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    	
    	Presence presence = xmppService.parsePresence(request);
        String from = presence.getFromJid().getId().split("/")[0];
        String to = presence.getToJid().getId();
        
        String body = "GreenFleet received XMPP Presence infomation => From : " + from + ", To : " + to + ", Presence : " + presence.getPresenceType();
        
        logger.info(body);
        
        try {
			AlarmUtils.sendMail("GreenFleet", "heartyoh@gmail.com", "Nam JongHo", "maparam419@gmail.com", "XMPP Presence test!", false, body);
		} catch (Exception e) {
			logger.error("Failed to send mail of xmpp presence", e);
		}
 
        xmppService.sendPresence(presence.getFromJid(), PresenceType.AVAILABLE, presence.getPresenceShow(), presence.getStatus());    	
    }
}
