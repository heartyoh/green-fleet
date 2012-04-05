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
	 * vehicleId, lattitude, longitude로 task를 만들어서 push queue에 추가
	 * 
	 * @param vehicleId
	 * @param lattitude
	 * @param longitude
	 * @throws Exception
	 */
	public static void addLbaTaskToQueue(String vehicleId, double lattitude, double longitude) throws Exception {
		Queue queue = QueueFactory.getQueue("LBAQueue");
		queue.add(TaskOptions.Builder.withMethod(Method.POST).url("/lba_status/execute_task").param("vehicle", vehicleId).param("lat", "" + lattitude).param("lng", "" + longitude));
	}
}
