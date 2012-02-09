package com.heartyoh.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

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
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.SessionUtils;

public abstract class EntityService {
	abstract protected String getEntityName();

	abstract protected String getIdValue(Map<String, String> map);

	protected static Map<String, String> toMap(HttpServletRequest request) {
		Map<String, String> map = new HashMap<String, String>();
		Enumeration e = request.getParameterNames();
		while (e.hasMoreElements()) {
			String name = (String) e.nextElement();
			map.put(name, request.getParameter(name));
		}
		return map;
	}

	protected static boolean booleanProperty(Map<String, String> map, String property) {
		String value = map.get(property);
		return value.equals("true") || value.equals("on");
	}

	protected static double doubleProperty(Map<String, String> map, String property) {
		String value = map.get(property);
		return Double.parseDouble(value);
	}

	protected static int intProperty(Map<String, String> map, String property) {
		String value = map.get(property);
		return Integer.parseInt(value);
	}

	protected boolean useFilter() {
		return false;
	}

	protected void onCreate(Entity entity, Map<String, String> map, Date now) {
		entity.setProperty("createdAt", now);
	}

	protected void onSave(Entity entity, Map<String, String> map, Date now) {
		entity.setProperty("updatedAt", now);
	}

	public String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws IOException {
		CustomUser user = SessionUtils.currentUser();

		MultipartFile file = request.getFile("file");

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

				Map<String, String> map = new HashMap<String, String>();

				for (int i = 0; i < keys.length; i++) {
					map.put(keys[i].trim(), values[i].trim());
				}

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
		Map<String, String> map = toMap(request);

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

			onSave(obj, map, now);

			datastore.put(obj);
		} finally {
		}

		response.setContentType("text/html");

		return "{ \"success\" : true, \"key\" : \"" + KeyFactory.keyToString(obj.getKey()) + "\" }";
	}

	public Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		try {
			datastore.delete(KeyFactory.stringToKey(key));
		} finally {
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", getEntityName() + " destroyed.");

		return result;
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
