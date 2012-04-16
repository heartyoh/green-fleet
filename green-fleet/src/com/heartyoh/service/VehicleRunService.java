/**
 * 
 */
package com.heartyoh.service;

import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 차량별 운행 정보 서비스
 * 
 * @author jhnam
 */
@Controller
public class VehicleRunService extends EntityService {

	@Override
	protected String getEntityName() {
		return "VehicleRunSum";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		// 차량, 년, 월 
		return (String)map.get("vehicle") + "@" + map.get("month");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		this.checkDate(map);
		
		entity.setProperty("vehicle", map.get("vehicle"));
		entity.setProperty("month", map.get("month"));
		
		super.onCreate(entity, map, datastore);
	}
	
	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		this.checkDate(map);
		
		// 주행거리 
		entity.setProperty("run_dist", map.get("run_dist"));
		
		// 주행시간 
		entity.setProperty("run_time", map.get("run_time"));
		
		// 연료소모량 
		entity.setProperty("consmpt", map.get("consmpt"));
		
		// CO2 배출량 
		entity.setProperty("co2_emss", map.get("co2_emss"));
		
		// 연비 
		entity.setProperty("effcc", map.get("effcc"));
		
		super.onSave(entity, map, datastore);
	}
	
	private void checkDate(Map<String, Object> map) {
		Object monthObj = map.get("month");
		
		if(!DataUtils.isEmpty(monthObj) && monthObj instanceof String)
			map.put("month", SessionUtils.stringToDate(monthObj.toString()));		
	}	
	
	@RequestMapping(value = "/vehicle_run/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/vehicle_run/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/vehicle_run/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/vehicle_run", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

	@Override
	protected void addFilter(Query q, String property, String value) {
		if("from_date".equals(property)) {
			Date fromDate = DataUtils.toDate(value);
			q.addFilter("month", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate);
			
		} else if("to_date".equals(property)) {
			Date toDate = DataUtils.toDate(value);
			q.addFilter("month", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate);
			
		} else {			
			q.addFilter(property, FilterOperator.EQUAL, value);
		}
	}
	
	@Override
	protected void buildQuery(Query q, HttpServletRequest request) {		
		String vehicle = request.getParameter("vehicle");
		if(!DataUtils.isEmpty(vehicle)) {
			q.addFilter("vehicle", FilterOperator.EQUAL, vehicle);
		}
		
		String fromDateStr = request.getParameter("from_date");
		String toDateStr = request.getParameter("to_date");
		
		if(!DataUtils.isEmpty(fromDateStr) && !DataUtils.isEmpty(toDateStr)) {
			q.addFilter("month", Query.FilterOperator.GREATER_THAN_OR_EQUAL, SessionUtils.stringToDate(fromDateStr));
			q.addFilter("month", Query.FilterOperator.LESS_THAN_OR_EQUAL, SessionUtils.stringToDate(toDateStr));
			
		} else if(!DataUtils.isEmpty(fromDateStr) && DataUtils.isEmpty(toDateStr)) {
			q.addFilter("month", Query.FilterOperator.GREATER_THAN_OR_EQUAL, SessionUtils.stringToDate(fromDateStr));
			
		} else if(DataUtils.isEmpty(fromDateStr) && !DataUtils.isEmpty(toDateStr)) {
			q.addFilter("month", Query.FilterOperator.LESS_THAN_OR_EQUAL, SessionUtils.stringToDate(toDateStr));
		}
	}
}
