/**
 * 
 */
package com.heartyoh.service;

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
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.util.SessionUtils;

/**
 * 차량별 소모품 교체 기준 정보
 * 
 * @author jhnam
 */
@Controller
public class VehicleConsumableService extends EntityService {

	private static final Logger logger = LoggerFactory.getLogger(VehicleConsumableService.class);

	@Override
	protected String getEntityName() {
		return "VehicleConsumable";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return (String) map.get("vehicle_id") + "@" + (String) map.get("consumable_code");
	}
	
	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("vehicle_id", map.get("vehicle_id"));
		entity.setProperty("consumable_code", map.get("consumable_code"));
		
		super.onCreate(entity, map, datastore);
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		entity.setProperty("repl_unit", map.get("repl_unit"));
		entity.setProperty("fst_repl_time", map.get("fst_repl_time"));
		entity.setProperty("fst_repl_mileage", map.get("fst_repl_mileage"));
		entity.setProperty("repl_mileage", map.get("repl_mileage"));
		entity.setProperty("repl_time", map.get("repl_time"));
		
		super.onSave(entity, map, datastore);
	}
	
	@RequestMapping(value = "/vehicle_consumable/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle_consumable/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/vehicle_consumable/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/vehicle_consumable", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		
		Map<String, Object> vehicleConsumables = super.retrieve(request, response);
		Map<String, Object> consumableCodes = this.retrieveConsumableCode(request, response);
		this.adjustDefaultResults(vehicleConsumables, consumableCodes);
		return vehicleConsumables;
	}
	
	@SuppressWarnings("unchecked")
	private void adjustDefaultResults(Map<String, Object> vehicleConsumables, Map<String, Object> consumableCodes) {
		
		List<Map<String, Object>> vehicleConsItems = (List<Map<String, Object>>)vehicleConsumables.get("items");
		List<Map<String, Object>> codeItems = (List<Map<String, Object>>)consumableCodes.get("items");
		
		for(Map<String, Object> codeItem : codeItems) {
			String consCode = (String)codeItem.get("consumable_code");
			
			boolean exist = false;
			
			for(Map<String, Object> vehicleConsItem : vehicleConsItems) {
				String vehicleCons = (String)vehicleConsItem.get("consumable_code");
				if(consCode.equals(vehicleCons)) {
					exist = true;
					break;
				}
			}
			
			if(!exist) {
				vehicleConsItems.add(codeItem);
			}
		}		
	}
	
	private Map<String, Object> retrieveConsumableCode(HttpServletRequest request, HttpServletResponse response) {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = this.getCompanyKey(request);		
		Query q = new Query("ConsumableCode");
		q.setAncestor(companyKey);		

		PreparedQuery pq = datastore.prepare(q);
		int total = pq.countEntities(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		for (Entity result : pq.asIterable()) {
			Map<String, Object> item = SessionUtils.cvtEntityToMap(result, request.getParameterValues("select"));
			this.adjustItem(item);
			item.put("vehicle_id", request.getParameter("vehicle_id"));
			items.add(item);
		}

		return packResultDataset(true, total, items);
	}
	
	@Override
	protected void adjustItem(Map<String, Object> item) {
		
		if(!item.containsKey("name"))
			return;
		
		String consumableCodeName = (String)item.remove("name");
		item.put("consumable_code", consumableCodeName);
		item.put("key", "");
		item.remove("desc");
	}	

	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {
		String vehicleId = request.getParameter("vehicle_id");
		q.addFilter("vehicle_id", FilterOperator.EQUAL, vehicleId);
	}	
}
