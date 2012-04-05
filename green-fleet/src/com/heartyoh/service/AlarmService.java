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
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 알람 컨트롤러
 * 
 * @author jhnam
 */
@Controller
public class AlarmService extends EntityService {

	@Override
	protected String getEntityName() {
		return "Alarm";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String)map.get("name");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		// 알람명
		entity.setProperty("name", map.get("name"));

		super.onCreate(entity, map, datastore);		
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {

		this.checkDate(map);
		
		// 모니터 대상 차량 
		entity.setProperty("vehicles", map.get("vehicles"));
		// 이벤트 종류 
		entity.setProperty("evt_type", map.get("evt_type"));
		// 위치 
		entity.setProperty("loc", map.get("loc"));
		// 반경
		entity.setProperty("rad", map.get("rad"));
		// 이벤트 트리거 
		entity.setProperty("evt_trg", map.get("evt_trg"));
		// 알림 대상
		entity.setProperty("dest", map.get("dest"));
		// 알림 방식 
		entity.setProperty("type", map.get("type"));
		// 알림 기간 always
		entity.setProperty("always", DataUtils.toBool(map.get("always")));		
		// 알림 기간 from
		entity.setProperty("from_date", map.get("from_date"));
		// 알림 기간 to
		entity.setProperty("to_date", map.get("to_date"));
		// 알림 메세지 
		entity.setProperty("msg", map.get("msg"));
		
		super.onSave(entity, map, datastore);
	}
	
	private void checkDate(Map<String, Object> map) {
		Object fromDateObj = map.get("from_date");
		Object toDateObj = map.get("to_date");
		
		if(!DataUtils.isEmpty(fromDateObj) && fromDateObj instanceof String)
			map.put("from_date", SessionUtils.stringToDate(fromDateObj.toString()));
		
		if(!DataUtils.isEmpty(toDateObj) && toDateObj instanceof String)
			map.put("to_date", SessionUtils.stringToDate(toDateObj.toString()));
	}	
	
	@RequestMapping(value = "/alarm/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/alarm/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/alarm/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/alarm", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {		
		return super.retrieve(request, response);
	}	
}
