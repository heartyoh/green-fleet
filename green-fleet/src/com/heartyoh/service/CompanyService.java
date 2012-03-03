package com.heartyoh.service;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityExistsException;
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
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

@Controller
public class CompanyService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(CompanyService.class);

	@Override
	protected String getEntityName() {
		return "Company";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String) map.get("id");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("id", map.get("id"));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("name", map.get("name"));
		entity.setProperty("desc", map.get("desc"));
		entity.setProperty("timezone", map.get("timezone"));
		
		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/company/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = toMap(request);
		if (request instanceof MultipartHttpServletRequest) {
			preMultipart(map, (MultipartHttpServletRequest) request);
		}

		String key = request.getParameter("key");

		Key objKey = null;
		boolean creating = false;

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Entity obj = null;

		if (key != null && key.trim().length() > 0) {
			objKey = KeyFactory.stringToKey(key);
			try {
				obj = datastore.get(objKey);
			} catch (EntityNotFoundException e) {
				// It's OK.(but Lost Key maybe.)
				creating = true;
			}
		} else {
			objKey = KeyFactory.createKey(getEntityName(), getIdValue(map));
			try {
				obj = datastore.get(objKey);
			} catch (EntityNotFoundException e) {
				// It's OK.
				creating = true;

			}
			// It's Not OK. You try to add duplicated identifier.
			if (obj != null)
				throw new EntityExistsException(getEntityName() + " with id (" + getIdValue(map) + ") already Exist.");
		}

		Date now = new Date();
		
		map.put("_now", now);

		try {
			if (creating) {
				obj = new Entity(objKey);
				onCreate(obj, map, datastore);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if (request instanceof MultipartHttpServletRequest) {
				postMultipart(obj, map, (MultipartHttpServletRequest) request);
			}

			onSave(obj, map, datastore);

			datastore.put(obj);
		} finally {
		}

		response.setContentType("text/html");

		return "{ \"success\" : true, \"key\" : \"" + KeyFactory.keyToString(obj.getKey()) + "\" }";
	}

	@RequestMapping(value = "/company", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

}
