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

import org.codehaus.jackson.map.ObjectMapper;
import org.dbist.dml.Query;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.IEntity;
import com.heartyoh.model.VehicleRunSum;
import com.heartyoh.util.DataUtils;

/**
 * 차량별 운행 정보 서비스
 * 
 * @author jhnam
 */
@Controller
public class VehicleRunOrmService extends OrmEntityService {

	private String[] keyFields = new String[] { "company", "vehicle", "year", "month" };
	
	@Override
	public Class<?> getEntityClass() {
		return VehicleRunSum.class;
	}

	@Override
	public String[] getKeyFields() {
		return this.keyFields;
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
	public void imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		
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
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println("{\"success\" : true, \"msg\" : \"Imported " + list.size() + " count successfully\"}");
	}
	
	@RequestMapping(value = "/vehicle_run/delete", method = RequestMethod.POST)
	public void delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.delete(request, response);
	}
	
	@RequestMapping(value = "/vehicle_run", method = RequestMethod.GET)
	public void retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		Map<String, Object> queryParams = new HashMap<String, Object>();
		StringBuffer query = new StringBuffer("select *, CONCAT_WS('-', year, month) month_str from vehicle_run_sum where company = :company");
		queryParams.put("company", company);
		
		if(!DataUtils.isEmpty(request.getParameter("from_year")) && !DataUtils.isEmpty(request.getParameter("from_month"))) {
			String fromDate = request.getParameter("from_year") + "-" + request.getParameter("from_month") + "-01";
			query.append(" and month_date >= STR_TO_DATE(:from_date,'%Y-%m-%d')");
			queryParams.put("from_date", fromDate);
		}
		
		if(!DataUtils.isEmpty(request.getParameter("to_year")) && !DataUtils.isEmpty(request.getParameter("to_month"))) {
			String toDate = request.getParameter("to_year") + "-" + request.getParameter("to_month") + "-01";
			query.append(" and month_date <= STR_TO_DATE(:to_date,'%Y-%m-%d')");
			queryParams.put("to_date", toDate);
		}
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle"))) {
			query.append(" and vehicle = :vehicle");
			queryParams.put("vehicle", request.getParameter("vehicle"));
		}
		
		if(!DataUtils.isEmpty(request.getParameter("vehicle_group"))) {
			query.append(" and vehicle in (select vehicle_id from vehicle_relation where group_id = (select id from vehicle_group where company = :company and name= :vehicle_group))");
			queryParams.put("vehicle_group", request.getParameter("vehicle_group"));
		}
		
		query.append(" order by year asc, month asc, vehicle asc");
		
		@SuppressWarnings("rawtypes")
		List<Map> items = this.dml.selectListBySql(query.toString(), queryParams, Map.class, 0, 0);
		response.setContentType("text/html; charset=UTF-8");
		String resultStr = new ObjectMapper().writeValueAsString(items);
		response.getWriter().println(resultStr);
	}
	
	@RequestMapping(value = "/vehicle_run/save", method = RequestMethod.POST)
	public void save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		super.save(request, response);
	}
	
	@RequestMapping(value = "/vehicle_run/find", method = RequestMethod.GET)
	public void find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		super.find(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		
		VehicleRunSum sum = (VehicleRunSum)entity;
		sum.setRunTime(DataUtils.toInt(request.getParameter("run_time")));
		sum.setRunDist(DataUtils.toFloat(request.getParameter("run_dist")));		
		sum.setCo2Emss(DataUtils.toFloat(request.getParameter("co2_emss")));
		sum.setConsmpt(DataUtils.toFloat(request.getParameter("consmpt")));
		sum.setEffcc(DataUtils.toFloat(request.getParameter("effcc")));
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
