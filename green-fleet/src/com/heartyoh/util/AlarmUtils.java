/**
 * 
 */
package com.heartyoh.util;

import java.io.ByteArrayOutputStream;
import java.util.Date;
import java.util.List;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.mail.Message;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.internet.MimeUtility;
import javax.mail.util.ByteArrayDataSource;

import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.appengine.api.capabilities.CapabilitiesService;
import com.google.appengine.api.capabilities.CapabilitiesServiceFactory;
import com.google.appengine.api.capabilities.Capability;
import com.google.appengine.api.capabilities.CapabilityStatus;
import com.google.appengine.api.channel.ChannelMessage;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.xmpp.JID;
import com.google.appengine.api.xmpp.MessageBuilder;
import com.google.appengine.api.xmpp.MessageType;
import com.google.appengine.api.xmpp.SendResponse;
import com.google.appengine.api.xmpp.XMPPService;
import com.google.appengine.api.xmpp.XMPPServiceFactory;
import com.heartyoh.model.Vehicle;


/**
 * Alarm Util Class
 * 
 * @author jhnam
 */
public class AlarmUtils {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(AlarmUtils.class);	
	/**
	 * XMPPService
	 */
	private static XMPPService xmppService = null;
	/**
	 * Channel Service
	 */
	private static ChannelService channelService = null;
	/**
	 * Capabilities Service
	 */
	private static CapabilitiesService capabilityService = null;
	
	/**
	 * msg 내용으로 현재 세션의 사용자에게 Channel Message를 보낸다.
	 *  
	 * @param to
	 * @param msg
	 * @throws Exception
	 */
	public static void sendChannelMessage(String[] toList, String msg) throws Exception {
		
		for(String to : toList) {
			sendChannelMessage(to, msg);
		}
	}
	
	/**
	 * msg 내용으로 현재 세션의 사용자에게 Channel Message를 보낸다.
	 *  
	 * @param to
	 * @param msg
	 * @throws Exception
	 */
	public static void sendChannelMessage(String to, String msg) throws Exception {
		
		if(channelService == null)
			channelService = ChannelServiceFactory.getChannelService();

		ChannelMessage channelMessage = new ChannelMessage(to, msg);
		channelService.sendMessage(channelMessage);
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
	 * to에게 msg 내용으로 XMPP Message를 보낸다. 
	 * 
	 * @param to
	 * @param msg
	 * @throws Exception
	 */
	public static void sendXmppMessage(String to, String msg) throws Exception {
		
		if(xmppService == null)
			xmppService = XMPPServiceFactory.getXMPPService();
		
		checkCapablities(Capability.XMPP);
			
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
	 * service가 사용 가능한지 아닌지 판단하여 아니라면 예외를 발생 
	 *  
	 * @param service
	 * @throws Exception
	 */
	public static void checkCapablities(Capability service) throws Exception {
		
		if(capabilityService == null)
			capabilityService = CapabilitiesServiceFactory.getCapabilitiesService();
		
		CapabilityStatus status = capabilityService.getStatus(service).getStatus();
		if(status == CapabilityStatus.DISABLED)
			throw new Exception("[" + service.getName() + "] Capability is disabled!");		
	}
	
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
	public static void sendMail(String senderName, 
			String senderEmail, 
			String receiverName, 
			String receiverEmail, 
			String subject, 
			boolean htmlType, 
			String msgBody) throws Exception {
		
		sendMail(senderName, 
				senderEmail, 
				(receiverName == null ? null : new String[] {receiverName}), 
				new String[] { receiverEmail }, 
				subject, 
				htmlType, 
				msgBody);
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
	public static void sendMail(String senderName, 
			String senderEmail, 
			String[] receiverNames, 
			String[] receiverEmails, 
			String subject, 
			boolean htmlType, 
			String msgBody) throws Exception {
		
		sendAttachmentMail(senderName, senderEmail, receiverNames, receiverEmails, subject, htmlType, msgBody, null);
	}
	
	/**
	 * send attachment email
	 * 
	 * @param senderName
	 * @param senderEmail
	 * @param receiverNames
	 * @param receiverEmails
	 * @param subject
	 * @param htmlType
	 * @param msgBody
	 * @param workbook
	 * @throws Exception
	 */
	public static void sendAttachmentMail(String senderName, 
			String senderEmail, 
			String[] receiverNames, 
			String[] receiverEmails, 
			String subject, 
			boolean htmlType, 
			String msgBody,
			Multipart mp) throws Exception {
		
		checkCapablities(Capability.MAIL);
		
		if(DataUtils.isEmpty(receiverEmails)) 
			throw new Exception("Receiver Email is required!");
		
		senderName = DataUtils.isEmpty(senderName) ? "GreenFleet" : senderName;
		senderEmail = DataUtils.isEmpty(senderEmail) ? "heartyoh@gmail.com" : senderEmail;
		
		boolean existReceiverNames = DataUtils.isEmpty(receiverNames) ? false : true;
		if(existReceiverNames && receiverEmails.length != receiverNames.length)
			throw new Exception("Receiver Emails count is not equal Receiver Names count!");
		
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(senderEmail, senderName));
        
        for(int i = 0 ; i < receiverEmails.length ; i++) {
        	String receiverName = existReceiverNames ? receiverNames[i] : "";
        	msg.addRecipient(Message.RecipientType.TO, new InternetAddress(receiverEmails[i], receiverName));
        }
        
        subject = MimeUtility.encodeText(subject, "utf-8", "B");
        
        if(htmlType)
        	msg.setContent(msgBody, "text/html;charset=utf-8");
        else
        	msg.setText(msgBody);
        
        if(mp != null)
        	msg.setContent(mp);
        
        Transport.send(msg);
	}
	
	/**
	 * html attachment mail 전송 
	 * 
	 * @param senderName
	 * @param senderEmail
	 * @param receiverNames
	 * @param receiverEmails
	 * @param subject
	 * @param content
	 * @throws Exception
	 */
	public static void sendHtmlAttachMail(String senderName, 
			String senderEmail, 
			String[] receiverNames, 
			String[] receiverEmails, 
			String subject, 
			String content) throws Exception {
		
		if(DataUtils.isEmpty(receiverEmails)) 
			throw new Exception("Receiver Email is required!");
		
		senderName = DataUtils.isEmpty(senderName) ? "GreenFleet" : senderName;
		senderEmail = DataUtils.isEmpty(senderEmail) ? "heartyoh@gmail.com" : senderEmail;
		
		boolean existReceiverNames = DataUtils.isEmpty(receiverNames) ? false : true;
		if(existReceiverNames && receiverEmails.length != receiverNames.length)
			throw new Exception("Receiver Emails count is not equal Receiver Names count!");
		
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        Message msg = new MimeMessage(session);
        msg.setFrom(new InternetAddress(senderEmail, senderName));
        
        for(int i = 0 ; i < receiverEmails.length ; i++) {
        	String receiverName = existReceiverNames ? receiverNames[i] : "";
        	msg.addRecipient(Message.RecipientType.TO, new InternetAddress(receiverEmails[i], receiverName));
        }
        
        subject = MimeUtility.encodeText(subject, "utf-8", "B");
        msg.setSubject(subject);
        MimeMultipart mp = new MimeMultipart();
        MimeBodyPart htmlPart = new MimeBodyPart();
        htmlPart.setContent(content, "text/html;charset=utf-8");
        mp.addBodyPart(htmlPart);
        msg.setContent(mp);
        Transport.send(msg);
	}

	/**
	 * send excel attachment email
	 * 
	 * @param senderName
	 * @param senderEmail
	 * @param receiverNames
	 * @param receiverEmails
	 * @param subject
	 * @param htmlType
	 * @param msgBody
	 * @param workbook
	 * @throws Exception
	 */
	public static void sendExcelAttachMail(String senderName, 
			String senderEmail, 
			String[] receiverNames, 
			String[] receiverEmails, 
			String subject, 
			boolean htmlType, 
			String msgBody,
			Workbook workbook) throws Exception {
		    
		Multipart mp = null;
		
        if(workbook != null) {
        	mp = new MimeMultipart();
            MimeBodyPart htmlPart = new MimeBodyPart();        
            htmlPart.setContent(msgBody, htmlType ? "text/html" : "text/plain");
            mp.addBodyPart(htmlPart);

            MimeBodyPart attachment = new MimeBodyPart();
            attachment.setFileName("report.xls");
    		
            ByteArrayOutputStream os = new ByteArrayOutputStream();
    		workbook.write(os);
    		os.close();
    		
    		DataSource src = new ByteArrayDataSource(os.toByteArray(), "application/vnd.ms-excel");
    		attachment.setDataHandler(new DataHandler(src));
            mp.addBodyPart(attachment);
        } 
        
        sendAttachmentMail(senderName, senderEmail, receiverNames, receiverEmails, subject, htmlType, msgBody, mp);
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
	 * 정비가 필요한 차량 정보를 알림 
	 * 
	 * @param impendingRepairs
	 * @throws Exception
	 */
	public static void alarmRepairs(List<Entity> impendingRepairs) throws Exception {
		
		if(DataUtils.isEmpty(impendingRepairs))
			return;
		
		String company = impendingRepairs.get(0).getKey().getParent().getName();		
		// 관리자 리스트를 조회
		List<Entity> admins = DatastoreUtils.findAdminUsers(company);
		
		if(DataUtils.isEmpty(admins))
			throw new Exception("The company [" + company + "] does not have an administrator user");
		
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
	 */
	public static void alarmConsumables(List<Entity> consumables) {
		
		if(DataUtils.isEmpty(consumables))
			return;
		
		// 1. companyKey 조회 
		String company = consumables.get(0).getKey().getParent().getName();
		
		// 2. 관리자 리스트를 조회
		List<Entity> admins = DatastoreUtils.findAdminUsers(company);
		
		if(DataUtils.isEmpty(admins)) {
			logger.error("The company [" + company + "] does not have an administrator user! So couln't send consumable alarm!");
			return;
		}
		
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
		
		try {
			AlarmUtils.sendMail("GreenFleet", "heartyoh@gmail.com", receiverNames, receiverEmails, subject, true, htmlMsgBody);
		} catch(Exception e) {
			logger.error("Failed to send mail!", e);
		}
		try {
			AlarmUtils.sendXmppMessage(receiverEmails, textMsgBody);
		} catch(Exception e) {
			logger.error("Failed to send xmpp message!", e);
		}
	}
	
	/**
	 * 사고 정보를 알림
	 * 
	 * @param vehicle
	 * @param incidnet
	 */
	public static void alarmIncidents(Vehicle vehicle, Entity incident) {
		
		if(vehicle == null)
			return;
		
		String companyStr = vehicle.getCompany();
		// 관리자 리스트를 조회
		List<Entity> admins = DatastoreUtils.findAdminUsers(companyStr);
		
		if(DataUtils.isEmpty(admins)) {
			logger.error("The company [" + companyStr + "] does not have an administrator user! So couldn't send incident alarm!");
			return;
		}
		
		int adminCount = admins.size();
		String[] receiverEmails = new String[adminCount];
		
		System.out.println("Incident! Admin users count (" + adminCount + ")");
		
		for(int i = 0 ; i < adminCount ; i++) {
			Entity user = admins.get(i);
			receiverEmails[i] = (String)user.getProperty("email");
		}
		
		String timeStr = DataUtils.dateToString((Date)incident.getProperty("datetime"), GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT);
		String msg = "[Incident] Please check out vehicle (id : " + vehicle.getId() + ", reg no. : " + vehicle.getRegistrationNumber() + ") accident!\n";
		msg += "Event occurrence time : " + timeStr;
		
		try {
			AlarmUtils.sendXmppMessage(receiverEmails, msg);
			// GAE Channel을 사용한다면 주석해제  
			//AlarmUtils.sendChannelMessage(receiverEmails, "Incident");			
		} catch (Exception e) {
			logger.error("Failed to send alarm!", e);
		}
	}
}
