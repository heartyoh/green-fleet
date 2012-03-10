package com.heartyoh.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
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
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.SessionUtils;

@Controller
public class VehicleService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(VehicleService.class);

	@Override
	protected String getEntityName() {
		return "Vehicle";
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
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("id", map.get("id"));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request)
			throws IOException {
		String image_file = saveFile((MultipartFile) map.get("image_file"));
		if(image_file != null) {
			entity.setProperty("image_clip", image_file);
		}

		super.postMultipart(entity, map, request);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("manufacturer", map.get("manufacturer"));
		entity.setProperty("vehicle_type", map.get("vehicle_type"));
		entity.setProperty("birth_year", map.get("birth_year"));
		entity.setProperty("ownership_type", map.get("ownership_type"));
		entity.setProperty("status", map.get("status"));
		entity.setProperty("total_distance", doubleProperty(map, "total_distance"));
		entity.setProperty("registration_number", map.get("registration_number"));
		entity.setProperty("remaining_fuel", doubleProperty(map, "remaining_fuel"));
		entity.setProperty("distance_since_new_oil", doubleProperty(map, "distance_since_new_oil"));
		entity.setProperty("engine_oil_status", map.get("engine_oil_status"));
		entity.setProperty("fuel_filter_status", map.get("fuel_filter_status"));
		entity.setProperty("brake_oil_status", map.get("brake_oil_status"));
		entity.setProperty("brake_pedal_status", map.get("brake_pedal_status"));
		entity.setProperty("cooling_water_status", map.get("cooling_water_status"));
		entity.setProperty("timing_belt_status", map.get("timing_belt_status"));
		entity.setProperty("spark_plug_status", map.get("spark_plug_status"));

		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/vehicle/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/vehicle/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/vehicle", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		
		if(request.getParameter("vehicle_group_id") != null && !request.getParameter("vehicle_group_id").isEmpty()) {
			return this.retrieveByGroup(request, response);
		} else {
			return super.retrieve(request, response);
		}
	}

	private Map<String, Object> retrieveByGroup(HttpServletRequest request, HttpServletResponse response) {
		
		// FIXME 추후 그룹 조건도 필터와 같이 동작하도록 수정 필요 
		CustomUser user = SessionUtils.currentUser();
		String company = (user != null) ? user.getCompany() : request.getParameter("company");
		String vehicleGroup = request.getParameter("vehicle_group_id");
		String jsonFilter = request.getParameter("filter");
		String jsonSorter = request.getParameter("sort");
		String[] selects = request.getParameterValues("select");

		Map<String, Object> relationResults = this.retrieveVehicleRelations(company, vehicleGroup, jsonFilter, jsonSorter, request.getParameter("limit"), request.getParameter("start"));
		int total = (Integer)relationResults.get("total");
		List<String> relationItems = (List<String>)relationResults.get("items");
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		if(total > 0 && !relationItems.isEmpty()) {
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			Key companyKey = KeyFactory.createKey("Company", company);
			Query q = new Query(this.getEntityName());
			q.setAncestor(companyKey);
			q.addFilter("id", FilterOperator.IN, relationItems);
			PreparedQuery pq = datastore.prepare(q);
			
			for (Entity result : pq.asIterable()) {
				items.add(SessionUtils.cvtEntityToMap(result, selects));
			}
		}
		
		return this.packResultDataset(true, total, items);
	}
	
	private Map<String, Object> retrieveVehicleRelations(String company, String vehicleGroup, String filterStr, String sorterStr, String limitStr, String startStr) {
		
		List<Filter> filters = null;
		List<Sorter> sorters = null;

		try {
			if (filterStr != null) {
				filters = new ObjectMapper().readValue(filterStr, new TypeReference<List<Filter>>() {
				});
			} else {
				filters = new ArrayList<Filter>();
			}
			
			if (sorterStr != null) {
				sorters = new ObjectMapper().readValue(sorterStr, new TypeReference<List<Sorter>>() {
				});
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		adjustFilters(filters);
		adjustSorters(sorters);

		Filter vehicleGroupFilter = new Filter();
		vehicleGroupFilter.setProperty("vehicle_group_id");
		vehicleGroupFilter.setValue(vehicleGroup);
		filters.add(vehicleGroupFilter);

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = KeyFactory.createKey("Company", company);
		Query q = new Query("VehicleRelation");
		q.setAncestor(companyKey);
		buildQuery(q, filters, sorters);
		PreparedQuery pq = datastore.prepare(q);
		int total = pq.countEntities(FetchOptions.Builder.withLimit(Integer.MAX_VALUE).offset(0));
		List<String> relationItems = new LinkedList<String>();
		
		if(total > 0) {	
			int offset = (startStr != null) ? Integer.parseInt(startStr) : 0;
			int limit = (limitStr != null) ? Integer.parseInt(limitStr) : Integer.MAX_VALUE;
	
			if(offset < 0) {
				offset = 0;
			}
			
			for (Entity result : pq.asIterable(FetchOptions.Builder.withLimit(limit).offset(offset))) {
				relationItems.add((String)result.getProperty("vehicle_id"));
			}
		}
		
		/*Map<String, Object> result = new HashMap<String, Object>();
		result.put("total", total);
		result.put("success", true);
		result.put("items", relationItems);*/	
		return this.packResultDataset(true, total, relationItems);
	}
	
	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {		
		String vehicle_id = request.getParameter("vehicle_id");
		if(vehicle_id != null && !vehicle_id.isEmpty()) {
			q.addFilter("id", FilterOperator.EQUAL, vehicle_id);
		}
		
		String registration_number = request.getParameter("registration_number");
		if(registration_number != null && !registration_number.isEmpty()) {
			q.addFilter("registration_number", FilterOperator.EQUAL, registration_number);
		}		
	}
}
