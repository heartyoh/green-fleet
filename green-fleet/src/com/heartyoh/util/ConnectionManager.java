/**
 * 
 */
package com.heartyoh.util;

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
		return instance;
	}
	
	private ConnectionManager() {		
	}	
}
