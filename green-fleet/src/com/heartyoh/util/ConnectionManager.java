/**
 * 
 */
package com.heartyoh.util;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;

import org.dbist.dml.Dml;

import com.google.appengine.api.rdbms.AppEngineDriver;

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
	
	private static Driver driver;
	/**
	 * datasource
	 */
	private Dml dml;
		
	public void setDml(Dml dml) {
		this.dml = dml;
	}
	
	public Dml getDml() {
		return this.dml;
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
		if(driver == null) {
			driver = new AppEngineDriver();
			DriverManager.registerDriver(driver);
		}
		
	    return DriverManager.getConnection("jdbc:google:rdbms://green-fleets-cloudsql:green-fleets/fleet_master", "root", "");
	}
}
