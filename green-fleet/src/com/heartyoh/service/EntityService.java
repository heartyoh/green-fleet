package com.heartyoh.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
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
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.SessionUtils;

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
		return map;
	}
	
	protected Key getCompanyKey(HttpServletRequest request) {
		CustomUser user = SessionUtils.currentUser();
		String company = (user != null) ? user.getCompany() : request.getParameter("company");
		return KeyFactory.createKey("Company", company);
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
	 * save 결과 메시지를 json형태의 문자열로 리턴한다.
	 * 
	 * @param success
	 * @param entity
	 * @return
	 */
	protected String getCreateResultMsg(boolean success, Entity entity) {
		return "{ \"success\" : " + success + ", \"key\" : \"" + KeyFactory.keyToString(entity.getKey()) + "\" }";
	}
	
	/**
	 * delete 결과 메시지를 json형태의 문자열로 리턴한다.
	 * 
	 * @param success
	 * @param key
	 * @return
	 */
	protected String getDeleteResultMsg(boolean success, String key) {
		return "{ \"success\" : " + success + ", \"msg\" : \"" + getEntityName() + " destroyed!\", \"key\" : \"" + key + "\" }";
	}
	
	/**
	 * 일반적인 success와 결과 메시지를 json형태의 문자열로 리턴한다.
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

	protected static String saveFile(MultipartFile file) throws IOException {
		if (file != null && file.getSize() > 0) {
			com.google.appengine.api.files.FileService fileService = FileServiceFactory.getFileService();
			AppEngineFile appfile = fileService.createNewBlobFile(file.getContentType());// ,
																							// imageFile.getOriginalFilename());

			boolean lock = true;
			FileWriteChannel writeChannel = fileService.openWriteChannel(appfile, lock);

			writeChannel.write(ByteBuffer.wrap(file.getBytes()));

			writeChannel.closeFinally();
//			writeChannel.close();

			return fileService.getBlobKey(appfile).getKeyString();
		}
		return null;
	}

	protected void preMultipart(Map<String, Object> map, MultipartHttpServletRequest request) throws IOException {
		Map<String, MultipartFile> filemap = request.getFileMap();

		Set<String> keys = filemap.keySet();

		Iterator<String> it = keys.iterator();

		while (it.hasNext()) {
			String key = it.next();
			MultipartFile file = filemap.get(key);

			map.put(key, file);
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

		Map<String, Object> commons = new HashMap<String, Object>();
		@SuppressWarnings("unchecked")
		Enumeration<String> names = request.getParameterNames();
		while (names.hasMoreElements()) {
			String name = names.nextElement();
			commons.put(name, request.getParameter(name));
		}

		MultipartFile file = request.getFile("file");
		String filename = file.getOriginalFilename();
		String contentType = file.getContentType();

		BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));

		String line = br.readLine();
		/*
		 * First line for the header Information
		 */
		String[] keys = line.split(",");

		/*
		 * Next lines for the values
		 */
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
				/*
				 * Request의 파라미터를 모든 레코드의 공통 파라미터로 추가한다.
				 */
				map.put("_commons", commons);

				Key key = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
				Entity entity = null;

				try {
					entity = datastore.get(key);
				} catch (EntityNotFoundException e) {
					entity = new Entity(key);
					onCreate(entity, map, datastore);
				}

				onSave(entity, map, datastore);
				datastore.put(entity);
				successCount++;
			}
		} finally {
		}

		response.setContentType("text/html");
		return this.getResultMsg(true, "Imported " + successCount + " count successfully!");
	}

	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, Object> map = toMap(request);
		if (request instanceof MultipartHttpServletRequest) {
			preMultipart(map, (MultipartHttpServletRequest) request);
		}

		String key = request.getParameter("key");
		Key companyKey = this.getCompanyKey(request);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();	
		Key objKey = (key != null && key.trim().length() > 0) ? KeyFactory.stringToKey(key) : KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
		
		boolean creating = false;
		Entity obj = null;

		try {
			obj = datastore.get(objKey);
		} catch (EntityNotFoundException e) {
			creating = true;
		}		

		Date now = new Date();
		map.put("_now", now);
		map.put("_company_key", companyKey);

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

	protected void addFilter(Query q, String property, String value) {
		q.addFilter(property, FilterOperator.EQUAL, value);
	}

	protected void buildQuery(Query q, List<Filter> filters, List<Sorter> sorters) {
		if (filters != null) {
			Iterator<Filter> it = filters.iterator();

			while (it.hasNext()) {
				Filter filter = it.next();
				String value = filter.getValue();
				if (value != null && value.length() > 0)
					addFilter(q, filter.getProperty(), filter.getValue());
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
			try {
				entity = datastore.get(KeyFactory.stringToKey(key));
			} catch (EntityNotFoundException e) {
			}
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

		int[] limit_offset = this.getLimitOffsetCount(request);
		int limit = limit_offset[0];
		int offset = limit_offset[1];

		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		for (Entity result : pq.asIterable(FetchOptions.Builder.withLimit(limit).offset(offset))) {
			Map<String, Object> item = SessionUtils.cvtEntityToMap(result, request.getParameterValues("select"));
			this.adjustItem(item);
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
