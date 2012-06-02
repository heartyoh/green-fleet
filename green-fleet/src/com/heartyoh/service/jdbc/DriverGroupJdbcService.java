/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.util.DataUtils;

/**
 * Driver Group, Driver & Driver Group Relation Service
 * 
 * @author jhnam
 */

public class DriverGroupJdbcService extends JdbcEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(DriverGroupJdbcService.class);	
	/**
	 * key names
	 */
	private static final String TABLE_NAME = "driver_group";
	
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
			COLUMN_SVC_FIELD_MAP.put("expl", "desc");
		}
		
		return COLUMN_SVC_FIELD_MAP;
	}

	@RequestMapping(value = "/driver_group/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}

	@RequestMapping(value = {"/driver_group", "/m/data/driver_group.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		Map<String, Object> params = super.parseFilters(request.getParameter("filter"));
		params.put("company", this.getCompany(request));
		return super.retrieve(false, params, request, response);		
	}
	
	@RequestMapping(value = "/driver_group/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}

	@RequestMapping(value = "/driver_group/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/driver_group/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);
		String id = request.getParameter("id");		
		Connection conn = null;
		
		try {
			conn = this.getConnection();
			Map<Integer, Object> params = DataUtils.newParams(this.getCompany(request), id);
			super.execute(conn, "delete from driver_relation where company = ? and group_id = ?", params);
			super.execute(conn, "delete from driver_group where company = ? and id = ?", params);
			
		} catch(Exception e) {
			logger.error("Failed to delete driver group [" + id + "]", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + id + "\" }";
			
		} finally {
			super.closeDB(conn);
		}
				
		return "{ \"success\" : true, \"msg\" : \"Driver Group destroyed!\", \"key\" : \"" + id + "\" }";
	}
	
	@RequestMapping(value = "/driver_group/group_count" , method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> groupCount(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		try {
			String query = "select vg.id, vg.expl, count(vr.group_id) count from driver_relation vr, driver_group vg where vg.company = '" + this.getCompany(request) + "' and vr.group_id = vg.id group by vr.group_id";
			List<Map<String, Object>> items = super.executeQuery(query, null);
			return this.getResultSet(true, items.size(), items);
			
		} catch (Exception e) {
			return this.getResultSet(false, 0, null);
		}
	}	
	
	@RequestMapping(value = "/driver_group/drivers", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveDriversByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String groupId = request.getParameter("driver_group_id");
		Connection conn = null;
		
		try {
			conn = this.getConnection();
			int[] startLimit = this.getStartLimitCount(request);
			Map<Integer, Object> params = DataUtils.newParams(company, groupId);
			String query = "select count(*) from driver_relation where company = ? and group_id = ?";
			int total = super.count(conn, query, params);
			
			params.put(3, startLimit[0]);
			params.put(4, startLimit[1]);
			query = "select d.* from driver d, driver_relation dr where d.id = dr.driver_id and dr.company = ? and dr.group_id = ? order by d.id asc limit ?, ?";
			List<Map<String, Object>> items = super.executeQuery(conn, query, params);
			return this.getResultSet(true, total, items);
			
		} catch (Exception e) {
			logger.error("Failed to list drivers by driver group [" + groupId + "]", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(conn);
		}		
	}
	
	@RequestMapping(value = "/driver_relation/save", method = RequestMethod.POST)
	public @ResponseBody
	String saveRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String[] driverIdArr = request.getParameterValues("driver_id");
		
		if(driverIdArr == null || driverIdArr.length == 0)
			return "{\"success\" : false, \"msg\" : \"No driver selected to save!\"}";
		
		String company = this.getCompany(request);
		String groupId = request.getParameter("driver_group_id");		
		response.setContentType(CONTENT_TYPE);

		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		
		try {
			conn = this.getConnection();
			// TODO 이미 있는 Relation 정보면 insert문에서 제외 필요 
			pstmt = conn.prepareStatement("insert into driver_relation(company, driver_id, group_id) values (?, ?, ?)");
			for(int i = 0 ; i < driverIdArr.length ; i++) {				
				pstmt.setString(1, company);
				pstmt.setString(2, driverIdArr[i]);
				pstmt.setString(3, groupId);
				pstmt.addBatch();
			}			
			pstmt.executeBatch();
			
		} catch (Exception e) {
			logger.error("Failed to save driver group relation", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}		
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save relation!\"}";
	}
	
	@RequestMapping(value = "/driver_relation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String deleteRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);
		String[] driverIdArr = request.getParameterValues("driver_id");
		
		if(driverIdArr == null || driverIdArr.length == 0)
			return "{\"success\" : false, \"msg\" : \"No driver selected to delete!\"}";
		
		try {
			String driverIds = DataUtils.concat(driverIdArr, "'", "'", ",");
			Map<Integer, Object> params = DataUtils.newParams(this.getCompany(request), request.getParameter("driver_group_id"));
			String query = "delete from driver_relation where company = ? and group_id = ? and driver_id in (" + driverIds + ")";
			super.execute(query, params);
			
		} catch (Exception e) {
			logger.error("Failed to delete driver relation", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";			
		} 	
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to delete relation!\"}";
	}
}
