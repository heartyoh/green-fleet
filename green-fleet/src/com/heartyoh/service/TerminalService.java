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
import org.springframework.web.multipart.MultipartFile;
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
	protected String getIdValue(Map<String, Object> map) {
		return (String) map.get("id");
	}

	@Override
	protected void onCreate(Entity entity, Map<String, Object> map, Date now) {
		entity.setProperty("id", map.get("id"));
		entity.setProperty("created_at", now);
	}

	@Override
	protected void postMultipart(Entity entity, Map<String, Object> map, MultipartHttpServletRequest request)
			throws IOException {
		super.postMultipart(entity, map, request);

		entity.setProperty("image_clip", saveFile((MultipartFile) map.get("image_file")));
	}

	@Override
	protected void onSave(Entity entity, Map<String, Object> map, Date now) {
		entity.setProperty("serial_no", stringProperty(map, "serial_no"));
		entity.setProperty("buying_date", SessionUtils.timestampToDate((String) map.get("buying_date")));
		entity.setProperty("comment", stringProperty(map, "comment"));

		entity.setProperty("updated_at", now);
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
