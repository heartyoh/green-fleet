/**
 * 
 */
package com.heartyoh.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.heartyoh.util.AlarmUtils;

/**
 * XMPP error를 받아서 처리한다.
 * OFFLINE인 사용자에게 보내다가 발생하는 에러가 대부분이다. 
 * 
 * @author jhnam
 */
public class XMPPErrorServlet extends HttpServlet {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 8112259388570233415L;

	private static final Logger logger = LoggerFactory.getLogger(XMPPErrorServlet.class);
	
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		
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
		
        try {
			AlarmUtils.sendMail("Admin", "heartyoh@gmail.com", "Name JongHo", "maparam419@gmail.com", "XMPP Message test!", false, msg);
		} catch (Exception e) {
			logger.error("Failed to send mail of xmpp message", e);
		}
		
		// Log the error
		logger.error("Error stanza received : " + msg);		
	}
}
