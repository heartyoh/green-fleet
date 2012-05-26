/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.io.InputStream;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
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

	/**
	 * key names
	 */
	private static final String TABLE_NAME = "task";	
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {		
		return null;
	}

	@RequestMapping(value = "/task/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
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
			
			if(map.containsKey("start_date")) {
				Timestamp ts = (Timestamp)map.remove("start_date");
				String fromTimeStr = DataUtils.dateToString(new Date(ts.getTime()), "yyyy-MM-dd HH:mm:ss");
				map.put("start", fromTimeStr);
			}
			
			if(map.containsKey("end_date")) {
				Timestamp ts = (Timestamp)map.remove("end_date");
				String toTimeStr = DataUtils.dateToString(new Date(ts.getTime()), "yyyy-MM-dd HH:mm:ss");				
				map.put("end", toTimeStr);
			}
			
			if(map.containsKey("all_day"))
				map.put("ad", map.remove("all_day"));
			
			if(map.containsKey("reminder"))
				map.put("rem", map.remove("reminder"));
		}
		
		return this.getResultSet(true, result.size(), result);
	}
	
	@RequestMapping(value = "/task/{id}", method = RequestMethod.GET)
	public @ResponseBody
	String find(@PathVariable String id, HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);			
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
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String mode = request.getParameter("mode");
		if("create".equalsIgnoreCase(mode)) {
			return this.create(request, response);
		} else if("update".equalsIgnoreCase(mode)) {
			return this.update(request, response); 
		} else if("destroy".equalsIgnoreCase(mode)) {
			return this.delete(request, response);
		} else {
			return "{\"success\" : false, \"msg\" : \"Parameter [mode] value is empty!\"}";
		}
	}
	
	/**
	 * Task 생성
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String create(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		// {"id":0,"cid":4,"title":"title","start":"2012-05-10T00:00:00","end":"2012-05-10T01:00:00","rrule":"","loc":"location","notes":"notes","url":"web link","ad":true,"rem":"60"}		
		@SuppressWarnings("rawtypes")
		Map paramMap = this.readPayload(request);
		String query = "insert into task(company, title, start_date, end_date, all_day, category, reminder, notes, loc, url, rrule) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		Map<Integer, Object> params = new HashMap<Integer, Object>();
		params.put(1, this.getCompany(request));
		params.put(2, paramMap.get("title"));
		params.put(3, DataUtils.toTimestamp((String)paramMap.get("start"), "yyyy-MM-dd'T'HH:mm:ss"));
		params.put(4, DataUtils.toTimestamp((String)paramMap.get("end"), "yyyy-MM-dd'T'HH:mm:ss"));
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
	
	/**
	 * Task 수정 
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String update(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		// {"id":0,"cid":1,"title":"asdfsa","start":"2012-05-16T00:00:00","end":"2012-05-16T01:00:00","rrule":"","loc":"locations","notes":"notes","url":"web links","ad":false,"rem":"5"," ":0}
		@SuppressWarnings("rawtypes")
		Map paramMap = this.readPayload(request);
		String query = "update task set title=?, start_date=?, end_date=?, all_day=?, category=?, reminder=?, notes=?, loc=?, url=?, rrule=? where id = ?";
		Map<Integer, Object> params = new HashMap<Integer, Object>();
		params.put(1, paramMap.get("title"));		
		params.put(2, DataUtils.toTimestamp((String)paramMap.get("start"), "yyyy-MM-dd'T'HH:mm:ss"));
		params.put(3, DataUtils.toTimestamp((String)paramMap.get("end"), "yyyy-MM-dd'T'HH:mm:ss"));
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
	 * Task 삭제 
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		@SuppressWarnings("rawtypes")
		Map paramMap = this.readPayload(request);
		Object id = paramMap.get("id");
		response.setContentType(CONTENT_TYPE);
		super.execute("delete from task where id = " + id, null);
		return "{ \"success\" : true, \"msg\" : \"Task destroyed!\", \"key\" : \"" + id + "\" }";
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
