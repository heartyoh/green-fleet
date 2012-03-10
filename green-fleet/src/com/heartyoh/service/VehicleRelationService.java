/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
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
import com.google.appengine.api.datastore.Transaction;
import com.heartyoh.model.CustomUser;
import com.heartyoh.util.SessionUtils;

/**
 * vehicle relation (vehicle group and vehicle) service
 * 
 * @author jhnam
 */
@Controller
public class VehicleRelationService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(VehicleRelationService.class);
	
	@Override
	protected String getEntityName() {
		return "VehicleRelation";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return this.getIdValue((String) map.get("vehicle_id"),  (String)map.get("vehicle_group_id"));
	}
	
	private String getIdValue(String vehicleId, String vehicleGroupId) {
		return vehicleGroupId + "@" + vehicleId;
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("vehicle_id", map.get("vehicle_id"));
		entity.setProperty("vehicle_group_id", map.get("vehicle_group_id"));

		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/vehicle_relation/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle_relation/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		CustomUser user = SessionUtils.currentUser();
		String company = (user != null) ? user.getCompany() : request.getParameter("company");
		String vehicleGroupId = request.getParameter("vehicle_group_id");
		String[] vehicleIdArr = request.getParameterValues("vehicle_id");
		List<Entity> objList = new ArrayList<Entity>();
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		String resultMsg = null;
		
		for(int i = 0 ; i < vehicleIdArr.length ; i++) {
			if(!this.checkExist(datastore, company, vehicleGroupId, vehicleIdArr[i])) {
				objList.add(this.makeEntity(company, vehicleGroupId, vehicleIdArr[i]));
			}
		}
		
		if(!objList.isEmpty()) {
			Transaction txn = datastore.beginTransaction();
			try {
				datastore.put(objList);
				txn.commit();
				resultMsg = "{ \"success\" : true, \"msg\" : \"" + objList.size() + " count of vehicle relations were created!\" }";
			} catch (Throwable th) {
				txn.rollback();
				resultMsg = "{ \"success\" : false, \"msg\" : \"" + th.getMessage() + "\" }";
			} 
		} else {
			resultMsg = "{ \"success\" : true, \"msg\" : \" Nothing was created!\" }";
		}
		
		response.setContentType("text/html");
		return resultMsg;
	}
	
	private boolean checkExist(DatastoreService datastore, String company, String vehicleGroupId, String vehicleId) {
		
		Key companyKey = KeyFactory.createKey("Company", company);
		Key objKey = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(vehicleId, vehicleGroupId));
		Entity obj = null;

		try {
			obj = datastore.get(objKey);
			if(obj != null) {
				return true;
			}
		} catch (EntityNotFoundException e) {
		}
		
		return false;
	}
	
	private Entity makeEntity(String company, String vehicleGroupId, String vehicleId) throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", company);
		Key objKey = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(vehicleId, vehicleGroupId));
		Entity obj = new Entity(objKey);
		Date now = new Date();
		obj.setProperty("vehicle_id", vehicleId);
		obj.setProperty("vehicle_group_id", vehicleGroupId);
		obj.setProperty("created_at", now);
		obj.setProperty("updated_at", now);
		return obj;
	}

	@RequestMapping(value = "/vehicle_relation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		
		CustomUser user = SessionUtils.currentUser();
		String company = (user != null) ? user.getCompany() : request.getParameter("company");
		String vehicleGroupId = request.getParameter("vehicle_group_id");
		String[] vehicleIdArr = request.getParameterValues("vehicle_id");
		List<Key> keyList = new ArrayList<Key>();
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = KeyFactory.createKey("Company", company);
		String resultMsg = null;
		
		for(int i = 0 ; i < vehicleIdArr.length ; i++) {
			Key objKey = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(vehicleIdArr[i], vehicleGroupId));
			keyList.add(objKey);
		}
		
		if(!keyList.isEmpty()) {
			Transaction txn = datastore.beginTransaction();
			
			try {
				datastore.delete(keyList);
				txn.commit();
				resultMsg = "{ \"success\" : true, \"msg\" : \"" + keyList.size() + " vehicle relations were destroyed\" }";
			} catch (Throwable th) {
			    txn.rollback();
			    resultMsg = "{ \"success\" : false, \"msg\" : \"" + th.getMessage() + "\" }";
			}
		} else {
			resultMsg = "{ \"success\" : true, \"msg\" : \" Nothing was destroyed!\" }";
		}
		
		response.setContentType("text/html");
		return resultMsg;
	}

	@RequestMapping(value = "/vehicle_relation", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/vehicle_relation/count", method = RequestMethod.GET)
	public @ResponseBody	
	Map<String, Object> retrieveCount(HttpServletRequest request, HttpServletResponse response) {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = this.getCompanyKey(request);
		String vehicleGroupId = request.getParameter("vehicle_group_id");
		List<Object> items = new ArrayList<Object>();
		int total = 0;
		
		// 특정 Vehicle Group만 카운트 
		if(vehicleGroupId != null && !vehicleGroupId.isEmpty()) {
			total = this.retrieveCountByVehicleGroup(datastore, companyKey, vehicleGroupId);
			this.putVehicleItem(items, vehicleGroupId, total);
			
		// 모든 Vehicle Group에 대해서 카운트 
		} else {
			List<String> groups = this.retrieveAllVehicleGroups(datastore, companyKey);
			for(String group : groups) {
				int vehicleCount = this.retrieveCountByVehicleGroup(datastore, companyKey, group);
				this.putVehicleItem(items, group, vehicleCount);
				total += vehicleCount;
			}
		}
		
		return this.packResultDataset(true, total, items);
	}
	
	private void putVehicleItem(List<Object> items, String group, int vehicleCount) {
		Map<String, Object> item = new HashMap<String, Object>();
		item.put("vehicle_group_id", group);
		item.put("vehicle_count", vehicleCount);
		items.add(item);
	}
	
	private int retrieveCountByVehicleGroup(DatastoreService datastore, Key companyKey, String vehicleGroupId) {
		
		Query q = new Query(getEntityName());
		q.setAncestor(companyKey);
		q.addFilter("vehicle_group_id", FilterOperator.EQUAL, vehicleGroupId);
		PreparedQuery pq = datastore.prepare(q);
		return pq.countEntities(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));
	}
	
	private List<String> retrieveAllVehicleGroups(DatastoreService datastore, Key companyKey) {
		
		List<String> groups = new ArrayList<String>();
		Query q = new Query("VehicleGroup");
		q.setAncestor(companyKey);
		PreparedQuery pq = datastore.prepare(q);
		
		for (Entity result : pq.asIterable()) {
			groups.add((String)result.getProperty("id"));
		}
		
		return groups;
	}
}
