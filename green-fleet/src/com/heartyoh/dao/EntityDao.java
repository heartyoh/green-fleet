package com.heartyoh.dao;

import java.util.List;
import java.util.Map;

import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;

public interface EntityDao {
	public List<Map<String, Object>> select(String table, String[] selects, List<Filter> filters, List<Sorter> orders, int start, int limit);
	public int selectCount(String table, List<Filter> filters);
	public Map<String, Object> find(String from, String[] selects, List<Filter> filters);
}
