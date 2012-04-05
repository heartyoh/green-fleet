/**
 * 
 */
package com.heartyoh.service;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;

/**
 * LBA (Location Based Alarm) 상태 관리 서비스 
 * 
 * @author jhnam
 */
@Controller
public class LbaStatusService extends EntityService {

	@Override
	protected String getEntityName() {
		return "LbaStatus";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String)map.get("vehicle") + "@" + (String)map.get("loc");
	}
	
	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		// 차량 아이디 
		entity.setProperty("vehicle", map.get("vehicle"));
		// Location 아이디 
		entity.setProperty("loc", map.get("loc"));		

		super.onCreate(entity, map, datastore);		
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		// 이벤트 트리거 
		entity.setProperty("evt_trg", map.get("evt_trg"));
		// 이전 상태 
		entity.setProperty("bef_status", map.get("bef_status"));
		// 현재 상태
		entity.setProperty("cur_status", map.get("cur_status"));
		
		super.onSave(entity, map, datastore);
	}	

	@RequestMapping(value = "/lba_status/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/lba_status/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/lba_status/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/lba_status", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {		
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/lba_status/execute_task", method = RequestMethod.POST)
	public void executeTask(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		// TODO location based alarm 처리 ...
		
		System.out.println("location based alarm...");
		System.out.println("vehicle : " + request.getParameter("vehicle") + ", lattitude : " + request.getParameter("lat") + ", longitude : " + request.getParameter("lng"));
	}
}
