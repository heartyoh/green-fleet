package com.heartyoh.service.datastore;

import java.io.IOException;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.repackaged.com.google.api.client.util.Data;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.security.AppRole;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

@Controller
public class UserService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(UserService.class);
	
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
		if(!DataUtils.isEmpty(map.get("image_file"))){
			String image_file = saveFile(request, (MultipartFile) map.get("image_file"));
			if(image_file != null) {
				entity.setProperty("image_clip", image_file);
			}
			super.postMultipart(entity, map, request);
		}
	}	

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		String email = (String) map.get("email");
		String name = (String) map.get("name");
		String company = (String) map.get("company");
		String admin = (String) map.get("admin");
		String superUser = (String) map.get("super_user");
		String language = (String) map.get("language");
		String grade = (String) map.get("grade");
		
		this.setEnabled(entity, map);
		entity.setProperty("admin", DataUtils.toBool(admin));
		entity.setProperty("super_user", DataUtils.toBool(superUser));
		
		if (email != null)
			entity.setProperty("email", email);
		
		if (name != null)
			entity.setProperty("name", name);
		
		if (company != null)
			entity.setProperty("company", company);
		
		if (grade != null)
			entity.setUnindexedProperty("grade", grade);
		
		if(language == null) {
			try {
				Entity companyEntity = datastore.get(entity.getParent());
				if(!DataUtils.isEmpty(companyEntity.getProperty("language")))
					language = (String)companyEntity.getProperty("language");
			} catch(EntityNotFoundException e) {
			} finally {
				if(language == null)
					language = "en";
			}
		}

		entity.setUnindexedProperty("language", language);
		
		Set<AppRole> roles = EnumSet.of(AppRole.USER);
		
		if(DataUtils.toBool(admin))
			roles.add(AppRole.ADMIN);
		
		if(DataUtils.toBool(superUser)) 
			roles.add(AppRole.SUPER_USER);
		
		long binaryAuthorities = 0;
		for (AppRole r : roles) {
			binaryAuthorities |= 1 << r.getBit();
		}

		entity.setUnindexedProperty("authorities", binaryAuthorities);		
		super.onSave(entity, map, datastore);
	}
	
	/**
	 * enable 설정 
	 * 
	 * @param user
	 * @param map
	 */
	private void setEnabled(Entity user, Map<String, Object> map) {
		
		String enabled = (String) map.get("enabled");
		
		if(enabled != null && user.getProperty("enabled") != null) {		
			boolean prevEnabled = DataUtils.toBool(user.getProperty("enabled"));
			boolean newEnabled = DataUtils.toBool(enabled);
			
			// 이전 enabled가 false이고 새 enabled가 true일 때 메일 발송 
			if(!prevEnabled && newEnabled) {				
				StringBuffer content = new StringBuffer();
				content.append("<H3 align='center'>Your Green Fleet Account Enabled!</H3> <br/>");
				content.append("<p>Your <a href='green-fleets.appspot.com'>Green Fleet</a> account enabled. Go to Green Fleet web page!</p><br/>");
				
				try {
					AlarmUtils.sendMail(null, null, 
						(String)user.getProperty("name"), 
						(String)user.getProperty("email"), 
						"Your Green Fleet account enabled", 
						true, 
						content.toString());
				} catch(Exception e) {
					logger.error("Failed to send account enabled email", e);
				}
			}
		}
		
		user.setProperty("enabled", DataUtils.toBool(enabled));
	}

	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		String email = request.getParameter("email");
		if(email != null)
			q.addFilter("email", Query.FilterOperator.EQUAL, email);
			//q.setFilter(new FilterPredicate("email", Query.FilterOperator.EQUAL, email));
		
		String key = request.getParameter("key");
		if(key != null)
			q.addFilter("key", Query.FilterOperator.EQUAL, key);
			//q.setFilter(new FilterPredicate("key", Query.FilterOperator.EQUAL, key));
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
		q.addFilter("company", Query.FilterOperator.EQUAL, this.getCompany(request));
		//q.setFilter(new FilterPredicate("company", Query.FilterOperator.EQUAL, this.getCompany(request)));
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
			Map<String, Object> item = 
					SessionUtils.cvtEntityToMap(result, request.getParameterValues("select"));
			this.adjustItem(item);
			items.add(item);
		}

		return DataUtils.packResultDataset(true, total, items);
	}
	
	@RequestMapping(value = "/user/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) {
		
		String key = request.getParameter("key");
		if(DataUtils.isEmpty(key)) {
			key = SessionUtils.currentUser().getKey();
			Entity entity = DatastoreUtils.findByKey(key);
			Map<String, Object> map = new HashMap<String, Object>();
			map.putAll(entity.getProperties());
			map.put("key", KeyFactory.keyToString(entity.getKey()));
			map.put("success", true);
			return map;
		} else {
			return super.find(request, response);
		}
	}

	@RequestMapping(value = "/user/exist", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> exist(HttpServletRequest request, HttpServletResponse response) {
		
		String email = request.getParameter("email");
		Map<String, Object> map = new HashMap<String, Object>();
		
		if(DataUtils.isEmpty(email)) {
			map.put("msg", "Parameter [email] not found!");
			map.put("success", false);
			
		} else {			
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			Query q = new Query("CustomUser");
			q.addFilter("email", Query.FilterOperator.EQUAL, email);
			q.addFilter("enabled", Query.FilterOperator.EQUAL, true);
			PreparedQuery pq = datastore.prepare(q);

			try {
				Entity user = pq.asSingleEntity();				
				
				if (user != null) {
					map.put("msg", "Valid User [" + email + "]");
					map.put("success", true);
				} else{
					map.put("msg", "Invalid user [" + email + "]");
					map.put("success", false);
				}
				
			} catch(Exception e) {
				map.put("msg", e.getMessage());
				map.put("success", false);
			}			
		}
		
		return map;		
	}
}
