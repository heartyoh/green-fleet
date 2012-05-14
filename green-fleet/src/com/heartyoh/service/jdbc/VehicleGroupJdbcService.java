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
 * VehicleGroup Service
 * 
 * @author jhnam
 */
@Controller
public class VehicleGroupJdbcService extends JdbcEntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(VehicleGroupJdbcService.class);

	@RequestMapping(value = "/vehicle_group/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports("vehicle_group", request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt1 = null;
		PreparedStatement pstmt2 = null;
		Long id = DataUtils.toLong(request.getParameter("key"));
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			pstmt1 = conn.prepareStatement("delete from vehicle_relation where group_id = ?");
			pstmt1.setLong(1, id);
			pstmt1.execute();
			
			pstmt2 = conn.prepareStatement("delete from vehicle_group where id = ?");
			pstmt2.setLong(1, id);
			pstmt2.execute();
			
		} catch (Exception e) {
			logger.error("Failed to delete Vehicle Group [" + this.getCompany(request) + "," + id + "]!", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + id + "\" }";
			
		} finally {
			super.closeDB(pstmt1, pstmt2, conn);
		}		
				
		return "{ \"success\" : true, \"msg\" : \"VehicleGroup destroyed!\", \"key\" : \"" + id + "\" }";
	}

	@RequestMapping(value = {"/vehicle_group", "/m/data/vehicle_groups.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		try {
			conn = this.getConnection();
			pstmt = conn.prepareStatement("select * from vehicle_group where company = ?");
			pstmt.setString(1, this.getCompany(request));
			rs = pstmt.executeQuery();
		
			while(rs.next()) {
				Map<String, Object> record = new HashMap<String, Object>();
				record.put("key", rs.getLong("id"));
				record.put("company", rs.getString("company"));
				record.put("id", rs.getString("name"));
				record.put("desc", rs.getString("expl"));
				record.put("created_at", rs.getTimestamp("created_at"));
				record.put("updated_at", rs.getTimestamp("updated_at"));
				items.add(record);
			}
		} catch (Exception e) {
			logger.error("Failed to list Vehicle Group [" + this.getCompany(request) + "]", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return this.getResultSet(true, items.size(), items); 
	}
	
	@RequestMapping(value = "/vehicle_group/group_count" , method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> groupCount(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		Statement stmt = null;
		ResultSet rs = null;
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		try {
			conn = this.getConnection();
			stmt = conn.createStatement();
			rs = stmt.executeQuery("select vg.name, vg.expl, count(vr.group_id) from vehicle_relation vr, vehicle_group vg where vr.group_id = vg.id group by vr.group_id");
		
			while(rs.next()) {
				Map<String, Object> record = new HashMap<String, Object>();
				record.put("name", rs.getString(1));
				record.put("expl", rs.getString(2));
				record.put("count", rs.getInt(3));
				items.add(record);
			}
		} catch (Exception e) {
			logger.error("Failed to list Vehicle Group Count", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, stmt, conn);
		}
		
		return this.getResultSet(true, items.size(), items); 		
	}
	
	@RequestMapping(value = "/vehicle_group/vehicles", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveVehiclesByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		List<String> vehicleIdList = new ArrayList<String>();
		int total = 0;
		
		String company = this.getCompany(request);
		String groupName = request.getParameter("vehicle_group_id");
		String selectMode = request.getParameter("select_mode");
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		
		try {
			conn = this.getConnection();
			
			if(!DataUtils.isEmpty(selectMode) && "vehicle_id_only".equalsIgnoreCase(selectMode)) {
				pstmt = conn.prepareStatement("select vr.vehicle_id from vehicle_group vg, vehicle_relation vr where vg.id = vr.group_id and vg.company = ? and vg.name = ?");
				pstmt.setString(1, company);
				pstmt.setString(2, groupName);
				rs = pstmt.executeQuery();				
				List<String> items = new ArrayList<String>();
				
				while(rs.next()) {
					items.add(rs.getString("vehicle_id"));
				}
				
				total = vehicleIdList.size();
				return this.getResultSet(true, total, items);
				
			} else {
				pstmt = conn.prepareStatement("select count(*) from vehicle_group vg, vehicle_relation vr where vg.id = vr.group_id and vg.company = ? and vg.name = ?");
				pstmt.setString(1, company);
				pstmt.setString(2, groupName);
				rs = pstmt.executeQuery();
				
				if(rs.next()) {
					total = rs.getInt(1);
				}
				
				rs.close();
				pstmt.close();
			
				pstmt = conn.prepareStatement("select vr.vehicle_id from vehicle_group vg, vehicle_relation vr where vg.id = vr.group_id and vg.company = ? and vg.name = ? limit ?, ?");
				pstmt.setString(1, company);
				pstmt.setString(2, groupName);
				pstmt.setInt(3, (page - 1) * limit);
				pstmt.setInt(4, (page * limit));
				rs = pstmt.executeQuery();			
				
				while(rs.next()) {
					vehicleIdList.add(rs.getString("vehicle_id"));
				}
				
				List<Map<String, Object>> items = this.retrieveVehicles(company, vehicleIdList, request.getParameterValues("select"));
				return this.getResultSet(true, total, items);
			}		
		} catch (Exception e) {
			logger.error("Failed to list vehicles by vehicle group [" + groupName + "]", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}						
	}
	
	@RequestMapping(value = "/vehicle_group/find", method = RequestMethod.GET)
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
			pstmt = conn.prepareStatement("select * from vehicle_group where id = ?");
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
			logger.error("Failed to find vehicle group [" + id + "]", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + id + "\" }";
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return new ObjectMapper().writeValueAsString(result);
	}
	
	@RequestMapping(value = "/vehicle_group/save", method = RequestMethod.POST)
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
				pstmt = conn.prepareStatement("update vehicle_group set name = ?, expl = ?, updated_at = ? where id = ?");
				pstmt.setString(1, request.getParameter("id"));
				pstmt.setString(2, request.getParameter("desc"));
				pstmt.setTimestamp(3, now);
				pstmt.setLong(4, DataUtils.toLong(key));
				
			} else {
				pstmt = conn.prepareStatement("insert into vehicle_group (company, name, expl, created_at, updated_at) values (?, ?, ?, ?, ?)");
				pstmt.setString(1, this.getCompany(request));
				pstmt.setString(2, request.getParameter("id"));
				pstmt.setString(3, request.getParameter("desc"));
				pstmt.setTimestamp(4, now);
				pstmt.setTimestamp(5, now);
			}
			
			pstmt.execute();
						
		} catch (Exception e) {
			logger.error("Failed to save vehicle group", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(pstmt, conn);
		}
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save!\"}";
	}
	
	@RequestMapping(value = "/vehicle_relation/save", method = RequestMethod.POST)
	public @ResponseBody
	String saveRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt1 = null;
		PreparedStatement pstmt2 = null;
		PreparedStatement pstmt3 = null;
		ResultSet rs = null;
		
		String company = this.getCompany(request);
		String groupName = request.getParameter("vehicle_group_id");
		String[] vehicleIdArr = request.getParameterValues("vehicle_id");
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			
			pstmt1 = conn.prepareStatement("select id from vehicle_group where company = ? and name = ?");
			pstmt1.setString(1, company);
			pstmt1.setString(2, groupName);
			rs = pstmt1.executeQuery();
			long groupId = 0;
			
			if(rs.next()) {
				groupId = rs.getLong("id");
			} else {
				throw new Exception("Vehicle group name [" + groupName + "] Not Found!");
			}
			
			pstmt2 = conn.prepareStatement("delete from vehicle_relation where company = ? and group_id = ?");
			pstmt2.setString(1, company);
			pstmt2.setLong(2, groupId);
			pstmt2.execute();
			
			pstmt3 = conn.prepareStatement("insert into vehicle_relation(company, vehicle_id, group_id) values (?, ?, ?)");
			for(int i = 0 ; i < vehicleIdArr.length ; i++) {				
				pstmt3.setString(1, company);
				pstmt3.setString(2, vehicleIdArr[i]);
				pstmt3.setLong(3, groupId);
				pstmt3.addBatch();
			}
			
			pstmt3.executeBatch();
			
		} catch (Exception e) {
			logger.error("Failed to save vehicle group relation", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(rs, pstmt1, pstmt2, pstmt3, conn);
		}
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save relation!\"}";
	}
	
	@RequestMapping(value = "/vehicle_relation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String deleteRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String[] vehicleIdArr = request.getParameterValues("vehicle_id");
		
		if(vehicleIdArr == null || vehicleIdArr.length == 0)
			return "{\"success\" : false, \"msg\" : \"No vehicle selected to delete!\"}";
		
		String company = this.getCompany(request);
		String groupName = request.getParameter("vehicle_group_id");		
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			StringBuffer vehicleIds = new StringBuffer();
			for(int i = 0 ; i < vehicleIdArr.length ; i++) {
				if(i > 0)
					vehicleIds.append(",");
				
				vehicleIds.append("'").append(vehicleIdArr[i]).append("'");
			}
			
			pstmt = conn.prepareStatement("delete from vehicle_relation where company = ? and group_id = (select id from vehicle_group where company = ? and name = ?) and vehicle_id in (" + vehicleIds.toString() + ")");
			pstmt.setString(1, company);
			pstmt.setString(2, company);
			pstmt.setString(3, groupName);
			pstmt.execute();
			
		} catch (Exception e) {
			logger.error("Failed to delete vehicle relation", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(pstmt, conn);
		}		
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to delete relation!\"}";
	}
	
	/**
	 * vehicleIdList내에 포함된 vehicleId로 실제 vehicle을 조회 
	 * 
	 * @param company
	 * @param vehicleIdList
	 * @param selects
	 * @return
	 * @throws Exception
	 */
	private List<Map<String, Object>> retrieveVehicles(String company, List<String> vehicleIdList, String[] selects) throws Exception {
		
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		if(!vehicleIdList.isEmpty()) {
			Key companyKey = KeyFactory.createKey("Company", company);
			
			if(!vehicleIdList.isEmpty()) {
				Iterator<Entity> vehilces = 
						DatastoreUtils.findEntities(companyKey, "Vehicle", DataUtils.newMap("id", vehicleIdList));
				while (vehilces.hasNext()) {
					Entity vehicle = vehilces.next();
					items.add(SessionUtils.cvtEntityToMap(vehicle, selects));
				}
			}
		}
		
		return items;
	}
}
