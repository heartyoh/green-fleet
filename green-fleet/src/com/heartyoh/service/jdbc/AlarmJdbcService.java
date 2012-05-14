/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;

/**
 * Alarm Service
 * 
 * @author jhnam
 */
@Controller
public class AlarmJdbcService extends JdbcEntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(AlarmJdbcService.class);

	@RequestMapping(value = "/alarm/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports("alarm", request, response);
	}
	
	@RequestMapping(value = "/alarm/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt1 = null;
		PreparedStatement pstmt2 = null;
		String company = this.getCompany(request);
		String name = request.getParameter("name");
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			
			// 1. alarm 삭제 
			pstmt1 = conn.prepareStatement("delete from alarm where company = ? and name = ?");
			pstmt1.setString(1, company);
			pstmt1.setString(2, name);
			pstmt1.execute();
			
			// 2. alarm & vehicle relation 삭제 
			pstmt2 = conn.prepareStatement("delete from alarm_vehicle_relation where company = ? and alarm_name = ?");
			pstmt2.setString(1, company);
			pstmt2.setString(2, name);
			pstmt2.execute();
			
			// 3. lba status 삭제
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			this.deleteLbaStatus(datastore, company, name);			
			
		} catch (Exception e) {
			logger.error("Failed to delete alarm [" + name + "]", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + name + "\" }";
			
		} finally {
			super.closeDB(pstmt1, pstmt2, conn);
		}		
				
		return "{ \"success\" : true, \"msg\" : \"Alarm destroyed!\", \"key\" : \"" + name + "\" }";
	}

	@RequestMapping(value = {"/alarm", "/m/data/alarm.json"}, method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		
		int total = 0;
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		String company = this.getCompany(request);
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		
		try {
			conn = this.getConnection();
			pstmt = conn.prepareStatement("select count(*) from alarm where company = ?");
			pstmt.setString(1, company);
			rs = pstmt.executeQuery();
			if(rs.next()) {
				total = rs.getInt(1);
			}
			
			rs.close();
			pstmt.close();
			
			pstmt = conn.prepareStatement("select * from alarm where company = ? limit ?, ?");
			pstmt.setString(1, company);
			pstmt.setInt(2, (page - 1) * limit);
			pstmt.setInt(3, page * limit);
			rs = pstmt.executeQuery();
		
			while(rs.next()) {
				Map<String, Object> record = new HashMap<String, Object>();
				record.put("name", rs.getString("name"));
				record.put("type", rs.getString("type"));
				record.put("evt_type", rs.getString("evt_type"));
				record.put("evt_name", rs.getString("evt_name"));
				record.put("evt_trg", rs.getString("evt_trg"));
				record.put("always", rs.getBoolean("always"));
				record.put("enabled", rs.getBoolean("enabled"));
				record.put("from_date", rs.getDate("from_date"));
				record.put("to_date", rs.getDate("to_date"));
				record.put("dest", rs.getString("dest"));
				record.put("msg", rs.getString("msg"));
				record.put("created_at", rs.getTimestamp("created_at"));
				record.put("updated_at", rs.getTimestamp("updated_at"));
				items.add(record);
			}
		} catch (Exception e) {
			logger.error("Failed to list alarm [" + company + "]", e);
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return this.getResultSet(true, total, items); 
	}
	
	@RequestMapping(value = "/alarm/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		String company = this.getCompany(request);
		String name = request.getParameter("name");
		Map<String, Object> record = new HashMap<String, Object>();
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			pstmt = conn.prepareStatement("select * from alarm where company = ? and name = ?");
			pstmt.setString(1, company);
			pstmt.setString(2, name);
			rs = pstmt.executeQuery();
		
			if(rs.next()) {
				record.put("name", rs.getString("name"));
				record.put("type", rs.getString("type"));
				record.put("evt_type", rs.getString("evt_type"));
				record.put("evt_name", rs.getString("evt_name"));
				record.put("evt_trg", rs.getString("evt_trg"));
				record.put("always", rs.getBoolean("always"));
				record.put("enabled", rs.getBoolean("enabled"));
				record.put("from_date", rs.getDate("from_date"));
				record.put("to_date", rs.getDate("to_date"));
				record.put("dest", rs.getString("dest"));
				record.put("msg", rs.getString("msg"));
				record.put("created_at", rs.getTimestamp("created_at"));
				record.put("updated_at", rs.getTimestamp("updated_at"));
				record.put("success", true);
			}
			
			pstmt.close();
			rs.close();
			
			if(!record.isEmpty()) {
				pstmt = conn.prepareStatement("select vehicle_id from alarm_vehicle_relation where company = ? and alarm_name = ?");
				pstmt.setString(1, company);
				pstmt.setString(2, name);
				rs = pstmt.executeQuery();
				StringBuffer vehicleIds = new StringBuffer();
				boolean isFirst = true;
				
				while(rs.next()) {
					if(isFirst) {
						isFirst = false;
					} else {
						vehicleIds.append(",");
					}
					
					vehicleIds.append(rs.getString(1));
				}
				
				record.put("vehicles", vehicleIds.toString());
			}
			
		} catch (Exception e) {
			logger.error("Failed to find alarm [" + name + "]", e);
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + name + "\" }";
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return new ObjectMapper().writeValueAsString(record);
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
		response.setContentType("text/html; charset=UTF-8");
		
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
			java.sql.Date fromDate = DataUtils.isEmpty(fromDateStr) ? null : new java.sql.Date(DataUtils.toDate(fromDateStr).getTime());
			java.sql.Date toDate = DataUtils.isEmpty(fromDateStr) ? null : new java.sql.Date(DataUtils.toDate(toDateStr).getTime());
			
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
		
			// 5. save lba status 
			Map<String, Object> alarm = new HashMap<String, Object>();
			alarm.put("company", company);
			alarm.put("name", name);
			alarm.put("evt_name", request.getParameter("evt_name"));
			alarm.put("evt_trg", request.getParameter("evt_trg"));
			alarm.put("always", DataUtils.toBool(request.getParameter("always")));
			alarm.put("from_date", DataUtils.toDate(request.getParameter("from_date")));
			alarm.put("to_date", DataUtils.toDate(request.getParameter("to_date")));
			this.saveLbaStatus(alarm, vehicles);
		
		} catch (Exception e) {
			logger.error("Failed to save alarm [" + name + "]", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(rs, pstmt, pstmt2, pstmt3, conn);			
		}
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save!\"}";
	}
	
	/**
	 * lbaStatus 저장 
	 * 
	 * @param alarm
	 * @param vehicles
	 * @throws Exception
	 */
	private void saveLbaStatus(Map<String, Object> alarm, String[] vehicles) throws Exception {
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		// Alarm 저장하기 전에 Alarm과 관계된 LbaStatus 정보를 추가 또는 갱신한다. lbaStatus 삭제 후 재 생성 
		this.deleteLbaStatus(datastore, (String)alarm.get("company"), (String)alarm.get("name"));
		this.createLbaStatus(datastore, alarm, vehicles);
	}
	
	/**
	 * Alarm과 관련된 LbaStatus 리스트를 생성 
	 * 
	 * @param datastore
	 * @param alarm
	 * @param vehicles
	 * @throws Exception
	 */
	private void createLbaStatus(DatastoreService datastore, Map<String, Object> alarm, String[] vehicles) throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", (String)alarm.get("company"));
		List<Entity> lbaStatusList = new ArrayList<Entity>();
		Date now = new Date();
		
		for(int i = 0 ; i < vehicles.length ; i++) {
			Entity lbaStatus = this.newLbaStatus(companyKey, alarm, vehicles[i]);
			lbaStatus.setUnindexedProperty("updated_at", now);
			lbaStatusList.add(lbaStatus);			
		}
		
		datastore.put(lbaStatusList);
	}
	
	/**
	 * LbaStatus Entity를 생성 
	 * 
	 * @param companyKey
	 * @param alarm
	 * @param vehicle
	 * @return
	 */
	private Entity newLbaStatus(Key companyKey, Map<String, Object> alarm, String vehicle) {
		
		Entity lbaStatus = new Entity(KeyFactory.createKey(companyKey, "LbaStatus", vehicle + "@" + alarm.get("name")));
		lbaStatus.setProperty("vehicle", vehicle);
		lbaStatus.setProperty("alarm", alarm.get("name"));
		lbaStatus.setProperty("loc", alarm.get("evt_name"));
		lbaStatus.setProperty("evt_trg", alarm.get("evt_trg"));
		lbaStatus.setProperty("bef_status", "");
		lbaStatus.setProperty("cur_status", "");
		// always가 체크되어 있으면 true 아니면 오늘이 from_date, to_date 사이에 있는지 확인 
		boolean use = (Boolean)alarm.get("always") ? true : DataUtils.between(DataUtils.getToday(), (java.sql.Date)alarm.get("from_date"), (java.sql.Date)alarm.get("to_date"));
		lbaStatus.setProperty("use", use);
		return lbaStatus;
	}	
	
	/**
	 * Alarm과 관련된 LbaStatus를 찾아 삭제 
	 * 
	 * @param datastore
	 * @param company
	 * @param alarmName
	 * @throws Exception
	 */
	private void deleteLbaStatus(DatastoreService datastore, String company, String alarmName) throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", company);
		List<Entity> lbaStatusList = DatastoreUtils.findEntityList(companyKey, "LbaStatus", DataUtils.newMap("alarm", alarmName));
		
		if(DataUtils.isEmpty(lbaStatusList))
			return;
		
		List<Key> keysToDel = new ArrayList<Key>();
		for(Entity lbaStatus : lbaStatusList)
			keysToDel.add(lbaStatus.getKey());
		
		datastore.delete(keysToDel);
	}	
}
