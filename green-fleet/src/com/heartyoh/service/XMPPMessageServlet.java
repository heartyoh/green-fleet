/**
 * 
 */
package com.heartyoh.service;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.appengine.api.xmpp.Message;
import com.google.appengine.api.xmpp.XMPPService;
import com.google.appengine.api.xmpp.XMPPServiceFactory;
import com.heartyoh.util.AlarmUtils;

/**
 * XMPP Message 처리 서블릿 
 * 
 * @author jhnam
 */
public class XMPPMessageServlet extends HttpServlet {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 5182510517579815973L;
	
	private static final Logger logger = LoggerFactory.getLogger(XMPPMessageServlet.class);

	private static XMPPService xmppService = XMPPServiceFactory.getXMPPService();
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        doPost(request,response);
    }
	
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		
		// 메세지 수신
        Message message = xmppService.parseMessage(request);
        String from = message.getFromJid().getId().split("/")[0];
        String receiveMsg = message.getBody();
        
        String sendMsg = "GreenFleets received message from : " + from + ", messageType " + message.getMessageType() + ", body : " + receiveMsg;
        
        logger.info(sendMsg);
        
        // 메일 발신
        try {
			AlarmUtils.sendMail("Admin", "heartyoh@gmail.com", "Name JongHo", "maparam419@gmail.com", "XMPP Message test!", false, sendMsg);
		} catch (Exception e) {
			logger.error("Failed to send mail of xmpp message", e);
		}
        
        // 메세지 발신        
        try {
			AlarmUtils.sendXmppMessage("maparam419@gmail.com", sendMsg);
		} catch (Exception e) {
			logger.error("Error when send XMPP Message!", e);
		}
	}
}
