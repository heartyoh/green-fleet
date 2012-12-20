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
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.ConsumableCode;
import com.heartyoh.model.IEntity;
import com.heartyoh.util.DataUtils;

/**
 * Consumable Code Service
 * 
 * @author jhnam
 */
@Controller
public class ConsumableCodeOrmService extends OrmEntityService {

	private static final String[] KEY_FIELDS = new String[] { "company", "name" };
	
	@Override
	public Class<?> getEntityClass() {
		return ConsumableCode.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}
	
	@Override
	protected boolean useFilter() {
		return true;
	}
	
	@RequestMapping(value = "/consumable_code/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/consumable_code/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/consumable_code", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/consumable_code/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/consumable_code/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@Override
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		Map<String, Object> item = entity.toMap(request.getParameterValues("select"));
		item.put("desc", item.get("expl"));
		return item;
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		ConsumableCode consumableCode = (ConsumableCode)entity;		
		consumableCode.setExpl(request.getParameter("expl"));
		consumableCode.setFstReplMileage(DataUtils.toInt(request.getParameter("fst_repl_mileage")));
		consumableCode.setFstReplTime(DataUtils.toInt(request.getParameter("fst_repl_time")));
		consumableCode.setReplMileage(DataUtils.toInt(request.getParameter("repl_mileage")));
		consumableCode.setReplTime(DataUtils.toInt(request.getParameter("repl_time")));
		consumableCode.setReplUnit(request.getParameter("repl_unit"));
		consumableCode.beforeUpdate();
		return consumableCode;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new ConsumableCode(this.getCompany(request), request.getParameter("name"));			
		}
		
		entity.beforeCreate();
		return entity;
	}	

}
