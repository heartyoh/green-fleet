/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.util.DataUtils;

/**
 * Driver Service
 * 
 * @author jhnam
 */

public class DriverJdbcService extends JdbcEntityService {

	/**
	 * key names
	 */
	private static final String TABLE_NAME = "driver";
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {		
		return null;
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
	
	@RequestMapping(value = {"/driver", "/m/data/driver.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		// TODO Driver group이 조건으로 들어왔을 때 처리 ... join...
		Map<String, Object> queryParams = DataUtils.newMap("company", this.getCompany(request));
		return super.retrieve(false, queryParams, request, response);		
	}
	
	@RequestMapping(value = "/driver/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.find(request, response);
	}
	
	@RequestMapping(value = "/driver/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
	@Override
	protected void postMultipart (Connection conn, Map<String, Object> paramMap, MultipartHttpServletRequest request) throws Exception {
		
		String imageFile = super.saveFile(request, (MultipartFile) paramMap.get("image_file"));
		if(imageFile != null) {
			this.execute(conn, "update driver set image_clip = ? where company = ? and id = ?", DataUtils.newParams(imageFile, paramMap.get("company"), paramMap.get("id")));
		}

		super.postMultipart(conn, paramMap, request);
	}	
}
