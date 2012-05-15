/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.io.InputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.util.DataUtils;

/**
 * Calendar Service
 * 
 * @author jhnam
 */
@Controller
public class TaskJdbcService extends JdbcEntityService {

	//private static final Logger logger = LoggerFactory.getLogger(TaskJdbcService.class);
	
	@RequestMapping(value = "/task/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports("task", request, response);
	}
	
	@RequestMapping(value = "/task/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String id = request.getParameter("id");
		
		if(DataUtils.isEmpty(id)) {
			return "{ \"success\" : false, \"msg\" : \"Task id is empty!\" }";
		} else {
			super.execute("delete from task where id = " + request.getParameter("id"), null);		
			return "{ \"success\" : true, \"msg\" : \"Task destroyed!\", \"key\" : \"" + id + "\" }";
		}
	}

	@RequestMapping(value = {"/task", "/m/data/task.json"}, method = RequestMethod.GET)
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
		
		String query = "select * from task where company = ? and ((start_date >= STR_TO_DATE(?, '%Y-%m-%d') and start_date <= STR_TO_DATE(?, '%Y-%m-%d')) or (end_date >= STR_TO_DATE(?, '%Y-%m-%d') and end_date <= STR_TO_DATE(?, '%Y-%m-%d')))";				
		Map<Integer, Object> params = new HashMap<Integer, Object>();
		params.put(1, company);
		params.put(2, startDateStr);
		params.put(3, endDateStr);
		params.put(4, startDateStr);
		params.put(5, endDateStr);
		List<Map<String, Object>> result = super.executeQuery(query, params);
		
		for(Map<String, Object> map : result) {
			if(map.containsKey("category"))
				map.put("cid", map.remove("category"));
			
			if(map.containsKey("start_date"))
				map.put("start", map.remove("start_date"));
			
			if(map.containsKey("end_date"))
				map.put("end", map.remove("end_date"));
			
			if(map.containsKey("all_day"))
				map.put("ad", map.remove("all_day"));
			
			if(map.containsKey("reminder"))
				map.put("rem", map.remove("reminder"));
		}
		
		return this.getResultSet(true, result.size(), result);
	}
	
	@RequestMapping(value = "/task/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String id = request.getParameter("id");
		
		if(DataUtils.isEmpty(id)) 
			return "{ \"success\" : false, \"msg\" : \"Task id is empty!\" }";
			
		String query = "select * from task where id = " + id;		
		List<Map<String, Object>> result = super.executeQuery(query, null);
		
		if(result.isEmpty()) {
			return "{ \"success\" : false, \"msg\" : \"Not found Task id (" + id + ")\" }";
		} else {
			Map<String, Object> record = result.get(0);
			record.put("success", true);
			return new ObjectMapper().writeValueAsString(record);
		}
	}
	
	@RequestMapping(value = "/task", method = RequestMethod.POST)
	public @ResponseBody
	String create(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		// {"id":0,"cid":4,"title":"title","start":"2012-05-10T00:00:00","end":"2012-05-10T01:00:00","rrule":"","loc":"location","notes":"notes","url":"web link","ad":true,"rem":"60"}		
		@SuppressWarnings("rawtypes")
		Map paramMap = this.readPayload(request);
		String query = "insert into task(company, title, start_date, end_date, all_day, category, reminder, notes, loc, url, rrule) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		Map<Integer, Object> params = new HashMap<Integer, Object>();
		params.put(1, this.getCompany(request));
		params.put(2, paramMap.get("title"));
		java.sql.Date startDate = DataUtils.toSqlDate((String)paramMap.get("start"), "yyyy-MM-dd'T'HH:mm:ss");
		java.sql.Date endDate = DataUtils.toSqlDate((String)paramMap.get("end"), "yyyy-MM-dd'T'HH:mm:ss");
		params.put(3, startDate);
		params.put(4, endDate);
		boolean allDay = DataUtils.toBool(paramMap.get("ad"));
		params.put(5, allDay);
		params.put(6, paramMap.get("cid"));
		params.put(7, paramMap.get("rem"));
		params.put(8, paramMap.get("notes"));
		params.put(9, paramMap.get("loc"));
		params.put(10, paramMap.get("url"));
		params.put(11, paramMap.get("rrule"));
		this.execute(query, params);
		return "{\"success\" : true, \"msg\" : \"Succeeded to create!\"}";
	}
	
	@RequestMapping(value = "/task", method = RequestMethod.PUT)
	public @ResponseBody
	String update(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		// {"id":0,"cid":1,"title":"asdfsa","start":"2012-05-16T00:00:00","end":"2012-05-16T01:00:00","rrule":"","loc":"locations","notes":"notes","url":"web links","ad":false,"rem":"5"," ":0}
		@SuppressWarnings("rawtypes")
		Map paramMap = this.readPayload(request);
		String query = "update task set title=?, start_date=?, end_date=?, all_day=?, category=?, reminder=?, notes=?, loc=?, url=?, rrule=? where id = ?";
		Map<Integer, Object> params = new HashMap<Integer, Object>();
		params.put(1, paramMap.get("title"));		
		java.sql.Date startDate = DataUtils.toSqlDate((String)paramMap.get("start"), "yyyy-MM-dd'T'HH:mm:ss");
		java.sql.Date endDate = DataUtils.toSqlDate((String)paramMap.get("end"), "yyyy-MM-dd'T'HH:mm:ss");		
		params.put(2, startDate);
		params.put(3, endDate);
		boolean allDay = DataUtils.toBool(paramMap.get("ad"));
		params.put(4, allDay);
		params.put(5, paramMap.get("cid"));
		params.put(6, paramMap.get("rem"));
		params.put(7, paramMap.get("notes"));
		params.put(8, paramMap.get("loc"));
		params.put(9, paramMap.get("url"));
		params.put(10, paramMap.get("rrule"));
		params.put(11, DataUtils.toLong(paramMap.get("id")));
		this.execute(query, params);
		return "{\"success\" : true, \"msg\" : \"Succeeded to update!\"}";
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
	
}
