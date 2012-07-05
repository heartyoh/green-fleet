/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.util.DataUtils;

/**
 * Alarm Service
 * 
 * @author jhnam
 */

public class AlarmJdbcService extends JdbcEntityService {
	
	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(AlarmJdbcService.class);
	/**
	 * key names
	 */
	private static final String TABLE_NAME = "alarm";
	
	@Override
	protected String getTableName() {
		return TABLE_NAME;
	}
	
	@Override
	protected Map<String, String> getColumnSvcFieldMap() {
		return null;
	}

	@RequestMapping(value = "/alarm/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/alarm/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);
		String company = this.getCompany(request);
		String name = request.getParameter("name");		
		Connection conn = null;
		
		try {
			conn = this.getConnection();
			Map<Integer, Object> params = DataUtils.newParams(company, name);
			// 1. alarm 삭제 
			super.execute(conn, "delete from alarm where company = ? and name = ?", params);
			
			// 2. alarm & vehicle relation 삭제 
			super.execute(conn, "delete from alarm_vehicle_relation where company = ? and alarm_name = ?", params);
						
		} catch (Exception e) {
			logger.error("Failed to delete alarm [" + name + "]", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + name + "\" }";
			
		} finally {
			super.closeDB(conn);
		}		
				
		return "{ \"success\" : true, \"msg\" : \"Alarm destroyed!\", \"key\" : \"" + name + "\" }";
	}

	@RequestMapping(value = {"/alarm", "/m/data/alarm.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> params = super.parseFilters(request.getParameter("filter"));
		params.put("company", this.getCompany(request));		
		return super.retrieve(false, params, request, response);		
	}
	
	@RequestMapping(value = "/alarm/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);
		String company = this.getCompany(request);
		String name = request.getParameter("name");
		Connection conn = null;
		
		try {
			conn = this.getConnection();

			Map<Integer, Object> params = DataUtils.newParams(company, name);
			String query = "select * from alarm where company = ? and name = ?";
			Map<String, Object> record = this.executeSingleQuery(conn, query, params);
						
			if(record.isEmpty()) {
				return "{ \"success\" : false, \"msg\" : \"Not found alarm!\", \"key\" : \"" + name + "\" }";
			}
			
			query = "select vehicle_id from alarm_vehicle_relation where company = ? and alarm_name = ?";
			List<Map<String, Object>> vehicleIds = this.executeQuery(conn, query, params);				
			StringBuffer vehicleIdStr = new StringBuffer();
			int idx = 0;
			
			for(Map<String, Object> vehicleMap : vehicleIds)
				vehicleIdStr.append(idx++ == 0 ? "" : ",").append(vehicleMap.get("vehicle_id"));
			
			record.put("vehicles", vehicleIdStr.toString());
			record.put("success", true);
			return new ObjectMapper().writeValueAsString(record);
			
		} catch (Exception e) {
			logger.error("Failed to find alarm [" + name + "]", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + name + "\" }";
			
		} finally {
			super.closeDB(conn);
		}		
	}
	
	@RequestMapping(value = "/alarm/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		PreparedStatement pstmt2 = null;
		PreparedStatement pstmt3 = null;
		ResultSet rs = null;
		String company = this.getCompany(request);
		String name = request.getParameter("name");
		java.sql.Timestamp now = new java.sql.Timestamp(new java.util.Date().getTime());
		response.setContentType(CONTENT_TYPE);
		
		try {
			conn = this.getConnection();
			
			// 1. create || update mode 체크 
			pstmt = conn.prepareStatement("select count(*) from alarm where company = ? and name = ?");
			pstmt.setString(1, this.getCompany(request));
			pstmt.setString(2, name);
			rs = pstmt.executeQuery();
		
			boolean createMode = true;
			if(rs.next()) {
				int count = rs.getInt(1);
				if(count > 0)
					createMode = false;
			}
			
			String fromDateStr = request.getParameter("from_date");
			String toDateStr = request.getParameter("to_date");
			
			Date fromUtilDate = DataUtils.isEmpty(fromDateStr) ? null : DataUtils.toDate(fromDateStr);
			Date toUtilDate = DataUtils.isEmpty(fromDateStr) ? null : DataUtils.toDate(toDateStr);
			
			java.sql.Date fromDate = fromUtilDate == null ? null : new java.sql.Date(fromUtilDate.getTime());
			java.sql.Date toDate = toUtilDate == null ? null : new java.sql.Date(toUtilDate.getTime());
			
			// 2. alarm 생성 || 수정 
			if(!createMode) {
				pstmt = conn.prepareStatement("update alarm set type = ?, evt_type = ?, evt_name = ?, evt_trg = ?, always = ?, enabled = ?, from_date = ?, to_date = ?, dest = ?, msg = ?, updated_at = ? where company = ? and name = ?");				
				pstmt.setString(1, request.getParameter("type"));
				pstmt.setString(2, request.getParameter("evt_type"));
				pstmt.setString(3, request.getParameter("evt_name"));
				pstmt.setString(4, request.getParameter("evt_trg"));
				pstmt.setBoolean(5, DataUtils.toBool(request.getParameter("always")));
				pstmt.setBoolean(6, DataUtils.toBool(request.getParameter("enabled")));
				pstmt.setDate(7, fromDate);
				pstmt.setDate(8, toDate);
				pstmt.setString(9, request.getParameter("dest"));
				pstmt.setString(10, request.getParameter("msg"));
				pstmt.setTimestamp(11, now);
				pstmt.setString(12, company);
				pstmt.setString(13, name);
				
			} else {
				pstmt = conn.prepareStatement("insert into alarm(company, name, type, evt_type, evt_name, evt_trg, always, enabled, from_date, to_date, dest, msg, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
				pstmt.setString(1, company);
				pstmt.setString(2, name);
				pstmt.setString(3, request.getParameter("type"));
				pstmt.setString(4, request.getParameter("evt_type"));
				pstmt.setString(5, request.getParameter("evt_name"));
				pstmt.setString(6, request.getParameter("evt_trg"));
				pstmt.setBoolean(7, DataUtils.toBool(request.getParameter("always")));
				pstmt.setBoolean(8, DataUtils.toBool(request.getParameter("enabled")));
				pstmt.setDate(9, fromDate);
				pstmt.setDate(10, toDate);
				pstmt.setString(11, request.getParameter("dest"));
				pstmt.setString(12, request.getParameter("msg"));
				pstmt.setTimestamp(13, now);
				pstmt.setTimestamp(14, now);
			}
			
			pstmt.execute();
			
			// 3. alarm & vehicle relation 삭제  
			pstmt2 = conn.prepareStatement("delete from alarm_vehicle_relation where company = ? and alarm_name = ?");
			pstmt2.setString(1, company);
			pstmt2.setString(2, name);
			pstmt2.execute();
		
			String[] vehicles = DataUtils.isEmpty(request.getParameter("vehicles")) ? null : request.getParameter("vehicles").split(",");

			// 4. alarm & vehicle relation 생성 			
			if(!DataUtils.isEmpty(vehicles)) {
				pstmt3 = conn.prepareStatement("insert into alarm_vehicle_relation(company, alarm_name, vehicle_id) values (?, ?, ?)");
				
				for(int i = 0 ; i < vehicles.length ; i++) {
					 pstmt3.setString(1, company);
					 pstmt3.setString(2, name);
					 pstmt3.setString(3, vehicles[i]);
					 pstmt3.addBatch();
				}
				
				pstmt3.executeBatch();
			}
				
		} catch (Exception e) {
			logger.error("Failed to save alarm [" + name + "]", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(rs, pstmt, pstmt2, pstmt3, conn);			
		}
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save!\"}";
	}
}
