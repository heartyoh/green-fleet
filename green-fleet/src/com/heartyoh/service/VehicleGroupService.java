/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
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
import com.google.appengine.api.datastore.Transaction;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

/**
 * vehicle group service
 * 
 * @author jhnam
 */
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
	
	@RequestMapping(value = "/vehicle_group/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = {"/vehicle_group", "/m/data/vehicle_group.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/vehicles", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveVehiclesByGroup(HttpServletRequest request, HttpServletResponse response) {
		
		Key companyKey = this.getCompanyKey(request);
		String[] selects = request.getParameterValues("select");
		
		Map<String, Object> filters = new HashMap<String, Object>();
		filters.put("vehicle_group_id", request.getParameter("vehicle_group_id"));
		Iterator<Entity> relations = DatastoreUtils.findEntities(companyKey, "VehicleRelation", filters);
		List<String> vehicleIdList = new ArrayList<String>();
		
		while(relations.hasNext()) {
			Entity relation = relations.next();
			vehicleIdList.add((String)relation.getProperty("vehicle_id"));
		}
		
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();		
		if(!vehicleIdList.isEmpty()) {
			filters.clear();
			filters.put("id", vehicleIdList);
			Iterator<Entity> vehilces = DatastoreUtils.findEntities(companyKey, "Vehicle", filters);
						
			while (vehilces.hasNext()) {
				Entity vehicle = vehilces.next();
				items.add(SessionUtils.cvtEntityToMap(vehicle, selects));
			}
		}
		
		return this.packResultDataset(true, items.size(), items);		
	}	

	@RequestMapping(value = "/vehicle_group/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, Object> map = toMap(request);
		String newVehicleGroupId = (String)map.get("id");
		
		if(DataUtils.isEmpty(newVehicleGroupId))
			return this.getResultMsg(false, "Not allowed empty vehicle group id!");
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = this.getCompanyKey(request);
		String key = (String)map.get("key");
		Key objKey = (!DataUtils.isEmpty(key)) ? KeyFactory.stringToKey(key) : KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map));
		
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

		// 생성 
		if (creating) {
			obj = new Entity(objKey);
			this.createObj(datastore, obj, map);
			resultMsg = this.getSaveResultStr(objKey, newVehicleGroupId);
			
		// 수정 
		} else {
			
			String oldVehicleGroupId = (String)obj.getProperty("id");
			
			// 1. group id가 변경되지 않았다면 일반적인 변경 
			if(oldVehicleGroupId == null || oldVehicleGroupId.equals(newVehicleGroupId)) {
				this.updateObj(datastore, obj, map);
				resultMsg = this.getSaveResultStr(obj.getKey(), newVehicleGroupId);
				
			// 2. group id가 변경되었다면 기존 릴레이션을 변경시켜줌 
			} else {
				// 0. 기존에 ID가 존재한다면 변경 실패				
				if(DatastoreUtils.checkExist(KeyFactory.createKey(companyKey, getEntityName(), newVehicleGroupId))) {
					resultMsg = this.getResultMsg(false, "Vehicle group id " + newVehicleGroupId + " already exist!");
				} else {
					resultMsg = this.updateWithRelations(datastore, companyKey, objKey, oldVehicleGroupId, newVehicleGroupId, map);
				}
			}
		}

		response.setContentType("text/html");
		return resultMsg;
	}
	
	private String getSaveResultStr(Key key, String vehicleGroupId) {
		return "{ \"success\" : true, \"key\" : \"" + KeyFactory.keyToString(key) + "\", \"vehicle_group_id\" : \"" + vehicleGroupId + "\", \"msg\" : \"Vehicle group update sucessfully!\" }";
	}
	
	private void createObj(DatastoreService datastore, Entity obj, Map<String, Object> map) throws Exception {
		onCreate(obj, map, datastore);
		this.updateObj(datastore, obj, map);
	}
	
	private void updateObj(DatastoreService datastore, Entity obj, Map<String, Object> map) throws Exception {
		this.onSave(obj, map, datastore);
		datastore.put(obj);		
	}
	
	private String updateWithRelations(DatastoreService datastore, Key companyKey, Key oldGroupKey, String oldVehicleGroupId, String newVehicleGroupId, Map<String, Object> map) {
		
		// 1. transaction
		Transaction txn = datastore.beginTransaction();
		String resultMsg = null;
		
		// 2. vehicle group 삭제 후 재생성 
		try {
			datastore.delete(oldGroupKey);
			Entity obj = new Entity(KeyFactory.createKey(companyKey, getEntityName(), getIdValue(map)));
			this.createObj(datastore, obj, map);
			
			// 3. find relation by group id
			Map<String, Object> filters = new HashMap<String, Object>();
			filters.put("vehicle_group_id", oldVehicleGroupId);
			Iterator<Entity> oldRelations = DatastoreUtils.findEntities(companyKey, "VehicleRelation", filters);
			
			if(oldRelations.hasNext()) {				
				// 4. 기존 릴레이션이 있으면 릴레이션 삭제 후 재 생성
				List<Key> keyListToDel = new ArrayList<Key>();
				List<Entity> newRelations = new ArrayList<Entity>();
				String forKeyStr = newVehicleGroupId + "@";
				Date now = (Date)map.get("_now");
				
				while(oldRelations.hasNext()) {
					Entity oldRelation = oldRelations.next();
					String oldVehicleId = (String)oldRelation.getProperty("vehicle_id");
					keyListToDel.add(oldRelation.getKey());
					
					Key newObjKey = KeyFactory.createKey(companyKey, "VehicleRelation", forKeyStr + oldVehicleId);
					newRelations.add(this.newVehicleEntity(newObjKey, oldVehicleId, newVehicleGroupId, now));
				}
				
				// delete relations
				datastore.delete(keyListToDel);
				// create relations
				datastore.put(newRelations);				
			}
			
			txn.commit();
			resultMsg = this.getSaveResultStr(obj.getKey(), newVehicleGroupId);
			
		} catch (Throwable th) {					
			resultMsg = this.getResultMsg(false, th.getMessage());
			txn.rollback();	
		}
		
		return resultMsg;
	}
	
	private Entity newVehicleEntity(Key newObjKey, String oldVehicleId, String newVehicleGroupId, Date now) {
		Entity newRelation = new Entity(newObjKey);
		newRelation.setProperty("vehicle_id", oldVehicleId);
		newRelation.setProperty("vehicle_group_id", newVehicleGroupId);
		newRelation.setProperty("created_at", now);
		newRelation.setProperty("updated_at", now);
		return newRelation;
	}
	
	@Override
	protected void adjustItem(Map<String, Object> item) {
		
		String groupKey = (String)item.get("key");
		String groupId = (String)item.get("id");
		
		Key companyKey = KeyFactory.stringToKey(groupKey).getParent();
		Map<String, Object> filters = new HashMap<String, Object>();
		filters.put("vehicle_group_id", groupId);
		List<String> vehicles = new LinkedList<String>();		
		Iterator<Entity> relations = DatastoreUtils.findEntities(companyKey, "VehicleRelation", filters);		

		while (relations.hasNext()) {
			Entity relation = relations.next();
			vehicles.add((String)relation.getProperty("vehicle_id"));
		}
		
		item.put("vehicles", vehicles);
	}
		
}
