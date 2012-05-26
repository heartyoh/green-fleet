package com.heartyoh.service;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;


public class ConsumableCodeService extends EntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(ConsumableCodeService.class);

	@Override
	protected String getEntityName() {
		return "ConsumableCode";
	}

	@Override
	protected boolean useFilter() {
		return false;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String) map.get("name");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("name", map.get("name"));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		// 교체 주기 단위 - 마일리지, 기간, 마일리지 and 기간 
		entity.setProperty("repl_unit", map.get("repl_unit"));
		//entity.setProperty("fst_repl_time", map.get("fst_repl_time"));
		//entity.setProperty("fst_repl_mileage", map.get("fst_repl_mileage"));
		
		// 교체 마일리지 
		entity.setProperty("repl_mileage", map.get("repl_mileage"));
		// 교체 기간 
		entity.setProperty("repl_time", map.get("repl_time"));
		// 설명  
		entity.setProperty("desc", map.get("desc"));

		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/consumable_code/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/consumable_code/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/consumable_code/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/consumable_code", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
}
