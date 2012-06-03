/**
 * 
 */
package com.heartyoh.service.orm;

import java.io.InputStream;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.Task;
import com.heartyoh.util.DataUtils;

/**
 * Task service
 * 
 * @author jhnam
 */
@Controller
public class TaskOrmService extends OrmEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(TaskOrmService.class);
	/**
	 * key fields
	 */
	private static final String[] KEY_FIELDS = new String[] { "id" };
	
	@Override
	public Class<?> getEntityClass() {
		return Task.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}

	@RequestMapping(value = "/task/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
		
	@RequestMapping(value = {"/task", "/m/data/task"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String startDateStr = request.getParameter("startDate");
		String endDateStr = request.getParameter("endDate");
		
		if(DataUtils.isEmpty(startDateStr)) {
			Date[] dates = DataUtils.getFirstLastDateOfMonth();
			startDateStr = DataUtils.dateToString(dates[0], "yyyy-MM-dd");
			endDateStr = DataUtils.dateToString(dates[1], "yyyy-MM-dd");
		}
		
		String query = "select * from task where company = :company and ((start_date >= STR_TO_DATE(:start_date, '%Y-%m-%d') and start_date <= STR_TO_DATE(:end_date, '%Y-%m-%d')) or (end_date >= STR_TO_DATE(:start_date, '%Y-%m-%d') and end_date <= STR_TO_DATE(:end_date, '%Y-%m-%d')))";				
		Map<String, Object> params = new HashMap<String, Object>();
		params.put("company", company);
		params.put("start_date", startDateStr);
		params.put("end_date", endDateStr);
		params.put("start_date", startDateStr);
		params.put("end_date", endDateStr);
		
		try {
			@SuppressWarnings("rawtypes")
			List<Map> items = this.dml.selectListBySql(query, params, Map.class, 0, 0);
			for(Map<String, Object> item : items) {
				this.convertItem(item);
			}
			
			return this.getResultSet(true, items.size(), items);
			
		} catch(Exception e) {
			logger.error("Failed to retrieve task!", e);
			return this.getResultSet(false, 0, null);
		}
	}
	
	/**
	 * 변환 
	 * @param item
	 */
	protected void convertItem(Map<String, Object> item) {
		if(item.containsKey("category"))
			item.put("cid", item.remove("category"));
		
		if(item.containsKey("start_date")) {
			Timestamp ts = (Timestamp)item.remove("start_date");
			String fromTimeStr = DataUtils.dateToString(new Date(ts.getTime()), "yyyy-MM-dd HH:mm:ss");
			item.put("start", fromTimeStr);
		}
		
		if(item.containsKey("end_date")) {
			Timestamp ts = (Timestamp)item.remove("end_date");
			String toTimeStr = DataUtils.dateToString(new Date(ts.getTime()), "yyyy-MM-dd HH:mm:ss");				
			item.put("end", toTimeStr);
		}
		
		if(item.containsKey("all_day"))
			item.put("ad", item.remove("all_day"));
		
		if(item.containsKey("reminder"))
			item.put("rem", item.remove("reminder"));		
	}	
	
	@RequestMapping(value = "/task", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String mode = request.getParameter("mode");
		if("create".equalsIgnoreCase(mode)) {
			return this.createTask(request, response);
		} else if("update".equalsIgnoreCase(mode)) {
			return this.updateTask(request, response); 
		} else if("destroy".equalsIgnoreCase(mode)) {
			return this.deleteTask(request, response);
		} else {
			return "{\"success\" : false, \"msg\" : \"Parameter [mode] value is empty!\"}";
		}
	}
	
	@RequestMapping(value = "/task/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> item = this.find(request, response);
		this.convertItem(item);
		return item;
	}
	
	/**
	 * Task 생성
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	private String createTask(HttpServletRequest request, HttpServletResponse response) throws Exception {

		// {"id":0,"cid":4,"title":"title","start":"2012-05-10T00:00:00","end":"2012-05-10T01:00:00","rrule":"","loc":"location","notes":"notes","url":"web link","ad":true,"rem":"60"}
		try {
			@SuppressWarnings("rawtypes")
			Map paramMap = this.readPayload(request);
			Task task = this.newTask(this.getCompany(request), paramMap);
			this.dml.insert(task);
			return "{\"success\" : true, \"msg\" : \"Succeeded to create task!\"}";
			
		} catch(Exception e) {
			logger.error("Failed to create task", e);
			return "{\"success\" : false, \"msg\" : \"Failed to create task " + e.getMessage() + "!\"}";
		}
		
	}
	
	/**
	 * Task 수정 
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	private String updateTask(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		// {"id":0,"cid":1,"title":"asdfsa","start":"2012-05-16T00:00:00","end":"2012-05-16T01:00:00","rrule":"","loc":"locations","notes":"notes","url":"web links","ad":false,"rem":"5"," ":0}		
		try {
			@SuppressWarnings("rawtypes")
			Map paramMap = this.readPayload(request);
			Task task = this.newTask(this.getCompany(request), paramMap);
			this.dml.update(task);
			return "{\"success\" : true, \"msg\" : \"Succeeded to update task!\"}";
			
		} catch(Exception e) {
			logger.error("Failed to update task", e);
			return "{\"success\" : false, \"msg\" : \"Failed to update task " + e.getMessage() + "!\"}";
		}
	}
	
	/**
	 * Task 삭제 
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */	
	private String deleteTask(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		try {
			@SuppressWarnings("rawtypes")
			Map paramMap = this.readPayload(request);
			Task task = this.newTask(this.getCompany(request), paramMap);
			this.dml.delete(task);
			return "{ \"success\" : true, \"msg\" : \"Task destroyed!\" }";
			
		} catch(Exception e) {
			logger.error("Failed to delete task", e);
			return "{\"success\" : false, \"msg\" : \"Failed to destroy task " + e.getMessage() + "!\"}";
		}
	}
	
	/**
	 * request의 payload를 읽어 리턴 
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	private Map readPayload(HttpServletRequest request) throws Exception {
		
		InputStream is = request.getInputStream();
		byte[] bytes = new byte[request.getContentLength()];
		int index = 0;
        int b = is.read();
        while (b != -1) {
        	bytes[index++] = (byte)b;
            b = is.read();
        }
        
        return new ObjectMapper().readValue(bytes, Map.class);
	}
	
	/**
	 * task 생성 
	 * 
	 * @param company
	 * @param id
	 * @param paramMap
	 * @return
	 * @throws Exception
	 */
	private Task newTask(String company, @SuppressWarnings("rawtypes") Map paramMap) throws Exception {
		
		Task task = new Task();
		Object idObj = paramMap.get("id");
		
		if(idObj != null && (idObj instanceof Long || idObj instanceof Integer))
			task.setId(Long.parseLong(idObj.toString()));
		
		task.setCompany(company);
		task.setTitle((String)paramMap.get("title"));
		task.setStartDate(DataUtils.toTimestamp((String)paramMap.get("start"), "yyyy-MM-dd'T'HH:mm:ss"));
		task.setEndDate(DataUtils.toTimestamp((String)paramMap.get("end"), "yyyy-MM-dd'T'HH:mm:ss"));
		boolean allDay = DataUtils.toBool(paramMap.get("ad"));
		task.setAllDay(allDay);
		task.setCategory("" + paramMap.get("cid"));
		task.setReminder((String)paramMap.get("rem"));
		task.setNotes((String)paramMap.get("notes"));
		task.setLoc((String)paramMap.get("loc"));
		task.setUrl((String)paramMap.get("url"));
		task.setReminder((String)paramMap.get("rrule"));
		return task;
	}	
}
