/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.IEntity;
import com.heartyoh.model.VehicleGroup;
import com.heartyoh.model.VehicleRelation;
import com.heartyoh.util.DataUtils;

/**
 * VehicleGroup Service
 * 
 * @author jhnam
 */
@Controller
public class VehicleGroupOrmService extends OrmEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(VehicleGroupOrmService.class);
	/**
	 * 
	 */
	private static final String[] KEY_FIELDS = new String[] { "company", "group_id" };
			
	@Override
	public Class<?> getEntityClass() {
		return VehicleGroup.class;
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
	
	@RequestMapping(value = "/vehicle_group/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return this.delete(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.find(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/group_count" , method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> groupCount(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String query = "select vg.id, vg.expl, count(vr.group_id) count from vehicle_relation vr, vehicle_group vg where vg.company = :company and vr.group_id = vg.id group by vr.group_id";
			Map<String, Object> params = DataUtils.newMap("company", this.getCompany(request));
			@SuppressWarnings("rawtypes")
			List<Map> items = this.dml.selectListBySql(query, params, Map.class, 0, 0);
			return this.getResultSet(true, items.size(), items);
		} catch (Exception e) {
			return this.getResultSet(true, 0, null);
		}
	}	
	
	@RequestMapping(value = "/vehicle_group/vehicles", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> vehiclesByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType(CONTENT_TYPE);
		String company = this.getCompany(request);
		String groupId = request.getParameter("vehicle_group_id");
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		
		try {
			// 1. driver relation 총 개수 
			String sql = "select count(*) from vehicle_relation where company = :company and group_id = :group_id";
			Query query = new Query();
			query.addFilter("company", company).addFilter("group_id", groupId);
			int totalCount = this.dml.selectSize(VehicleRelation.class, query);
		
			// 2. driver 조회 
			sql = "select v.* from vehicle v, vehicle_relation vr where v.id = vr.vehicle_id and vr.company = :company and vr.group_id = :group_id order by v.id asc";
			Map<String, Object> params = DataUtils.newMap("company", company);
			params.put("group_id", groupId);
			@SuppressWarnings("rawtypes")
			List<Map> items = this.dml.selectListBySql(sql, params, Map.class, page - 1, limit);
			
			// 3. 결과 생성 
			return this.getResultSet(true, totalCount, items);
			
		} catch (Exception e) {
			logger.error("Failed to get vehicles by vehicle group!", e);
			return this.getResultSet(true, 0, null);
		}		
	}
	
	@RequestMapping(value = "/vehicle_group/vehicle_ids", method = RequestMethod.GET)
	public @ResponseBody 
	Map<String, Object> vehicleIdListByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		Map<String, Object> params = DataUtils.newMap("company", this.getCompany(request));
		params.put("group_id", request.getParameter("group_id"));
		String sql = "select vehicle_id from vehicle_relation where company = :company and group_id = :group_id";
		List<String> items = this.dml.selectListBySql(sql, params, String.class, 0, 0);
		return this.getResultSet(true, items.size(), items);		
	}
	
	@Override
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		
		VehicleGroup group = (VehicleGroup)entity;
		Map<String, Object> map = group.toMap(null);
		map.put("desc", group.getExpl());
		return map;
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		
		VehicleGroup group = (VehicleGroup)entity;
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
			entity = new VehicleGroup(company, id, expl);
		}
		
		entity.beforeCreate();
		return entity;
	}
	
	@RequestMapping(value = "/vehicle_relation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String deleteRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String company = this.getCompany(request);
		String groupId = request.getParameter("vehicle_group_id");
		String[] vehicleIdArr = request.getParameterValues("vehicle_id");
		Query query = new Query();
		query.addFilter("company", company).addFilter("group_id", groupId).addFilter("vehicle_id", vehicleIdArr);
		
		try {
			List<VehicleRelation> relations = this.dml.selectList(VehicleRelation.class, query);
		
			if(!relations.isEmpty())
				this.dml.deleteBatch(relations);
		
			return "{ \"success\" : true, \"msg\" : \"Vehicle group destroyed!\", \"key\" : \"" + groupId + "\" }";
			
		} catch (Exception e) {
			return "{ \"success\" : false, \"msg\" : \"Failed to destroyed vehicle group " + e.getMessage() + "\", \"key\" : \"" + groupId + "\" }";
		}		
	}
	
	@RequestMapping(value = "/vehicle_relation/save", method = RequestMethod.POST)
	public @ResponseBody
	String saveRelation(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		response.setContentType("text/html; charset=UTF-8");
		String company = this.getCompany(request);
		String groupId = request.getParameter("driver_group_id");
		String[] vehicleIdArr = request.getParameterValues("driver_id");		
		
		try {
			List<VehicleRelation> oldRelations = this.findVehicleRelations(company, groupId, vehicleIdArr);
			List<VehicleRelation> newRelations = new ArrayList<VehicleRelation>();
		
			for(int i = 0 ; i < vehicleIdArr.length ; i++) {
				if(!this.existVehicleRelation(oldRelations, vehicleIdArr[i]))			
					newRelations.add(new VehicleRelation(company, groupId, vehicleIdArr[i]));
			}
			
			this.dml.insertBatch(newRelations);
			
		} catch(Exception e) {
			return "{\"success\" : false, \"msg\" : \"Failed to save - " + e.getMessage() + "\"}";
		}
		
		return "{\"success\" : true, \"msg\" : \"Succeeded to save!\"}";
	}
	
	/**
	 * vehicle relation 정보를 조회 
	 * 
	 * @param company
	 * @param groupId
	 * @param vehicleIdArr
	 * @return
	 * @throws Exception
	 */
	private List<VehicleRelation> findVehicleRelations(String company, String groupId, String[] vehicleIdArr) throws Exception {
		// TODO 체크 
		Query query = new Query();
		query.addFilter("company", company).addFilter("group_id", groupId).addFilter("vehicle_id", vehicleIdArr);
		return this.dml.selectList(VehicleRelation.class, query);
	}
	
	/**
	 * relations에 driverId가 존재하는지 체크 
	 * 
	 * @param relations
	 * @param vehicleId
	 * @return
	 */
	private boolean existVehicleRelation(List<VehicleRelation> relations, String vehicleId) {
		
		for(VehicleRelation rel : relations) {
			if(rel.getVehicleId().equalsIgnoreCase(vehicleId)) {
				return true;
			}
		}
		
		return false;
	}
}
