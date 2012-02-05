package com.heartyoh.model;

import java.io.Serializable;
import java.util.Collection;
import java.util.EnumSet;
import java.util.Set;

import com.heartyoh.security.AppRole;

@SuppressWarnings("serial")
public class CustomUser implements Serializable {
	private String userId;
	private String email;
	private String nickname;
	private String forename;
	private String surname;
	private Set<AppRole> authorities;
	private String company;
	private boolean enabled;

	/**
	 * Pre-registration constructor.
	 * 
	 * Assigns the user the "NEW_USER" role only.
	 */
	public CustomUser(String userId, String nickname, String email) {
		this.userId = userId;
		this.nickname = nickname;
		this.authorities = EnumSet.of(AppRole.NEW_USER);
		this.forename = null;
		this.surname = null;
		this.email = email;
		this.company = null;
		this.enabled = true;
	}

	/**
	 * Post-registration constructor
	 */
	public CustomUser(String userId, String nickname, String email, String forename, String surname,
			Set<AppRole> authorities, String company, boolean enabled) {
		this.userId = userId;
		this.nickname = nickname;
		this.email = email;
		this.authorities = authorities;
		this.forename = forename;
		this.surname = surname;
		this.company = company;
		this.enabled = enabled;
	}

	/**
	 * Post-registration constructor
	 */
	public CustomUser(String email, String nickname, String forename, String surname,
			Set<AppRole> authorities, String company, boolean enabled) {
		this.nickname = nickname;
		this.email = email;
		this.authorities = authorities;
		this.forename = forename;
		this.surname = surname;
		this.company = company;
		this.enabled = enabled;
	}

	public String getUserId() {
		return userId;
	}

	public String getNickname() {
		return nickname;
	}

	public String getEmail() {
		return email;
	}

	public String getForename() {
		return forename;
	}

	public String getSurname() {
		return surname;
	}

	public String getCompany() {
		return company;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public Collection<AppRole> getAuthorities() {
		return authorities;
	}

	@Override
	public String toString() {
		return "GaeUser{" + "userId='" + userId + '\'' + ", nickname='" + nickname + '\'' + ", forename='" + forename
				+ '\'' + ", surname='" + surname + '\'' + ", company='" + company + '\'' + ", authorities=" + authorities + '}';
	}
}
