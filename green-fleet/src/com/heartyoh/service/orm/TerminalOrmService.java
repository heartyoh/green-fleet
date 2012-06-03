/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.IEntity;
import com.heartyoh.model.Terminal;
import com.heartyoh.util.DataUtils;

/**
 * Terminal Service
 * 
 * @author jhnam
 */
public class TerminalOrmService extends OrmEntityService {

	private static final String[] KEY_FIELDS = new String[] { "company", "id" };
	
	@Override
	public Class<?> getEntityClass() {
		return Terminal.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}
	
	@RequestMapping(value = "/terminal/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/terminal/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/terminal", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/terminal/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/terminal/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.find(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		Terminal terminal = (Terminal)entity;		
		terminal.setSerialNo(request.getParameter("serial_no"));
		terminal.setVehicleId(request.getParameter("vehicle_id"));
		terminal.setComment(request.getParameter("comment"));
		String buyingDateStr = request.getParameter("buying_date");
		
		if(DataUtils.isEmpty(buyingDateStr)) {
			Date buyingDate = DataUtils.toDate(buyingDateStr);
			terminal.setBuyingDate(buyingDate);
		}
		
		terminal.beforeUpdate();
		return terminal;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new Terminal(this.getCompany(request), request.getParameter("id"));
		}
		
		entity.beforeCreate();
		return entity;
	}
	
	@Override
	protected void postMultipart (IEntity entity, Map<String, Object> paramMap, MultipartHttpServletRequest request) throws Exception {
		
		String imageFile = super.saveFile(request, (MultipartFile) paramMap.get("image_file"));
		if(imageFile != null) {
			paramMap.put("image_clip", imageFile);
			Terminal terminal = (Terminal)entity;
			terminal.setImageClip(imageFile);
			this.dml.update(terminal);
		}

		super.postMultipart(entity, paramMap, request);
	}

}
