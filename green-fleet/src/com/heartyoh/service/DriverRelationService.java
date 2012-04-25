/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Date;
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
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Transaction;
import com.heartyoh.util.DatastoreUtils;

/**
 * driver relation (driver group and driver) service
 * 
 * @author jhnam
 */
@Controller
public class DriverRelationService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(DriverRelationService.class);
	
	@Override
	protected String getEntityName() {
		return "DriverRelation";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return this.getIdValue((String) map.get("driver_id"),  (String)map.get("driver_group_id"));
	}
	
	private String getIdValue(String driverId, String driverGroupId) {
		return driverGroupId + "@" + driverId;
	}	

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("driver_id", map.get("driver_id"));
		entity.setProperty("driver_group_id", map.get("driver_group_id"));

		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/driver_relation/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/driver_relation/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Key companyKey = this.getCompanyKey(request);
		String driverGroupId = request.getParameter("driver_group_id");
		String[] driverIdArr = request.getParameterValues("driver_id");
		List<Entity> objList = new ArrayList<Entity>();
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		String resultMsg = null;
		
		for(int i = 0 ; i < driverIdArr.length ; i++) {
			if(!this.checkExist(companyKey, driverGroupId, driverIdArr[i])) {
				objList.add(this.makeEntity(companyKey, driverGroupId, driverIdArr[i]));
			}
		}
		
		if(!objList.isEmpty()) {
			Transaction txn = datastore.beginTransaction();
			try {
				datastore.put(objList);
				txn.commit();
				resultMsg = this.getResultMsg(true, objList.size() + " count of driver relations were created!");
				
			} catch (Throwable th) {
				txn.rollback();
				resultMsg = this.getResultMsg(false, th.getMessage());
			} 
		} else {
			resultMsg = this.getResultMsg(true, "Nothing was created!");
		}
		
		response.setContentType("text/html");
		return resultMsg;
	}
	
	private boolean checkExist(Key companyKey, String driverGroupId, String driverId) {		
		Key objKey = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(driverId, driverGroupId));
		return DatastoreUtils.checkExist(objKey);
	}
	
	private Entity makeEntity(Key companyKey, String driverGroupId, String driverId) throws Exception {
		
		Key objKey = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(driverId, driverGroupId));
		Entity obj = new Entity(objKey);
		Date now = new Date();
		obj.setProperty("driver_id", driverId);
		obj.setProperty("driver_group_id", driverGroupId);
		obj.setProperty("created_at", now);
		obj.setProperty("updated_at", now);
		return obj;
	}

	@RequestMapping(value = "/driver_relation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		
		Key companyKey = this.getCompanyKey(request);
		String driverGroupId = request.getParameter("driver_group_id");
		String[] driverIdArr = request.getParameterValues("driver_id");
		List<Key> keyList = new ArrayList<Key>();
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		String resultMsg = null;
		
		for(int i = 0 ; i < driverIdArr.length ; i++) {
			Key objKey = KeyFactory.createKey(companyKey, getEntityName(), getIdValue(driverIdArr[i], driverGroupId));
			keyList.add(objKey);
		}
		
		if(!keyList.isEmpty()) {
			Transaction txn = datastore.beginTransaction();
			
			try {
				datastore.delete(keyList);
				txn.commit();
				resultMsg = this.getResultMsg(true, keyList.size() + " driver relations were destroyed");
			} catch (Throwable th) {
				resultMsg = this.getResultMsg(false, th.getMessage());
			    txn.rollback();
			}
		} else {
			resultMsg = this.getResultMsg(true, "Nothing was destroyed!");
		}
		
		response.setContentType("text/html");
		return resultMsg;
	}

	@RequestMapping(value = "/driver_relation", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}	
}
