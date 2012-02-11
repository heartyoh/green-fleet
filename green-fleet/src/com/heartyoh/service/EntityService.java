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

import javax.persistence.EntityExistsException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.SessionUtils;

public abstract class EntityService {
	abstract protected String getEntityName();

	abstract protected String getIdValue(Map<String, Object> map);

	protected static Map<String, Object> toMap(HttpServletRequest request) {
		Map<String, Object> map = new HashMap<String, Object>();
		Enumeration e = request.getParameterNames();
		while (e.hasMoreElements()) {
			String name = (String) e.nextElement();
			map.put(name, request.getParameter(name));
		}
		return map;
	}

	protected static boolean booleanProperty(Map<String, Object> map, String property) {
		String value = (String)map.get(property);
		return value.equals("true") || value.equals("on");
	}

	protected static double doubleProperty(Map<String, Object> map, String property) {
		String value = (String)map.get(property);
		return Double.parseDouble(value);
	}

	protected static int intProperty(Map<String, Object> map, String property) {
		String value = (String)map.get(property);
		return Integer.parseInt(value);
	}

	protected static String stringProperty(Map<String, Object> map, String property) {
		return (String)map.get(property);
	}

	protected boolean useFilter() {
		return false;
	}

	protected void onCreate(Entity entity, Map<String, Object> map, Date now) {
		entity.setProperty("created_at", now);
	}

	protected void onSave(Entity entity, Map<String, Object> map, Date now) {
		entity.setProperty("updated_at", now);
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

	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request)
			throws IOException {
	}

	/*
	 * 하나의 파일(키이름 : file)로 여러 레코드를 한번에 생성 또는 수정하는 경우에 사용함. (파일은 CSV형태이어야 하면, 첫번째
	 * 레코드에는 key 이름이 나열되어야 한다.)
	 * 
	 * 이 경우에는 각 레코드의 키로 사용될 정보는 filename 정보와 각 레코드의 필드 정보로 만들어 낼 수 있다.
	 * getIdValue 에 넘겨지는 파라미터(map)에는 각 레코드의 데이타 외에 _filename 키로 파일이름이 넘겨지고,
	 * _content_type 키로 컨텐트 타입이 넘겨진다.
	 */
	public String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws IOException {
		CustomUser user = SessionUtils.currentUser();

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

		try {
			Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());

			Date now = new Date();

			while ((line = br.readLine()) != null) {
				String[] values = line.split(",");

				Map<String, Object> map = new HashMap<String, Object>();

				for (int i = 0; i < keys.length; i++) {
					map.put(keys[i].trim(), values[i].trim());
				}
				map.put("_filename", filename);
				map.put("_content_type", contentType);

				Key key = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
				Entity entity = null;

				try {
					entity = datastore.get(key);
				} catch (EntityNotFoundException e) {
					entity = new Entity(key);
					onCreate(entity, map, now);
				}

				onSave(entity, map, now);

				datastore.put(entity);
			}
		} finally {
		}

		response.setContentType("text/html");

		return "{ \"success\" : true }";
	}

	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		Map<String, Object> map = toMap(request);
		if (request instanceof MultipartHttpServletRequest) {
			preMultipart(map, (MultipartHttpServletRequest) request);
		}

		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");

		Key objKey = null;
		boolean creating = false;

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Key companyKey = KeyFactory.createKey("Company", user.getCompany());

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
			objKey = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
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

		try {
			if (creating) {
				obj = new Entity(objKey);
				onCreate(obj, map, now);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if (request instanceof MultipartHttpServletRequest) {
				postMultipart(obj, map, (MultipartHttpServletRequest) request);
			}

			onSave(obj, map, now);

			datastore.put(obj);
		} finally {
		}

		response.setContentType("text/html");

		return "{ \"success\" : true, \"key\" : \"" + KeyFactory.keyToString(obj.getKey()) + "\" }";
	}

	public String delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		try {
			datastore.delete(KeyFactory.stringToKey(key));
		} finally {
		}

		// Map<String, Object> result = new HashMap<String, Object>();
		// result.put("success", true);
		// result.put("msg", getEntityName() + " destroyed.");
		//
		// return result;
		response.setContentType("text/html");

		return "{ \"success\" : true, \"msg\" : \"" + getEntityName() + " destroyed\" }";
	}

	protected void buildQuery(Query q, List<Filter> filters, List<Sorter> sorters) {
		if (filters != null) {
			Iterator<Filter> it = filters.iterator();

			while (it.hasNext()) {
				Filter filter = it.next();
				String value = filter.getValue();
				if (value != null && value.length() > 1)
					q.addFilter(filter.getProperty(), FilterOperator.EQUAL, filter.getValue());
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

	public List<Map<String, Object>> retrieve(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String jsonFilter = request.getParameter("filter");
		String jsonSorter = request.getParameter("sort");

		List<Filter> filters = null;
		List<Sorter> sorters = null;

		try {
			if (jsonFilter != null) {
				filters = new ObjectMapper().readValue(request.getParameter("filter"),
						new TypeReference<List<Filter>>() {
						});
			}
			if (jsonSorter != null) {
				sorters = new ObjectMapper().readValue(request.getParameter("sort"), new TypeReference<List<Sorter>>() {
				});
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = KeyFactory.createKey("Company", user.getCompany());

		Query q = new Query(getEntityName());
		q.setAncestor(companyKey);

		if (useFilter())
			buildQuery(q, filters, sorters);

		PreparedQuery pq = datastore.prepare(q);

		List<Map<String, Object>> list = new LinkedList<Map<String, Object>>();

		for (Entity result : pq.asIterable()) {
			list.add(SessionUtils.cvtEntityToMap(result));
		}

		return list;
	}

}
