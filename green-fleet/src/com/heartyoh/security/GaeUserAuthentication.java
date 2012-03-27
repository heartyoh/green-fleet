package com.heartyoh.security;

import java.util.Collection;
import java.util.HashSet;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import com.heartyoh.model.CustomUser;

public class GaeUserAuthentication implements Authentication {
	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -7923390262882445539L;
	private final CustomUser principal;
	private final Object details;
	private boolean authenticated;

	public GaeUserAuthentication(CustomUser principal, Object details) {
		this.principal = principal;
		this.details = details;
		authenticated = true;
	}

	public Collection<GrantedAuthority> getAuthorities() {
		return new HashSet<GrantedAuthority>(principal.getAuthorities());
	}

	public Object getCredentials() {
		throw new UnsupportedOperationException();
	}

	public Object getDetails() {
		return null;
	}

	public Object getPrincipal() {
		return principal;
	}

	public boolean isAuthenticated() {
		return authenticated;
	}

	public void setAuthenticated(boolean isAuthenticated) {
		authenticated = isAuthenticated;
	}

	public String getName() {
		return principal.getUserId();
	}

	@Override
	public String toString() {
		return "GaeUserAuthentication{" + "principal=" + principal + ", details=" + details + ", authenticated="
				+ authenticated + '}';
	}
}
