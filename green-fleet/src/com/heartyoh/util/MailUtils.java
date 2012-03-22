/**
 * 
 */
package com.heartyoh.util;

import java.util.Properties;

import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

/**
 * Mail Util Class
 * 
 * @author jhnam
 */
public class MailUtils {

	/**
	 * mail 보내기
	 * 
	 * @param senderName
	 * @param senderEmail
	 * @param receiverName
	 * @param receiverEmail
	 * @param subject
	 * @param msgBody
	 * @throws Exception
	 */
	public static void sendMail(String senderName, String senderEmail, String receiverName, String receiverEmail, String subject, String msgBody) throws Exception {
		
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(senderEmail, senderName));
        msg.addRecipient(Message.RecipientType.TO, new InternetAddress(receiverEmail, receiverName));
        msg.setSubject(subject);
        msg.setText(msgBody);
        Transport.send(msg);
	}
}
