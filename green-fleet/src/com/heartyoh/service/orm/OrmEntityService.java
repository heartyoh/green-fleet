/**
 * 
 */
package com.heartyoh.service.orm;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.ByteBuffer;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.common.util.ValueUtils;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.dbist.dml.Dml;
import org.dbist.dml.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.IEntity;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

/**
 * Dbist Entity Service
 * 
 * @author jhnam
 */
public abstract class OrmEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(OrmEntityService.class); 
	/**
	 * RESPONSE CONTENT TYPE
	 */
	protected static final String CONTENT_TYPE = "text/html; charset=UTF-8";	
	/**
	 * empty entity list
	 */
	protected static final List<IEntity> emptyList = new ArrayList<IEntity>();
	
	/**
	 * Dml
	 */
	protected Dml dml; 
	
	@Autowired
	public void setDml(Dml dml) {
		this.dml = dml;
	}
	
	/**
	 * dml을 리턴
	 * 
	 * @return
	 */
	public Dml getDml() {
		return this.dml;
	}
	
	/**
	 * 해당 서비스에서 다루는 Entity class
	 * 
	 * @return
	 */
	public abstract Class<?> getEntityClass();
	
	/**
	 * key field list
	 * 
	 * @return
	 */
	public abstract String[] getKeyFields();
	
	/**
	 * remote filter 
	 * @return
	 */
	protected boolean useFilter() {
		return false;
	}
	
	/**
	 * company 정보 추출 
	 * 
	 * @param request
	 * @return
	 */
	protected String getCompany(HttpServletRequest request) {
		
		CustomUser user = SessionUtils.currentUser();
		return (user != null) ? user.getCompany() : request.getParameter("company");
	}
	
	/**
	 * Entity 하나를 선택  
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */	
	public IEntity find(HttpServletRequest request) throws Exception {		
		return (IEntity)this.dml.select(this.getEntityClass(), this.getKeyQuery(request, true));
	}
	
	/**
	 * Entity 하나를 선택해서 삭제 
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */
	public IEntity delete(HttpServletRequest request) throws Exception {
		
		IEntity entity = this.find(request);
		
		if(entity == null)
			throw new Exception("Failed to delete because entity not found!");

		this.onDelete(request, entity);
		this.dml.delete(entity);
		return entity;
	}
	
	/**
	 * Entity 하나를 선택해서 저장 
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */
	public IEntity save(HttpServletRequest request) throws Exception {
		
		IEntity obj = null;
		try {
			obj = this.find(request);
		} catch (Exception e) {
		}
		
		if(obj == null)
			obj = this.onCreate(request, obj);
		
		this.onUpdate(request, obj);
		this.dml.upsert(obj);
		return obj;
	}
	
	/**
	 * 파라미터로 검색 
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */	
	public List<IEntity> retrieve(HttpServletRequest request) throws Exception {
		
		Query query = this.getRetrieveQuery(request);
		@SuppressWarnings("unchecked")
		List<IEntity> list = (List<IEntity>)this.dml.selectList(this.getEntityClass(), query);
		for(IEntity entity : list) {
			this.adjustEntity(request, entity);
		}
		
		return list;
	}	
	
	/**
	 * pagination하여 검색 
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> retrieveByPaging(HttpServletRequest request) throws Exception {
		
		Query query = this.getRetrieveQuery(request);
		int total = this.dml.selectSize(this.getEntityClass(), query);
		
		if(total >= 1) {
			this.setPageInfo(request, query);
			@SuppressWarnings("unchecked")
			List<IEntity> list = (List<IEntity>)this.dml.selectList(this.getEntityClass(), query);
			for(IEntity entity : list) {
				this.adjustEntity(request, entity);
			}
			
			return this.getResultSet(true, total, list);			
		} else {
			return this.getResultSet(true, 0, emptyList);
		}
	}
	
	/**
	 * import 
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		
		MultipartFile file = request.getFile("file");
		BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
		String line = br.readLine();
		String[] keys = line.split(",");
		String company = this.getCompany(request);
		List<IEntity> list = new ArrayList<IEntity>();
		
		while ((line = br.readLine()) != null) {
			String[] values = line.split(",");
			IEntity entity = (IEntity)this.getEntityClass().newInstance();
			entity.setCompany(company);
			
			for (int i = 0; i < keys.length; i++) {
				String key = keys[i].trim();
				String value = values[i].trim();
				this.setImportValue(entity, key, value);				
			}

			entity.beforeSave();
			list.add(entity);
		}

		this.dml.upsertBatch(list);
		response.setContentType("text/html; charset=UTF-8");
		return "{\"success\" : true, \"msg\" : \"Imported " + list.size() + " count successfully\"}";
	}
	
	/**
	 * import 시 사용, 해당 Entity 객체에 각 필드마다 값을 설정 
	 * 
	 * @param entity
	 * @param columnName
	 * @param columnValue
	 * @throws Exception
	 */
	private void setImportValue(IEntity entity, String columnName, String columnValue) throws Exception {
		Class<?> clz = this.getEntityClass();
		Field f = clz.getDeclaredField(ValueUtils.toCamelCase(columnName, '_'));
		Class<?> fType = f.getType();
		String methodName = "set_" + columnName;
		methodName = ValueUtils.toCamelCase(methodName, '_');
		Method m = clz.getMethod(methodName, fType);
		Object newValue = this.convertValueByType(fType, columnValue);
		m.invoke(entity, newValue);
	}
	
	/**
	 * column type에 따라 값 변환
	 * 
	 * @param type
	 * @param value
	 * @return
	 */
	protected Object convertValueByType(Class<?> fType, String value) {

		if(fType == boolean.class || fType == Boolean.class) {
			return DataUtils.toBool(value);
		} else if(fType == float.class || fType == Float.class) {
			return DataUtils.toFloat(value);
		} else if(fType == int.class || fType == Integer.class) {
			return DataUtils.toInt(value);
		} else if(fType == long.class || fType == Long.class) {
			return DataUtils.toLong(value);
		} else if(fType == double.class || fType == Double.class) {
			return DataUtils.toDouble(value);
		} else if(fType == Date.class) {
			return DataUtils.toDate(value);
		} else if(fType == Timestamp.class) {
			Date d = DataUtils.toDate(value);
			return (d != null) ? new java.sql.Timestamp(d.getTime()) : null;
		} else {
			return value;
		}		
	}
	
	/**
	 * retrieve
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		try {
			response.setContentType(CONTENT_TYPE);
			List<IEntity> list = this.retrieve(request);
			List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
			for(IEntity entity : list)
				items.add(this.convertItem(request, entity));
			
			return this.getResultSet(true, items.size(), items);
		} catch(Exception e) {
			logger.error("Failed to retrieve " + this.getEntityClass().getName(), e);
			return this.getResultSet(true, 0, null);
		}
	}
	
	/**
	 * retrieve by paging
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> retrieveByPaging(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		Query query = this.getRetrieveQuery(request);
		int total = this.dml.selectSize(this.getEntityClass(), query);
		
		if(total >= 1) {
			this.setPageInfo(request, query);
			@SuppressWarnings("unchecked")
			List<IEntity> list = (List<IEntity>)this.dml.selectList(this.getEntityClass(), query);
			List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
			
			for(IEntity entity : list) {
				this.adjustEntity(request, entity);
				items.add(this.convertItem(request, entity));				
			}
			
			return this.getResultSet(true, total, items);			
		} else {
			return this.getResultSet(true, 0, emptyList);
		}				
	}
	
	/**
	 * save
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);
		try {
			Map<String, Object> paramMap = null;
			
			// 1. multi part 전처리
			if (request instanceof MultipartHttpServletRequest) {
				paramMap = DataUtils.toMap(request);
				preMultipart(paramMap, (MultipartHttpServletRequest) request);
			}
			
			IEntity entity = this.save(request);
			
			// 3. multi part 후처리
			if (request instanceof MultipartHttpServletRequest)
				postMultipart(entity, paramMap, (MultipartHttpServletRequest) request);
			
			return "{\"success\" : true, \"msg\" : \"Succeeded to save!\"}";
		} catch(Exception e) {
			logger.error("Failed to save!", e);
			return "{\"success\" : false, \"msg\" : \"Failed to save!\"}";
		}		
	}
	
	/**
	 * multipart 데이터가 넘어올 경우, 전 처리
	 * 
	 * @param paramMap
	 * @param request
	 * @throws Exception
	 */
	protected void preMultipart(Map<String, Object> paramMap, MultipartHttpServletRequest request) throws Exception {

		Map<String, MultipartFile> filemap = request.getFileMap();
		Set<String> keys = filemap.keySet();
		Iterator<String> it = keys.iterator();

		while (it.hasNext()) {
			String key = it.next();
			MultipartFile file = filemap.get(key);
			paramMap.put(key, file);
		}
	}
	
	/**
	 * multipart 데이터가 넘어올 경우, 후 처리
	 * 
	 * @param entity
	 * @param paramMap
	 * @param request
	 * @throws Exception
	 */
	protected void postMultipart(IEntity entity, Map<String, Object> paramMap, MultipartHttpServletRequest request) throws Exception {
	}
	
	/**
	 * Multipart file google store에 저장
	 * 
	 * @param request
	 * @param file
	 * @return
	 * @throws IOException
	 */
	protected String saveFile(MultipartHttpServletRequest request,
			MultipartFile file) throws IOException {

		if (file != null && file.getSize() > 0) {
			com.google.appengine.api.files.FileService fileService = FileServiceFactory
					.getFileService();
			AppEngineFile appfile = fileService.createNewBlobFile(
					file.getContentType(), file.getOriginalFilename());
			FileWriteChannel writeChannel = fileService.openWriteChannel(
					appfile, true);
			writeChannel.write(ByteBuffer.wrap(file.getBytes()));
			writeChannel.closeFinally();
			return fileService.getBlobKey(appfile).getKeyString();
		} else {
			return null;
		}
	}	
	
	/**
	 * find
	 * 
	 * @param request
	 * @param response
	 * @return 
	 * @throws Exception
	 */
	public Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");		
		try {
			IEntity entity = this.find(request);
			return this.convertItem(request, entity);
			
		} catch(Exception e) {
			return DataUtils.newMap(new String[] {"result", "msg" }, new Object[] { false, "Failed to find - " + e.getMessage() });
		}		
	}
	
	/**
	 * delete
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		try {
			this.delete(request);
			return "{\"success\" : true, \"msg\" : \"Success to destroy!\"}";
		} catch(Exception e) {
			return "{\"success\" : false, \"msg\" : \"Failed to destroy!\"}";
		}		
	}	
	
	/**
	 * 파라미터 조건에 맞는 카운트 
	 * 
	 * @param query
	 * @return
	 * @throws Exception
	 */
	public int count(Query query) throws Exception {		
		return this.dml.selectSize(this.getEntityClass(), query);
	}
	
	/**
	 * Query에 page를 설정 
	 * 
	 * @param request
	 * @param query
	 */
	protected void setPageInfo(HttpServletRequest request, Query query) {
		
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		query.setPageIndex(page - 1);
		query.setPageSize(limit);
	}
	
	/**
	 * request로 부터 retrieve query를 정의한다. 
	 * 
	 * @param request
	 * @return
	 * @throws
	 */
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		
		if(this.useFilter()) {
			List<Filter> filters = this.parseFilters(request.getParameter("filter"));
			List<Sorter> sorters = this.parseSorters(request.getParameter("sorter"));
		
			if(filters != null) {
				for(Filter filter : filters) {
					if(!DataUtils.isEmpty(filter.getValue()))
						query.addFilter(filter.getProperty(), filter.getValue());
				}
			}
		
			if(sorters != null) {
				for(Sorter sorter : sorters) {
					query.addOrder(sorter.getProperty(), "asc".equals(sorter.getDirection().toLowerCase()));
				}
			}
		}
		
		return query;
	}	
	
	/**
	 * update 전에 처리 
	 * 
	 * @param request
	 * @param entity
	 * @return
	 */
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		return entity;
	}
	
	/**
	 * create 전에 처리 
	 * 
	 * @param request
	 * @param entity
	 * @return
	 */
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		return entity;
	}
	
	/**
	 * delete 전에 처리 
	 * 
	 * @param request
	 * @param entity
	 * @return
	 */
	protected IEntity onDelete(HttpServletRequest request, IEntity entity) {
		return entity;
	}
	
	/**
	 * find 전에 처리
	 * 
	 * @param request
	 * @param entity
	 * @return
	 */
	protected IEntity onFind(HttpServletRequest request, IEntity entity) {
		return entity;
	}
	
	/**
	 * List를 조회하는 도중 각 서비스에서 entity를 Map으로 변환한다.
	 * 
	 * @param request
	 * @param entity
	 * @return
	 */
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		return entity.toMap(request.getParameterValues("select"));
	}
	
	/**
	 * List를 조회하는 도중 각 서비스에서 entity를 조정한다.
	 * 
	 * @param request
	 * @param entity
	 * @return
	 */
	protected void adjustEntity(HttpServletRequest request, IEntity entity) {		
	}	
	
	/**
	 * 키 값에 대한 값이 존재하는지 체크, 설정된 키가 request에 없다면 예외 발생
	 * 
	 * @param request
	 * @throws Exception
	 */
	protected void checkKeyValues(HttpServletRequest request) throws Exception {
		
		String[] keyFields = this.getKeyFields();
		for(int i = 0; i < keyFields.length ; i++) {
			String key = keyFields[i];
			if(DataUtils.isEmpty(request.getParameter(key)))
				throw new Exception("Key [" + key + "] value is null!");
		}
	}
	
	/**
	 * 정의된 key field로 request로 부터 파라미터를 뽑아 리턴     
	 * 
	 * @param request
	 * @param checkNull
	 * @return
	 * @throws
	 */
	protected Map<String, Object> getKeyValues(HttpServletRequest request, boolean checkNull) throws Exception {
		
		Map<String, Object> keyValues = new HashMap<String, Object>();
		String[] keyFields = this.getKeyFields();
		
		for(int i = 0; i < keyFields.length ; i++) {
			String key = keyFields[i];
			Object value = request.getParameter(key);
			
			if("company".equalsIgnoreCase(key)) {
				value = this.getCompany(request);
			}
			
			// checkNull이 true로 되어 있다면 request에 key 값이 없다면 예외 발생 
			if(checkNull && DataUtils.isEmpty(value))
				throw new Exception("Key [" + key + "] value is null!");
			
			keyValues.put(key, value);
		}
		
		return keyValues;
	}
	
	/**
	 * 정의된 key field로 request로 부터 파라미터를 뽑아 Query 객체를 만들어 리턴  
	 * 
	 * @param request
	 * @param checkNull
	 * @return
	 * @throws Exception
	 */
	protected Query getKeyQuery(HttpServletRequest request, boolean checkNull) throws Exception {
		Query query = new Query();
		String[] keyFields = this.getKeyFields();
		
		for(int i = 0; i < keyFields.length ; i++) {
			String key = keyFields[i];
			Object value = request.getParameter(key);
			
			if("company".equalsIgnoreCase(key)) {
				value = this.getCompany(request);
			}
			
			// checkNull이 true로 되어 있다면 request에 key 값이 없다면 예외 발생 
			if(checkNull && DataUtils.isEmpty(value))
				throw new Exception("Key [" + key + "] value is null!");
			
			query.addFilter(key, value);
		}
		
		return query;
	}
	
	/**
	 * 파라미터로 Query 생성 
	 * 
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
	protected Query genQuery(Map<String, Object> paramMap) throws Exception {
		
		Query query = new Query();
		Iterator<String> keyIter = paramMap.keySet().iterator();
		
		while(keyIter.hasNext()) {
			String key = keyIter.next();
			Object value = paramMap.get(key);
			query.addFilter(key, value);
		}
		
		return query;
	}
	
	/**
	 * 결과셋 리턴 
	 * 
	 * @param success
	 * @param totalCount
	 * @param items
	 * @return
	 */
	protected Map<String, Object> getResultSet(boolean success, int totalCount, Object items) {
		
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", success);
		result.put("total", totalCount);
		result.put("items", items);		
		return result;
	}
	
	/**
	 * filterStr 파싱 
	 * 
	 * @param filterStr
	 * @return
	 * @throws
	 */
	protected List<Filter> parseFilters(String filterStr) throws Exception {
		
		if (filterStr != null) {
			return new ObjectMapper().readValue(filterStr, new TypeReference<List<Filter>>() {});
		} else {
			return null;
		}		
	}
	
	/**
	 * sorterStr 파싱
	 * 
	 * @param sorterStr
	 * @return
	 * @throws
	 */
	protected List<Sorter> parseSorters(String sorterStr) throws Exception {
		
		if (sorterStr != null) {
			return new ObjectMapper().readValue(sorterStr, new TypeReference<List<Sorter>>() {});
		} else {
			return null;
		}
	}	
}
