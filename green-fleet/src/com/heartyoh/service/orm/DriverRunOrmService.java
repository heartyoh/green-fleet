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
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.DriverRunSum;
import com.heartyoh.model.IEntity;
import com.heartyoh.util.DataUtils;

/**
 * 운전자별 운행 정보 서비스
 * 
 * @author jhnam
 */
@Controller
public class DriverRunOrmService extends OrmEntityService {

	private static final String[] KEY_FIELDS = new String[] { "company", "driver", "year", "month" };
	
	@Override
	public Class<?> getEntityClass() {
		return DriverRunSum.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}
	
	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		
		if(!DataUtils.isEmpty(request.getParameter("driver"))) {
			query.addFilter("driver", request.getParameter("driver"));
		}
		
		query.addOrder("year", true);
		query.addOrder("month", true);
		query.addOrder("driver", true);
		return query;
	}
	
	@RequestMapping(value = "/driver_run/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		
		MultipartFile file = request.getFile("file");
		BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
		String line = br.readLine();
		String[] keys = line.split(",");
		String company = this.getCompany(request);
		List<IEntity> list = new ArrayList<IEntity>();
		int batchCount = 0;
		
		while ((line = br.readLine()) != null) {
			String[] values = line.split(",");
			DriverRunSum sum = new DriverRunSum();
			sum.setCompany(company);
			
			for (int i = 0; i < keys.length; i++) {
				String key = keys[i].trim();
				String value = values[i].trim();
				
				if(key.equalsIgnoreCase("driver")) {
					sum.setDriver(value);
					
				} else if(key.equalsIgnoreCase("month")) {
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
					
				} else if(key.equalsIgnoreCase("sud_accel_cnt")) {
					sum.setSudAccelCnt(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("sud_brake_cnt")) {
					sum.setSudBrakeCnt(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("eco_drv_time")) {
					sum.setEcoDrvTime(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("ovr_spd_time")) {
					sum.setOvrSpdTime(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("inc_cnt")) {
					sum.setIncCnt(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt10")) {
					sum.setSpdLt10(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt20")) {
					sum.setSpdLt20(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt30")) {
					sum.setSpdLt30(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt40")) {
					sum.setSpdLt40(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt50")) {
					sum.setSpdLt50(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt60")) {
					sum.setSpdLt60(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt70")) {
					sum.setSpdLt70(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt80")) {
					sum.setSpdLt80(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt90")) {
					sum.setSpdLt90(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt100")) {
					sum.setSpdLt100(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt110")) {
					sum.setSpdLt110(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt120")) {
					sum.setSpdLt120(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt130")) {
					sum.setSpdLt130(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt140")) {
					sum.setSpdLt140(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt150")) {
					sum.setSpdLt150(DataUtils.toInt(value));
					
				} else if(key.equalsIgnoreCase("spd_lt160")) {
					sum.setSpdLt160(DataUtils.toInt(value));
				} 
			}

			sum.beforeSave();			
			list.add(sum);
			batchCount++;
			
			if(batchCount == 30) {
				this.dml.upsertBatch(list);
				list.clear();
				batchCount = 0;
			}
		}

		this.dml.upsertBatch(list);
		response.setContentType("text/html; charset=UTF-8");
		return "{\"success\" : true, \"msg\" : \"Imported " + list.size() + " count successfully\"}";
	}	

	@RequestMapping(value = "/driver_run/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/driver_run", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String company = this.getCompany(request);
		Map<String, Object> queryParams = new HashMap<String, Object>();
		StringBuffer query = new StringBuffer("select *, CONCAT_WS('-', year, month) month_str from driver_run_sum where company = :company");
		queryParams.put("company", company);
		
		if(!DataUtils.isEmpty(request.getParameter("from_year")) && !DataUtils.isEmpty(request.getParameter("from_month"))) {
			String fromDate = request.getParameter("from_year") + "-" + request.getParameter("from_month") + "-01";
			query.append(" and month_date >= STR_TO_DATE(:from_date, '%Y-%m-%d')");
			queryParams.put("from_date", fromDate);
		}
		
		if(!DataUtils.isEmpty(request.getParameter("to_year")) && !DataUtils.isEmpty(request.getParameter("to_month"))) {
			String toDate = request.getParameter("to_year") + "-" + request.getParameter("to_month") + "-01";
			query.append(" and month_date <= STR_TO_DATE(:to_date, '%Y-%m-%d')");
			queryParams.put("to_date", toDate);
		}
		
		if(!DataUtils.isEmpty(request.getParameter("driver"))) {
			query.append(" and driver = :driver");
			queryParams.put("driver", request.getParameter("driver"));
		}
		
		if(!DataUtils.isEmpty(request.getParameter("driver_group"))) {
			query.append(" and driver in (select driver_id from driver_relation where group_id = (select id from driver_group where company = :company and name= :driver_group))");
			queryParams.put("driver_group", request.getParameter("driver_group"));			
		}
		
		query.append(" order by year asc, month asc, driver asc");
		
		@SuppressWarnings("rawtypes")
		List<Map> items = this.dml.selectListBySql(query.toString(), queryParams, Map.class, 0, 0);
		return this.getResultSet(true, items.size(), items);
	}
	
	@RequestMapping(value = "/driver_run/speed", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveSpeed(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return this.retrieve(request, response);
	}	
	
	@RequestMapping(value = "/driver_run/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/driver_run/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.find(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		
		DriverRunSum sum = (DriverRunSum)entity;
		sum.setRunTime(DataUtils.toInt(request.getParameter("run_time")));
		sum.setRunDist(DataUtils.toFloat(request.getParameter("run_dist")));		
		sum.setCo2Emss(DataUtils.toFloat(request.getParameter("co2_emss")));
		sum.setConsmpt(DataUtils.toFloat(request.getParameter("consmpt")));
		sum.setEffcc(DataUtils.toFloat(request.getParameter("effcc")));
		sum.setSudAccelCnt(DataUtils.toInt(request.getParameter("sud_accel_cnt")));
		sum.setSudBrakeCnt(DataUtils.toInt(request.getParameter("sud_brake_cnt")));
		sum.setEcoDrvTime(DataUtils.toInt(request.getParameter("eco_drv_time")));
		sum.setOvrSpdTime(DataUtils.toInt(request.getParameter("ovr_spd_time")));
		sum.setIncCnt(DataUtils.toInt(request.getParameter("inc_cnt")));
		sum.setSpdLt10(DataUtils.toInt(request.getParameter("spd_lt10")));
		sum.setSpdLt20(DataUtils.toInt(request.getParameter("spd_lt20")));
		sum.setSpdLt30(DataUtils.toInt(request.getParameter("spd_lt30")));
		sum.setSpdLt40(DataUtils.toInt(request.getParameter("spd_lt40")));
		sum.setSpdLt50(DataUtils.toInt(request.getParameter("spd_lt50")));
		sum.setSpdLt60(DataUtils.toInt(request.getParameter("spd_lt60")));
		sum.setSpdLt70(DataUtils.toInt(request.getParameter("spd_lt70")));
		sum.setSpdLt80(DataUtils.toInt(request.getParameter("spd_lt80")));
		sum.setSpdLt90(DataUtils.toInt(request.getParameter("spd_lt90")));
		sum.setSpdLt100(DataUtils.toInt(request.getParameter("spd_lt100")));
		sum.setSpdLt110(DataUtils.toInt(request.getParameter("spd_lt110")));
		sum.setSpdLt120(DataUtils.toInt(request.getParameter("spd_lt120")));
		sum.setSpdLt130(DataUtils.toInt(request.getParameter("spd_lt130")));
		sum.setSpdLt140(DataUtils.toInt(request.getParameter("spd_lt140")));
		sum.setSpdLt150(DataUtils.toInt(request.getParameter("spd_lt150")));
		sum.setSpdLt160(DataUtils.toInt(request.getParameter("spd_lt160")));

		sum.beforeUpdate();
		return sum;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new DriverRunSum(this.getCompany(request), 
									   request.getParameter("driver"), 
									   DataUtils.toInt(request.getParameter("year")), 
									   DataUtils.toInt(request.getParameter("month")));
		}
		
		entity.beforeCreate();
		return entity;
	}	
}
