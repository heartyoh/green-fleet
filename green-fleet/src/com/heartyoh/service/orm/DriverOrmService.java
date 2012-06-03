/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.Driver;
import com.heartyoh.model.IEntity;

/**
 * Driver Service
 * 
 * @author jhnam
 */
@Controller
public class DriverOrmService extends OrmEntityService {

	/**
	 * key fields
	 */
	private static final String[] KEY_FIELDS = new String[] { "company", "id" };
	
	@Override
	public Class<?> getEntityClass() {
		return Driver.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}
	
	@Override
	public boolean useFilter() {
		return true;
	}

	@RequestMapping(value = "/driver/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/driver/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/driver", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/driver/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/driver/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		Driver driver = (Driver)entity;
		driver.setDivision(request.getParameter("division"));
		driver.setTitle(request.getParameter("title"));
		driver.setDivision(request.getParameter("division"));
		driver.setSocialId(request.getParameter("socialId"));
		driver.setPhoneNo1(request.getParameter("phoneNo1"));
		driver.setPhoneNo2(request.getParameter("phoneNo2"));
		driver.beforeUpdate();
		return driver;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new Driver(this.getCompany(request), request.getParameter("id"));
		}
		
		entity.beforeCreate();
		return entity;
	}
	
	@Override
	protected void postMultipart (IEntity entity, Map<String, Object> paramMap, MultipartHttpServletRequest request) throws Exception {
		
		String imageFile = super.saveFile(request, (MultipartFile) paramMap.get("image_file"));
		if(imageFile != null) {
			paramMap.put("image_clip", imageFile);
			Driver driver = (Driver)entity;
			driver.setImageClip(imageFile);
			this.dml.update(driver);
		}

		super.postMultipart(entity, paramMap, request);
	}
}
