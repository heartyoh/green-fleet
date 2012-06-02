/**
 * 
 */
package com.heartyoh.util;

import java.sql.Connection;

import javax.sql.DataSource;

import org.dbist.dml.Dml;

/**
 * JdbcConnectionPool
 * 
 * @author jhnam
 */
public class ConnectionManager {

	/**
	 * singleton
	 */
	private static ConnectionManager instance;
	
	/**
	 * dbist dml
	 */
	private Dml dml;
	/**
	 * datasource
	 */
	private DataSource dataSource;
		
	public void setDml(Dml dml) {
		this.dml = dml;
	}
	
	public Dml getDml() {
		return this.dml;
	}
	
	public void setDataSource(DataSource dataSource) {
		this.dataSource = dataSource;
	}
	
	public DataSource getDataSource() {
		return this.dataSource;
	}
	
	public static ConnectionManager createInstance() {
		if(instance == null) {
			instance = new ConnectionManager();
		}
		
		return instance;
	}
	
	public static ConnectionManager getInstance() {
		
		if(instance == null)
			createInstance();
		
		return instance;
	}
	
	private ConnectionManager() {		
	}
	
	public Connection getConnection() throws Exception {
		return this.dataSource.getConnection();
	}
}
