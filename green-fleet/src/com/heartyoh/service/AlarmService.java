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
		// 알림 기간 from
		entity.setProperty("from_date", map.get("from_date"));
		// 알림 기간 to
		entity.setProperty("to_date", map.get("to_date"));
		// 알림 메세지 
		entity.setProperty("msg", map.get("msg"));
		
		// TODO Alarm 저장 후에 차량 ==> 차량, 위치, 상태, 그 당시 위치 (위도, 경도) 테이블에 vehicles를 추가 ... 
		super.onSave(entity, map, datastore);
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
