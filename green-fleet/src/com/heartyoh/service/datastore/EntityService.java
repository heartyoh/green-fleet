package com.heartyoh.service.datastore;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.labs.repackaged.org.json.JSONArray;
import com.google.appengine.labs.repackaged.org.json.JSONObject;
import com.google.appengine.tools.cloudstorage.GcsFilename;
import com.google.appengine.tools.cloudstorage.GcsOutputChannel;
import com.google.appengine.tools.cloudstorage.GcsService;
import com.google.appengine.tools.cloudstorage.GcsServiceFactory;
import com.google.appengine.tools.cloudstorage.RetryParams;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;
//import com.google.appengine.api.files.AppEngineFile;
//import com.google.appengine.api.files.FileServiceFactory;
//import com.google.appengine.api.files.FileWriteChannel;
//import com.google.appengine.api.files.GSFileOptions.GSFileOptionsBuilder;
//import com.google.appengine.tools.cloudstorage.GcsFileOptions.Builder;

/**
 * 각 엔티티의 콘트롤러 클래스의 부모 클래스 
 * 
 * @author heartyoh
 */
public abstract class EntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(EntityService.class);
	private static final Map<String, Object> emptyMap = new HashMap<String, Object>();

	abstract protected String getEntityName();

	abstract protected String getIdValue(Map<String, Object> map);

	protected static Map<String, Object> toMap(HttpServletRequest request) {
		Map<String, Object> map = new HashMap<String, Object>();
		@SuppressWarnings("rawtypes")
		Enumeration e = request.getParameterNames();
		while (e.hasMoreElements()) {
			String name = (String) e.nextElement();
			map.put(name, request.getParameter(name));
		}
		
		if(!map.containsKey("company"))
			map.put("company", "palmvision");
		
		return map;
	}
	
	protected Key getCompanyKey(HttpServletRequest request) {
		CustomUser user = SessionUtils.currentUser();
		String company = (user != null) ? user.getCompany() : request.getParameter("company");
		
		company = (company == null || company.equalsIgnoreCase("")) ? "palmvision" : company;
		
		return KeyFactory.createKey("Company", company);
	}
	
	protected String getCompany(HttpServletRequest request) {
		CustomUser user = SessionUtils.currentUser();
		return (user != null) ? user.getCompany() : request.getParameter("company");
	}	
	
	protected Map<String, Object> packResultDataset(boolean success, int totalCount, Object items) {
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", success);
		result.put("total", totalCount);
		result.put("items", items);		
		return result;
	}
	
	protected Map<String, Object> packResultData(boolean success, Object item) {
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", success);
		result.put("data", item);
		return result;
	}
	
	protected static boolean booleanProperty(Map<String, Object> map, String property) {
		String value = (String) map.get(property);
		return value.equals("true") || value.equals("on");
	}

	protected static double doubleProperty(Map<String, Object> map, String property) {
		String value = (String) map.get(property);
		return Double.parseDouble(value);
	}

	protected static int intProperty(Map<String, Object> map, String property) {
		String value = (String) map.get(property);
		return Integer.parseInt(value);
	}

	protected static String stringProperty(Map<String, Object> map, String property) {
		return (String) map.get(property);
	}

	protected boolean useFilter() {
		return false;
	}
	
	/**
	 * save 결과 메시지를 json 형태의 문자열로 리턴한다.
	 * 
	 * @param success
	 * @param entity
	 * @return
	 */
	protected String getCreateResultMsg(boolean success, Entity entity) {
		return "{ \"success\" : " + success + ", \"key\" : \"" + KeyFactory.keyToString(entity.getKey()) + "\" }";
	}
	
	/**
	 * 처리 결과 발생된 결과 메시지를 json 형태의 문자열로 리턴한다.
	 * 
	 * @param key
	 * @return
	 */
	protected String getSuccessMsg(String key) {
		return "{ \"success\" : true, \"key\" : \"" + key + "\" }";
	}	
	
	/**
	 * delete 결과 메시지를 json 형태의 문자열로 리턴한다.
	 * 
	 * @param success
	 * @param key
	 * @return
	 */
	protected String getDeleteResultMsg(boolean success, String key) {
		return "{ \"success\" : " + success + ", \"msg\" : \"" + getEntityName() + " destroyed!\", \"key\" : \"" + key + "\" }";
	}
	
	/**
	 * 일반적인 success와 결과 메시지를 json 형태의 문자열로 리턴한다.
	 * FIXME 문자열 escape를 위해 리턴 결과셋을 오브젝트화 하고 이를 json 형태의 문자열로 변환한다.
	 * 
	 * @param success
	 * @param msg
	 * @return {success : true, msg : 'message...'}
	 */
	protected String getResultMsg(boolean success, String msg) {
		return "{ \"success\" : " + success + ", \"msg\" : \"" + msg + "\" }";
	}

	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("created_at", map.get("_now"));
	}

	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("updated_at", map.get("_now"));
	}

	protected static String saveFile(MultipartHttpServletRequest request, MultipartFile file) throws IOException {
		if (file != null && file.getSize() > 0) {
			CustomUser user = SessionUtils.currentUser();
			String company = (user != null) ? user.getCompany() : request.getParameter("company");
			company = (company == null) ? "palmvision" : company;
			
			GcsService gcsService = GcsServiceFactory.createGcsService(RetryParams.getDefaultInstance());
			com.google.appengine.tools.cloudstorage.GcsFileOptions.Builder optionsBuilder = new com.google.appengine.tools.cloudstorage.GcsFileOptions.Builder()
			.mimeType(file.getContentType())
			.acl("public_read");
//			.addUserMetadata("company", company);
			GcsFilename gcsFilename = new GcsFilename("green-fleets.appspot.com", company + "/images/" + file.getOriginalFilename());
			
			GcsOutputChannel gcsOutputChannel = gcsService.createOrReplace(gcsFilename, optionsBuilder.build());
			gcsOutputChannel.write(ByteBuffer.wrap(file.getBytes()));
//			gcsOutputChannel.waitForOutstandingWrites();
			gcsOutputChannel.close();

			return "https://storage.googleapis.com/green-fleets.appspot.com/" + company + "/images/" + file.getOriginalFilename();
		}
		return null;
	}

	protected static String saveFileToGS(MultipartHttpServletRequest request, MultipartFile file) throws IOException {
		if (file != null && file.getSize() > 0) {
			CustomUser user = SessionUtils.currentUser();
			String company = (user != null) ? user.getCompany() : request.getParameter("company");
			company = (company == null) ? "palmvision" : company;
			
			GcsService gcsService = GcsServiceFactory.createGcsService(RetryParams.getDefaultInstance());
			com.google.appengine.tools.cloudstorage.GcsFileOptions.Builder optionsBuilder = new com.google.appengine.tools.cloudstorage.GcsFileOptions.Builder()
				.mimeType(file.getContentType())
				.acl("public_read");
//				.addUserMetadata("company", company);
			
			GcsFilename gcsFilename = new GcsFilename("green-fleets.appspot.com", company + "/incident/" + file.getOriginalFilename());
			
			GcsOutputChannel gcsOutputChannel = gcsService.createOrReplace(gcsFilename, optionsBuilder.build());
			gcsOutputChannel.write(ByteBuffer.wrap(file.getBytes()));
//			gcsOutputChannel.waitForOutstandingWrites();
			gcsOutputChannel.close();
			
			
			String OriginFullName = file.getOriginalFilename();
			int pos = OriginFullName.lastIndexOf(".");
			String fileName = OriginFullName.substring(0, pos);
			String extension = OriginFullName.substring(OriginFullName.lastIndexOf(".")+1, OriginFullName.length());
			
			if(extension.equals("avi"))
				callZencoder(file.getOriginalFilename(), company, fileName);
			
			return "https://storage.googleapis.com/green-fleets.appspot.com/" + company + "/incident/" + fileName + ".mp4";
		}
		return null;
	}
	
	protected static void callZencoder(String originalFileFullName, String company, String fileName) {
		try {
			URL url = new URL("https://app.zencoder.com/api/v2/jobs");
			HttpURLConnection connection = (HttpURLConnection) url.openConnection();
			connection.setRequestProperty("Zencoder-Api-Key", "275b34d6afc0b3a0de8f2aeed3b49718");
	        connection.setRequestProperty("Content-Type", "application/json");
	        
	        connection.setDoInput(true);
	        connection.setDoOutput(true);
	        connection.setRequestMethod("POST");
	        OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream());
	        
	        String msg = "{\"input\": \"gcs://green-fleets.appspot.com/" + company + "/incident/" + originalFileFullName + "\",\"outputs\":[{\"url\":\"gcs://green-fleets.appspot.com/" + company + "/incident/" + fileName + ".mp4\", \"headers\" : {\"x-goog-acl\" : \"public-read\"}} ]}";          
	        
	        writer.write(msg);
	        writer.flush();
	        writer.close();
	        
	        if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
            } else {
            }
		} catch (Exception e) {
			
		}
	}

	protected void preMultipart(Map<String, Object> map, MultipartHttpServletRequest request) throws IOException {
		Map<String, MultipartFile> filemap = request.getFileMap();

		Set<String> keys = filemap.keySet();

		Iterator<String> it = keys.iterator();

		while (it.hasNext()) {
			String key = it.next();
			MultipartFile file = filemap.get(key);

			// image clip or video clip
			if(key.endsWith("_clip")) {
				map.put(key, file);
			} else {
				map.put(key, new String(file.getBytes()));
			}						
		}
	}

	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request) throws IOException {
	}

	/*
	 * 하나의 파일(키이름 : file)로 여러 레코드를 한번에 생성 또는 수정하는 경우에 사용함. (파일은 CSV형태이어야 하면, 첫번째
	 * 레코드에는 key 이름이 나열되어야 한다.)
	 * 
	 * 이 경우에는 각 레코드의 키로 사용될 정보는 filename 정보와 각 레코드의 필드 정보로 만들어 낼 수 있다.
	 * getIdValue 에 넘겨지는 파라미터(map)에는 각 레코드의 데이타 외에 _filename 키로 파일이름이 넘겨지고,
	 * _content_type 키로 컨텐트 타입이 넘겨진다.
	 */
	public String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {

		response.setContentType("text/html");
		Map<String, Object> commons = toMap(request);
		MultipartFile file = request.getFile("file");
		String filename = file.getOriginalFilename();
		String contentType = file.getContentType();
		BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
		String line = br.readLine();
		// First line for the header Information
		String[] keys = line.split(",");
		// Next lines for the values
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		int successCount = 0;
		
		try {
			Key companyKey = this.getCompanyKey(request);
			Date now = new Date();

			while ((line = br.readLine()) != null) {
				String[] values = line.split(",");
				Map<String, Object> map = new HashMap<String, Object>();
				for (int i = 0; i < keys.length; i++) {
					map.put(keys[i].trim(), values[i].trim());
				}
				
				map.put("_filename", filename);
				map.put("_content_type", contentType);
				map.put("_now", now);
				map.put("_company_key", companyKey);
				// Request의 파라미터를 모든 레코드의 공통 파라미터로 추가한다.
				map.put("_commons", commons);

				this.adjustRequestMap(datastore, map);
				Key key = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
				Entity entity = null;
				try {
					entity = datastore.get(key);
				} catch (EntityNotFoundException e) {
					entity = new Entity(key);
					onCreate(entity, map, datastore);
				}

				onSave(entity, map, datastore);
				this.saveEntity(entity, map, datastore);
				successCount++;
			}
		} catch(Exception e) {
			logger.error("Failed to import!", e);
			return this.getResultMsg(false, e.getMessage());
			
		} finally {
			if(br != null)
				br.close();
		}
		
		return this.getResultMsg(true, "Imported " + successCount + " count successfully!");
	}
	
	/**
	 * Entity save
	 * Entity save시 구현 서비스에서 다른 작업 (예를 들면 Transaction 처리, 이력 관리 등...)을 할 수 있도록 ...  
	 * 
	 * @param entity
	 * @param map
	 * @param datastore
	 */
	protected void saveEntity(Entity obj, Map<String, Object> map, DatastoreService datastore) throws Exception {
		datastore.put(obj);
	}
	
	/**
	 * save 전에 Request 파라미터로 부터 뽑아낸 Map에 대해서 핸들링한다.
	 * 
	 * @param datastore
	 * @param map
	 * @throws Exception
	 */
	protected void adjustRequestMap(DatastoreService datastore, Map<String, Object> map) throws Exception {		
	}

	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, Object> map = toMap(request);
//		String key = request.getParameter("key");
//		Key companyKey = this.getCompanyKey(request);
//		map.put("_company_key", companyKey);
//		map.put("_now", new Date());
		
		if (request instanceof MultipartHttpServletRequest) {
			preMultipart(map, (MultipartHttpServletRequest) request);
		}
		
		String key = request.getParameter("key");
		Key companyKey = null;
		
		if(map.containsKey("company")) {
			companyKey = KeyFactory.createKey("Company", (String)map.get("company"));
		} else {
			companyKey = this.getCompanyKey(request);
		}
		
		map.put("_company_key", companyKey);
		map.put("_now", new Date());		
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		this.adjustRequestMap(datastore, map);
		
		Key objKey = (!DataUtils.isEmpty(key)) ? KeyFactory.stringToKey(key) : KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
		Entity obj = null;

		try {
			obj = datastore.get(objKey);
		} catch (EntityNotFoundException e) {
			obj = new Entity(objKey);
			onCreate(obj, map, datastore);
		}

		if (request instanceof MultipartHttpServletRequest) {
			postMultipart(obj, map, (MultipartHttpServletRequest) request);
		}

		onSave(obj, map, datastore);
		this.saveEntity(obj, map, datastore);
		response.setContentType("text/html");
		return this.getCreateResultMsg(true, obj);
	}
	
	public String delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		try {
			datastore.delete(KeyFactory.stringToKey(key));
		} finally {
		}

		response.setContentType("text/html");
		return this.getDeleteResultMsg(true, key);
	}

	protected void addFilter(Query q, String property, Object value) {
		q.addFilter(property, Query.FilterOperator.EQUAL, value);
		//q.setFilter(new FilterPredicate(property, Query.FilterOperator.EQUAL, value));
	}

	protected void buildQuery(Query q, List<Filter> filters, List<Sorter> sorters) {
		if (filters != null) {
			Iterator<Filter> it = filters.iterator();

			while (it.hasNext()) {
				Filter filter = it.next();
				String value = filter.getValue();
				if (value != null && value.length() > 0)
					this.addFilter(q, filter.getProperty(), value);
			}
		}

		if (sorters != null) {
			Iterator<Sorter> it = sorters.iterator();
			while (it.hasNext()) {
				Sorter sorter = it.next();
				SortDirection dir = SortDirection.ASCENDING;
				if (sorter.getDirection() != null && (!sorter.getDirection().startsWith("ASC"))) {
					dir = SortDirection.DESCENDING;
				}
				q.addSort(sorter.getProperty(), dir);
			}
		}
	}

	protected void buildQuery(Query q, HttpServletRequest request) {
		return;
	}

	protected void adjustFilters(List<Filter> filters) {
		return;
	}

	protected void adjustSorters(List<Sorter> sorters) {
		return;
	}
	
	/**
	 * retrieve 시점에 최종 결과 result dataset의 items에 담기전에 item에 대해서 핸들링 
	 * @param item
	 */
	protected void adjustItem(Map<String, Object> item) {
		return;
	}	

	public Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Entity entity = null;
		
		String key = request.getParameter("key");
		if(key != null) {
			entity = DatastoreUtils.findByKey(key);
			
		} else {
			List<Filter> filters = this.parseFilters(request.getParameter("filter"));

			Key companyKey = this.getCompanyKey(request);
			Query q = new Query(getEntityName());
			q.setAncestor(companyKey);
			buildQuery(q, request);
			
			if (useFilter())
				buildQuery(q, filters, null);

			PreparedQuery pq = datastore.prepare(q);
			
			entity = pq.asSingleEntity();
		}
		
		if(entity != null) {
			Map<String, Object> map = new HashMap<String, Object>();
			
			map.putAll(entity.getProperties());
			map.put("key", KeyFactory.keyToString(entity.getKey()));
			
			return packResultData(true, map);
		}
		
		return packResultData(false, emptyMap);
	}
	
	public Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		
		List<Filter> filters = this.parseFilters(request.getParameter("filter"));
		List<Sorter> sorters = this.parseSorters(request.getParameter("sort"));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = this.getCompanyKey(request);
		Query q = new Query(getEntityName());
		q.setAncestor(companyKey);
		buildQuery(q, request);
		
		if (useFilter())
			buildQuery(q, filters, sorters);

		PreparedQuery pq = datastore.prepare(q);
		int total = pq.countEntities(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));

		int[] limitOffset = this.getLimitOffsetCount(request);
		int limit = limitOffset[0];
		int offset = limitOffset[1];

		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		for (Entity result : pq.asIterable(FetchOptions.Builder.withLimit(limit).offset(offset))) {
			Map<String, Object> item = SessionUtils.cvtEntityToMap(result, request.getParameterValues("select"));
			this.adjustItem(item);
			
			if(item != null && !item.isEmpty())
				items.add(item);
		}

		return packResultDataset(true, total, items);
	}
	
	/**
	 * request에서 paging을 위한 limit 값과 offset 값을 찾아 계산 후 리턴
	 *  
	 * @param request
	 * @return 첫 번째 값이 limit, 두 번째 값이 offset
	 */
	protected int[] getLimitOffsetCount(HttpServletRequest request) {

		String pLimit = request.getParameter("limit");
		String pStart = request.getParameter("start");

		int offset = 0;
		int limit = Integer.MAX_VALUE;

		if (pStart != null) {
			offset = Integer.parseInt(pStart);
		}
		
		if (pLimit != null) {
			limit = Integer.parseInt(pLimit);
		}
		
		return new int[] {limit, offset};
	}
	
	/**
	 * filterStr 파싱 
	 * 
	 * @param filterStr
	 * @return
	 */
	protected List<Filter> parseFilters(String filterStr) {
		
		List<Filter> filters = null;

		if (filterStr != null) {
			try {
				filters = new ObjectMapper().readValue(filterStr, new TypeReference<List<Filter>>() {});
				adjustFilters(filters);
			} catch (Exception e) {
				logger.error("Failed to parse filter string to json!", e);
			}
		}
		
		return filters;
	}
	
	/**
	 * sorterStr 파싱
	 * 
	 * @param sorterStr
	 * @return
	 */
	protected List<Sorter> parseSorters(String sorterStr) {
		
		List<Sorter> sorters = null;

		if (sorterStr != null) {
			try {
				sorters = new ObjectMapper().readValue(sorterStr, new TypeReference<List<Sorter>>() {});
				adjustSorters(sorters);
			} catch (Exception e) {
				logger.error("Failed to parse sorter string to json!", e);
			}
		}
		
		return sorters;
	}	
}
