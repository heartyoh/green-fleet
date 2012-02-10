package com.heartyoh.service;

import java.io.IOException;
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
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.Entity;
import com.heartyoh.util.SessionUtils;

@Controller
public class TerminalService extends EntityService {
	private static final Logger logger = LoggerFactory.getLogger(TerminalService.class);
	
	@Override
	protected String getEntityName() {
		return "Terminal";
	}

	@Override
	protected boolean useFilter() {
		return false;
	}

	@Override
	protected String getIdValue(Map<String, String> map) {
		return map.get("id");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, String> map, Date now) {
		entity.setProperty("id", map.get("id"));
		entity.setProperty("createdAt", now);
	}

	@Override
	protected void onMultipart(Entity entity, Map<String, String> map, MultipartHttpServletRequest request) throws IOException {
		super.onMultipart(entity, map, request);
		if(map.containsKey("imageFile"))
			entity.setProperty("imageClip", map.get("imageFile"));
	}

	@Override
	protected void onSave(Entity entity, Map<String, String> map, Date now) {
		String serialNo = map.get("serialNo");
		String buyingDate = map.get("buyingDate");
		String comment = map.get("comment");

		entity.setProperty("serialNo", serialNo);
		entity.setProperty("buyingDate", SessionUtils.timestampToDate(buyingDate));
		entity.setProperty("comment", comment);

		entity.setProperty("updatedAt", now);
	}

	@RequestMapping(value = "/terminal/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws IOException {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/terminal/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		return super.save(request, response);
	}

	@RequestMapping(value = "/terminal/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) {
		return super.delete(request, response);
	}

	@RequestMapping(value = "/terminal", method = RequestMethod.GET)
	public @ResponseBody
	List<Map<String, Object>> retrieve(HttpServletRequest request, HttpServletResponse response) {
		return super.retrieve(request, response);
	}

}
