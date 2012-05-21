/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
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

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

/**
 * @author jhnam
 *
 */
@Controller
public class DriverGroupJdbcService extends JdbcEntityService {

	private static final Logger logger = LoggerFactory.getLogger(DriverGroupJdbcService.class);
	
	@RequestMapping(value = "/driver_group/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports("driver_group", request, response);
	}
	
	@RequestMapping(value = "/driver_group/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String id = request.getParameter("key");		
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

	@RequestMapping(value = {"/driver_group", "/m/data/driver_group.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		String company = this.getCompany(request);
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		try {
			conn = this.getConnection();
			pstmt = conn.prepareStatement("select * from driver_group where company = ?");
			pstmt.setString(1, company);
			rs = pstmt.executeQuery();		
		
			while(rs.next()) {
				Map<String, Object> record = new HashMap<String, Object>();
				String id = rs.getString("id");
				record.put("key", id);
				record.put("id", id);
				record.put("desc", rs.getString("expl"));
				record.put("created_at", rs.getTimestamp("created_at"));
				record.put("updated_at", rs.getTimestamp("updated_at"));
				items.add(record);
			}
		} catch (Exception e) {
			logger.error("Failed to list Driver Group [" + company + "]", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return this.getResultSet(true, items.size(), items); 
	}
	
	@RequestMapping(value = "/driver_group/group_count" , method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> groupCount(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		Statement stmt = null;
		ResultSet rs = null;
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		try {
			conn = this.getConnection();
			stmt = conn.createStatement();
			rs = stmt.executeQuery("select vg.id, vg.expl, count(vr.group_id) from driver_relation vr, driver_group vg where vg.company = '" + this.getCompany(request) + "' and vr.group_id = vg.id group by vr.group_id");
		
			while(rs.next()) {
				Map<String, Object> record = new HashMap<String, Object>();
				record.put("id", rs.getString(1));
				record.put("expl", rs.getString(2));
				record.put("count", rs.getInt(3));
				items.add(record);
			}
		} catch (Exception e) {
			logger.error("Failed to list Driver Group Count", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, stmt, conn);
		}
		
		return this.getResultSet(true, items.size(), items); 		
	}	
	
	@RequestMapping(value = "/driver_group/drivers", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveDriversByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String groupId = request.getParameter("driver_group_id");
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		int total = 0;
		List<Map<String, Object>> items = null;
		List<String> driverIdList = new ArrayList<String>();

		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		
		try {
			conn = this.getConnection();
			String query = "select count(*) from driver_relation where company = ? and group_id = ?";
			Map<Integer, Object> params = DataUtils.newParams(company, groupId);
			total = super.count(query, params);
			
			pstmt = conn.prepareStatement("select driver_id from driver_relation where company = ? and group_id = ? limit ?, ?");
			pstmt.setString(1, company);
			pstmt.setString(2, groupId);
			pstmt.setInt(3, (page - 1) * limit);
			pstmt.setInt(4, (page * limit));
			rs = pstmt.executeQuery();
			
			while(rs.next()) {
				driverIdList.add(rs.getString("driver_id"));
			}
						
		} catch (Exception e) {
			logger.error("Failed to list drivers by driver group [" + groupId + "]", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		items = this.retrieveDrivers(company, driverIdList, request.getParameterValues("select"));
		return this.getResultSet(true, total, items);
	}
	
	@RequestMapping(value = "/driver_group/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String company = this.getCompany(request);
		String id = request.getParameter("key");
		Map<String, Object> result = new HashMap<String, Object>();		
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;		
		
		try {
			conn = this.getConnection();
			pstmt = conn.prepareStatement("select * from driver_group where company = ? and id = ?");
			pstmt.setString(1, company);
			pstmt.setString(2, id);
			rs = pstmt.executeQuery();
		
			while(rs.next()) {
				result.put("key", id);
				result.put("id", id);
				result.put("desc", rs.getString("expl"));
				result.put("created_at", rs.getTimestamp("created_at"));
				result.put("updated_at", rs.getTimestamp("updated_at"));
				result.put("success", true);
			}

		} catch (Exception e) {
			logger.error("Failed to find driver group [" + id + "]", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + id + "\" }";
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return new ObjectMapper().writeValueAsString(result);
	}
	
	@RequestMapping(value = "/driver_group/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
				
		String company = this.getCompany(request);
		String id = request.getParameter("key");		
		java.sql.Timestamp now = new java.sql.Timestamp(new java.util.Date().getTime());
		response.setContentType("text/html; charset=UTF-8");
		Connection conn = null;
		
		try {
			conn = this.getConnection();			
			
			if(!DataUtils.isEmpty(id)) {
				Map<Integer, Object> params = DataUtils.newParams(request.getParameter("desc"), now, company, id);
				this.execute("update driver_group set expl = ?, updated_at = ? where company = ? and id = ?", params);
				
			} else {
				Map<Integer, Object> params = DataUtils.newParams(company, request.getParameter("id"), request.getParameter("desc"), now, now);
				this.execute("insert into driver_group(company, id, expl, created_at, updated_at) values (?, ?, ?, ?, ?)", params);				
			}			
						
		} catch (Exception e) {
			logger.error("Failed to save driver group", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(conn);
		}
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save!\"}";
	}
	
	@RequestMapping(value = "/driver_relation/save", method = RequestMethod.POST)
	public @ResponseBody
	String saveRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String[] driverIdArr = request.getParameterValues("driver_id");
		
		if(driverIdArr == null || driverIdArr.length == 0)
			return "{\"success\" : false, \"msg\" : \"No driver selected to save!\"}";
		
		String company = this.getCompany(request);
		String groupId = request.getParameter("driver_group_id");		
		response.setContentType("text/html; charset=UTF-8");

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
		
		response.setContentType("text/html; charset=UTF-8");
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
	
	/**
	 * driverIdList내에 포함된 driverId로 실제 driver를 조회 
	 * 
	 * @param company
	 * @param driverIdList
	 * @param selects
	 * @return
	 * @throws Exception
	 */
	private List<Map<String, Object>> retrieveDrivers(String company, List<String> driverIdList, String[] selects) throws Exception {
		
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		if(!driverIdList.isEmpty()) {
			Key companyKey = KeyFactory.createKey("Company", company);
			
			if(!driverIdList.isEmpty()) {
				Iterator<Entity> drivers = 
						DatastoreUtils.findEntities(companyKey, "Driver", DataUtils.newMap("id", driverIdList));
				while (drivers.hasNext()) {
					Entity vehicle = drivers.next();
					items.add(SessionUtils.cvtEntityToMap(vehicle, selects));
				}
			}
		}
		
		return items;
	}
}
