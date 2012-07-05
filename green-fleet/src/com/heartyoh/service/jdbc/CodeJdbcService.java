	/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.Sorter;

/**
 * Code Service
 * 
 * @author jhnam
 */

public class CodeJdbcService extends JdbcEntityService {
	
	/**
	 * key names
	 */
	private static final String TABLE_NAME = "common_code";
	
	/**
	 * table column - service field map
	 */
	private static Map<String, String> COLUMN_SVC_FIELD_MAP;
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {
		
		if(COLUMN_SVC_FIELD_MAP == null) {
			COLUMN_SVC_FIELD_MAP = new HashMap<String, String>();
			COLUMN_SVC_FIELD_MAP.put("code_group", "group");
			COLUMN_SVC_FIELD_MAP.put("expl", "desc");
		}
		
		return COLUMN_SVC_FIELD_MAP;
	}

	@RequestMapping(value = "/code/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/code/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/code/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.find(request, response);
	}
	
	@RequestMapping(value = "/code/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
		
	@RequestMapping(value = {"/code", "/m/data/code.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		Map<String, Object> params = super.parseFilters(request.getParameter("filter"));
		params.put("company", this.getCompany(request));
		return super.retrieve(false, params, request, response);
	}
	
	@Override
	protected List<Sorter> parseSorters(String sorterStr) throws Exception {

		if (sorterStr == null)
			return null;

		List<Sorter> sorters = new ObjectMapper().readValue(sorterStr, new TypeReference<List<Sorter>>() {});
		
		for(Sorter sorter : sorters) {
			if("group".equalsIgnoreCase(sorter.getProperty())) {
				sorter.setProperty("code_group");
			}
		}
		
		return sorters;
	}	
	
}
