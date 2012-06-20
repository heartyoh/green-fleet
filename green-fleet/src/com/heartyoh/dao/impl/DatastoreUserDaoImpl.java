package com.heartyoh.dao.impl;

import java.util.Collection;
import java.util.Date;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.heartyoh.dao.UserDao;
import com.heartyoh.model.CustomUser;
import com.heartyoh.security.AppRole;

public class DatastoreUserDaoImpl implements UserDao {
	private final Logger logger = LoggerFactory.getLogger(getClass());

	private static final String USER_TYPE = "CustomUser";
	private static final String USER_NAME = "name";
	private static final String USER_EMAIL = "email";
	private static final String USER_ENABLED = "enabled";
	private static final String USER_AUTHORITIES = "authorities";
	private static final String USER_COMPANY = "company";
	private static final String USER_LANGUAGE = "language";
	private static final String USER_CREATED_AT = "created_at";
	private static final String USER_UPDATED_AT = "updated_at";

	public List<CustomUser> listUsers(String company) {
		return null;
	}

	public CustomUser findUser(String email) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Query q = new Query(USER_TYPE);
		q.addFilter("email", Query.FilterOperator.EQUAL, email);
		q.addFilter("enabled", Query.FilterOperator.EQUAL, true);

		PreparedQuery pq = datastore.prepare(q);

		try {
			Entity user = pq.asSingleEntity();
			if (user == null)
				return null;

			long binaryAuthorities = (Long) user.getProperty(USER_AUTHORITIES);
			Set<AppRole> roles = EnumSet.noneOf(AppRole.class);

			for (AppRole r : AppRole.values()) {
				if ((binaryAuthorities & (1 << r.getBit())) != 0) {
					roles.add(r);
				}
			}

			CustomUser gaeUser = new CustomUser(KeyFactory.keyToString(user.getKey()), user.getKey().getName(),
					(String) user.getProperty(USER_NAME), (String) user.getProperty(USER_EMAIL), roles,
					(String) user.getProperty(USER_COMPANY), (String) user.getProperty(USER_LANGUAGE),
					(Boolean) user.getProperty(USER_ENABLED));

			return gaeUser;

		} catch (PreparedQuery.TooManyResultsException e) {
			logger.debug("Too many items found who email is " + email + " in the datastore");
			return null;
		}
	}

	public void registerUser(CustomUser newUser) {
		
		if(logger.isDebugEnabled())
			logger.debug("Attempting to create new user " + newUser);

		Key companyKey = KeyFactory.createKey("Company", newUser.getCompany());
		Key key = KeyFactory.createKey(companyKey, USER_TYPE, newUser.getEmail());
		Date now = new Date();
		
		Entity user = new Entity(key);
		user.setProperty(USER_EMAIL, newUser.getEmail());
		user.setProperty(USER_NAME, newUser.getName());
		user.setProperty(USER_COMPANY, newUser.getCompany());
		user.setProperty(USER_LANGUAGE, newUser.getLanguage());
		user.setUnindexedProperty(USER_ENABLED, newUser.isEnabled());
		user.setUnindexedProperty(USER_CREATED_AT, now);
		user.setUnindexedProperty(USER_UPDATED_AT, now);

		Collection<AppRole> roles = newUser.getAuthorities();
		long binaryAuthorities = 0;

		for (AppRole r : roles) {
			binaryAuthorities |= 1 << r.getBit();
		}

		user.setUnindexedProperty(USER_AUTHORITIES, binaryAuthorities);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.put(user);
	}

	public void removeUser(String key) {
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		datastore.delete(KeyFactory.stringToKey(key));
	}
}
