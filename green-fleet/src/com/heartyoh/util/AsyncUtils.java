/**
 * 
 */
package com.heartyoh.util;

import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions;
import com.google.appengine.api.taskqueue.TaskOptions.Method;

/**
 * Async 관련 유틸리티 
 * 
 * @author jhnam
 */
public class AsyncUtils {

	/**
	 * vehicleId, lattitude, longitude로 task를 만들어서 LBAQueue에 추가
	 * 
	 * @param company
	 * @param vehicle
	 * @param latitude
	 * @param longitude
	 * @throws Exception
	 */
	public static void addLbaTaskToQueue(String company, String vehicle, double latitude, double longitude) throws Exception {
		Queue queue = QueueFactory.getQueue("LBAQueue");
		queue.add(TaskOptions.Builder.withMethod(Method.POST).url("/lba_status/execute_task").param("company", company).param("vehicle", vehicle).param("lat", "" + latitude).param("lng", "" + longitude));
	}
	
	/**
	 * mail task를 MailQueue에 추가 
	 * 
	 * @param company
	 * @param receivers
	 * @param subject
	 * @param message
	 * @throws Exception
	 */
	public static void addMailTaskToQueue(String company, String[] receivers, String subject, String message) throws Exception {
		Queue queue = QueueFactory.getQueue("MailQueue");
		TaskOptions task = TaskOptions.Builder.withMethod(Method.POST).url("/alarm/send/mail").param("company", company).param("subject", subject).param("message", message);
		for(int i = 0 ; i < receivers.length ; i++) {
			task.param("receivers", receivers[i]);
		}
		queue.add(task);
	}
	
	/**
	 * xmpp task를 XmppQueue에 추가 
	 * 
	 * @param company
	 * @param receivers
	 * @param message
	 * @throws Exception
	 */
	public static void addXmppTaskToQueue(String company, String[] receivers, String message) throws Exception {
		Queue queue = QueueFactory.getQueue("XmppQueue");
		TaskOptions task = TaskOptions.Builder.withMethod(Method.POST).url("/alarm/send/xmpp").param("company", company).param("message", message);
		for(int i = 0 ; i < receivers.length ; i++) {
			task.param("receivers", receivers[i]);
		}
		queue.add(task);
	}
}
