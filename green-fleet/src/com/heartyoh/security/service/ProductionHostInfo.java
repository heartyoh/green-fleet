/**
 * 
 */
package com.heartyoh.security.service;

import java.util.List;

/**
 * Production mode의 Host 정보 테이블 
 * 
 * @author jhnam
 */
public class ProductionHostInfo {

	/**
	 * 운영 모드 host명 대상 리스트
	 */
	private List<String> hostNameList;

	public List<String> getHostNameList() {
		return hostNameList;
	}

	public void setHostNameList(List<String> hostNameList) {
		this.hostNameList = hostNameList;
	}
	
}
