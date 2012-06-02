/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.util.DataUtils;

/**
 * Location Service
 * 
 * @author jhnam
 */

public class LocationJdbcService extends JdbcEntityService {

	/**
	 * key names
	 */
	private static final String TABLE_NAME = "location";	
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {
		return null;
	}

	@RequestMapping(value = "/location/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/location/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);
		String company = this.getCompany(request);
		String name = request.getParameter("name");		
		Connection conn = null;
		
		try {
			conn = this.getConnection();			
			Map<Integer, Object> params = DataUtils.newParams(company, name);
			this.execute(conn, "delete from location where company = ? and name = ?", params);
			this.execute(conn, "delete from alarm where company = ? and evt_type = 'location' and evt_name = ?", params);
			
		} catch (Exception e) {
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + name + "\" }";
			
		} finally {
			super.closeDB(conn);
		}		
				
		return "{ \"success\" : true, \"msg\" : \"Location destroyed!\", \"key\" : \"" + name + "\" }";
	}

	@RequestMapping(value = {"/location", "/m/data/location.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.retrieve(true, DataUtils.newMap("company", this.getCompany(request)), request, response);
	}
	
	@RequestMapping(value = "/location/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@RequestMapping(value = "/location/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
}
