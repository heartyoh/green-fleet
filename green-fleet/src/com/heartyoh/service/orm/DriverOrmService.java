/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.Driver;
import com.heartyoh.model.Filter;
import com.heartyoh.model.IEntity;
import com.heartyoh.util.DataUtils;

/**
 * Driver Service
 * 
 * @author jhnam
 */
@Controller
public class DriverOrmService extends OrmEntityService {

	/**
	 * key fields
	 */
	private static final String[] KEY_FIELDS = new String[] { "company", "id" };
	
	@Override
	public Class<?> getEntityClass() {
		return Driver.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}
	
	@Override
	public boolean useFilter() {
		return true;
	}

	@RequestMapping(value = "/driver/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/driver/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/driver", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/driver/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/driver/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@Override
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		Map<String, Object> item = entity.toMap(request.getParameterValues("select"));
		item.put("phone_no_1", item.remove("phone_no1"));
		item.put("phone_no_2", item.remove("phone_no2"));
		return item;
	}	
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		Driver driver = (Driver)entity;
		driver.setName(request.getParameter("name"));
		driver.setDivision(request.getParameter("division"));
		driver.setTitle(request.getParameter("title"));
		driver.setDivision(request.getParameter("division"));
		driver.setSocialId(request.getParameter("social_id"));
		driver.setPhoneNo1(request.getParameter("phone_no_1"));
		driver.setPhoneNo2(request.getParameter("phone_no_2"));
		driver.beforeUpdate();
		return driver;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new Driver(this.getCompany(request), request.getParameter("id"));
		}
		
		entity.beforeCreate();
		return entity;
	}
	
	@Override
	protected void postMultipart (IEntity entity, Map<String, Object> paramMap, MultipartHttpServletRequest request) throws Exception {
		
		String imageFile = super.saveFile(request, (MultipartFile) paramMap.get("image_file"));
		if(imageFile != null) {
			paramMap.put("image_clip", imageFile);
			Driver driver = (Driver)entity;
			driver.setImageClip(imageFile);
			this.dml.update(driver);
		}

		super.postMultipart(entity, paramMap, request);
	}
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	@RequestMapping(value = "/driver/summary", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> summary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String driverId = null;
		String yearStr = null;
		String monthStr = null;
		int year = 0;
		int month = 0;
		
		List<Filter> filters = this.parseFilters(request.getParameter("filter"));
		if(!DataUtils.isEmpty(filters)) {
			for(Filter filter : filters) {
				if("id".equalsIgnoreCase(filter.getProperty()))
					driverId = filter.getValue();
				
				if("year".equalsIgnoreCase(filter.getProperty()))
					yearStr = filter.getValue();
				
				if("month".equalsIgnoreCase(filter.getProperty()))
					monthStr = filter.getValue();			
			}
		} else {
			driverId = request.getParameter("id");
			yearStr = request.getParameter("year");
			monthStr = request.getParameter("month");
		}
		
		if(DataUtils.isEmpty(yearStr)) {
			Calendar c = Calendar.getInstance();
			c.setTime(new Date());
			year = c.get(Calendar.YEAR);
			month = c.get(Calendar.MONTH) + 1;
		} else {
			year = Integer.parseInt(yearStr);
			month = Integer.parseInt(monthStr);
		}		
		
		if(DataUtils.isEmpty(driverId))
			throw new Exception("Parameter [id] required!");
		
		StringBuffer sql = new StringBuffer();
		sql.append("select d.id, d.name, d.division, d.social_id, d.phone_no_1, d.image_clip, d.total_distance, d.total_run_time, d.avg_effcc, ");
		sql.append("d.eco_index, d.eco_run_rate, ds.run_time_of_month, ds.eco_drv_time_of_month, ds.run_dist_of_month, ds.consmpt_of_month, ds.effcc_of_month from ");
		sql.append("driver d LEFT OUTER JOIN ");
		sql.append("(select driver, run_time run_time_of_month, eco_drv_time eco_drv_time_of_month, run_dist run_dist_of_month, consmpt consmpt_of_month, effcc effcc_of_month ");
		sql.append("from driver_run_sum where company = :company and year = :year and month = :month and driver = :id) ds ");
		sql.append("ON d.id = ds.driver ");
		sql.append("where d.company = :company and d.id = :id");
		
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("id", driverId);
		params.put("year", year);
		params.put("month", month);
		Map data = dml.selectBySql(sql.toString(), params, Map.class);
		data.put("success", true);
		return data;
	}
}
