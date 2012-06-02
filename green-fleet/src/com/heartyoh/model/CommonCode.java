/**
 * 
 */
package com.heartyoh.model;

import java.util.Date;

/**
 * CommonCode 모델 
 * 
 * @author jhnam
 */
public class CommonCode extends AbstractEntity {

	/**
	 * 코드 그룹
	 */
	private String codeGroup;
	/**
	 * 코드 
	 */
	private String code;
	/**
	 * 코드 설명
	 */
	private String expl;
	/**
	 * 생성일 
	 */
	private Date createdAt;
	/**
	 * 수정일 
	 */
	private Date updatedAt;
	
	/**
	 * 생성자 
	 * 
	 * @param company
	 * @param codeGroup
	 * @param code
	 */
	public CommonCode(String company, String codeGroup, String code) {
		this.company = company;
		this.codeGroup = codeGroup;
		this.code = code;
	}
	
	public CommonCode() {		
	}
	
	public String getCodeGroup() {
		return codeGroup;
	}

	public void setCodeGroup(String codeGroup) {
		this.codeGroup = codeGroup;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getExpl() {
		return expl;
	}

	public void setExpl(String expl) {
		this.expl = expl;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public Date getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Date updatedAt) {
		this.updatedAt = updatedAt;
	}
	
	@Override
	public void beforeSave() {		
		if(this.createdAt == null)
			this.createdAt = new Date();
		
		if(this.updatedAt == null)
			this.updatedAt = new Date();
	}

	@Override
	public void beforeCreate() {
		if(this.createdAt == null)
			this.createdAt = new Date();
	}

	@Override
	public void beforeUpdate() {
		if(this.updatedAt == null)
			this.updatedAt = new Date();
	}	

	@Override
	public String getUniqueValue() {
		return this.codeGroup + "@" + this.code;
	}

}
