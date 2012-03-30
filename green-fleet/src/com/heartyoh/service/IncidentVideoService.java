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
		String video_file = saveFileToGS(request, (MultipartFile) map.get("video_clip"));
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
		
		BackendService backendsApi = BackendServiceFactory.getBackendService();
		String currentBackend = backendsApi.getCurrentBackend();
		
		if(!DataUtils.isEmpty(currentBackend)) {
			if(logger.isInfoEnabled())
				logger.info("This is backend mode! Current backend name : " + currentBackend + ", currentInstance : " + backendsApi.getCurrentInstance());
		} else {
			if(logger.isInfoEnabled())
				logger.info("This is frontend mode!");			
		}
		
		long time = System.currentTimeMillis();
		try {
			return super.save(request, response);
			//return this.enqueueTask(request, response);
		} catch(Throwable e) {
			time = System.currentTimeMillis() - time;
			logger.error("It took " + time + " millis to save file.", e);
			return getResultMsg(false, "It took " + time + " millis to save file. [" + e.toString() + "]");
			
		}
	}

	/**
	 * Video 데이터 임시 저장소 
	 * 키 : IncidentVideo entity의 key, 값 : vedio 데이터 
	 */
	//private static Map<Object, Object> VIDEO_FILE_CACHE = new HashMap<Object, Object>();
	
	/**
	 * Task를 VideoQueue로 넣는다.
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	/*private String enqueueTask(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, Object> map = toMap(request);
		
		if (request instanceof MultipartHttpServletRequest) {
			preMultipart(map, (MultipartHttpServletRequest) request);
		}

		String key = request.getParameter("key");
		Key companyKey = this.getCompanyKey(request);
		Key objKey = (!DataUtils.isEmpty(key)) ? KeyFactory.stringToKey(key) : KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
		key = KeyFactory.keyToString(objKey);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		map.put("_now", new Date());
		map.put("_company_key", companyKey);
		Entity incident = null;

		try {
			incident = datastore.get(objKey);
		} catch (EntityNotFoundException e) {
			incident = new Entity(objKey);
			onCreate(incident, map, datastore);
		}		

		onSave(incident, map, datastore);
		// 1. Memcache를 이용하고 싶지만 Memcache는 value limit가 1Mbyte밖에 안 됨 
		VIDEO_FILE_CACHE.put(key, new Object[] { incident, map });
		
		// task 생성 후 enqueue
	    Queue queue = QueueFactory.getQueue("VideoQueue");
	    // Create Task and insert into Video Queue
	  	TaskOptions taskOption = TaskOptions.Builder.withUrl("/tasks/incident/execute_task").param("key", key).method(Method.POST);
	  	queue.add(taskOption);
	    
		response.setContentType("text/html");
		return this.getSuccessMsg(key);
	}*/
	
	/**
	 * VideoQueue로 부터 Task를 실행 
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	/*@RequestMapping(value = "/tasks/incident/execute_task", method = RequestMethod.POST)
	public void executeTask(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String key = request.getParameter("key");
		
		if(DataUtils.isEmpty(key) || !VIDEO_FILE_CACHE.containsKey(key)) {
			logger.error("Failed to execute task entity key [" + key + "]");
		}
		
		Object[] incidentVideoObjs = (Object[])VIDEO_FILE_CACHE.get(key);
		Entity incident = (Entity)incidentVideoObjs[0];
		@SuppressWarnings("unchecked")
		Map<String, Object> map = (Map<String, Object>)incidentVideoObjs[1];
		
		if(logger.isInfoEnabled())
			logger.info("Video File Saving Task executing (terminal_id : " + incident.getProperty("terminal_id") + ", datetime : " + incident.getProperty("datetime") + ")");
		
		// 1. 파일 저장 
		String videoFile = this.saveFile(incident.getKey().getParent().getName(), (MultipartFile) map.get("video_clip"));
		if(videoFile != null) {
			incident.setProperty("video_clip", videoFile);
		}

		// 2. 나머지 데이터 저장 
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		this.onSave(incident, map, datastore);
		this.saveEntity(incident, map, datastore);
		
		if(logger.isInfoEnabled())
			logger.info("Video File Saving Task executed (terminal_id : " + incident.getProperty("terminal_id") + ", datetime : " + incident.getProperty("datetime") + ")!");		
	}*/
	
	/**
	 * save video file
	 * 
	 * @param company
	 * @param file
	 * @return
	 * @throws IOException
	 */
	/*private String saveFile(String company, MultipartFile file) throws IOException {
		
		if (file != null && file.getSize() > 0) {
			com.google.appengine.api.files.FileService fileService = FileServiceFactory.getFileService();
			
			GSFileOptionsBuilder optionsBuilder = new GSFileOptionsBuilder()
		       .setBucket("green-fleets")
		       .setKey(company + "/incident/" + file.getOriginalFilename())
		       .setMimeType(file.getContentType())
		       .setAcl("public_read");

		    AppEngineFile appfile = fileService.createNewGSFile(optionsBuilder.build());			
			FileWriteChannel writeChannel = fileService.openWriteChannel(appfile, true);
			writeChannel.write(ByteBuffer.wrap(file.getBytes()));
			writeChannel.closeFinally();			
			return "http://commondatastorage.googleapis.com/green-fleets/" + company + "/incident/" + file.getOriginalFilename();
			
		} else {
			return null;
		}
	}*/
}
