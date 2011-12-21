package com.heartyoh.dao.impl;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.heartyoh.dao.EntityDao;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.PMF;

@Component
public class JdoEntityDaoImpl implements EntityDao {
	private static final Logger logger = LoggerFactory.getLogger(JdoEntityDaoImpl.class);
	private static final PersistenceManager pm = PMF.get().getPersistenceManager(); 
	
	private static String buildSelectClause(String[] selects) {
		if (selects == null || selects.length == 0)
			return "SELECT * ";
		return "SELECT " + StringUtils.arrayToDelimitedString(selects, ", ");
	}

	private static String buildWhereClause(List<Filter> filters) {
		if (filters == null || filters.size() == 0)
			return "";

		String[] clause = new String[filters.size()];

		if (filters != null) {
			Iterator<Filter> it = filters.iterator();
			int i = 0;
			while (it.hasNext()) {
				Filter filter = it.next();
				clause[i++] = filter.getProperty() + " LIKE :" + filter.getProperty();
			}
		}

		return " WHERE " + StringUtils.arrayToDelimitedString(clause, " AND ");
	}

	private static String buildOrderByClause(List<Sorter> sorters) {
		if (sorters == null || sorters.size() == 0)
			return "";

		String[] clause = new String[sorters.size()];

		if (sorters != null) {
			Iterator<Sorter> it = sorters.iterator();
			int i = 0;
			while (it.hasNext()) {
				Sorter sorter = it.next();
				clause[i++] = sorter.getProperty() + " " + sorter.getDirection();
			}
		}
		return " ORDER BY " + StringUtils.arrayToDelimitedString(clause, ", ");
	}

	@Override
	public List<Map<String, Object>> select(String table, String[] selects, List<Filter> filters, List<Sorter> orders, int start, int limit) {
		String selectClause = buildSelectClause(selects);
		String whereClause = buildWhereClause(filters);
		String orderbyClause = buildOrderByClause(orders);
		String pStart = Integer.toString(start);
		String pLimit = Integer.toString(start + limit);

		String sql = selectClause + ", ROWNUM RNUM FROM " + table + whereClause + orderbyClause;
		sql = selectClause + " FROM " + "(" + sql + ") WHERE RNUM > " + pStart + " AND RNUM <= " + pLimit;

		Map<String, Object> params = new HashMap<String, Object>();

		if (filters != null) {
			Iterator<Filter> it = filters.iterator();
			while (it.hasNext()) {
				Filter filter = it.next();
				params.put(filter.getProperty(), filter.getValue() + "%");
			}
		}
		
		Query query = pm.newQuery(sql);
//		query.setFilter("lastName == lastNameParam");
//	    query.setOrdering("hireDate desc");
//	    query.declareParameters("String lastNameParam");
//
//	    try {
//	        List<Employee> results = (List<Employee>) query.execute("Smith");
//	        if (!results.isEmpty()) {
//	            for (Employee e : results) {
//	                // ...
//	            }
//	        } else {
//	            // ... no results ...
//	        }
//	    } finally {
//	        query.closeAll();
//	    }
//
//		return query.execute(sql, params);
		return null;
	}

	public int selectCount(String table, List<Filter> filters) {
		String whereClause = buildWhereClause(filters);

		String sql = "SELECT COUNT(*) FROM " + table + whereClause;
		
		logger.info(sql);

		Map<String, Object> params = new HashMap<String, Object>();

		if (filters != null) {
			Iterator<Filter> it = filters.iterator();
			while (it.hasNext()) {
				Filter filter = it.next();
				params.put(filter.getProperty(), filter.getValue() + "%");
			}
		}

		return -1;
	}

	@Override
	public Map<String, Object> find(String from, String[] selects, List<Filter> filters) {
		String selectClause = buildSelectClause(selects);
		String whereClause = buildWhereClause(filters);

		String sql = selectClause + " FROM " + from + whereClause;

		Map<String, Object> params = new HashMap<String, Object>();

		if (filters != null) {
			Iterator<Filter> it = filters.iterator();
			while (it.hasNext()) {
				Filter filter = it.next();
				params.put(filter.getProperty(), filter.getValue());
			}
		}

		return null;
	}

}
