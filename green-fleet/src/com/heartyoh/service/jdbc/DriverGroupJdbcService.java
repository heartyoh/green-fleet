/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
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
		
		Connection conn = null;
		PreparedStatement pstmt1 = null;
		PreparedStatement pstmt2 = null;
		Long id = DataUtils.toLong(request.getParameter("key"));
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			pstmt1 = conn.prepareStatement("delete from driver_relation where group_id = ?");
			pstmt1.setLong(1, id);
			pstmt1.execute();
			
			pstmt2 = conn.prepareStatement("delete from driver_group where id = ?");
			pstmt2.setLong(1, id);
			pstmt2.execute();
			
		} catch (Exception e) {
			logger.error("Failed to delete Driver Group [" + this.getCompany(request) + "," + id + "]!", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + id + "\" }";
			
		} finally {
			super.closeDB(pstmt1, pstmt2, conn);
		}		
				
		return "{ \"success\" : true, \"msg\" : \"DriverGroup destroyed!\", \"key\" : \"" + id + "\" }";
	}

	@RequestMapping(value = {"/driver_group", "/m/data/driver_group.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		try {
			conn = this.getConnection();
			pstmt = conn.prepareStatement("select * from driver_group where company = ?");
			pstmt.setString(1, this.getCompany(request));
			rs = pstmt.executeQuery();		
		
			while(rs.next()) {
				Map<String, Object> record = new HashMap<String, Object>();				
				record.put("key", rs.getLong("id"));
				record.put("id", rs.getString("name"));
				record.put("desc", rs.getString("expl"));
				record.put("created_at", rs.getTimestamp("created_at"));
				record.put("updated_at", rs.getTimestamp("updated_at"));
				items.add(record);
			}
		} catch (Exception e) {
			logger.error("Failed to list Driver Group [" + this.getCompany(request) + "]", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return this.getResultSet(true, items.size(), items); 
	}
	
	@RequestMapping(value = "/driver_group/drivers", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveDriversByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		List<Map<String, Object>> items = null;		
		List<String> driverIdList = new ArrayList<String>();		
		int total = 0;
		
		String company = this.getCompany(request);
		String groupName = request.getParameter("driver_group_id");
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		
		try {
			conn = this.getConnection();
			pstmt = conn.prepareStatement("select count(*) from driver_group vg, driver_relation vr where vg.id = vr.group_id and vg.company = ? and vg.name = ?");
			pstmt.setString(1, company);
			pstmt.setString(2, groupName);			
			rs = pstmt.executeQuery();
			if(rs.next()) {
				total = rs.getInt(1);
			}
			
			rs.close();
			pstmt.close();			
			
			pstmt = conn.prepareStatement("select vr.driver_id from driver_group vg, driver_relation vr where vg.id = vr.group_id and vg.company = ? and vg.name = ? limit ?, ?");
			pstmt.setString(1, company);
			pstmt.setString(2, groupName);
			pstmt.setInt(3, (page - 1) * limit);
			pstmt.setInt(4, (page * limit));
			rs = pstmt.executeQuery();			
			
			while(rs.next()) {
				driverIdList.add(rs.getString("driver_id"));
			}
						
		} catch (Exception e) {
			logger.error("Failed to list drivers by driver group [" + groupName + "]", e);
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
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		Long id = DataUtils.toLong(request.getParameter("key"));
		Map<String, Object> result = new HashMap<String, Object>();
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			pstmt = conn.prepareStatement("select * from driver_group where id = ?");
			pstmt.setLong(1, id);
			rs = pstmt.executeQuery();
		
			while(rs.next()) {
				result.put("key", rs.getLong("id"));
				result.put("company", rs.getString("company"));
				result.put("id", rs.getString("name"));
				result.put("desc", rs.getString("expl"));
				result.put("created_at", rs.getTimestamp("created_at"));
				result.put("updated_at", rs.getTimestamp("updated_at"));
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
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		String key = request.getParameter("key");
		java.sql.Timestamp now = new java.sql.Timestamp(new java.util.Date().getTime());
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			
			if(!DataUtils.isEmpty(key)) {
				pstmt = conn.prepareStatement("update driver_group set name = ?, expl = ?, updated_at = ? where id = ?");
				pstmt.setString(1, request.getParameter("id"));
				pstmt.setString(2, request.getParameter("desc"));
				pstmt.setTimestamp(3, now);
				pstmt.setLong(4, DataUtils.toLong(key));
				
			} else {
				pstmt = conn.prepareStatement("insert into driver_group(company, name, expl, created_at, updated_at) values (?, ?, ?, ?, ?)");
				pstmt.setString(1, this.getCompany(request));
				pstmt.setString(2, request.getParameter("id"));
				pstmt.setString(3, request.getParameter("desc"));
				pstmt.setTimestamp(4, now);
				pstmt.setTimestamp(5, now);
			}
			
			pstmt.execute();
						
		} catch (Exception e) {
			logger.error("Failed to save driver group", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(pstmt, conn);
		}
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save!\"}";
	}
	
	@RequestMapping(value = "/driver_relation/save", method = RequestMethod.POST)
	public @ResponseBody
	String saveRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt1 = null;
		PreparedStatement pstmt2 = null;
		PreparedStatement pstmt3 = null;
		ResultSet rs = null;
		
		String company = this.getCompany(request);
		String groupName = request.getParameter("driver_group_id");
		String[] driverIdArr = request.getParameterValues("driver_id");
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			
			pstmt1 = conn.prepareStatement("select id from driver_group where company = ? and name = ?");
			pstmt1.setString(1, company);
			pstmt1.setString(2, groupName);
			rs = pstmt1.executeQuery();
			long groupId = 0;
			
			if(rs.next()) {
				groupId = rs.getLong("id");
			} else {
				throw new Exception("Vehicle group name [" + groupName + "] Not Found!");
			}
			
			pstmt2 = conn.prepareStatement("delete from driver_relation where company = ? and group_id = ?");
			pstmt2.setString(1, company);
			pstmt2.setLong(2, groupId);
			pstmt2.execute();
			
			pstmt3 = conn.prepareStatement("insert into driver_relation(company, driver_id, group_id) values (?, ?, ?)");
			for(int i = 0 ; i < driverIdArr.length ; i++) {				
				pstmt3.setString(1, company);
				pstmt3.setString(2, driverIdArr[i]);
				pstmt3.setLong(3, groupId);
				pstmt3.addBatch();
			}
			
			pstmt3.executeBatch();
			
		} catch (Exception e) {
			logger.error("Failed to save driver group relation", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(rs, pstmt1, pstmt2, pstmt3, conn);
		}		
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save relation!\"}";
	}
	
	@RequestMapping(value = "/driver_relation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String deleteRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String[] driverIdArr = request.getParameterValues("driver_id");
		
		if(driverIdArr == null || driverIdArr.length == 0)
			return "{\"success\" : false, \"msg\" : \"No driver selected to delete!\"}";
		
		String company = this.getCompany(request);
		String groupName = request.getParameter("driver_group_id");		
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			StringBuffer driverIds = new StringBuffer();
			for(int i = 0 ; i < driverIdArr.length ; i++) {
				if(i > 0)
					driverIds.append(",");
				
				driverIds.append("'").append(driverIdArr[i]).append("'");
			}
			
			pstmt = conn.prepareStatement("delete from driver_relation where company = ? and group_id = (select id from driver_group where company = ? and name = ?) and driver_id in (" + driverIds.toString() + ")");
			pstmt.setString(1, company);
			pstmt.setString(2, company);
			pstmt.setString(3, groupName);
			pstmt.execute();
			
		} catch (Exception e) {
			logger.error("Failed to delete driver relation", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(pstmt, conn);
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
