package com.heartyoh.model;

import java.io.Serializable;
import java.util.Collection;
import java.util.EnumSet;
import java.util.Set;

import com.heartyoh.security.AppRole;

@SuppressWarnings("serial")
public class CustomUser implements Serializable {
	private String key;
	private String userId;
	private String email;
	private String name;
	private Set<AppRole> authorities;
	private String company;
	private String language;
	private boolean enabled;

	/**
	 * Pre-registration constructor.
	 * 
	 * Assigns the user the "NEW_USER" role only.
	 */
	public CustomUser(String userId, String name, String email) {
		this.key = null;
		this.userId = userId;
		this.name = name;
		this.authorities = EnumSet.of(AppRole.NEW_USER);
		this.email = email;
		this.company = null;
		this.language = "en";
		this.enabled = true;
	}

	/**
	 * Post-registration constructor
	 */
	public CustomUser(String key, String userId, String name, String email, Set<AppRole> authorities, String company, String language, boolean enabled) {
		this.key = key;
		this.userId = userId;
		this.name = name;
		this.email = email;
		this.authorities = authorities;
		this.company = company;
		if (language == null)
			language = "en";
		this.language = language;
		this.enabled = enabled;
	}

	/**
	 * Post-registration constructor
	 */
	public CustomUser(String key, String email, String name, Set<AppRole> authorities, String company, String language, boolean enabled) {
		this.key = key;
		this.name = name;
		this.email = email;
		this.authorities = authorities;
		this.company = company;
		if (language == null)
			language = "en";
		this.language = language;
		this.enabled = enabled;
	}

	public String getKey() {
		return key;
	}
	
	public String getUserId() {
		return userId;
	}

	public String getName() {
		return name;
	}

	public String getEmail() {
		return email;
	}

	public String getCompany() {
		return company;
	}

	public String getLanguage() {
		return language;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public Collection<AppRole> getAuthorities() {
		return authorities;
	}

	@Override
	public String toString() {
		return "GaeUser{" + "userId='" + userId + '\'' + ", name='" + name + '\'' + ", company='" + company + '\'' + ", language='"
				+ language + '\'' + ", authorities=" + authorities + '}';
	}
}
