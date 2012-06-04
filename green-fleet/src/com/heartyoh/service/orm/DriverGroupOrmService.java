/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
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

import com.heartyoh.model.DriverGroup;
import com.heartyoh.model.DriverRelation;
import com.heartyoh.model.IEntity;
import com.heartyoh.util.DataUtils;

/**
 * DriverGroup Service
 * 
 * @author jhnam
 */
@Controller
public class DriverGroupOrmService extends OrmEntityService {
	
	private static final String[] KEY_FIELDS = new String[] { "company", "id" };
	
	@Override
	public Class<?> getEntityClass() {
		return DriverGroup.class;
	}
	
	@Override
	public String[] getKeyFields() {		
		return KEY_FIELDS;
	}
	
	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		Query query = super.getRetrieveQuery(request);
		query.addOrder("id", true);
		return query;
	}
	
	@RequestMapping(value = "/driver_group/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/driver_group/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}

	@RequestMapping(value = "/driver_group", method = RequestMethod.GET)
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		
		// TODO outer join
		String sql = "select dg.*, dr.driver_id from driver_group dg, driver_relation dr where dg.company = dr.company and dg.company = :company and dg.id = dr.group_id order by dg.id asc";
		Map<String, Object> params = DataUtils.newMap("company", this.getCompany(request));
		List<Map> items = this.dml.selectListBySql(sql, params, Map.class, 0, 0);
				
		String prevId = "";
		Map newItem = null;
		List<String> drivers = null;
		List<Map> results = new ArrayList<Map>();
		
		for(Map item : items) {
			String id = (String)item.get("id");
			
			if(prevId.equals(id)) {
				// get
				drivers.add((String)item.get("driver_id"));
			} else {
				// 전 groupId에 대한 처리
				if(newItem != null) {
					newItem.put("drivers", drivers);
					results.add(newItem);
				}
				
				// 객체 새로 생성
				newItem = new HashMap();
				drivers = new ArrayList<String>();
				newItem.put("key", id);
				newItem.put("id", id);
				newItem.put("desc", (String)item.get("expl"));
				newItem.put("updated_at", (Date)item.get("updated_at"));
				newItem.put("created_at", (Date)item.get("created_at"));
				drivers.add((String)item.get("driver_id"));
			}
			
			prevId = id;
		}
		
		if(newItem != null) {
			newItem.put("drivers", drivers);		
			results.add(newItem);
		}
		
		return this.getResultSet(true, results.size(), results);
	}	
	
	@RequestMapping(value = "/driver_group/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/driver_group/find", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@RequestMapping(value = "/driver_group/group_count" , method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> groupCount(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String query = "select vg.id, vg.expl, count(vr.group_id) count from driver_relation vr, driver_group vg where vg.company = :company and vr.group_id = vg.id group by vr.group_id";
			Map<String, Object> params = DataUtils.newMap("company", this.getCompany(request));
			@SuppressWarnings("unchecked")
			Map<String, Object> items = this.dml.selectBySql(query, params, Map.class);
			return this.getResultSet(true, items.size(), items);
		} catch (Exception e) {
			return this.getResultSet(true, 0, null);
		}
	}	
	
	@RequestMapping(value = "/driver_group/drivers", method = RequestMethod.GET)
	public  @ResponseBody
	Map<String, Object> driversByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);
		String company = this.getCompany(request);
		String groupId = request.getParameter("driver_group_id");
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		
		try {
			// 1. driver relation 총 개수 
			String sql = "select count(*) from driver_relation where company = :company and group_id = :group_id";
			Query query = new Query();
			query.addFilter("company", company).addFilter("group_id", groupId);
			int totalCount = this.dml.selectSize(DriverRelation.class, query);
		
			// 2. driver 조회 
			sql = "select d.* from driver d, driver_relation dr where d.id = dr.driver_id and dr.company = :company and dr.group_id = :group_id order by d.id asc";
			Map<String, Object> params = DataUtils.newMap("company", company);
			params.put("group_id", groupId);
			@SuppressWarnings("rawtypes")
			List<Map> items = this.dml.selectListBySql(sql, params, Map.class, page - 1, limit);
			
			// 3. 결과 생성 
			return this.getResultSet(true, totalCount, items);
			
		} catch (Exception e) {
			return this.getResultSet(true, 0, null);
		}
	}
	
	@RequestMapping(value = "/driver_relation/save", method = RequestMethod.POST)
	public @ResponseBody
	String saveRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String company = this.getCompany(request);
		String groupId = request.getParameter("driver_group_id");
		String[] driverIdArr = request.getParameterValues("driver_id");		
		
		try {
			List<DriverRelation> oldRelations = this.findDriverRelations(company, groupId, driverIdArr);
			List<DriverRelation> newRelations = new ArrayList<DriverRelation>();
		
			for(int i = 0 ; i < driverIdArr.length ; i++) {
				if(!this.existDriverRelation(oldRelations, driverIdArr[i]))			
					newRelations.add(new DriverRelation(company, groupId, driverIdArr[i]));
			}
			
			this.dml.insertBatch(newRelations);
			
		} catch(Exception e) {
			return "{\"success\" : false, \"msg\" : \"Failed to save - " + e.getMessage() + "\"}";
		}
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save!\"}";
	}
	
	/**
	 * driver relation 정보를 조회 
	 * 
	 * @param company
	 * @param groupId
	 * @param driverIdArr
	 * @return
	 * @throws Exception
	 */
	private List<DriverRelation> findDriverRelations(String company, String groupId, String[] driverIdArr) throws Exception {
		// TODO 체크 
		Query query = new Query();
		query.addFilter("company", company).addFilter("group_id", groupId).addFilter("driver_id", driverIdArr);
		return this.dml.selectList(DriverRelation.class, query);
	}
	
	/**
	 * relations에 driverId가 존재하는지 체크 
	 * 
	 * @param relations
	 * @param driverId
	 * @return
	 */
	private boolean existDriverRelation(List<DriverRelation> relations, String driverId) {
		
		for(DriverRelation rel : relations) {
			if(rel.getDriverId().equalsIgnoreCase(driverId)) {
				return true;
			}
		}
		
		return false;
	}
	
	@RequestMapping(value = "/driver_relation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String deleteRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String company = this.getCompany(request);
		String groupId = request.getParameter("driver_group_id");
		String[] driverIdArr = request.getParameterValues("driver_id");
		Query query = new Query();
		query.addFilter("company", company).addFilter("group_id", groupId).addFilter("driver_id", driverIdArr);
		
		try {
			List<DriverRelation> relations = this.dml.selectList(DriverRelation.class, query);
		
			if(!relations.isEmpty())
				this.dml.deleteBatch(relations);
		
			return "{ \"success\" : true, \"msg\" : \"Driver relation destroyed!\", \"key\" : \"" + groupId + "\" }";
			
		} catch (Exception e) {
			return "{ \"success\" : false, \"msg\" : \"Failed to destroyed driver relation " + e.getMessage() + "\", \"key\" : \"" + groupId + "\" }";
		}
	}	

	@Override
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		
		DriverGroup group = (DriverGroup)entity;
		Map<String, Object> map = group.toMap(null);
		map.put("desc", group.getExpl());
		return map;
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		
		DriverGroup group = (DriverGroup)entity;
		group.setId(request.getParameter("id"));
		group.setExpl(request.getParameter("desc"));		
		group.beforeUpdate();
		return group;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			String company = this.getCompany(request);
			String id = request.getParameter("id");
			String expl = request.getParameter("desc");
			entity = new DriverGroup(company, id, expl);
		}
		
		entity.beforeCreate();
		return entity;
	}	
		
}
