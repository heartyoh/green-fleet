/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Query;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.CommonCode;
import com.heartyoh.model.Filter;
import com.heartyoh.model.IEntity;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.DataUtils;

/**
 * Code Service
 * 
 * @author jhnam
 */
@Controller
public class CodeOrmService extends OrmEntityService {

	/**
	 * key field names
	 */
	private static final String[] KEY_FIELDS = new String[] { "company", "group", "code" };
	
	@Override
	public Class<?> getEntityClass() {
		return CommonCode.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}
	
	@Override
	public boolean useFilter() {
		return true;
	}

	@RequestMapping(value = "/code/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/code/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/code", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/code/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/code/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@Override
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		Map<String, Object> item = entity.toMap(request.getParameterValues("select"));
		item.put("desc", item.get("expl"));
		item.put("group", item.get("code_group"));
		return item;
	}	
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		CommonCode code = (CommonCode)entity;
		code.setExpl(request.getParameter("desc"));
		code.beforeUpdate();
		return code;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new CommonCode(this.getCompany(request), request.getParameter("group"), request.getParameter("code"));
		}
		
		entity.beforeCreate();
		return entity;
	}
		
	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		
		if(this.useFilter()) {
			List<Filter> filters = this.parseFilters(request.getParameter("filter"));
			List<Sorter> sorters = this.parseSorters(request.getParameter("sorter"));
			
			if(filters != null) {
				for(Filter filter : filters) {
					if("group".equalsIgnoreCase(filter.getProperty()))
						filter.setProperty("code_group");
				
					query.addFilter(filter.getProperty(), filter.getValue());
				}
			}
		
			if(sorters != null) {
				for(Sorter sorter : sorters) {
					if("group".equalsIgnoreCase(sorter.getProperty()))
						sorter.setProperty("code_group");
				
					query.addOrder(sorter.getProperty(), "asc".equals(sorter.getDirection().toLowerCase()));
				}
			}
		}
		
		return query;
	}
	
	@Override
	protected Query getKeyQuery(HttpServletRequest request, boolean checkNull) throws Exception {
		Query query = new Query();
		String[] keyFields = this.getKeyFields();
		
		for(int i = 0; i < keyFields.length ; i++) {
			String key = keyFields[i];
			Object value = request.getParameter(key);
			
			if("company".equalsIgnoreCase(key)) {
				value = this.getCompany(request);
			}
			
			if("group".equalsIgnoreCase(key)) {
				key = "code_group";
			}
			
			// checkNull이 true로 되어 있다면 request에 key 값이 없다면 예외 발생 
			if(checkNull && DataUtils.isEmpty(value))
				throw new Exception("Key [" + key + "] value is null!");
			
			query.addFilter(key, value);
		}
		
		return query;
	}
}
