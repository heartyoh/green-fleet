package com.heartyoh.dao.impl;

import java.util.Collection;
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
    private static final String USER_FORENAME = "forename";
    private static final String USER_SURNAME = "surname";
    private static final String USER_NICKNAME = "nickname";
    private static final String USER_EMAIL = "email";
    private static final String USER_ENABLED = "enabled";
    private static final String USER_AUTHORITIES = "authorities";
    private static final String USER_COMPANY = "company";

    public List<CustomUser> listUsers(String company) {
    	return null;
    }
    
    public CustomUser findUser(String email) {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        Query q = new Query(USER_TYPE);
		q.addFilter("email", Query.FilterOperator.EQUAL, email);
        
        PreparedQuery pq = datastore.prepare(q);
		
//        Key key = KeyFactory.createKey(USER_TYPE, userId);
//        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        try {
//            Entity user = datastore.get(key);
    		Entity user = pq.asSingleEntity();
    		if(user == null)
    			return null;

            long binaryAuthorities = (Long)user.getProperty(USER_AUTHORITIES);
            Set<AppRole> roles = EnumSet.noneOf(AppRole.class);

            for (AppRole r : AppRole.values()) {
                if ((binaryAuthorities & (1 << r.getBit())) != 0) {
                    roles.add(r);
                }
            }

            CustomUser gaeUser = new CustomUser(
                    user.getKey().getName(),
                    (String)user.getProperty(USER_NICKNAME),
                    (String)user.getProperty(USER_EMAIL),
                    (String)user.getProperty(USER_FORENAME),
                    (String)user.getProperty(USER_SURNAME),
                    roles,
                    (String)user.getProperty(USER_COMPANY),
                    (Boolean)user.getProperty(USER_ENABLED));

            return gaeUser;

//        } catch (EntityNotFoundException e) {
//            logger.debug(userId + " not found in datastore");
        } catch (PreparedQuery.TooManyResultsException e) {
            logger.debug("Too many items found who email is " + email + " in the datastore");
            return null;
        }
    }

    public void registerUser(CustomUser newUser) {
        logger.debug("Attempting to create new user " + newUser);
        
        Key companyKey = KeyFactory.createKey("Company", newUser.getCompany());
        Key key = KeyFactory.createKey(companyKey, USER_TYPE, newUser.getEmail());

//        Key key = KeyFactory.createKey(USER_TYPE, newUser.getUserId());
        
        Entity user =  
        		new Entity(key);
        user.setProperty(USER_EMAIL, newUser.getEmail());
        user.setProperty(USER_NICKNAME, newUser.getNickname());
        user.setProperty(USER_FORENAME, newUser.getForename());
        user.setProperty(USER_SURNAME, newUser.getSurname());
        user.setProperty(USER_COMPANY, newUser.getCompany());
        user.setUnindexedProperty(USER_ENABLED, newUser.isEnabled());

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

//      Key key = KeyFactory.createKey(USER_TYPE, userId);

//      datastore.delete(key);

//        Query q = new Query(USER_TYPE);
//		q.addFilter("email", Query.FilterOperator.EQUAL, email);
//        
//        PreparedQuery pq = datastore.prepare(q);
//		Entity user = pq.asSingleEntity();
//
//        datastore.delete(user.getKey());
    }
}
