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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.util.DataUtils;

/**
 * Terminal Service
 * 
 * @author jhnam
 */
@Controller
public class TerminalJdbcService extends JdbcEntityService {
	/**
	 * key names
	 */
	private static final String TABLE_NAME = "terminal";
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {		
		return null;
	}

	@RequestMapping(value = "/terminal/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/terminal/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = {"/terminal", "/m/data/terminal.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.retrieve(true, DataUtils.newMap("company", this.getCompany(request)), request, response);
	}
	
	@RequestMapping(value = "/terminal/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@RequestMapping(value = "/terminal/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
	@Override
	protected void postMultipart (Connection conn, Map<String, Object> paramMap, MultipartHttpServletRequest request) throws Exception {
		
		String imageFile = super.saveFile(request, (MultipartFile) paramMap.get("image_file"));
		if(imageFile != null) {
			this.execute(conn, "update terminal set image_clip = ? where company = ? and id = ?", DataUtils.newParams(imageFile, paramMap.get("company"), paramMap.get("id")));
		}

		super.postMultipart(conn, paramMap, request);
	}
}
