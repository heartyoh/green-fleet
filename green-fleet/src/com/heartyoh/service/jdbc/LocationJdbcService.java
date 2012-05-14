/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.util.DataUtils;

/**
 * Location Service
 * 
 * @author jhnam
 */
@Controller
public class LocationJdbcService extends JdbcEntityService {

	@RequestMapping(value = "/location/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports("location", request, response);
	}
	
	@RequestMapping(value = "/location/delete", method = RequestMethod.POST)
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
			pstmt1 = conn.prepareStatement("delete from location where company = ? and name = ?");
			pstmt1.setString(1, company);
			pstmt1.setString(2, name);
			pstmt1.execute();
			
			pstmt2 = conn.prepareStatement("delete from alarm where company = ? and evt_type = 'location' and evt_name = ?");
			pstmt1.setString(1, company);
			pstmt1.setString(2, name);
			pstmt2.execute();
			
		} catch (Exception e) {
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + name + "\" }";
			
		} finally {
			super.closeDB(pstmt1, pstmt2, conn);
		}		
				
		return "{ \"success\" : true, \"msg\" : \"Location destroyed!\", \"key\" : \"" + name + "\" }";
	}

	@RequestMapping(value = {"/location", "/m/data/location.json"}, method = RequestMethod.GET)
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
			
			pstmt = conn.prepareStatement("select count(*) from location where company = ?");
			pstmt.setString(1, company);
			rs = pstmt.executeQuery();
			if(rs.next()) {
				total = rs.getInt(1);
			}
			
			rs.close();
			pstmt.close();
			
			pstmt = conn.prepareStatement("select * from location where company = ? limit ?, ?");
			pstmt.setString(1, company);
			pstmt.setInt(2, (page - 1) * limit);
			pstmt.setInt(3, page * limit);
			rs = pstmt.executeQuery();
		
			while(rs.next()) {
				Map<String, Object> record = new HashMap<String, Object>();
				record.put("company", rs.getString("company"));
				record.put("name", rs.getString("name"));
				record.put("addr", rs.getString("addr"));
				record.put("expl", rs.getString("expl"));
				record.put("lat", rs.getFloat("lat"));
				record.put("lng", rs.getFloat("lng"));
				record.put("rad", rs.getFloat("rad"));
				record.put("lat_hi", rs.getFloat("lat_hi"));
				record.put("lat_lo", rs.getFloat("lat_lo"));
				record.put("lng_hi", rs.getFloat("lng_hi"));
				record.put("lng_lo", rs.getFloat("lng_lo"));
				record.put("created_at", rs.getTimestamp("created_at"));
				record.put("updated_at", rs.getTimestamp("updated_at"));
				items.add(record);
			}
		} catch (Exception e) {
			return this.getResultSet(false, 0, null);
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return this.getResultSet(true, total, items); 
	}
	
	@RequestMapping(value = "/location/find", method = RequestMethod.GET)
	public @ResponseBody
	String find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;		
		String name = request.getParameter("name");
		Map<String, Object> result = new HashMap<String, Object>();
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			pstmt = conn.prepareStatement("select * from location where company = ? and name = ?");
			pstmt.setString(1, this.getCompany(request));
			pstmt.setString(2, name);
			rs = pstmt.executeQuery();
		
			while(rs.next()) {
				result.put("company", rs.getString("company"));
				result.put("name", rs.getString("name"));
				result.put("addr", rs.getString("addr"));
				result.put("expl", rs.getString("expl"));
				result.put("lat", rs.getFloat("lat"));
				result.put("lng", rs.getFloat("lng"));
				result.put("rad", rs.getFloat("rad"));
				result.put("lat_hi", rs.getFloat("lat_hi"));
				result.put("lat_lo", rs.getFloat("lat_lo"));
				result.put("lng_hi", rs.getFloat("lng_hi"));
				result.put("lng_lo", rs.getFloat("lng_lo"));				
				result.put("created_at", rs.getTimestamp("created_at"));
				result.put("updated_at", rs.getTimestamp("updated_at"));
			}
		} catch (Exception e) {
			return "{ \"success\" : false, \"msg\" : \"" + e.getMessage() + "\", \"key\" : \"" + name + "\" }";
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return new ObjectMapper().writeValueAsString(result);
	}
	
	@RequestMapping(value = "/location/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Connection conn = null;
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		String name = request.getParameter("name");
		java.sql.Timestamp now = new java.sql.Timestamp(new java.util.Date().getTime());
		response.setContentType("text/html; charset=UTF-8");
		
		try {
			conn = this.getConnection();
			
			pstmt = conn.prepareStatement("select count(*) from location where company = ? and name = ?");
			pstmt.setString(1, this.getCompany(request));
			pstmt.setString(2, name);
			rs = pstmt.executeQuery();
		
			boolean createMode = true;
			if(rs.next()) {
				int count = rs.getInt(1);
				if(count > 0)
					createMode = false;
			}
			
			if(!createMode) {
				pstmt = conn.prepareStatement("update location set expl = ?, lat = ?, lng = ?, rad = ?, lat_hi = ?, lat_lo = ?, lng_hi = ?, lng_lo = ? updated_at = ? where company = ? and name = ?");
				pstmt.setString(1, request.getParameter("expl"));
				pstmt.setFloat(2, DataUtils.toFloat(request.getParameter("lat")));
				pstmt.setFloat(3, DataUtils.toFloat(request.getParameter("lng")));
				pstmt.setFloat(4, DataUtils.toFloat(request.getParameter("rad")));
				pstmt.setFloat(5, DataUtils.toFloat(request.getParameter("lat_hi")));
				pstmt.setFloat(6, DataUtils.toFloat(request.getParameter("lat_lo")));
				pstmt.setFloat(7, DataUtils.toFloat(request.getParameter("lng_hi")));
				pstmt.setFloat(8, DataUtils.toFloat(request.getParameter("lng_lo")));
				pstmt.setTimestamp(9, now);
				pstmt.setString(10, this.getCompany(request));
				pstmt.setString(11, name);
				
			} else {
				pstmt = conn.prepareStatement("insert into location(company, name, expl, lat, lng, rad, lat_hi, lat_lo, lng_hi, lng_lo, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
				pstmt.setString(1, this.getCompany(request));
				pstmt.setString(2, name);
				pstmt.setString(3, request.getParameter("expl"));
				pstmt.setFloat(4, DataUtils.toFloat(request.getParameter("lat")));
				pstmt.setFloat(5, DataUtils.toFloat(request.getParameter("lng")));
				pstmt.setFloat(6, DataUtils.toFloat(request.getParameter("rad")));
				pstmt.setFloat(7, DataUtils.toFloat(request.getParameter("lat_hi")));
				pstmt.setFloat(8, DataUtils.toFloat(request.getParameter("lat_lo")));
				pstmt.setFloat(9, DataUtils.toFloat(request.getParameter("lng_hi")));
				pstmt.setFloat(10, DataUtils.toFloat(request.getParameter("lng_lo")));
				pstmt.setTimestamp(11, now);
				pstmt.setTimestamp(12, now);				
			}
			
			pstmt.execute();
						
		} catch (Exception e) {
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage() + "\"}";
			
		} finally {
			super.closeDB(rs, pstmt, conn);
		}
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save!\"}";
	}
	
}
