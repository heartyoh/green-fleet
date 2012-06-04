package com.heartyoh.service;

import java.io.IOException;
import java.util.EnumSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.security.AppRole;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

@Controller
public class UserService extends EntityService {

	@Override
	protected String getEntityName() {
		return "CustomUser";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String) map.get("email");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		super.onCreate(entity, map, datastore);
	}
	
	@Override
	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request)
			throws IOException {
		String image_file = saveFile(request, (MultipartFile) map.get("image_file"));
		if(image_file != null) {
			entity.setProperty("image_clip", image_file);
		}

		super.postMultipart(entity, map, request);
	}	

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		String email = (String) map.get("email");
		String name = (String) map.get("name");
		String company = (String) map.get("company");
		String admin = (String) map.get("admin");
		String enabled = (String) map.get("enabled");
		String language = (String) map.get("language");
		
		if(language == null) {
			try {
				Entity entity_company = datastore.get(entity.getParent());
				if(!DataUtils.isEmpty(entity_company.getProperty("language")))
					language = (String)entity_company.getProperty("language");
			} catch(EntityNotFoundException e) {
			} finally {
				if(language == null)
					language = "en";
			}
		}

		Set<AppRole> roles = EnumSet.of(AppRole.USER);

		if (admin != null && (admin.equalsIgnoreCase("true") || admin.equalsIgnoreCase("on"))) {
			roles.add(AppRole.ADMIN);
		}

		if (email != null)
			entity.setProperty("email", email);
		if (name != null)
			entity.setProperty("name", name);
		if (company != null)
			entity.setProperty("company", company);
		if (admin != null)
			entity.setProperty("admin", booleanProperty(map, "admin"));
		
		if (language != null)
			entity.setUnindexedProperty("language", language);
		if (enabled != null)
			entity.setUnindexedProperty("enabled", booleanProperty(map, "enabled"));

		long binaryAuthorities = 0;

		for (AppRole r : roles) {
			binaryAuthorities |= 1 << r.getBit();
		}

		entity.setUnindexedProperty("authorities", binaryAuthorities);

		super.onSave(entity, map, datastore);
	}

	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		String email = request.getParameter("email");
		if(email != null)
			q.addFilter("email", FilterOperator.EQUAL, email);
		
		String key = request.getParameter("key");
		if(key != null)
			q.addFilter("key", FilterOperator.EQUAL, key);
	}

	@RequestMapping(value = "/user/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/user/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/user", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		
		List<Filter> filters = this.parseFilters(request.getParameter("filter"));
		List<Sorter> sorters = this.parseSorters(request.getParameter("sort"));

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query(getEntityName());
		q.addFilter("company", FilterOperator.EQUAL, this.getCompany(request));
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
			items.add(item);
		}

		return packResultDataset(true, total, items);
	}
	
	@RequestMapping(value = "/user/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) {
		return super.find(request, response);
	}

}
