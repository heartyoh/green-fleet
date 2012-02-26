package com.heartyoh.service;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.heartyoh.util.SessionUtils;

@Controller
public class ReservationService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(ReservationService.class);

	@Override
	protected String getEntityName() {
		return "Reservation";
	}

	@Override
	protected boolean useFilter() {
		return true;
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return map.get("vehicle_id") + "@" + map.get("reserved_date");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		entity.setProperty("vehicle_id", map.get("vehicle_id"));
		entity.setProperty("reserved_date", SessionUtils.stringToDate((String) map.get("reserved_date")));

		super.onCreate(entity, map, datastore);
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, DatastoreService datastore) throws Exception {
		String driver = (String) map.get("driver_id");
		String vehicle_type = (String) map.get("vehicle_type");
		String delivery_place = (String) map.get("delivery_place");
		String destination = (String) map.get("destination");
		String purpose = (String) map.get("purpose");
		String status = (String) map.get("status");

		entity.setProperty("driver_id", driver);
		entity.setProperty("vehicle_type", vehicle_type);
		entity.setProperty("delivery_place", delivery_place);
		entity.setProperty("destination", destination);
		entity.setProperty("purpose", purpose);
		entity.setProperty("status", status);

		super.onSave(entity, map, datastore);
	}

	@RequestMapping(value = "/reservation/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.save(request, response);
	}

	@RequestMapping(value = "/reservation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/reservation", method = RequestMethod.GET)
	public @ResponseBody
	List<Map<String, Object>> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

	@Override
	protected void addFilter(Query q, String property, String value) {
		if("reserved_date".equals(property)) {
			long fromMillis = Long.parseLong(value);
			Calendar c = Calendar.getInstance();
			c.setTimeInMillis(fromMillis * 1000);
			Date fromDate = c.getTime();
			c.setTimeInMillis((fromMillis + (60 * 60 * 24)) * 1000);
			Date toDate = c.getTime();
			q.addFilter("reserved_date", Query.FilterOperator.GREATER_THAN_OR_EQUAL, fromDate);
			q.addFilter("reserved_date", Query.FilterOperator.LESS_THAN_OR_EQUAL, toDate);
		} else {			
			q.addFilter(property, FilterOperator.EQUAL, value);
		}
	}
}
