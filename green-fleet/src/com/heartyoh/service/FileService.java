package com.heartyoh.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;

/**
 * Handles requests for the application home page.
 */
@Controller
public class FileService {

	private static final Logger logger = LoggerFactory.getLogger(FileService.class);
	private BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
	private DatastoreService datastoreService = DatastoreServiceFactory.getDatastoreService();
	
	/*
	 * File을 Upload하기 위해서는 다음과 같은 절차로 해야한다.
	 * 1. 먼저 BlobstoreService.createUploadUrl 로 파일을 업로드 하기위한 URL을 만든다.
	 * 2. 만들어진 URL로 파일을 업로드한다. (multipart, fileName
	 * <form method="POST" enctype='multipart/form-data' action="<%= blobstoreService.getBlobstoreService() %>">
     *   <input type=file name=upload>
     *   <input type=submit name=press value="OK">
     * </form>
     * 
     * curl로 하는 경우
     * 1. 먼저 fileUpload URL을 받는다.
	 *    (curl http://localhost:8888/data/fileUploadUrl)
	 * 2. 위 호출의 결과 값으로 받은 URL을 사용해서 파일을 업로드 한다. 
	 *    (curl --form fileName=@./fileNameToUpload http://localhost:8888/_ah/upload/agtncmVlbi1mbGVldHIbCxIVX19CbG9iVXBsb2FkU2Vzc2lvbl9fGFcM)
	 * 주의할 점 : 위에서 생성한 URL은 꼭 한번만 사용할 수 있다. 따라서, 여러 파일을 올릴 때는 반복적으로 새로운 업로드 URL을 받아야 한다.
	 */
	@RequestMapping(value = "/data/fileUploadUrl", method = RequestMethod.GET)
	public @ResponseBody String getFileUploadUrl() {
		return blobstoreService.createUploadUrl("/upload");
	}
	
	@RequestMapping(value = "/data/files.json", method = RequestMethod.GET)
	public @ResponseBody ArrayList<Map<String, Object>> getFiles() {
		Query query = new Query("__BlobInfo__");
		
//		q.addFilter("lastName", Query.FilterOperator.EQUAL, lastNameParam);
//		q.addFilter("height", Query.FilterOperator.LESS_THAN, maxHeightParam);
		
		PreparedQuery pq = datastoreService.prepare(query);

		ArrayList<Map<String, Object>> entities = new ArrayList<Map<String, Object>>();
				
		for (Entity result : pq.asIterable()) {
			entities.add(result.getProperties());
		}
		
		return entities;
	}
	
//	@RequestMapping(value="/upload", method = RequestMethod.POST)
//	public @ResponseBody Map<String, Object> upload(HttpServletRequest request, HttpServletResponse response) {
//
//	     Map<String, BlobKey> blobs = blobstoreService.getUploadedBlobs(request);
//	     BlobKey blobKey = blobs.get("fileName");
//	     
//	     response.setContentType("text/html");
//
//	     Map<String, Object> result = new HashMap<String, Object>();
//	     
//	     if (blobKey == null) {
//		     result.put("success", false);
//		     result.put("msg", "file upload failed");
//	     } else {
//		     result.put("success", true);
//		     result.put("msg", blobKey.getKeyString());
//	     }		
//
//	     return result;
//	}

	/*
	 * Caution 주의 : 파일 업로드인 경우에는 아래처럼 response contentType을 text/html로 하고,
	 * 꼭, 스트링으로 응답을 주어야 한다. Ajax로 파일을 요청하는 측에서 통상 iFrame을 사용하기 때문에 발생하는 문제라고 한다.
	 */
	@RequestMapping(value="/upload", method = RequestMethod.POST)
	public @ResponseBody String upload(HttpServletRequest request, HttpServletResponse response) {

	     Map<String, BlobKey> blobs = blobstoreService.getUploadedBlobs(request);
	     BlobKey blobKey = blobs.get("fileName");
	     
	     response.setContentType("text/html");

	     if (blobKey == null) {
	    	 return "{ \"success\" : false, \"msg\" : \"file upload failed\" }";
	     } else {
	    	 return "{ \"success\" : true, \"blob-key\" : \"" + blobKey.getKeyString() + "\" }";
	     }		
	}
	
	@RequestMapping(value="/download", method = RequestMethod.GET)
	public void download(HttpServletRequest request, HttpServletResponse response) throws Exception {

		String blobKeyStr = request.getParameter("blob-key");
		BlobKey blobKey = null;
		
		if(blobKeyStr.startsWith("/gs/")) {
			String namePart = blobKeyStr.substring(blobKeyStr.lastIndexOf("/") + 1);
			response.setHeader("Content-Disposition", "inline;filename=\"" + namePart + "\"");
			blobKey = this.blobstoreService.createGsBlobKey(blobKeyStr);
		} else {
			blobKey = new BlobKey(blobKeyStr);
		}
		
        blobstoreService.serve(blobKey, response);
	}
}
