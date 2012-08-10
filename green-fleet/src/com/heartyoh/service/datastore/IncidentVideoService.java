package com.heartyoh.service.datastore;

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

import com.google.appengine.api.backends.BackendService;
import com.google.appengine.api.backends.BackendServiceFactory;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

@Controller
public class IncidentVideoService extends EntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(IncidentVideoService.class);
	/**
	 * blob store type
	 */
	private static final String STORE_TYPE = "gf_store";
	/**
	 * blob store
	 */
	private static final String STORE_BLOB = "blob";
	/**
	 * cloud store
	 */
	private static final String STORE_CLOUD = "cloud";
	
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
		
		String gfStorage = (String)request.getAttribute(STORE_TYPE);
		String video_file = null;
		
		if(STORE_BLOB.equals(gfStorage)) {
			video_file = saveFile(request, (MultipartFile) map.get("video_clip"));
		} else {
			video_file = saveFileToGS(request, (MultipartFile) map.get("video_clip"));
		}
		
		if(video_file != null) {
			entity.setProperty("video_clip", video_file);
		}

		super.postMultipart(entity, map, request);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/incident/upload_blob", method = RequestMethod.POST)
	public @ResponseBody
	String importsByBlob(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		
		long time = System.currentTimeMillis();
		try {
			request.setAttribute(STORE_TYPE, STORE_BLOB);
			return super.save(request, response);
		} catch(Throwable e) {
			BackendService backendsApi = BackendServiceFactory.getBackendService();
			String currentBackend = backendsApi.getCurrentBackend();
			time = System.currentTimeMillis() - time;
			String log = "It took " + time + " millis to save file. " + (DataUtils.isEmpty(currentBackend) ? "At frontend mode!" : "At backend (" + currentBackend + ") mode!");
			logger.error(log, e);
			return getResultMsg(false, log);
		}
	}
	
	@RequestMapping(value = "/incident/upload_video", method = RequestMethod.POST)
	public @ResponseBody
	String importByCloud(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		
		long time = System.currentTimeMillis();
		try {
			request.setAttribute(STORE_TYPE, STORE_CLOUD);
			return super.save(request, response);
		} catch(Throwable e) {
			BackendService backendsApi = BackendServiceFactory.getBackendService();
			String currentBackend = backendsApi.getCurrentBackend();
			time = System.currentTimeMillis() - time;
			String log = "It took " + time + " millis to save file. " + (DataUtils.isEmpty(currentBackend) ? "At frontend mode!" : "At backend (" + currentBackend + ") mode!");
			logger.error(log, e);
			return getResultMsg(false, log);
		}
	}
}
