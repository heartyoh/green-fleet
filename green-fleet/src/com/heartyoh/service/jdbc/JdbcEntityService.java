/**
 * 
 */
package com.heartyoh.service.jdbc;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.ConnectionManager;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

/**
 * Entity service JDBC 구현
 * 
 * @author jhnam
 */
public abstract class JdbcEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory
			.getLogger(JdbcEntityService.class);

	/**
	 * 모든 테이블 - 컬럼 매핑 정보 (키 : 테이블 명 - 값 (맵 (키 : 컬럼명 - 값 : 컬럼타입(java.sql.Types
	 * 상수)))
	 */
	protected static Map<String, Map<String, Integer>> TABLE_COLUMN_MAP = new Hashtable<String, Map<String, Integer>>();

	/**
	 * 모든 테이블 - PK 매핑 정보 (키 : 테이블 명 - 값 (PK 컬럼명 리스트))
	 */
	protected static Map<String, List<String>> TABLE_PK_MAP = new Hashtable<String, List<String>>();

	/**
	 * RESPONSE CONTENT TYPE
	 */
	protected static final String CONTENT_TYPE = "text/html; charset=UTF-8";

	/**
	 * 테이블 명 리턴
	 * 
	 * @return
	 */
	protected abstract String getTableName();

	/**
	 * table column과 클라이언트로 리턴될 service field명이 다를 경우 둘 간의 매핑을 정의한다. 둘 다 모두 같다면
	 * return null로 정의해도 된다. 키 : table column, 값 : service field 명
	 * 
	 * @return
	 */
	protected abstract Map<String, String> getColumnSvcFieldMap();

	/**
	 * import
	 * 
	 * @param tableName
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String imports(MultipartHttpServletRequest request,
			HttpServletResponse response) throws Exception {

		MultipartFile file = request.getFile("file");
		BufferedReader br = new BufferedReader(new InputStreamReader(
				file.getInputStream(), "UTF-8"));
		String line = br.readLine();
		String[] fieldNames = line.split(",");
		String company = this.getCompany(request);
		int count = 0;
		Connection conn = null;
		PreparedStatement pstmt = null;

		try {
			conn = this.getConnection();
			Map<String, Integer> columnInfo = this.getColumnInfo(this
					.getTableName());
			java.sql.Timestamp now = new java.sql.Timestamp(
					new java.util.Date().getTime());
			pstmt = conn.prepareStatement(this.getInsertQueryForImport(
					this.getTableName(), fieldNames));

			while ((line = br.readLine()) != null) {
				String[] values = line.split(",");
				int idx = this.setDefaultImportValues(pstmt, columnInfo,
						company, now);

				for (int i = 0; i < fieldNames.length; i++) {
					String key = fieldNames[i].trim();
					String value = values[i].trim();
					pstmt.setObject(idx++,
							this.convertValueByType(columnInfo.get(key), value));
				}

				if (count == 100) {
					pstmt.executeBatch();
					pstmt.clearBatch();
					count = 0;
				} else {
					pstmt.addBatch();
					count++;
				}
			}

			pstmt.executeBatch();

		} catch (Exception e) {
			logger.error("Failed to import!", e);
			return "{\"success\" : false, \"msg\" : \"Reason - "
					+ e.getMessage() + "\"}";

		} finally {
			this.closeDB(pstmt, conn);
		}

		return "{\"success\" : true, \"msg\" : \"Imported " + count
				+ " count successfully\"}";
	}

	/**
	 * 레코드별 import를 위해 각 row별 기본값을 설정한다.
	 * 
	 * @param pstmt
	 * @param columnInfo
	 * @param company
	 * @param now
	 * @return
	 * @throws Exception
	 */
	private int setDefaultImportValues(PreparedStatement pstmt,
			Map<String, Integer> columnInfo, String company,
			java.sql.Timestamp now) throws Exception {
		
		int idx = 1;

		if (columnInfo.containsKey("company"))
			pstmt.setObject(idx++, company);

		if (columnInfo.containsKey("created_at"))
			pstmt.setTimestamp(idx++, now);

		if (columnInfo.containsKey("updated_at"))
			pstmt.setTimestamp(idx++, now);

		return idx;
	}

	/**
	 * insert query 생성
	 * 
	 * @param tableName
	 * @param importColumns
	 * @return
	 * @throws Exception
	 */
	protected String getInsertQueryForImport(String tableName, String[] importColumns)
			throws Exception {

		Map<String, Integer> columnInfo = this.getColumnInfo(tableName);
		boolean companyExist = columnInfo.containsKey("company");
		boolean createdAtExist = columnInfo.containsKey("created_at");
		boolean updatedAtExist = columnInfo.containsKey("updated_at");

		String defaultColumns = companyExist ? "company" : "";
		defaultColumns += createdAtExist ? (defaultColumns.length() > 1 ? ", created_at"
				: "created_at")
				: "";
		defaultColumns += updatedAtExist ? (defaultColumns.length() > 1 ? ", updated_at"
				: "updated_at")
				: "";

		StringBuffer query = new StringBuffer("insert into ").append(tableName)
				.append(" (").append(defaultColumns);
		int columnCount = importColumns.length;

		for (int i = 0; i < columnCount; i++) {
			String importColumn = importColumns[i].trim();
			if (!columnInfo.containsKey(importColumn))
				throw new Exception("Table [" + tableName + "] has no column ["
						+ importColumn + "]!");

			query.append(i > 0 ? "," : (defaultColumns.length() > 1 ? "," : ""))
					.append(importColumn);
		}

		query.append(") values (");

		columnCount += companyExist ? 1 : 0;
		columnCount += createdAtExist ? 1 : 0;
		columnCount += updatedAtExist ? 1 : 0;

		for (int i = 0; i < columnCount; i++)
			query.append(i == 0 ? "" : ",").append(" ?");

		return query.append(")").toString();
	}

	/**
	 * 삭제
	 * 
	 * @param keyNames
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String delete(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		Map<Integer, Object> params = new HashMap<Integer, Object>();
		List<String> keyColumns = this.getPrimaryKeys(this.getTableName());
		Map<String, String> colSvcFieldMap = this.getColumnSvcFieldMap();
		StringBuffer query = new StringBuffer("delete from "
				+ this.getTableName());

		for (int i = 0; i < keyColumns.size(); i++) {
			String keyColumn = keyColumns.get(i);
			query.append((i == 0) ? " where " : " and ").append(keyColumn)
					.append(" = ?");

			if ("company".equalsIgnoreCase(keyColumn))
				params.put(i + 1, this.getCompany(request));
			else {
				params.put(i + 1, this.getColumnMappingValue(keyColumn,
						colSvcFieldMap, request));
			}
		}

		response.setContentType(CONTENT_TYPE);
		String queryStr = query.toString();
		Connection conn = null;

		try {
			conn = this.getConnection();
			this.onBeforeDelete(conn, queryStr, params, request, response);
			this.execute(conn, queryStr, params);
			this.onAfterDelete(conn, request, response);
			return "{ \"success\" : true, \"msg\" : \"" + this.getTableName()
					+ " destroyed!\" }";

		} catch (Exception e) {
			return "{ \"success\" : false, \"msg\" : \"Failed to destroy "
					+ this.getTableName() + "! Reason - " + e.getMessage()
					+ "\" }";

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * 조회
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String find(HttpServletRequest request, HttpServletResponse response)
			throws Exception {

		Map<Integer, Object> params = new HashMap<Integer, Object>();
		Map<String, String> colSvcFieldMap = this.getColumnSvcFieldMap();
		List<String> keyColumns = this.getPrimaryKeys(this.getTableName());
		StringBuffer query = new StringBuffer("select * from "
				+ this.getTableName());

		for (int i = 0; i < keyColumns.size(); i++) {
			String keyColumn = keyColumns.get(i);
			query.append((i == 0) ? " where " : " and ").append(keyColumn)
					.append(" = ?");

			if ("company".equalsIgnoreCase(keyColumn))
				params.put(i + 1, this.getCompany(request));
			else
				params.put(i + 1, this.getColumnMappingValue(keyColumn,
						colSvcFieldMap, request));
		}

		response.setContentType(CONTENT_TYPE);
		String queryStr = query.toString();
		Connection conn = null;

		try {
			conn = this.getConnection();
			this.onBeforeFind(conn, queryStr, params, request, response);
			Map<String, Object> item = this.executeSingleQuery(conn, queryStr,
					params);
			this.onAfterFind(conn, item, request, response);
			return new ObjectMapper().writeValueAsString(item);

		} catch (Exception e) {
			return "{ \"success\" : false, \"msg\" : \"Failed to find "
					+ this.getTableName() + "! Reason - " + e.getMessage()
					+ "\" }";

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * 생성 or 수정
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String save(HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		return DataUtils.isEmpty(request.getParameter("key")) ? this.create(
				request, response) : this.update(request, response);
	}

	/**
	 * 생성
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String create(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		response.setContentType(CONTENT_TYPE);
		Map<String, Object> paramMap = null;
		Connection conn = null;

		try {
			conn = this.getConnection();

			// 1. multi part 전처리
			if (request instanceof MultipartHttpServletRequest) {
				paramMap = this.toMap(request);
				preMultipart(conn, paramMap,
						(MultipartHttpServletRequest) request);
			}

			// 2. table명과 테이블 컬럼 - 서비스 필드명 매핑, request 객체로 insert 실행
			this.processInsert(conn, request, response);

			// 3. multi part 후처리
			if (request instanceof MultipartHttpServletRequest)
				postMultipart(conn, paramMap,
						(MultipartHttpServletRequest) request);

			// 4. 리턴
			return "{\"success\" : true, \"msg\" : \"Succeeded to create!\"}";

		} catch (Exception e) {
			logger.error("Failed to create!", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage()
					+ "\"}";

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * insert 실행한다.
	 * 
	 * @param conn
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	private void processInsert(Connection conn, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		// 테이블 명으로 컬럼정보를 조회
		String tableName = this.getTableName();
		Map<String, String> colSvcFieldMap = this.getColumnSvcFieldMap();
		Map<String, Integer> columnInfo = this.getColumnInfo(tableName);
		Map<Integer, Object> params = new HashMap<Integer, Object>();

		StringBuffer query = new StringBuffer("insert into ");
		query.append(tableName).append(" (");
		Iterator<String> columnNames = columnInfo.keySet().iterator();
		int idx = 0;

		// 컬럼 정보를 traversing하면서 insert 쿼리와 파라미터를 생성한다.
		while (columnNames.hasNext()) {
			String columnName = columnNames.next();
			query.append((idx++ > 0) ? "," : "").append(columnName);
			params.put(idx,
					this.getSqlParamValue(columnName, colSvcFieldMap, request));
		}

		query.append(") values (");

		for (int i = 0; i < columnInfo.size(); i++) {
			query.append((i > 0) ? "," : "").append("?");
		}

		query.append(")");

		// 실행
		String queryStr = query.toString();
		this.onBeforeCreate(conn, queryStr, params, request, response);
		this.execute(conn, queryStr, params);
		this.onAfterCreate(conn, request, response);
	}

	/**
	 * 생성
	 * 
	 * @param createQuery
	 * @param params
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String create(String createQuery, Map<Integer, Object> params,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {

		response.setContentType(CONTENT_TYPE);
		Map<String, Object> paramMap = null;
		Connection conn = null;

		try {
			conn = this.getConnection();

			if (request instanceof MultipartHttpServletRequest) {
				paramMap = this.toMap(request);
				preMultipart(conn, paramMap,
						(MultipartHttpServletRequest) request);
			}

			this.onBeforeCreate(conn, createQuery, params, request, response);
			this.execute(createQuery, params);
			this.onAfterCreate(conn, request, response);

			if (request instanceof MultipartHttpServletRequest)
				postMultipart(conn, paramMap,
						(MultipartHttpServletRequest) request);

			return "{\"success\" : true, \"msg\" : \"Succeeded to create!\"}";

		} catch (Exception e) {
			logger.error("Failed to create!", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage()
					+ "\"}";

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * 업데이트
	 * 
	 * @param updateQuery
	 * @param params
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String update(String updateQuery, Map<Integer, Object> params,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {

		response.setContentType(CONTENT_TYPE);
		Map<String, Object> paramMap = null;
		Connection conn = null;

		try {
			conn = this.getConnection();

			if (request instanceof MultipartHttpServletRequest) {
				paramMap = this.toMap(request);
				preMultipart(conn, paramMap,
						(MultipartHttpServletRequest) request);
			}

			this.onBeforeUpdate(conn, updateQuery, params, request, response);
			this.execute(updateQuery, params);
			this.onAfterUpdate(conn, request, response);

			if (request instanceof MultipartHttpServletRequest)
				postMultipart(conn, paramMap,
						(MultipartHttpServletRequest) request);

			return "{\"success\" : true, \"msg\" : \"Succeeded to update!\"}";

		} catch (Exception e) {
			logger.error("Failed to update!", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage()
					+ "\"}";

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * 업데이트
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public String update(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		response.setContentType(CONTENT_TYPE);
		Map<String, Object> paramMap = null;
		Connection conn = null;

		try {
			conn = this.getConnection();

			// 1. multi part 전처리
			if (request instanceof MultipartHttpServletRequest) {
				paramMap = this.toMap(request);
				preMultipart(conn, paramMap,
						(MultipartHttpServletRequest) request);
			}

			// 2. table명과 테이블 컬럼 - 서비스 필드명 매핑, request 객체로 insert 실행
			this.processUpdate(conn, request, response);

			// 3. multi part 후처리
			if (request instanceof MultipartHttpServletRequest)
				postMultipart(conn, paramMap,
						(MultipartHttpServletRequest) request);

			// 4. 리턴
			return "{\"success\" : true, \"msg\" : \"Succeeded to update!\"}";

		} catch (Exception e) {
			logger.error("Failed to update!", e);
			return "{\"success\" : false, \"msg\" : \"" + e.getMessage()
					+ "\"}";

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * update 실행한다.
	 * 
	 * @param conn
	 * @param colSvcFieldMap
	 *            테이블 컬럼명과 서비스 필드명 매핑
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	private void processUpdate(Connection conn, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		String tableName = this.getTableName();
		Map<String, String> colSvcFieldMap = this.getColumnSvcFieldMap();
		Map<String, Integer> columnInfo = this.getColumnInfo(tableName);
		List<String> pkColumnList = this.getPrimaryKeys(tableName);
		Map<Integer, Object> params = new HashMap<Integer, Object>();

		StringBuffer query = new StringBuffer("update ");
		query.append(tableName).append(" set ");
		Iterator<String> columnNames = columnInfo.keySet().iterator();
		int idx = 0;

		// 컬럼 정보를 traversing하면서 insert 쿼리와 파라미터를 생성한다.
		while (columnNames.hasNext()) {
			String columnName = columnNames.next();

			// pk column 혹은 created_at 이면 스킵
			if ("company".equalsIgnoreCase(columnName)
					|| "created_at".equalsIgnoreCase(columnName))
				continue;

			query.append((idx++ > 0) ? "," : "").append(columnName)
					.append(" = ?");
			params.put(idx,
					this.getSqlParamValue(columnName, colSvcFieldMap, request));
		}

		query.append(" where ");
		Object[] keyDataArr = this.restoreKeyData(request.getParameter("key"),
				tableName);

		for (int i = 0; i < pkColumnList.size(); i++) {
			query.append((i > 0) ? " and " : "").append(pkColumnList.get(i))
					.append(" = ?");
			params.put(++idx, keyDataArr[i]);
		}

		// 실행
		String queryStr = query.toString();
		this.onBeforeUpdate(conn, queryStr, params, request, response);
		this.execute(conn, queryStr, params);
		this.onAfterUpdate(conn, request, response);
	}

	/**
	 * insert or update에 필요한 파라미터 값을 추출한다.
	 * 
	 * @param columnName
	 * @param colSvcFieldMap
	 * @param request
	 * @return
	 */
	private Object getSqlParamValue(String columnName,
			Map<String, String> colSvcFieldMap, HttpServletRequest request) {

		Object manualMappingValue = this.manualColumnValueMapping(columnName,
				request);

		// company, created_at, updated_at 등의 정보는 request로 부터 뽑을 수 없으므로 매뉴얼
		// 매핑한다.
		if (manualMappingValue != null) {
			return manualMappingValue;
			// table 컬럼명으로 request로 부터 데이터를 뽑아 매핑한다.
		} else {
			return this.getColumnMappingValue(columnName, colSvcFieldMap,
					request);
		}
	}

	/**
	 * insert, update시 쿼리 파라미터 매핑을 위해 column 명으로 부터 request로 부터 값을 추출 여기서 column
	 * 명과 서비스 필드명이 다른 것을 고려하여 다르다면 colSvcFieldMap에서 매핑된 정보로 request에서 정보를 추출
	 * 
	 * @param columnName
	 * @param colSvcFieldMap
	 * @param request
	 * @return
	 */
	protected Object getColumnMappingValue(String columnName,
			Map<String, String> colSvcFieldMap, HttpServletRequest request) {

		// table 컬럼명으로 request로 부터 데이터를 뽑아 매핑한다.
		Object value = request.getParameter(columnName);

		// 값이 없다면 colSvcFieldMap에서 매핑된 정보로 request에서 정보를 추출
		if (value == null && colSvcFieldMap != null
				&& colSvcFieldMap.containsKey(columnName)) {
			value = request.getParameter(colSvcFieldMap.get(columnName));
		}

		return value;
	}

	/**
	 * 수동매핑 컬럼들에 대한 처리, 각 서비스에서 추가적인 수동매핑 값이 있다면 이를 재정의한다.
	 * 
	 * @param columnName
	 * @param request
	 * @return
	 */
	protected Object manualColumnValueMapping(String columnName,
			HttpServletRequest request) {

		if ("company".equalsIgnoreCase(columnName)) {
			return this.getCompany(request);
		} else if ("created_at".equalsIgnoreCase(columnName)
				|| "updated_at".equalsIgnoreCase(columnName)) {
			return new java.sql.Timestamp(new Date().getTime());
		} else {
			return null;
		}
	}

	/**
	 * retrieve
	 * 
	 * @param pagination
	 * @param conditions
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	public Map<String, Object> retrieve(boolean pagination,
			Map<String, Object> conditions, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		int total = 0;
		List<Map<String, Object>> items = null;
		Connection conn = null;

		try {
			conn = this.getConnection();
			String[] selectCols = request.getParameterValues("select");
			List<Sorter> sorters = this.parseSorters(request
					.getParameter("sort"));
			this.onBeforeRetrieve(conn, conditions, request, response);

			if (pagination) {
				total = this.countForPaging(conn, conditions);
				if (total > 0) {
					int[] startLimit = this.getStartLimitCount(request);
					items = this.listByPaging(conn, selectCols, conditions,
							sorters, startLimit[0], startLimit[1]);
				}
			} else {
				items = this.list(conn, selectCols, conditions, sorters);
				total = items.size();
			}

			this.onAfterRetrieve(conn, items, request, response);
			return this.getResultSet(true, total, items);

		} catch (Exception e) {
			logger.error("Failed to retrieve!", e);
			return this.getResultSet(false, 0, null);

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * parameter 조건에 맞는 모든 결과를 조회
	 * 
	 * @param conn
	 * @param selectCols
	 * @param conditions
	 * @param sorters
	 * @return
	 * @throws Exception
	 */
	public List<Map<String, Object>> list(Connection conn, String[] selectCols,
			Map<String, Object> conditions, List<Sorter> sorters)
			throws Exception {
		return this.listByPaging(conn, selectCols, conditions, sorters, -1, -1);
	}

	/**
	 * parameter, start건수, limit 건수로 페이징 리스트 조회하여 리턴
	 * 
	 * @param conn
	 * @param selectCols
	 * @param conditions
	 * @param sorters
	 * @param start
	 * @param limit
	 * @return
	 * @throws Exception
	 */
	public List<Map<String, Object>> listByPaging(Connection conn,
			String[] selectCols, Map<String, Object> conditions,
			List<Sorter> sorters, int start, int limit) throws Exception {

		String tableName = this.getTableName();
		StringBuffer query = new StringBuffer("select ");

		if (selectCols == null || selectCols.length == 0) {
			query.append(" * from ").append(tableName);
		} else {
			String selectColumns = this.getSelectPhase(tableName, selectCols);
			query.append(selectColumns).append(" from ").append(tableName);
		}

		Map<Integer, Object> queryParams = new HashMap<Integer, Object>();
		int idx = 1;

		if (conditions != null) {
			Iterator<String> keyNames = conditions.keySet().iterator();

			while (keyNames.hasNext()) {
				String keyName = keyNames.next();
				query.append((idx == 1) ? " where " : " and ").append(keyName)
						.append(" = ? ");
				queryParams.put(idx++, conditions.get(keyName));
			}
		}

		if (sorters != null && sorters.size() > 0) {
			query.append("order by ");
			for (int i = 0; i < sorters.size(); i++) {
				Sorter sorter = sorters.get(i);
				query.append(i == 0 ? "" : " ,").append(sorter.getProperty())
						.append(" ").append(sorter.getDirection());
			}
		}

		if (start > -1) {
			query.append(" limit ?, ?");
			queryParams.put(idx++, start);
			queryParams.put(idx, limit);
		}

		return this.executeQuery(conn, query.toString(), queryParams);
	}

	/**
	 * 각 서비스의 테이블(getTableName()에 정의된 테이블)에 params 조건으로 total count를 리턴한다.
	 * 
	 * @param conn
	 * @param params
	 * @return
	 * @throws Exception
	 */
	protected int countForPaging(Connection conn, Map<String, Object> params)
			throws Exception {

		StringBuffer query = new StringBuffer("select count(*) from ").append(this.getTableName());
		Iterator<String> keyNames = params.keySet().iterator();
		Map<Integer, Object> queryParams = new HashMap<Integer, Object>();
		int idx = 1;

		while (keyNames.hasNext()) {
			String keyName = keyNames.next();
			query.append((idx == 1) ? " where " : " and ").append(keyName)
					.append(" = ? ");
			queryParams.put(idx++, params.get(keyName));
		}

		return this.count(conn, query.toString(), queryParams);
	}

	/**
	 * delete 전 액션
	 * 
	 * @param conn
	 * @param query
	 * @param params
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onBeforeDelete(Connection conn, String query,
			Map<Integer, Object> params, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
	}

	/**
	 * delete 후 액션
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onAfterDelete(Connection conn, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
	}

	/**
	 * find 전 액션
	 * 
	 * @param query
	 * @param params
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onBeforeFind(Connection conn, String query,
			Map<Integer, Object> params, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
	}

	/**
	 * find 후 액션
	 * 
	 * @param conn
	 * @param item
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onAfterFind(Connection conn, Map<String, Object> item,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {

		if (item == null) {
			item = new HashMap<String, Object>();
			item.put("success", false);

		} else {
			Map<String, String> columnSvcFieldMap = this.getColumnSvcFieldMap();
			Map<String, Object> itemToAdd = null;

			// table column 명과 실제 서비스로 표시할 필드명이 다를 경우 매핑된 필드로 바꿔서 리턴한다.
			Iterator<String> itemKeyIter = item.keySet().iterator();
			while (itemKeyIter.hasNext()) {
				String itemKey = itemKeyIter.next();

				if (columnSvcFieldMap != null
						&& columnSvcFieldMap.containsKey(itemKey)) {
					if (itemToAdd == null)
						itemToAdd = new HashMap<String, Object>();

					itemToAdd.put(columnSvcFieldMap.get(itemKey),
							item.get(itemKey));
				}
			}

			if (itemToAdd != null)
				item.putAll(itemToAdd);

			item.put("key",
					this.getKeyData(item,
							this.getPrimaryKeys(this.getTableName()),
							columnSvcFieldMap));
			item.put("success", true);
		}
	}

	/**
	 * multipart 데이터가 넘어올 경우, 전 처리
	 * 
	 * @param conn
	 * @param paramMap
	 * @param request
	 * @throws Exception
	 */
	protected void preMultipart(Connection conn, Map<String, Object> paramMap,
			MultipartHttpServletRequest request) throws Exception {

		Map<String, MultipartFile> filemap = request.getFileMap();
		Set<String> keys = filemap.keySet();
		Iterator<String> it = keys.iterator();

		while (it.hasNext()) {
			String key = it.next();
			MultipartFile file = filemap.get(key);
			paramMap.put(key, file);
		}
	}

	/**
	 * multipart 데이터가 넘어올 경우, 후 처리
	 * 
	 * @param conn
	 * @param paramMap
	 * @param request
	 * @throws Exception
	 */
	protected void postMultipart(Connection conn, Map<String, Object> paramMap,
			MultipartHttpServletRequest request) throws Exception {
	}

	/**
	 * create 전 액션
	 * 
	 * @param query
	 * @param params
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onBeforeCreate(Connection conn, String query,
			Map<Integer, Object> params, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
	}

	/**
	 * create 후 액션
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onAfterCreate(Connection conn, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
	}

	/**
	 * update 전 액션
	 * 
	 * @param query
	 * @param params
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onBeforeUpdate(Connection conn, String query,
			Map<Integer, Object> params, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
	}

	/**
	 * update 후 액션
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onAfterUpdate(Connection conn, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
	}

	/**
	 * update 전 액션
	 * 
	 * @param params
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onBeforeRetrieve(Connection conn,
			Map<String, Object> params, HttpServletRequest request,
			HttpServletResponse response) throws Exception {
	}

	/**
	 * update 후 액션
	 * 
	 * @param items
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	protected void onAfterRetrieve(Connection conn,
			List<Map<String, Object>> items, HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		Map<String, String> columnSvcFieldMap = this.getColumnSvcFieldMap();

		for (Map<String, Object> item : items) {
			Map<String, Object> itemToAdd = null;

			// table column 명과 실제 서비스로 표시할 필드명이 다를 경우 매핑된 필드로 바꿔서 리턴한다.
			Iterator<String> itemKeyIter = item.keySet().iterator();
			while (itemKeyIter.hasNext()) {
				String itemKey = itemKeyIter.next();

				if (columnSvcFieldMap != null
						&& columnSvcFieldMap.containsKey(itemKey)) {
					if (itemToAdd == null)
						itemToAdd = new HashMap<String, Object>();

					itemToAdd.put(columnSvcFieldMap.get(itemKey),
							item.get(itemKey));
				}
			}

			if (itemToAdd != null)
				item.putAll(itemToAdd);

			// key 정보 추가
			item.put("key",
					this.getKeyData(item,
							this.getPrimaryKeys(this.getTableName()),
							columnSvcFieldMap));
			item.put("success", true);
		}
	}

	/**
	 * 테이블 상관없이 쿼리를 단순수행한다. query, param으로 카운트를 조회하여 리턴, connection은 닫지 않고 리턴
	 * 
	 * @param conn
	 * @param query
	 *            count query
	 * @param params
	 * @return
	 * @throws Exception
	 */
	protected int count(Connection conn, String query,
			Map<Integer, Object> params) throws Exception {

		PreparedStatement pstmt = null;
		ResultSet rs = null;
		int count = 0;

		try {
			pstmt = conn.prepareStatement(query);
			this.setParameters(pstmt, params);
			rs = pstmt.executeQuery();

			if (rs.next()) {
				count = rs.getInt(1);
			}

		} catch (Exception e) {
			logger.error("Failed to executeQuery!", e);
			throw e;

		} finally {
			this.closeDB(rs, pstmt);
		}

		return count;
	}

	/**
	 * 테이블 상관없이 쿼리를 수행한다. query, param으로 카운트를 조회하여 리턴, connection을 새로 얻어서 실행 후
	 * 닫고 리턴
	 * 
	 * @param query
	 * @param params
	 * @return
	 * @throws Exception
	 */
	protected int count(String query, Map<Integer, Object> params)
			throws Exception {

		Connection conn = null;
		try {
			conn = this.getConnection();
			return this.count(conn, query, params);

		} catch (Exception e) {
			logger.error("Failed to execute!", e);
			throw e;

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * query를 params 파라미터를 적용하여 실행한다. 실행 후 Connection을 닫지 않는다.
	 * 
	 * @param conn
	 * @param query
	 * @param params
	 * @throws Exception
	 */
	protected void execute(Connection conn, String query,
			Map<Integer, Object> params) throws Exception {

		PreparedStatement pstmt = null;
		try {
			pstmt = conn.prepareStatement(query);
			this.setParameters(pstmt, params);
			pstmt.execute();

		} catch (Exception e) {
			logger.error("Failed to execute!", e);
			throw e;

		} finally {
			this.closeDB(pstmt);
		}
	}

	/**
	 * query를 params 파라미터를 적용하여 쿼리를 실행하여 결과를 Map의 리스트 형태로 리턴한다. 실행 후 Connection은
	 * 닫지 않는다.
	 * 
	 * @param conn
	 * @param query
	 * @param params
	 * @return
	 * @throws Exception
	 */
	protected List<Map<String, Object>> executeQuery(Connection conn,
			String query, Map<Integer, Object> params) throws Exception {

		List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
		PreparedStatement pstmt = null;
		ResultSet rs = null;

		try {
			pstmt = conn.prepareStatement(query);
			this.setParameters(pstmt, params);
			rs = pstmt.executeQuery();

			while (rs.next()) {
				Map<String, Object> record = new HashMap<String, Object>();
				ResultSetMetaData md = rs.getMetaData();
				int columnCount = md.getColumnCount();

				for (int i = 1; i <= columnCount; i++) {
					String columnName = md.getColumnName(i);
					Object value = rs.getObject(columnName);
					record.put(columnName, value);
				}

				result.add(record);
			}

		} catch (Exception e) {
			logger.error("Failed to executeQuery!", e);
			throw e;

		} finally {
			this.closeDB(rs, pstmt);
		}

		return result;
	}

	/**
	 * query를 params 파라미터를 적용하여 실행한다. 실행 전 Connection을 생성하고 실행 후 닫는다.
	 * 
	 * @param query
	 * @param params
	 * @throws Exception
	 */
	protected void execute(String query, Map<Integer, Object> params)
			throws Exception {

		Connection conn = null;
		try {
			conn = this.getConnection();
			this.execute(conn, query, params);

		} catch (Exception e) {
			logger.error("Failed to execute!", e);
			throw e;

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * query를 params 파라미터를 적용하여 쿼리를 실행하여 결과를 Map의 리스트 형태로 리턴한다. 실행 전 Connection을
	 * 생성하고 실행 후 Connection은 닫는다.
	 * 
	 * @param query
	 * @param params
	 * @return
	 * @throws Exception
	 */
	protected List<Map<String, Object>> executeQuery(String query,
			Map<Integer, Object> params) throws Exception {

		Connection conn = null;
		try {
			conn = this.getConnection();
			return this.executeQuery(conn, query, params);

		} catch (Exception e) {
			logger.error("Failed to execute!", e);
			throw e;

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * query를 params 파라미터를 적용하여 쿼리를 실행하여 결과를 Map의 리스트 형태로 리턴한다. 실행 전 Connection을
	 * 생성하고 실행 후 Connection은 닫는다.
	 * 
	 * @param query
	 * @param params
	 * @return
	 * @throws Exception
	 */
	protected Map<String, Object> executeSingleQuery(String query,
			Map<Integer, Object> params) throws Exception {

		Connection conn = null;
		try {
			conn = this.getConnection();
			return this.executeSingleQuery(conn, query, params);

		} catch (Exception e) {
			logger.error("Failed to execute!", e);
			throw e;

		} finally {
			this.closeDB(conn);
		}
	}

	/**
	 * query를 params 파라미터를 적용하여 쿼리를 실행하여 결과를 Map의 리스트 형태로 리턴한다.
	 * 
	 * @param conn
	 * @param query
	 * @param params
	 * @return
	 * @throws Exception
	 */
	protected Map<String, Object> executeSingleQuery(Connection conn,
			String query, Map<Integer, Object> params) throws Exception {

		Map<String, Object> result = new HashMap<String, Object>();
		PreparedStatement pstmt = null;
		ResultSet rs = null;

		try {
			pstmt = conn.prepareStatement(query);
			this.setParameters(pstmt, params);
			rs = pstmt.executeQuery();

			while (rs.next()) {
				ResultSetMetaData md = rs.getMetaData();
				int columnCount = md.getColumnCount();

				for (int i = 1; i <= columnCount; i++) {
					String columnName = md.getColumnName(i);
					Object value = rs.getObject(columnName);
					result.put(columnName, value);
				}
			}

		} catch (Exception e) {
			logger.error("Failed to executeSingleQuery!", e);
			throw e;

		} finally {
			this.closeDB(rs, pstmt);
		}

		return result;
	}

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
			if (connection != null)
				connection.close();
		} catch (SQLException e) {
			logger.error("Error while close connection!", e);
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
		return (user != null) ? user.getCompany() : request
				.getParameter("company");
	}

	/**
	 * company key를 생성하여 리턴
	 * 
	 * @param request
	 * @return
	 */
	protected Key getCompanyKey(HttpServletRequest request) {
		return KeyFactory.createKey("Company", this.getCompany(request));
	}

	/**
	 * 결과셋 리턴
	 * 
	 * @param success
	 * @param totalCount
	 * @param items
	 * @return
	 */
	protected Map<String, Object> getResultSet(boolean success, int totalCount,
			Object items) {

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", success);
		result.put("total", totalCount);
		result.put("items", items);
		return result;
	}

	/**
	 * json 형태의 filterStr을 파싱하여 검색 조건을 생성한다.
	 * 
	 * @param filterStr
	 * @return
	 * @throws Exception
	 */
	protected Map<String, Object> parseFilters(String filterStr)
			throws Exception {

		Map<String, Object> condition = new HashMap<String, Object>();

		if (filterStr == null)
			return condition;

		List<Filter> filters = new ObjectMapper().readValue(filterStr,
				new TypeReference<List<Filter>>() {
				});

		for (Filter filter : filters)
			condition.put(filter.getProperty(), filter.getValue());

		return condition;
	}

	/**
	 * json 형태의 sorterStr을 파싱하여 Sort 조건을 생성한다.
	 * 
	 * @param sorterStr
	 * @return
	 * @throws Exception
	 */
	protected List<Sorter> parseSorters(String sorterStr) throws Exception {

		if (sorterStr == null)
			return null;

		return new ObjectMapper().readValue(sorterStr,
				new TypeReference<List<Sorter>>() {
				});
	}

	/**
	 * select 절을 생성하여 리턴한다. 클라이언트로 부터 넘어온 select 필드가 실제 테이블의 컬럼명과 일치하는지 비교
	 * 
	 * @param tableName
	 * @param selectCols
	 *            클라이언트로 부터 넘어온 select 필드 리스트
	 * @return
	 * @throws Exception
	 */
	private String getSelectPhase(String tableName, String[] selectCols)
			throws Exception {

		StringBuffer selectPhase = new StringBuffer();
		Map<String, Integer> columnInfo = this.getColumnInfo(tableName);
		Map<String, String> columnSvcFieldMap = this.getColumnSvcFieldMap();

		for (int i = 0; i < selectCols.length; i++) {
			// 클라이언트로 부터 넘어온 select 필드가 실제 테이블의 컬럼명과 일치하는지 비교, 일치하면 OK
			if (columnInfo.containsKey(selectCols[i])) {
				selectPhase.append(selectPhase.length() == 0 ? "" : ",")
						.append(selectCols[i]);

				// 일치하지 않으면 서비스 명으로 매핑테이블을 조회, 여기에 매핑되는 값이 있다면 매핑되는 컬럼명이 select
				// 절에 추가되고 그렇지 않으면 빠진다.
			} else {
				if (columnSvcFieldMap != null
						&& columnSvcFieldMap.containsValue(selectCols[i])) {
					Iterator<String> columnIter = columnSvcFieldMap.keySet()
							.iterator();
					while (columnIter.hasNext()) {
						String columnName = columnIter.next();
						String svcFiled = columnSvcFieldMap.get(columnName);
						if (svcFiled.equals(selectCols[i])) {
							selectPhase.append(
									selectPhase.length() == 0 ? "" : ",")
									.append(columnName);
							break;
						}
					}
				}
			}
		}

		return selectPhase.toString();
	}

	/**
	 * column type에 따라 값 변환
	 * 
	 * @param type
	 * @param value
	 * @return
	 */
	protected Object convertValueByType(int type, String value) {

		if (type == Types.BIT || type == Types.BOOLEAN) {
			return DataUtils.toBool(value);
		} else if (type == Types.DATE) {
			Date d = DataUtils.toDate(value);
			return (d != null) ? new java.sql.Date(d.getTime()) : null;
		} else if (type == Types.TIMESTAMP) {
			Date d = DataUtils.toDate(value);
			return (d != null) ? new java.sql.Timestamp(d.getTime()) : null;
		} else if (type == Types.TINYINT || type == Types.SMALLINT
				|| type == Types.INTEGER) {
			return DataUtils.toInt(value);
		} else if (type == Types.FLOAT) {
			return DataUtils.toFloat(value);
		} else if (type == Types.DOUBLE) {
			return DataUtils.toDouble(value);
		} else if (type == Types.BIGINT) {
			return DataUtils.toLong(value);
		} else if (type == Types.DECIMAL) {
			return DataUtils.isEmpty(value) ? null : new BigDecimal(value);
		} else {
			return value;
		}
	}

	/**
	 * table이 가지는 컬럼 정보를 리턴한다.
	 * 
	 * @param tableName
	 * @return 컬럼명 - 컬럼타입 맵 정보
	 * @throws
	 */
	protected Map<String, Integer> getColumnInfo(String tableName)
			throws Exception {
		if (!TABLE_COLUMN_MAP.containsKey(tableName)) {
			this.initTableInfo(tableName);
		}

		return TABLE_COLUMN_MAP.get(tableName);
	}

	/**
	 * table이 가지는 PK 컬럼명 리스트를 리턴한다.
	 * 
	 * @param tableName
	 * @return
	 * @throws
	 */
	protected List<String> getPrimaryKeys(String tableName) throws Exception {
		if (!TABLE_PK_MAP.containsKey(tableName)) {
			this.initTableInfo(tableName);
		}

		return TABLE_PK_MAP.get(tableName);
	}

	/**
	 * 테이블 - 컬럼 매핑, 테이블 - PK 매핑을 초기화한다.
	 * 
	 * @param tableName
	 * @throws Exception
	 */
	protected void initTableInfo(String tableName) throws Exception {

		Connection conn = null;
		ResultSet rs = null;

		try {
			Map<String, Integer> columnInfo = new HashMap<String, Integer>();
			conn = this.getConnection();
			DatabaseMetaData dbMetaData = conn.getMetaData();
			rs = dbMetaData.getColumns(null, null, tableName, "%");
			while (rs.next()) {
				columnInfo.put(rs.getString("COLUMN_NAME"),
						rs.getInt("DATA_TYPE"));
			}

			if (!TABLE_COLUMN_MAP.containsKey(tableName))
				TABLE_COLUMN_MAP.put(tableName, columnInfo);

			rs.close();

			List<String> pkList = new Vector<String>();
			rs = dbMetaData.getPrimaryKeys(null, null, tableName);
			while (rs.next()) {
				pkList.add(rs.getString("COLUMN_NAME"));
			}

			if (!TABLE_PK_MAP.containsKey(tableName))
				TABLE_PK_MAP.put(tableName, pkList);

		} catch (Exception e) {
			throw e;

		} finally {
			this.closeDB(rs, conn);
		}
	}

	/**
	 * close database connection
	 * 
	 * @param closables
	 */
	protected void closeDB(Object... closables) {

		try {
			for (Object closable : closables) {

				if (closable == null)
					continue;

				if (closable instanceof ResultSet) {
					((ResultSet) closable).close();

				} else if (closable instanceof Statement) {
					((Statement) closable).close();

				} else if (closable instanceof Connection) {
					((Connection) closable).close();
				}
			}
		} catch (Exception e) {
			logger.error("Failed to close connection!", e);
		}
	}

	/**
	 * record로 부터 display key 값을 뽑아서 리턴한다. 각 서비스마다 key 데이터를 다른 방식으로 생성하려면 이 메소드를
	 * 재정의한다.
	 * 
	 * @param record
	 * @param pkList
	 * @param columnSvcFieldMap
	 * @return
	 */
	protected String getKeyData(Map<String, Object> record,
			List<String> pkList, Map<String, String> columnSvcFieldMap) {

		String keyData = "";

		for (int i = 0; i < pkList.size(); i++) {
			// table 컬럼명으로 request로 부터 데이터를 뽑아 매핑한다.
			String pkColumn = pkList.get(i);
			Object value = record.get(pkList.get(i));

			// 값이 없다면 colSvcFieldMap에서 매핑된 정보로 request에서 정보를 추출
			if (value == null && columnSvcFieldMap != null
					&& columnSvcFieldMap.containsKey(pkColumn)) {
				value = record.get(columnSvcFieldMap.get(pkColumn));
			}

			keyData += (i > 0 ? "@" : "");
			keyData += (value == null) ? " " : value.toString();
		}

		return keyData;
	}

	/**
	 * keyData를 다시 Object[]로 복원한다.
	 * 
	 * @param keyData
	 * @param tableName
	 * @param columnSvcFieldMap
	 * @return
	 * @throws
	 */
	protected Object[] restoreKeyData(String keyData, String tableName)
			throws Exception {

		List<String> pkList = this.getPrimaryKeys(tableName);
		Map<String, Integer> columnInfo = this.getColumnInfo(tableName);
		String[] keyStrData = keyData.split("@");
		Object[] keyObjData = new Object[keyStrData.length];

		for (int i = 0; i < pkList.size(); i++) {
			String pkColumn = pkList.get(i);
			int dataType = columnInfo.get(pkColumn);
			keyObjData[i] = this.convertValueByType(dataType, keyStrData[i]);
		}

		return keyObjData;
	}

	/**
	 * request의 파라미터를 모두 map 형태로 변환
	 * 
	 * @param request
	 * @return
	 */
	protected Map<String, Object> toMap(HttpServletRequest request) {

		Map<String, Object> map = new HashMap<String, Object>();
		@SuppressWarnings("rawtypes")
		Enumeration e = request.getParameterNames();
		while (e.hasMoreElements()) {
			String name = (String) e.nextElement();
			map.put(name, request.getParameter(name));
		}

		if (!map.containsKey("company")) {
			map.put("company", this.getCompany(request));
		}
		return map;
	}

	/**
	 * Multipart file google store에 저장
	 * 
	 * @param request
	 * @param file
	 * @return
	 * @throws IOException
	 */
	protected String saveFile(MultipartHttpServletRequest request,
			MultipartFile file) throws IOException {

		if (file != null && file.getSize() > 0) {
			com.google.appengine.api.files.FileService fileService = FileServiceFactory
					.getFileService();
			AppEngineFile appfile = fileService.createNewBlobFile(
					file.getContentType(), file.getOriginalFilename());
			FileWriteChannel writeChannel = fileService.openWriteChannel(
					appfile, true);
			writeChannel.write(ByteBuffer.wrap(file.getBytes()));
			writeChannel.closeFinally();
			return fileService.getBlobKey(appfile).getKeyString();
		} else {
			return null;
		}
	}

	/**
	 * request에서 paging을 위한 start 값과 limit 값을 찾아 계산 후 리턴
	 * 
	 * @param request
	 * @return 첫 번째 값이 start, 두 번째 값이 limit
	 */
	protected int[] getStartLimitCount(HttpServletRequest request) {

		String pPage = request.getParameter("page");
		String pLimit = request.getParameter("limit");

		int page = 0;
		int limit = Integer.MAX_VALUE;

		if (pPage != null) {
			page = Integer.parseInt(pPage);
		}

		if (pLimit != null) {
			limit = Integer.parseInt(pLimit);
		}

		return new int[] { (page - 1) * limit, page * limit };
	}

	/**
	 * parameter를 설정한다.
	 * 
	 * @param pstmt
	 * @param params
	 *            키는 1부터 시작한다.
	 * @throws Exception
	 */
	private void setParameters(PreparedStatement pstmt,
			Map<Integer, Object> params) throws Exception {

		if (params != null && !params.isEmpty()) {
			for (int i = 1; i <= params.size(); i++) {
				if (!params.containsKey(i))
					throw new Exception("[" + i + "]'s Parameter is empty!");

				Object value = params.get(i);
				pstmt.setObject(i, value);
			}
		}
	}
}
