/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.CustomUser;
import com.heartyoh.util.ConnectionManager;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

/**
 * Entity service JDBC 구현
 * 
 * @author jhnam
 */
public abstract class JdbcEntityService {
	
	private static final Logger logger = LoggerFactory.getLogger(JdbcEntityService.class);
	
	/**
	 * connection 리턴 
	 *  
	 * @return
	 * @throws Exception
	 */
	protected Connection getConnection() throws Exception {
		return ConnectionManager.getInstance().getConnection();
	}
	
	/**
	 * close connection
	 * 
	 * @param connection
	 */
	protected void closeConnection(Connection connection) {		
		try {
			if(connection != null)
				connection.close();
		} catch (SQLException e) {
			
		}
	}
	
	/**
	 * company 정보 추출 
	 * 
	 * @param request
	 * @return
	 */
	protected String getCompany(HttpServletRequest request) {
		CustomUser user = SessionUtils.currentUser();
		return (user != null) ? user.getCompany() : request.getParameter("company");
	}
	
	/**
	 * 결과셋 리턴 
	 * 
	 * @param success
	 * @param totalCount
	 * @param items
	 * @return
	 */
	protected Map<String, Object> getResultSet(boolean success, int totalCount, Object items) {
		
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", success);
		result.put("total", totalCount);
		result.put("items", items);
		return result;
	}
	
	/**
	 * import 
	 * 
	 * @param tableName
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	protected String imports(String tableName, MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		
		MultipartFile file = request.getFile("file");
		BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
		String line = br.readLine();
		String[] keys = line.split(",");
		String company = this.getCompany(request);
		int count = 0;
		Connection conn = null;
		PreparedStatement pstmt = null;
		
		try {
			conn = this.getConnection();
			Map<String, Integer> columnInfo = this.getTableMetadata(conn, tableName);
			pstmt = conn.prepareStatement(this.getInsertQuery(tableName, keys));
			
			while ((line = br.readLine()) != null) {
				String[] values = line.split(",");
				pstmt.setObject(1, company);
				
				for (int i = 0; i < keys.length; i++) {
					String key = keys[i].trim();
					
					if(!columnInfo.containsKey(key)) {
						throw new Exception("Table [" + tableName + "] has no column [" + key + "]!");
					}
					
					int columnType = columnInfo.get(key);
					String value = values[i].trim();
					Object columnVal = this.getValue(columnType, value);
					pstmt.setObject(i + 2, columnVal);
				}
				
				pstmt.addBatch();
				count++;
			}
			
			pstmt.executeBatch();
			
		} catch (Exception e) {
			throw e;
			
		} finally {
			this.closeDB(pstmt, conn);			
		}

		return "{\"success\" : true, \"msg\" : \"Imported " + count + " count successfully\"}";
	}
	
	/**
	 * column type에 따라 값 변환 
	 * 
	 * @param type
	 * @param value
	 * @return
	 */
	private Object getValue(int type, String value) {
		
		if(type == Types.BIT || type == Types.BOOLEAN) {
			return DataUtils.toBool(value);
		} else if(type == Types.DATE) {
			Date d = DataUtils.toDate(value);
			return (d != null) ? new java.sql.Date(d.getTime()) : null;
		} else if(type == Types.TIMESTAMP) {
			Date d = DataUtils.toDate(value);
			return (d != null) ? new java.sql.Timestamp(d.getTime()) : null;
		} else if(type == Types.TINYINT || type == Types.SMALLINT || type == Types.INTEGER) {
			return DataUtils.toInt(value);
		} else if(type == Types.FLOAT) {
			return DataUtils.toFloat(value);
		} else if(type == Types.DOUBLE) {
			return DataUtils.toDouble(value);
		} else if(type == Types.BIGINT) {
			return DataUtils.toLong(value);
		} else if(type == Types.DECIMAL) {
			return DataUtils.isEmpty(value) ? null : new BigDecimal(value);
		} else {
			return value;
		}
	}
	
	/**
	 * insert query 생성 
	 * 
	 * @param tableName
	 * @param columns
	 * @return
	 */
	private String getInsertQuery(String tableName, String[] columns) {
		
		StringBuffer query = new StringBuffer("insert into ");
		query.append(tableName).append(" (company");
		int columnCount = columns.length;
		
		for(int i = 0 ; i < columnCount ; i++) {
			query.append(",").append(columns[i]);
		}
		
		query.append(") values (?");
		
		for(int i = 0 ; i < columnCount ; i++) {
			query.append(",").append("?");
		}
		
		query.append(")");
		return query.toString();
	}
	
	/**
	 * get table metadata
	 * 
	 * @param tableName
	 * @return
	 * @throws Exception
	 */
	protected Map<String, Integer> getTableMetadata(Connection conn, String tableName) throws Exception {
		
		Map<String, Integer> columnInfo = new HashMap<String, Integer>();
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		
		try {
			pstmt = conn.prepareStatement("select * from " + tableName + " limit 0, 1");
			rs = pstmt.executeQuery();
			ResultSetMetaData metaRs = rs.getMetaData();
			int columnCount = metaRs.getColumnCount();
			
			for(int i = 1 ; i <= columnCount ; i++) {
				String colName = metaRs.getColumnName(i);
				int colType = metaRs.getColumnType(i);
				columnInfo.put(colName, colType);
			}			
			
		} catch(Exception e) {
			throw e;
			
		} finally {
			this.closeDB(rs, pstmt);	
		}
		
		return columnInfo;
	}
	
	/**
	 * close database connection 
	 * 
	 * @param closables
	 */
	protected void closeDB(Object ... closables) {
		
		try {
			for(Object closable : closables) {
				
				if(closable == null)
					continue;
				
				if(closable instanceof ResultSet) {
					((ResultSet)closable).close();
					
				} else if(closable instanceof Statement) {
					((Statement)closable).close();
					
				} else if(closable instanceof Connection) {
					((Connection)closable).close();
				}
			}
		} catch (Exception e) {
			logger.error("Failed to close connection!", e);
		}
	}
}
