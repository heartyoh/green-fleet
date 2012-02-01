package com.heartyoh.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityExistsException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.SessionUtils;

@Controller
public class CodeService {
	private static final Logger logger = LoggerFactory.getLogger(CodeService.class);
	private static final String entity_name = "Code";

	@RequestMapping(value = "/code/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws IOException {
		CustomUser user = SessionUtils.currentUser();

		MultipartFile file = request.getFile("file");

		BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));

		String line = br.readLine();
		/*
		 * First line for the header Information
		 */
		String[] keys = line.split(",");

		/*
		 * Next lines for the values
		 */
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		try {
			Key companyKey = KeyFactory.createKey("Company", user.getCompany());

			Date now = new Date();

			while ((line = br.readLine()) != null) {
				String[] values = line.split(",");

				Map<String, String> map = new HashMap<String, String>();

				for (int i = 0; i < keys.length; i++) {
					map.put(keys[i].trim(), values[i].trim());
				}

				try {
					String id = map.get("id");
					Entity code = new Entity(entity_name, id, companyKey);

					code.setProperty("id", id);
					code.setProperty("code", map.get("code"));
					code.setProperty("name", map.get("name"));
					code.setProperty("value", map.get("value"));
					code.setProperty("updatedAt", now);
					code.setProperty("createdAt", now);

					datastore.put(code);

				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		} finally {
		}

		response.setContentType("text/html");

		return "{ \"success\" : true }";
	}

	@RequestMapping(value = "/code/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String imageClip = null;
		if (request instanceof MultipartHttpServletRequest) {
			// process the uploaded file
			MultipartFile imageFile = ((MultipartHttpServletRequest) request).getFile("imageFile");

			if (imageFile.getSize() > 0) {
				com.google.appengine.api.files.FileService fileService = FileServiceFactory.getFileService();
				AppEngineFile file = fileService.createNewBlobFile(imageFile.getContentType());

				boolean lock = true;
				FileWriteChannel writeChannel = fileService.openWriteChannel(file, lock);

				writeChannel.write(ByteBuffer.wrap(imageFile.getBytes()));

				writeChannel.closeFinally();

				imageClip = fileService.getBlobKey(file).getKeyString();
			}
		}

		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String id = request.getParameter("id");
		String code = request.getParameter("code");
		String name = request.getParameter("name");
		String value = request.getParameter("value");

		Key objKey = null;
		boolean creating = false;

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		Key companyKey = KeyFactory.createKey("Company", user.getCompany());
		
		Entity obj = null;

		if (key != null && key.trim().length() > 0) {
			objKey = KeyFactory.stringToKey(key);
			try {
				obj = datastore.get(objKey);
			} catch (EntityNotFoundException e) {
				// It's OK.(but Lost Key maybe.)
				creating = true;
			}
		} else {
			objKey = KeyFactory.createKey(companyKey, entity_name, id);
			try {
				obj = datastore.get(objKey);
			} catch (EntityNotFoundException e) {
				// It's OK.
				creating = true;

			}
			// It's Not OK. You try to add duplicated identifier.
			if (obj != null)
				throw new EntityExistsException(entity_name + " with id(" + id + ") already Exist.");
		}

		Date now = new Date();

		try {
			if (creating) {
				obj = new Entity(entity_name, id, companyKey);

				obj.setProperty("id", id);
				obj.setProperty("createdAt", now);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if (code != null)
				obj.setProperty("code", code);
			if (name != null)
				obj.setProperty("name", name);
			if (value != null)
				obj.setProperty("value", value);
			if (name != null)
				obj.setProperty("name", name);

			obj.setProperty("updatedAt", now);

			datastore.put(obj);
		} finally {
		}

		response.setContentType("text/html");

		return "{ \"success\" : true, \"key\" : \"" + obj.getKey() + "\" }";
	}

	@RequestMapping(value = "/code/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

		try {
			datastore.delete(KeyFactory.stringToKey(key));
		} finally {
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", entity_name + " destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/code", method = RequestMethod.GET)
	public @ResponseBody
	List<Map<String, Object>> retrieve(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String jsonFilter = request.getParameter("filter");
		String jsonSorter = request.getParameter("sort");

		List<Filter> filters = null;
		List<Sorter> sorters = null;

		try {
			if (jsonFilter != null) {
				filters = new ObjectMapper().readValue(request.getParameter("filter"),
						new TypeReference<List<Filter>>() {
						});
			}
			if (jsonSorter != null) {
				sorters = new ObjectMapper().readValue(request.getParameter("sort"), new TypeReference<List<Sorter>>() {
				});
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());

		// The Query interface assembles a query
		Query q = new Query("Incident");
		q.setAncestor(companyKey);

		// PreparedQuery contains the methods for fetching query results
		// from the datastore
		PreparedQuery pq = datastore.prepare(q);

		List<Map<String, Object>> list = new LinkedList<Map<String, Object>>();

		for (Entity result : pq.asIterable()) {
			SessionUtils.cvtEntityToMap(result);
		}

		return list;
	}

}
