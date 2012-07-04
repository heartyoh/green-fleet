/**
 * 
 */
package com.heartyoh.service.orm;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.IEntity;
import com.heartyoh.model.VehicleRunSum;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * 차량별 운행 정보 서비스
 * 
 * @author jhnam
 */
@Controller
public class VehicleRunOrmService extends OrmEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(VehicleRunOrmService.class);
	/**
	 * key fields
	 */
	private static final String[] KEY_FIELDS = new String[] { "company", "vehicle", "year", "month" };
	
	@Override
	public Class<?> getEntityClass() {
		return VehicleRunSum.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}

	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle"))) {
			query.addFilter("vehicle", request.getParameter("vehicle"));
		}
		
		query.addOrder("year", true);
		query.addOrder("month", true);
		query.addOrder("vehicle", true);
		return query;
	}

	@RequestMapping(value = "/vehicle_run/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		MultipartFile file = request.getFile("file");
		BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
		String line = br.readLine();
		String[] keys = line.split(",");
		String company = this.getCompany(request);
		List<IEntity> list = new ArrayList<IEntity>();
		int batchCount = 0;
		
		while ((line = br.readLine()) != null) {
			String[] values = line.split(",");
			VehicleRunSum sum = new VehicleRunSum();
			sum.setCompany(company);
			
			for (int i = 0; i < keys.length; i++) {
				String key = keys[i].trim();
				String value = values[i].trim();
				
				if(key.equalsIgnoreCase("vehicle")) {
					sum.setVehicle(value);
					
				} else if(key.equalsIgnoreCase("month_date")) {
					Date date = DataUtils.toDate(value);
					Calendar c = Calendar.getInstance();
					c.setTime(date);
					sum.setYear(c.get(Calendar.YEAR));
					sum.setMonth(c.get(Calendar.MONTH) + 1);
					sum.setMonthDate(date);
					
				} else if(key.equalsIgnoreCase("run_time")) {
					sum.setRunTime(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("run_dist")) { 
					sum.setRunDist(DataUtils.toFloat(value));
					
				} else if(key.equalsIgnoreCase("co2_emss")) {
					sum.setCo2Emss(DataUtils.toFloat(value));
					
				} else if(key.equalsIgnoreCase("consmpt")) {
					sum.setConsmpt(DataUtils.toFloat(value));
					
				} else if(key.equalsIgnoreCase("effcc")) {
					sum.setEffcc(DataUtils.toFloat(value));
					
				} else if(key.equalsIgnoreCase("eco_index")) {
					sum.setEcoIndex(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("sud_accel_cnt")) {
					sum.setSudAccelCnt(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("sud_brake_cnt")) {
					sum.setSudBrakeCnt(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("eco_drv_time")) {
					sum.setEcoDrvTime(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("ovr_spd_time")) {
					sum.setOvrSpdTime(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("idle_time")) {
					sum.setIdleTime(DataUtils.toInt(value));					
					
				} else if(key.equalsIgnoreCase("inc_cnt")) {
					sum.setIncCnt(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("oos_cnt")) {
					sum.setOosCnt(DataUtils.toInt(value));
				
				} else if(key.equalsIgnoreCase("mnt_cnt")) {
					sum.setMntCnt(DataUtils.toInt(value));
				
				} else if(key.equalsIgnoreCase("mnt_time")) {
					sum.setMntTime(DataUtils.toInt(value));				
				}
			}

			sum.beforeSave();
			list.add(sum);
			
			if(batchCount == 30) {
				this.dml.upsertBatch(list);
				list.clear();
				batchCount = 0;
			}			
		}

		this.dml.upsertBatch(list);		
		return "{\"success\" : true, \"msg\" : \"Imported " + list.size() + " count successfully\"}";
	}
	
	@RequestMapping(value = "/vehicle_run/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/vehicle_run", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String timeView = request.getParameter("time_view");
		
		if(DataUtils.isEmpty(timeView))
			timeView = "monthly";
				
		try {
			@SuppressWarnings("rawtypes")
			List<Map> items = null;
			if("daily".equalsIgnoreCase(timeView)) {
				items = this.retrieveByDaily(request);
			} else if("monthly".equalsIgnoreCase(timeView)) {
				items = this.retrieveByMonthly(request);
			} else {
				items = this.retrieveByYearly(request);
			}
			return this.getResultSet(true, items.size(), items);
			
		} catch(Exception e) {
			logger.error("Failed to retrieve vehicle_run_sum!", e);
			return this.getResultSet(false, 0, null);
		}
	}
	
	@SuppressWarnings("rawtypes")
	private List<Map> retrieveByDaily(HttpServletRequest request) throws Exception {
		
		Date fromDate = DataUtils.toDate(request.getParameter("year") + "-" + request.getParameter("month") + "-01");
		Calendar c = Calendar.getInstance();
		c.setTime(fromDate);
		int lastDay = c.getMaximum(Calendar.DAY_OF_MONTH);
		c.add(Calendar.DAY_OF_MONTH, lastDay - 1);
		Date toDate = c.getTime();
		Key companyKey = KeyFactory.createKey("Company", this.getCompany(request));
		List<Entity> checkins = 
				DatastoreUtils.findCheckinsByVehicle(companyKey, request.getParameter("vehicle"), fromDate, toDate);
		
		List<Map> items = new ArrayList<Map>();
		for(Entity checkin : checkins) {
			Map<String, Object> item = new HashMap<String, Object>();
			Object monthDateObj = checkin.getProperty("engine_end_time");
			item.put("vehicle", checkin.getProperty("vehicle_id"));
			item.put("year", c.get(Calendar.YEAR));
			item.put("month", c.get(Calendar.MONTH) + 1);
			item.put("month_date", monthDateObj);
			item.put("month_str", DataUtils.dateToString((Date)monthDateObj, GreenFleetConstant.DEFAULT_DATE_FORMAT));			
			item.put("time_view", "daily");
			item.put("eco_index", checkin.getProperty("eco_index"));
			item.put("effcc", checkin.getProperty("fuel_efficiency"));
			item.put("co2_emss", checkin.getProperty("co2_emissions"));
			item.put("run_dist", checkin.getProperty("distance"));
			item.put("run_time", checkin.getProperty("running_time"));
			item.put("eco_drv_time", checkin.getProperty("eco_driving_time"));
			item.put("idle_time", checkin.getProperty("idle_time"));
			item.put("ovr_spd_time", checkin.getProperty("over_speed_time"));
			item.put("sud_accel_cnt", checkin.getProperty("sudden_accel_count"));
			item.put("sud_brake_cnt", checkin.getProperty("sudden_brake_count"));
			items.add(item);
		}
		
		return items;
	}	
	
	@SuppressWarnings("rawtypes")
	private List<Map> retrieveByMonthly(HttpServletRequest request) throws Exception {
		
		String company = this.getCompany(request);
		StringBuffer query = new StringBuffer("select *, CONCAT_WS('-', year, month) month_str, 'monthly' time_view ");
		query.append("from vehicle_run_sum where company = :company");
		Map<String, Object> params = DataUtils.newMap("company", company);
		
		if(!DataUtils.isEmpty(request.getParameter("from_year")) && !DataUtils.isEmpty(request.getParameter("from_month"))) {
			Date fromDate = DataUtils.toDate(request.getParameter("from_year") + "-" + request.getParameter("from_month") + "-01");
			query.append(" and month_date >= :from_date ");
			params.put("from_date", fromDate);
		}
		
		if(!DataUtils.isEmpty(request.getParameter("to_year")) && !DataUtils.isEmpty(request.getParameter("to_month"))) {
			String toDateStr = request.getParameter("to_year") + "-" + request.getParameter("to_month") + "-01";
			Calendar c = Calendar.getInstance();
			c.setTime(DataUtils.toDate(toDateStr));
			c.add(Calendar.MONTH, 1);
			query.append(" and month_date <= :to_date ");
			params.put("to_date", c.getTime());
		}
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle"))) {
			query.append(" and vehicle = :vehicle ");
			params.put("vehicle", request.getParameter("vehicle"));
		}
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle_group"))) {
			query.append(" and vehicle in (select vehicle_id from vehicle_relation where group_id = :vehicle_group)");
			params.put("vehicle_group", request.getParameter("vehicle_group"));
		}
		
		query.append(" order by year asc, month asc, vehicle asc");		
		return this.dml.selectListBySql(query.toString(), params, Map.class, 0, 0);
	}
	
	@SuppressWarnings("rawtypes")
	private List<Map> retrieveByYearly(HttpServletRequest request) throws Exception {
		
		String company = this.getCompany(request);
		String vehicle = request.getParameter("vehicle");
		StringBuffer query = new StringBuffer("select * from (");
		query.append("select year, year month_str, 0 month, 'yearly' time_view, '" + vehicle + "' vehicle, ");
		query.append("format(sum(eco_index) / count(vehicle), 2) eco_index, ");
		query.append("format(sum(effcc) / count(vehicle), 2) effcc, ");
		query.append("sum(co2_emss) co2_emss, sum(consmpt) consmpt, sum(eco_drv_time) eco_drv_time, ");
		query.append("sum(idle_time) idle_time, sum(inc_cnt) inc_cnt, sum(ovr_spd_time) ovr_spd_time, ");
		query.append("sum(run_dist) run_dist, sum(run_time) run_time, sum(sud_accel_cnt) sud_accel_cnt, ");
		query.append("sum(sud_brake_cnt) sud_brake_cnt, sum(mnt_cnt) mnt_cnt, sum(mnt_time) mnt_time, ");
		query.append("sum(oos_cnt) oos_cnt from vehicle_run_sum where company = :company");
		Map<String, Object> queryParams = DataUtils.newMap("company", company);
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle"))) {
			query.append(" and vehicle = :vehicle");
			queryParams.put("vehicle", request.getParameter("vehicle"));
		}
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle_group"))) {
			query.append(" and vehicle in (select vehicle_id from vehicle_relation where group_id = :vehicle_group)");
			queryParams.put("vehicle_group", request.getParameter("vehicle_group"));
		}
		
		query.append(" group by year, vehicle order by year asc, vehicle asc) a");		
		return this.dml.selectListBySql(query.toString(), queryParams, Map.class, 0, 0);
	}
	
	@RequestMapping(value = "/vehicle_run/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/vehicle_run/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.find(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		
		VehicleRunSum sum = (VehicleRunSum)entity;
		sum.setRunTime(DataUtils.toInt(request.getParameter("run_time")));
		sum.setRunDist(DataUtils.toFloat(request.getParameter("run_dist")));		
		sum.setCo2Emss(DataUtils.toFloat(request.getParameter("co2_emss")));
		sum.setConsmpt(DataUtils.toFloat(request.getParameter("consmpt")));
		sum.setEffcc(DataUtils.toFloat(request.getParameter("effcc")));
		sum.setEcoIndex(DataUtils.toInt(request.getParameter("eco_index")));
		sum.setSudAccelCnt(DataUtils.toInt(request.getParameter("sud_accel_cnt")));
		sum.setSudBrakeCnt(DataUtils.toInt(request.getParameter("sud_brake_cnt")));
		sum.setEcoDrvTime(DataUtils.toInt(request.getParameter("eco_drv_time")));
		sum.setOvrSpdTime(DataUtils.toInt(request.getParameter("ovr_spd_time")));
		sum.setIdleTime(DataUtils.toInt(request.getParameter("idle_time")));
		sum.setIncCnt(DataUtils.toInt(request.getParameter("inc_cnt")));
		sum.setOosCnt(DataUtils.toInt(request.getParameter("oos_cnt")));
		sum.setMntCnt(DataUtils.toInt(request.getParameter("mnt_cnt")));
		sum.setMntTime(DataUtils.toInt(request.getParameter("mnt_time")));		
		
		sum.beforeUpdate();
		return sum;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new VehicleRunSum(this.getCompany(request), 
									   request.getParameter("vehicle"), 
									   DataUtils.toInt(request.getParameter("year")), 
									   DataUtils.toInt(request.getParameter("month")));
		}
		
		entity.beforeCreate();
		return entity;
	}
}
