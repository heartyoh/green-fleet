/**
 * 
 */
package com.heartyoh.datasource;

import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;

import javax.servlet.http.HttpServletRequest;
import javax.sql.DataSource;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Dbist에서 사용하는 DataSource 구현
 * 
 * @author jhnam
 */
public class GfDataSource implements DataSource {

	/**
	 * request scope에서 사용될 connection명 : request의 attributes에 추가되는 connection 이름
	 */
	public static final String REQUEST_CONNECTION_ATTR_NAME = "gf_conneciton";
	/**
	 * driver class name
	 */
	private String driverClassName = "com.google.appengine.api.rdbms.AppEngineDriver"; 
	/**
	 * connection url
	 */
	private String connectionUrl = "jdbc:google:rdbms://green-fleets-cloudsql:green-fleets/fleet_master";
	/**
	 * root
	 */
	private String user = "root";
	/**
	 * password
	 */
	private String password = "";
	/**
	 * login timeout
	 */
	private int loginTimeout = 0;
	/**
	 * log writer
	 */
	private PrintWriter logWriter = new PrintWriter(System.out);
	
	@Override
	public PrintWriter getLogWriter() throws SQLException {
		return this.logWriter;
	}

	@Override
	public int getLoginTimeout() throws SQLException {
		return this.loginTimeout;
	}

	@Override
	public void setLogWriter(PrintWriter logWriter) throws SQLException {
		this.logWriter = logWriter;
	}

	@Override
	public void setLoginTimeout(int loginTimeout) throws SQLException {
		this.loginTimeout = loginTimeout;
	}

	@Override
	public boolean isWrapperFor(Class<?> arg0) throws SQLException {
		return false;
	}

	@Override
	public <T> T unwrap(Class<T> arg0) throws SQLException {
		return null;
	}
	
	public void setDriverClassName(String driverClassName) {
		this.driverClassName = driverClassName;
	}
	
	public String getDriverClassName() {
		return this.driverClassName;
	}
	
	public void setConnectionUrl(String connectionUrl) {
		this.connectionUrl = connectionUrl;
	}
	
	public String getConnectionUrl() {
		return this.connectionUrl;
	}
	
	public void setUser(String user) {
		this.user = user;
	}
	
	public String getUser() {
		return this.user;
	}
	
	public void setPassword(String password) {
		this.password = password;
	}
	
	public String getPassword() {
		return this.password;
	}

	@Override
	public Connection getConnection() throws SQLException {
		return getConnection(null, null);
	}

	@Override
	public Connection getConnection(String arg0, String arg1) throws SQLException {
		
		if(DriverManager.getDrivers() == null || !DriverManager.getDrivers().hasMoreElements()) {
			try {
				Class<?> clazz = Class.forName(this.driverClassName);
				Driver driver = (Driver)clazz.newInstance();
				DriverManager.registerDriver(driver);
			} catch (Exception e) {
				throw new SQLException("Failed to load driver [" + this.driverClassName + "]!", e);
			}
		}

		Connection conn = null;
		
		// 사용자 요청을 처리하는 경우 
		try {
			// 현재 request에서 attribute gf_connection을 꺼내서 재사용. 없으면 새로 생성해서 추가 
			HttpServletRequest curRequest = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
			if(curRequest.getAttribute(REQUEST_CONNECTION_ATTR_NAME) != null) {
				conn = (Connection)curRequest.getAttribute(REQUEST_CONNECTION_ATTR_NAME);
			} else {
				Connection googleConn = DriverManager.getConnection(this.connectionUrl, this.user, this.password);
				conn = new GfConnection(googleConn);
				curRequest.setAttribute(REQUEST_CONNECTION_ATTR_NAME, conn);
			}
		} catch (Exception e) {
			// Context Loading 시점에는 이 코드 ... 
			conn = DriverManager.getConnection(this.connectionUrl, this.user, this.password);
		}
		
		return conn;
	}
}
