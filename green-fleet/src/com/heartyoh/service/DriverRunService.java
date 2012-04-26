/**
 * 
 */
package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
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
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 운전자별 운행 정보 서비스
 * 
 * @author jhnam
 */
@Controller
public class DriverRunService extends EntityService {

	@Override
	protected String getEntityName() {
		return "DriverRunSum";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		// 운전자, 년, 월 
		return (String)map.get("driver") + "@" + map.get("month");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		
		this.checkDate(map);
		
		entity.setProperty("driver", map.get("driver"));
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
		
		// 급가속 횟수 
		entity.setProperty("sud_accel_cnt", DataUtils.toInt(map.get("sud_accel_cnt")));
		
		// 급감속 횟수 
		entity.setProperty("sud_brake_cnt", DataUtils.toInt(map.get("sud_brake_cnt")));
		
		// eco driving time
		entity.setProperty("eco_drv_time", DataUtils.toInt(map.get("eco_drv_time")));
		
		// 과속 시간 
		entity.setProperty("ovr_spd_time", DataUtils.toInt(map.get("ovr_spd_time")));
		
		// 사고 횟수 
		entity.setProperty("inc_cnt", DataUtils.toInt(map.get("inc_cnt")));
		
		// 10km 미만 시간 
		entity.setProperty("spd_lt10", DataUtils.toInt(map.get("spd_lt10")));
		entity.setProperty("spd_lt20", DataUtils.toInt(map.get("spd_lt20")));
		entity.setProperty("spd_lt30", DataUtils.toInt(map.get("spd_lt30")));
		entity.setProperty("spd_lt40", DataUtils.toInt(map.get("spd_lt40")));
		entity.setProperty("spd_lt50", DataUtils.toInt(map.get("spd_lt50")));
		entity.setProperty("spd_lt60", DataUtils.toInt(map.get("spd_lt60")));
		entity.setProperty("spd_lt70", DataUtils.toInt(map.get("spd_lt70")));
		entity.setProperty("spd_lt80", DataUtils.toInt(map.get("spd_lt80")));
		entity.setProperty("spd_lt90", DataUtils.toInt(map.get("spd_lt90")));
		entity.setProperty("spd_lt100", DataUtils.toInt(map.get("spd_lt100")));
		entity.setProperty("spd_lt110", DataUtils.toInt(map.get("spd_lt110")));
		entity.setProperty("spd_lt120", DataUtils.toInt(map.get("spd_lt120")));
		entity.setProperty("spd_lt130", DataUtils.toInt(map.get("spd_lt130")));
		entity.setProperty("spd_lt140", DataUtils.toInt(map.get("spd_lt140")));
		entity.setProperty("spd_lt150", DataUtils.toInt(map.get("spd_lt150")));
		entity.setProperty("spd_lt160", DataUtils.toInt(map.get("spd_lt160")));
		
		super.onSave(entity, map, datastore);
	}
	
	private void checkDate(Map<String, Object> map) {
		Object monthObj = map.get("month");
		
		if(!DataUtils.isEmpty(monthObj) && monthObj instanceof String)
			map.put("month", SessionUtils.stringToDate(monthObj.toString()));		
	}	
	
	@RequestMapping(value = "/driver_run/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = "/driver_run/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/driver_run/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/driver_run", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/driver_run/speed", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveSpeed(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}
	
	@Override
	protected void adjustItem(Map<String, Object> item) {
		if(item.containsKey("month")) {
			Date monthDt = (Date)item.get("month");
			item.put("month_str", DataUtils.dateToString(monthDt, "yyyy-MM"));
		}
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
		
		String driver = request.getParameter("driver");
		String driverGroup = request.getParameter("driver_group");
		String fromDateStr = request.getParameter("from_date");
		String toDateStr = request.getParameter("to_date");
		
		if(!DataUtils.isEmpty(driver))
			q.addFilter("driver", FilterOperator.EQUAL, driver);
		
		if(!DataUtils.isEmpty(fromDateStr))
			q.addFilter("month", FilterOperator.GREATER_THAN_OR_EQUAL, SessionUtils.stringToDate(fromDateStr));
		
		if(!DataUtils.isEmpty(toDateStr))
			q.addFilter("month", FilterOperator.LESS_THAN_OR_EQUAL, SessionUtils.stringToDate(toDateStr));
		
		if(!DataUtils.isEmpty(driverGroup)) {
			List<String> vgList = new ArrayList<String>();
			Iterator<Entity> vgIter = DatastoreUtils.findEntities(this.getCompanyKey(request), "DriverRelation", DataUtils.newMap("driver_group_id", driverGroup));
			
			while(vgIter.hasNext()) {
				Entity vg = vgIter.next();
				vgList.add((String)vg.getProperty("driver_id"));
			}
			
			if(!vgList.isEmpty())
				q.addFilter("driver", FilterOperator.IN, vgList);
		}		
	}	
}
