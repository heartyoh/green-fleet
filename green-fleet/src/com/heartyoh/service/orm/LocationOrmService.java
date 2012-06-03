/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Query;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.IEntity;
import com.heartyoh.model.Location;
import com.heartyoh.util.DataUtils;

/**
 * Location Service
 * 
 * @author jhnam
 */
@Controller
public class LocationOrmService extends OrmEntityService {

	private static final String[] KEY_FIELDS = new String[] { "company", "name" };
	
	@Override
	public Class<?> getEntityClass() {
		return Location.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}

	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		query.addOrder("updated_at", false);
		return query;
	}

	@RequestMapping(value = "/location/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/location/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/location", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.retrieveByPaging(request, response);
	}
	
	@RequestMapping(value = "/location/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/location/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		
		Location location = (Location)entity;
		location.setExpl(request.getParameter("expl"));		
		location.setAddr(request.getParameter("addr"));
		location.setLat(DataUtils.toFloat(request.getParameter("lat")));
		location.setLng(DataUtils.toFloat(request.getParameter("lng")));
		location.setRad(DataUtils.toFloat(request.getParameter("rad")));
		location.setLatHi(DataUtils.toFloat(request.getParameter("lat_hi")));
		location.setLatLo(DataUtils.toFloat(request.getParameter("lat_lo")));
		location.setLngHi(DataUtils.toFloat(request.getParameter("lng_hi")));
		location.setLngLo(DataUtils.toFloat(request.getParameter("lng_lo")));
		
		location.beforeUpdate();
		return location;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new Location(this.getCompany(request), request.getParameter("name"));
		}
		
		entity.beforeCreate();
		return entity;
	}
}
