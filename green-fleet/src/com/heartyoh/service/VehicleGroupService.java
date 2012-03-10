/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
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
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Transaction;

/**
 * vehicle group service
 * 
 * @author jhnam
 */
@Controller
public class VehicleGroupService extends EntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(VehicleGroupService.class);
	
	@Override
	protected String getEntityName() {
		return "VehicleGroup";
	}

	@Override
	protected boolean useFilter() {
		return false;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String) map.get("id");
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("id", map.get("id"));
		entity.setUnindexedProperty("desc", map.get("desc"));
		super.onSave(entity, map, datastore);
	}
	
	@RequestMapping(value = "/vehicle_group/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle_group/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, Object> map = toMap(request);
		String newVehicleGroupId = (String)map.get("id");
		
		if(newVehicleGroupId == null || newVehicleGroupId.isEmpty()) {
			return this.getResultMsg(false, "Not allowed empty vehicle group id!");
		}
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = this.getCompanyKey(request);
		
		String key = (String)map.get("key");
		Key objKey = (key != null && !key.isEmpty()) ? KeyFactory.stringToKey(key) : KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
		
		String oldVehicleGroupId = null;
		Entity obj = null;
		String resultMsg = null;
		boolean creating = false;
		
		try {
			obj = datastore.get(objKey);
		} catch (EntityNotFoundException e) {
			creating = true;
		}

		Date now = new Date();
		map.put("_now", now);
		map.put("_company_key", companyKey);

		if (creating) {
			obj = new Entity(objKey);
			onCreate(obj, map, datastore);
			onSave(obj, map, datastore);
			datastore.put(obj);
			
		} else {
			
			oldVehicleGroupId = (String)obj.getProperty("id");
			
			// 1. group id가 변경되었다면 일반적인 변경 
			if(oldVehicleGroupId == null || oldVehicleGroupId.equals(newVehicleGroupId)) {
				this.onSave(obj, map, datastore);
				datastore.put(obj);
				
			// 2. group id가 변경되었다면 기존 릴레이션을 변경시켜줌 
			} else {
				// 0. 기존에 ID가 존재한다면 변경 실패
				if(this.checkExist(datastore, companyKey, newVehicleGroupId)) {
					return this.getResultMsg(false, "Vehicle group id " + newVehicleGroupId + " already exist!");
				}
				
				// 1. transaction
				Transaction txn = datastore.beginTransaction();
				
				// 2. vehicle group 삭제 후 재생성 
				try {
					datastore.delete(objKey);
					obj = new Entity(KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map)));
					this.onCreate(obj, map, datastore);
					this.onSave(obj, map, datastore);
					datastore.put(obj);
					
					// 3. find relation by group id					
					List<Entity> oldRelations = this.getRelationsByGroupId(companyKey, oldVehicleGroupId);
					if(!oldRelations.isEmpty()) {
						// 4. 기존 릴레이션이 있으면 릴레이션 삭제 후 재 생성
						List<Key> keyListToDel = new ArrayList<Key>();
						List<Entity> newRelations = new ArrayList<Entity>();
						String forKeyStr = newVehicleGroupId + "@";
						
						for(Entity oldRelation : oldRelations) {
							String oldVehicleId = (String)oldRelation.getProperty("vehicle_id");
							keyListToDel.add(oldRelation.getKey());
							Key newObjKey = KeyFactory.createKey(companyKey, "VehicleRelation", forKeyStr + oldVehicleId);
							Entity newRelation = new Entity(newObjKey);
							newRelation.setProperty("vehicle_id", oldVehicleId);
							newRelation.setProperty("vehicle_group_id", newVehicleGroupId);
							newRelation.setProperty("created_at", now);
							newRelation.setProperty("updated_at", now);
							newRelations.add(newRelation);
						}
						
						// delete
						datastore.delete(keyListToDel);						
						// create
						datastore.put(newRelations);
						
						resultMsg = "{ \"success\" : true, \"key\" : \"" + KeyFactory.keyToString(obj.getKey()) + "\", \"vehicle_group_id\" : \"" + newVehicleGroupId + "\", \"msg\" : \"Vehicle group update sucessfully!, " + newRelations.size() + " count vehicle relations updated!\" }";
					}
					
					txn.commit();
					
				} catch (Throwable th) {					
					resultMsg = this.getResultMsg(false, th.getMessage());
					txn.rollback();	
				} 
			}								
		}			

		response.setContentType("text/html");
		
		if(resultMsg == null) {
			resultMsg = "{ \"success\" : true, \"key\" : \"" + KeyFactory.keyToString(obj.getKey()) + "\", \"vehicle_group_id\" : \"" + newVehicleGroupId + "\", \"msg\" : \"Vehicle group update sucessfully!\" }";
		}
		
		return resultMsg;
	}

	@RequestMapping(value = "/vehicle_group/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/vehicle_group", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
	
	@Override
	protected void adjustItem(Map<String, Object> item) {
		
		String groupKey = (String)item.get("key");
		String groupId = (String)item.get("id");
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = KeyFactory.stringToKey(groupKey).getParent();
		
		Query q = new Query("VehicleRelation");
		q.setAncestor(companyKey);
		q.addFilter("vehicle_group_id", Query.FilterOperator.EQUAL, groupId);

		PreparedQuery pq = datastore.prepare(q);
		List<String> vehicles = new LinkedList<String>();

		for (Entity result : pq.asIterable()) {
			vehicles.add((String)result.getProperty("vehicle_id"));
		}
		
		item.put("vehicles", vehicles);
	}
	
	private List<Entity> getRelationsByGroupId(Key companyKey, String vehicleGroupId) {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("VehicleRelation");
		q.setAncestor(companyKey);
		q.addFilter("vehicle_group_id", FilterOperator.EQUAL, vehicleGroupId);
		
		PreparedQuery pq = datastore.prepare(q);
		List<Entity> results = new LinkedList<Entity>();
		
		for (Entity result : pq.asIterable()) {
			results.add(result);
		}
		
		return results;
	}
	
	private boolean checkExist(DatastoreService datastore, Key companyKey, String vehicleGroupId) {
		
		Key objKey = KeyFactory.createKey(companyKey, getEntityName(), vehicleGroupId);		
		try {
			datastore.get(objKey);
		} catch (EntityNotFoundException e) {
			return false;
		}
		
		return true;
	}
}
