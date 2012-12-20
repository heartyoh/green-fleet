package com.heartyoh.service.datastore;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.persistence.EntityExistsException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

@Controller
public class CompanyService extends EntityService {
	//private static final Logger logger = LoggerFactory.getLogger(CompanyService.class);

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
		entity.setProperty("language", map.get("language") != null ? map.get("language") : "en");
		entity.setProperty("address", map.get("address"));
		
		// TODO default 값은 추후 변경 
		double lat = map.containsKey("lat") ? DataUtils.toDouble(map.get("lat")) : 37.55;
		double lng = map.containsKey("lng") ? DataUtils.toDouble(map.get("lng")) : 126.97;
		entity.setUnindexedProperty("lat", lat);
		entity.setUnindexedProperty("lng", lng);
		
		super.onSave(entity, map, datastore);
	}

	@Override
	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request)
			throws IOException {
		if(!DataUtils.isEmpty(map.get("image_file"))){
			String image_file = saveFile(request, (MultipartFile) map.get("image_file"));
			if(image_file != null) {
				entity.setProperty("image_clip", image_file);
			}
			super.postMultipart(entity, map, request);
		}
	}
	
	@RequestMapping(value = "/company/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, Object> map = toMap(request);
		if (request instanceof MultipartHttpServletRequest) {
			preMultipart(map, (MultipartHttpServletRequest) request);
		}

		boolean creating = false;		
		String key = request.getParameter("key");
		Key objKey = (key != null && key.trim().length() > 0) ? KeyFactory.stringToKey(key) : KeyFactory.createKey(getEntityName(), getIdValue(map));
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Entity obj = null;
		try {
			obj = datastore.get(objKey);
		} catch (EntityNotFoundException e) {
			// It's OK.(but Lost Key maybe.)
			creating = true;
		}
		
		if (DataUtils.isEmpty(key)) {
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
		return this.getCreateResultMsg(true, obj);
	}

	@RequestMapping(value = "/company", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

	@RequestMapping(value = "/company/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) {
		String companyId = request.getParameter("id");		
		if(DataUtils.isEmpty(companyId))
			companyId = SessionUtils.currentUser().getCompany();		
		Entity entity = DatastoreUtils.findCompany(companyId);
		Map<String, Object> map = new HashMap<String, Object>();
		map.putAll(entity.getProperties());
		map.put("key", KeyFactory.keyToString(entity.getKey()));
		map.put("success", true);
		return map;
	}	
}
