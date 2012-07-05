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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

public class VehicleGroupJdbcService extends JdbcEntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(VehicleGroupJdbcService.class);
	/**
	 * key names
	 */
	private static final String TABLE_NAME = "vehicle_group";	
	
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

	@RequestMapping(value = "/vehicle_group/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);
		String id = request.getParameter("id");
		Connection conn = null;
		
		try {
			conn = this.getConnection();
			Map<Integer, Object> params = DataUtils.newParams(this.getCompany(request), id);
			super.execute(conn, "delete from vehicle_relation where company = ? and group_id = ?", params);
			super.execute(conn, "delete from vehicle_group where company = ? and id = ?", params);
			
		} catch(Exception e) {
			logger.error("Failed to delete vehicle group [" + id + "]", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + id + "\" }";
			
		} finally {
			super.closeDB(conn);
		}
				
		return "{ \"success\" : true, \"msg\" : \"Vehicle Group destroyed!\", \"key\" : \"" + id + "\" }";
	}

	@RequestMapping(value = {"/vehicle_group", "/m/data/vehicle_groups.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, Object> queryParams = DataUtils.newMap("company", this.getCompany(request));
		return super.retrieve(false, queryParams, request, response);			
	}
	
	@RequestMapping(value = "/vehicle_group/group_count" , method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> groupCount(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String query = "select vg.id, vg.expl, count(vr.group_id) count from vehicle_relation vr, vehicle_group vg where vg.company = '" + this.getCompany(request) + "' and vr.group_id = vg.id group by vr.group_id";
		
		try {
			List<Map<String, Object>> items = this.executeQuery(query, null);
			return this.getResultSet(true, items.size(), items);
			
		} catch (Exception e) {
			return this.getResultSet(false, 0, null);			
		} 
	}
	
	@RequestMapping(value = "/vehicle_group/vehicles", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieveVehiclesByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String selectMode = request.getParameter("select_mode");
		String groupId = request.getParameter("vehicle_group_id");
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));

		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		
		try {
			conn = this.getConnection();
			
			if(!DataUtils.isEmpty(selectMode) && "vehicle_id_only".equalsIgnoreCase(selectMode)) {
				pstmt = conn.prepareStatement("select vehicle_id from vehicle_relation where company = ? and group_id = ?");
				pstmt.setString(1, company);
				pstmt.setString(2, groupId);
				rs = pstmt.executeQuery();				
				List<String> items = new ArrayList<String>();
				
				while(rs.next()) {
					items.add(rs.getString("vehicle_id"));
				}
				
				return this.getResultSet(true, items.size(), items);
				
			} else {
				String query = "select count(*) from vehicle_relation where company = ? and group_id = ?";
				Map<Integer, Object> params = DataUtils.newParams(company, groupId);
				int total = super.count(query, params);
				
				pstmt = conn.prepareStatement("select vehicle_id from vehicle_relation where company = ? and group_id = ? limit ?, ?");
				pstmt.setString(1, company);
				pstmt.setString(2, groupId);
				pstmt.setInt(3, (page - 1) * limit);
				pstmt.setInt(4, (page * limit));
				rs = pstmt.executeQuery();
				List<String> vehicleIdList = new ArrayList<String>();
				
				while(rs.next()) {
					vehicleIdList.add(rs.getString("vehicle_id"));
				}
				
				List<Map<String, Object>> items = this.retrieveVehicles(company, vehicleIdList, request.getParameterValues("select"));
				return this.getResultSet(true, total, items);
			}	
		} catch (Exception e) {
			logger.error("Failed to list vehicles by vehicle group [" + groupId + "]", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}						
	}
	
	@RequestMapping(value = "/vehicle_group/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.find(request, response);	
	}
	
	@RequestMapping(value = "/vehicle_group/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);		
	}
	
	@RequestMapping(value = "/vehicle_relation/save", method = RequestMethod.POST)
	public @ResponseBody
	String saveRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String[] vehicleIdArr = request.getParameterValues("vehicle_id");
		
		if(vehicleIdArr == null || vehicleIdArr.length == 0)
			return "{\"success\" : false, \"msg\" : \"No vehicle selected to save!\"}";
		
		String company = this.getCompany(request);
		String groupId = request.getParameter("vehicle_group_id");		
		response.setContentType(CONTENT_TYPE);

		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		
		try {
			conn = this.getConnection();
			// TODO 이미 있는 Relation 정보면 insert문에서 제외 필요 
			pstmt = conn.prepareStatement("insert into vehicle_relation(company, vehicle_id, group_id) values (?, ?, ?)");
			for(int i = 0 ; i < vehicleIdArr.length ; i++) {				
				pstmt.setString(1, company);
				pstmt.setString(2, vehicleIdArr[i]);
				pstmt.setString(3, groupId);
				pstmt.addBatch();
			}			
			pstmt.executeBatch();
			
		} catch (Exception e) {
			logger.error("Failed to save vehicle group relation", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}		
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save relation!\"}";		
	}
	
	@RequestMapping(value = "/vehicle_relation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String deleteRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
				
		response.setContentType(CONTENT_TYPE);
		String[] vehicleIdArr = request.getParameterValues("vehicle_id");
		
		if(vehicleIdArr == null || vehicleIdArr.length == 0)
			return "{\"success\" : false, \"msg\" : \"No vehicle selected to delete!\"}";
		
		try {
			String vehicleIds = DataUtils.concat(vehicleIdArr, "'", "'", ",");
			Map<Integer, Object> params = DataUtils.newParams(this.getCompany(request), request.getParameter("vehicle_group_id"));
			String query = "delete from vehicle_relation where company = ? and group_id = ? and vehicle_id in (" + vehicleIds + ")";
			super.execute(query, params);
			
		} catch (Exception e) {
			logger.error("Failed to delete vehicle relation", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";			
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
