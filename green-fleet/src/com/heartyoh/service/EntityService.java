package com.heartyoh.service;

import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.SessionUtils;

public abstract class EntityService {
	abstract protected String getEntityName();

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
//		if(filters != null) {
//			Iterator<Filter> it = filters.iterator();
//			
//			while(it.hasNext()) {
//				Filter filter = it.next();
//				String value = filter.getValue();
//				if(value != null && value.length() > 1)
//					q.addFilter(filter.getProperty(), FilterOperator.EQUAL, filter.getValue());
//			}
//		}
//		
//		if(sorters != null) {
//			Iterator<Sorter> it = sorters.iterator();
//			while(it.hasNext()) {
//				Sorter sorter = it.next();
//				SortDirection dir = SortDirection.ASCENDING;
//				if(sorter.getDirection() != null && (!sorter.getDirection().startsWith("ASC"))) {
//					dir = SortDirection.DESCENDING;
//				}
//				q.addSort(sorter.getProperty(), dir);
//			}
//		}
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
		
		buildQuery(q, filters, sorters);

		PreparedQuery pq = datastore.prepare(q);

		List<Map<String, Object>> list = new LinkedList<Map<String, Object>>();

		for (Entity result : pq.asIterable()) {
			list.add(SessionUtils.cvtEntityToMap(result));
		}

		return list;
	}

}
