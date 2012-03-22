package com.heartyoh.service;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.heartyoh.util.SessionUtils;

@Controller
public class IncidentVideoService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(IncidentVideoService.class);

	@Override
	protected String getEntityName() {
		return "Incident";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return map.get("terminal_id") + "@" + map.get("datetime");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		Entity company = datastore.get((Key)map.get("_company_key"));

		entity.setProperty("terminal_id", map.get("terminal_id"));
		entity.setProperty("datetime", SessionUtils.stringToDateTime((String)map.get("datetime"), null, Integer.parseInt((String)company.getProperty("timezone"))));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void preMultipart(Map<String, Object> map, MultipartHttpServletRequest request) throws IOException {
		super.preMultipart(map, request);
	}

	@Override
	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request)
			throws IOException {
		String video_file = saveFile((MultipartFile) map.get("video_clip"));
		if(video_file != null) {
			entity.setProperty("video_clip", video_file);
		}

		super.postMultipart(entity, map, request);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/incident/upload_video", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		long time = System.currentTimeMillis();
		try {
			return super.save(request, response);
		} catch(Throwable e) {
			time = System.currentTimeMillis() - time;
			return getResultMsg(false, "It takes " + time + " millis to save file. [" + e.toString() +"]");
		}
	}

}
