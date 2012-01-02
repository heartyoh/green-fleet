package com.heartyoh.service;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.persistence.EntityExistsException;
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

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.files.AppEngineFile;
import com.google.appengine.api.files.FileServiceFactory;
import com.google.appengine.api.files.FileWriteChannel;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Driver;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class DriverService {
	private static final Logger logger = LoggerFactory.getLogger(DriverService.class);
	private static final Class<Driver> clazz = Driver.class;

	@RequestMapping(value = "/driver/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String imageClip = null;
		if (request instanceof MultipartHttpServletRequest) {
			// process the uploaded file
			MultipartFile imageFile = ((MultipartHttpServletRequest) request).getFile("imageFile");

			com.google.appengine.api.files.FileService fileService = FileServiceFactory.getFileService();
			String filename = new String(imageFile.getOriginalFilename().getBytes(response.getCharacterEncoding()));
			AppEngineFile file = fileService.createNewBlobFile(imageFile.getContentType(), filename);

			boolean lock = true;
			FileWriteChannel writeChannel = fileService.openWriteChannel(file, lock);

			writeChannel.write(ByteBuffer.wrap(imageFile.getBytes()));

			writeChannel.closeFinally();

			imageClip = fileService.getBlobKey(file).getKeyString();
		}
		
		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String id = new String(request.getParameter("id").getBytes(response.getCharacterEncoding()));
		String name = new String(request.getParameter("name").getBytes(response.getCharacterEncoding()));

		String division = new String(request.getParameter("division").getBytes(response.getCharacterEncoding()));
		String title = new String(request.getParameter("title").getBytes(response.getCharacterEncoding()));

		// Map<String, BlobKey> blobs =
		// blobstoreService.getUploadedBlobs(request);
		// BlobKey blobKey = blobs.get("imageClip");

		Key objKey = null;
		boolean creating = false;

		PersistenceManager pm = PMF.get().getPersistenceManager();
		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
		Company company = pm.getObjectById(Company.class, companyKey);
		Driver obj = null;

		if (key != null && key.trim().length() > 0) {
			objKey = KeyFactory.stringToKey(key);
		} else {
			objKey = KeyFactory.createKey(companyKey, clazz.getSimpleName(), id);
			try {
				obj = pm.getObjectById(clazz, objKey);
			} catch (JDOObjectNotFoundException e) {
				// It's OK.
				creating = true;

			}
			// It's Not OK. You try to add duplicated identifier.
			if (obj != null)
				throw new EntityExistsException(clazz.getSimpleName() + " with id(" + id + ") already Exist.");
		}

		Date now = new Date();

		try {
			if (creating) {
				obj = new Driver();
				obj.setKey(KeyFactory.keyToString(objKey));
				obj.setCompany(company);
				obj.setId(id);
				obj.setCreatedAt(now);
			} else {
				obj = pm.getObjectById(clazz, objKey);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if (name != null)
				obj.setName(name);
			if (title != null)
				obj.setTitle(title);
			if (division != null)
				obj.setDivision(division);
			 if (imageClip != null)
				 obj.setImageClip(imageClip);

			obj.setUpdatedAt(now);

			obj = pm.makePersistent(obj);
		} finally {
			pm.close();
		}

		response.setContentType("text/html");

		return "{ \"success\" : true, \"key\" : \"" + obj.getKey() + "\" }";

		// Map<String, Object> result = new HashMap<String, Object>();
		//
		// result.put("success", true);
		// result.put("msg", clazz.getSimpleName() + (creating ? " created." :
		// " updated"));
		// result.put("key", obj.getKey());
		//
		// return result;
	}

	@RequestMapping(value = "/driver/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Driver obj = pm.getObjectById(clazz, KeyFactory.stringToKey(key));

			pm.deletePersistent(obj);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", clazz.getSimpleName() + " destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/driver", method = RequestMethod.GET)
	public @ResponseBody
	List<Driver> retrieve(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		// String jsonFilter = request.getParameter("filter");
		// String jsonSorter = request.getParameter("sort");
		//
		// List<Filter> filters = null;
		// List<Sorter> sorters = null;
		//
		//
		//
		// try {
		// if(jsonFilter != null) {
		// filters = new
		// ObjectMapper().readValue(request.getParameter("filter"), new
		// TypeReference<List<Filter>>(){ });
		// }
		// if(jsonSorter != null) {
		// sorters = new ObjectMapper().readValue(request.getParameter("sort"),
		// new TypeReference<List<Sorter>>(){ });
		// }
		// } catch (Exception e) {
		// e.printStackTrace();
		// }

		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Company company = pm.getObjectById(Company.class, companyKey);
		// Query query = pm.newQuery(clazz);
		//
		// query.setFilter("company == companyParam && id >= idParam1 && id < idParam2");
		// query.declareParameters(Company.class.getName() +
		// " companyParam, String idParam1, String idParam2");
		//
		// String idFilter = null;
		//
		// if (filters != null) {
		// Iterator<Filter> it = filters.iterator();
		// while (it.hasNext()) {
		// Filter filter = it.next();
		// if(filter.getProperty().equals("id"))
		// idFilter = filter.getValue();
		// }
		// }

		// query.setGrouping(user.getCompany());
		// query.setOrdering();
		// query.declareParameters();

		// return (List<Driver>) query.execute(company, idFilter, idFilter +
		// "\ufffd");
		return company.getDrivers();
	}

}
