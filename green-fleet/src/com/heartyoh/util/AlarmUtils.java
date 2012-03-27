/**
 * 
 */
package com.heartyoh.util;

import java.util.Date;
import java.util.List;
import java.util.Properties;

import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.xmpp.JID;
import com.google.appengine.api.xmpp.MessageBuilder;
import com.google.appengine.api.xmpp.MessageType;
import com.google.appengine.api.xmpp.SendResponse;
import com.google.appengine.api.xmpp.XMPPService;
import com.google.appengine.api.xmpp.XMPPServiceFactory;

/**
 * Alarm Util Class
 * 
 * @author jhnam
 */
public class AlarmUtils {

	/**
	 * XMPPService
	 */
	private static XMPPService xmppService = null;
	
	/**
	 * mail send
	 * 
	 * @param senderName
	 * @param senderEmail
	 * @param receiverName
	 * @param receiverEmail
	 * @param subject
	 * @param htmlType
	 * @param htmlBody
	 * @throws Exception
	 */
	public static void sendMail(String senderName, String senderEmail, String receiverName, String receiverEmail, String subject, boolean htmlType, String msgBody) throws Exception {
		
		if(DataUtils.isEmpty(senderEmail)) 
			throw new Exception("Sender Email is required!");
		
		if(DataUtils.isEmpty(receiverEmail)) 
			throw new Exception("Receiver Email is required!");
				
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(senderEmail, senderName));        
    	msg.addRecipient(Message.RecipientType.TO, new InternetAddress(receiverEmail, receiverName));        
        msg.setSubject(subject);
        
        if(htmlType)
        	msg.setContent(msgBody, "text/html;charset=utf-8");
        else
        	msg.setText(msgBody);
        
        Transport.send(msg);
	}
	
	/**
	 * mail send
	 * 
	 * @param senderName
	 * @param senderEmail
	 * @param receiverNames
	 * @param receiverEmails
	 * @param subject
	 * @param htmlType
	 * @param htmlBody
	 * @throws Exception
	 */
	public static void sendMail(String senderName, String senderEmail, String[] receiverNames, String[] receiverEmails, String subject, boolean htmlType, String msgBody) throws Exception {
		
		if(DataUtils.isEmpty(senderEmail)) 
			throw new Exception("Sender Email is required!");
		
		if(DataUtils.isEmpty(receiverEmails)) 
			throw new Exception("Receiver Email is required!");
		
		boolean existReceiverNames = DataUtils.isEmpty(receiverNames) ? false : true;
		if(existReceiverNames && receiverEmails.length != receiverNames.length)
			throw new Exception("Receiver Emails count is not equal Receiver Names count!");
		
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(senderEmail, senderName));
        
        for(int i = 0 ; i < receiverNames.length ; i++) {
        	String receiverName = existReceiverNames ? receiverNames[i] : "";
        	msg.addRecipient(Message.RecipientType.TO, new InternetAddress(receiverEmails[i], receiverName));
        }
        
        msg.setSubject(subject);
        
        if(htmlType)
        	msg.setContent(msgBody, "text/html;charset=utf-8");
        else
        	msg.setText(msgBody);
        
        Transport.send(msg);
	}
	
	/**
	 * Repair alarm 메시지를 보내기 위한 메시지를 생성한다.  
	 * 
	 * @param uptoRepairs
	 * @param htmlType
	 * @return
	 */
	public static String generateRepairAlarmContent(List<Entity> uptoRepairs, boolean htmlType) {
		
		if(DataUtils.isEmpty(uptoRepairs))
			return null;

		StringBuffer msgBody = new StringBuffer();
		
		if(htmlType)
			msgBody.append("<h1 align='center'>");
		
		msgBody.append("A maintenance schedule for the following vehicles at the moment!");
		
		if(htmlType) {
			msgBody.append("</h1><br><br>");
			msgBody.append("<table border='1' align='center'>");
			msgBody.append("<tr>");
			msgBody.append("<td>Vehicle</td><td>Previous Repair Date</td><td>Previous Repair Mileage(km)</td><td>Previous Repair Man</td><td>Previous Repair Content</td><td>Next Repair Date</td>");
			msgBody.append("</tr>");
		}
		
		for(Entity repair : uptoRepairs) {
			String vehicleId = (String)repair.getProperty("vehicle_id");
			String nextRepairDate = DataUtils.isEmpty(repair.getProperty("next_repair_date")) ? "" : DataUtils.dateToString((Date)repair.getProperty("next_repair_date"), "yyyy-MM-dd");
			
			if(htmlType) {
				String previousRepairDate = DataUtils.isEmpty(repair.getProperty("repair_date")) ? "" : DataUtils.dateToString((Date)repair.getProperty("repair_date"), "yyyy-MM-dd");
				String previousRepairMileage = (String)repair.getProperty("repair_mileage");
				String repairMan = DataUtils.toNotNull((String)repair.getProperty("repair_main"));
				String repairContent = DataUtils.toNotNull((String)repair.getProperty("content"));
				
				msgBody.append("<tr>");
				msgBody.append("<td>").append(vehicleId).append("</td>");
				msgBody.append("<td align='center'>").append(previousRepairDate).append("</td>");
				msgBody.append("<td align='right'>").append(previousRepairMileage).append("</td>");
				msgBody.append("<td>").append(repairMan).append("</td>");
				msgBody.append("<td>").append(repairContent).append("</td>");
				msgBody.append("<td align='center'>").append(nextRepairDate).append("</td>");
				msgBody.append("</tr>");
				
			} else {
				msgBody.append("\n Vehicle : ").append(vehicleId).append(", Repair Date : ").append(nextRepairDate);
			}
		}
		
		if(htmlType) {
			msgBody.append("</table>");
		}
		
		return msgBody.toString();
	}
	
	/**
	 * Replacement alarm 메시지를 보내기 위한 메시지를 생성한다.  
	 * 
	 * @param consumableReplList
	 * @param htmlType
	 * @return
	 */
	public static String generateReplaceAlarmContent(List<Entity> consumableReplList, boolean htmlType) {
		
		if(DataUtils.isEmpty(consumableReplList))
			return null;

		StringBuffer msgBody = new StringBuffer();
		
		if(htmlType)
			msgBody.append("<h1 align='center'>");
		
		msgBody.append("A consumable replacement schedule for the following vehicles at the moment!");
		
		if(htmlType) {
			msgBody.append("</h1><br><br>");
			msgBody.append("<table border='1' align='center'>");
			msgBody.append("<tr>");
			msgBody.append("<td>Vehicle</td><td>Consumable</td><td>Last Replace Date</td><td>Last Replace Mileage(km)</td><td>Health Rate</td><td>Health Status</td><td>Next Replace Date</td>");
			msgBody.append("</tr>");
		} 		
		
		for(Entity replacement : consumableReplList) {
			String vehicleId = (String)replacement.getProperty("vehicle_id");
			String consumableItem = (String)replacement.getProperty("consumable_item");
			String nextReplDate = DataUtils.isEmpty(replacement.getProperty("next_repl_date")) ? "" : DataUtils.dateToString((Date)replacement.getProperty("next_repl_date"), "yyyy-MM-dd");
			
			if(htmlType) {
				String lastReplDate = DataUtils.isEmpty(replacement.getProperty("last_repl_date")) ? "" : DataUtils.dateToString((Date)replacement.getProperty("last_repl_date"), "yyyy-MM-dd");
				String lastReplMileage = DataUtils.toNotNull(replacement.getProperty("repl_mileage"));
				int healthRate = (int)(DataUtils.toFloat(replacement.getProperty("health_rate")) * 100);
				String healthStatus = DataUtils.toNotNull(replacement.getProperty("status"));			
				
				msgBody.append("<tr>");
				msgBody.append("<td>").append(vehicleId).append("</td>");
				msgBody.append("<td>").append(consumableItem).append("</td>");
				msgBody.append("<td align='center'>").append(lastReplDate).append("</td>");
				msgBody.append("<td align='right'>").append(lastReplMileage).append("</td>");
				msgBody.append("<td>").append(healthRate).append("%</td>");
				msgBody.append("<td>").append(healthStatus).append("</td>");
				msgBody.append("<td align='center'>").append(nextReplDate).append("</td>");
				msgBody.append("</tr>");
				
			} else {
				msgBody.append("\n Vehicle : ").append(vehicleId).append(", Consumable : ").append(consumableItem).append(", Next Replacement Date : ").append(nextReplDate);
			}
		}
		
		if(htmlType) {
			msgBody.append("</table>");
		}
		
		return msgBody.toString();
	}
	
	/**
	 * XMPP Message를 to에게 msg 내용을 보낸다. 
	 * 
	 * @param to
	 * @param msg
	 * @throws Exception
	 */
	public static void sendXmppMessage(String to, String msg) throws Exception {
		
		if(xmppService == null)
			xmppService = XMPPServiceFactory.getXMPPService();
		
        MessageBuilder messageBuilder = new MessageBuilder();
        JID receiver = new JID(to);
        messageBuilder.withRecipientJids(receiver);
        messageBuilder.withMessageType(MessageType.NORMAL);
        messageBuilder.withBody(msg);
        com.google.appengine.api.xmpp.Message xmppMsg = messageBuilder.build();
        SendResponse xmppResponse = xmppService.sendMessage(xmppMsg);
        boolean messageSent = (xmppResponse.getStatusMap().get(receiver) == SendResponse.Status.SUCCESS);
        
        if(!messageSent) {
        	throw new Exception("User [" + receiver.getId() + "] didn't receive messsage!");
        }
	}
	
	/**
	 * XMPP Message를 to에게 msg 내용을 보낸다. 
	 * 
	 * @param to
	 * @param msg
	 * @throws Exception
	 */
	public static void sendXmppMessage(String[] toList, String msg) throws Exception {
		for(String to : toList) {
			sendXmppMessage(to, msg);
		}
	}
	
	/**
	 * 정비가 필요한 차량 정보를 알림 
	 * 
	 * @param impendingRepairs
	 * @throws Exception
	 */
	public static void alarmRepairs(List<Entity> impendingRepairs) throws Exception {
		
		if(DataUtils.isEmpty(impendingRepairs))
			return;
		
		// 1. companyKey 조회 
		Key companyKey = impendingRepairs.get(0).getKey().getParent();
		
		// 2. 관리자 리스트를 조회
		List<Entity> admins = DatastoreUtils.findAdminUsers(companyKey);
		
		if(DataUtils.isEmpty(admins))
			throw new Exception("The company [" + companyKey.getName() + "] does not have an administrator user");
		
		String subject = "Notification in accordance with maintenance schedule";
		int adminCount = admins.size();
		
		String[] receiverNames = new String[adminCount];
		String[] receiverEmails = new String[adminCount];
		
		for(int i = 0 ; i < adminCount ; i++) {
			Entity user = admins.get(i);
			receiverNames[i] = (String)user.getProperty("name");
			receiverEmails[i] = (String)user.getProperty("email");
		}
		
		String htmlMsgBody = AlarmUtils.generateRepairAlarmContent(impendingRepairs, true);
		String textMsgBody = AlarmUtils.generateRepairAlarmContent(impendingRepairs, false);
		
		AlarmUtils.sendMail("GreenFleet", "heartyoh@gmail.com", receiverNames, receiverEmails, subject, true, htmlMsgBody);
		AlarmUtils.sendXmppMessage(receiverEmails, textMsgBody);		
	}
	
	/**
	 * 교체가 필요한 소모품 정보를 알림 
	 * 
	 * @param consumables
	 * @throws Exception
	 */
	public static void alarmConsumables(List<Entity> consumables) throws Exception {
		
		if(DataUtils.isEmpty(consumables))
			return;
		
		// 1. companyKey 조회 
		Key companyKey = consumables.get(0).getKey().getParent();
		
		// 2. 관리자 리스트를 조회
		List<Entity> admins = DatastoreUtils.findAdminUsers(companyKey);
		
		if(DataUtils.isEmpty(admins))
			throw new Exception("The company [" + companyKey.getName() + "] does not have an administrator user");
		
		String subject = "Notification in accordance with consumable replacement schedule";
		int adminCount = admins.size();
		
		String[] receiverNames = new String[adminCount];
		String[] receiverEmails = new String[adminCount];
		
		for(int i = 0 ; i < adminCount ; i++) {
			Entity user = admins.get(i);
			receiverNames[i] = (String)user.getProperty("name");
			receiverEmails[i] = (String)user.getProperty("email");
		}
		
		String htmlMsgBody = AlarmUtils.generateReplaceAlarmContent(consumables, true);
		String textMsgBody = AlarmUtils.generateReplaceAlarmContent(consumables, false);
		
		AlarmUtils.sendMail("GreenFleet", "heartyoh@gmail.com", receiverNames, receiverEmails, subject, true, htmlMsgBody);
		AlarmUtils.sendXmppMessage(receiverEmails, textMsgBody);
	}
	
	/**
	 * 사고 정보를 알림
	 * 
	 * @param vehicle
	 * @throws Exception
	 */
	public static void alarmIncidents(Entity vehicle) throws Exception {
		
		if(vehicle == null)
			return;
		
		// 1. companyKey 조회 
		Key companyKey = vehicle.getKey().getParent();
		
		// 2. 관리자 리스트를 조회
		List<Entity> admins = DatastoreUtils.findAdminUsers(companyKey);
		
		if(DataUtils.isEmpty(admins))
			throw new Exception("The company [" + companyKey.getName() + "] does not have an administrator user");
		
		int adminCount = admins.size();
		String[] receiverEmails = new String[adminCount];
		
		for(int i = 0 ; i < adminCount ; i++) {
			Entity user = admins.get(i);
			receiverEmails[i] = (String)user.getProperty("email");
		}
		
		Entity company = DatastoreUtils.findByKey(companyKey);
		String timeStr = DataUtils.dateToString(new Date(), "yyyy-MM-dd HH:mm", company);		
		AlarmUtils.sendXmppMessage(receiverEmails, "Please check out vehicle (id : " + vehicle.getProperty("id") + ", reg no. : " + vehicle.getProperty("registration_number") + ") accident! Event occurrence time : " + timeStr);		
	}
}
