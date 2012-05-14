/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.dbist.dml.Query;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.IEntity;
import com.heartyoh.model.VehicleGroup;
import com.heartyoh.model.VehicleRelation;
import com.heartyoh.util.DataUtils;

/**
 * Vehicle & Vehicle Group Relation Service
 * 
 * @author jhnam
 */
public class VehicleRelationOrmService extends OrmEntityService {

	private String[] keyFields = new String[] { "key" };
	
	@Override
	public String[] getKeyFields() {
		return this.keyFields;
	}	

	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		return query;
	}
	
	@Override
	public Class<?> getEntityClass() {
		return VehicleRelation.class;
	}

	@RequestMapping(value = "/vehicle_relation/import", method = RequestMethod.POST)
	public void imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		
		super.imports(request, response);
	}
	
	@RequestMapping(value = "/vehicle_relation/delete", method = RequestMethod.POST)
	public void delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String vehicleGroupId = request.getParameter("vehicle_group_id");
		String[] vehicleIdArr = request.getParameterValues("vehicle_id");
		
		Long groupId = this.getVehicleGroupId(company, vehicleGroupId);
		Query query = new Query();
		query.addFilter("company", company).addFilter("group_id", groupId).addFilter("vehicle_id", vehicleIdArr);
		List<VehicleRelation> relations = this.dml.selectList(VehicleRelation.class, query);
		
		if(!relations.isEmpty())
			this.dml.deleteBatch(relations);
		
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println("{ \"success\" : true, \"msg\" : \"Vehicle group destroyed!\", \"key\" : \"" + groupId + "\" }");
	}
		
	@RequestMapping(value = "/vehicle_relation/save", method = RequestMethod.POST)
	public void save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String vehicleGroupId = request.getParameter("vehicle_group_id");
		String[] vehicleIdArr = request.getParameterValues("vehicle_id");
		
		Long groupId = this.getVehicleGroupId(company, vehicleGroupId);
		Query query = new Query();
		query.addFilter("company", company).addFilter("group_id", groupId).addFilter("vehicle_id", vehicleIdArr);
		List<VehicleRelation> relationsOnDB = this.dml.selectList(VehicleRelation.class, query);
		List<VehicleRelation> relations = new ArrayList<VehicleRelation>();
		
		for(int i = 0 ; i < vehicleIdArr.length ; i++) {
			String vehicleId = vehicleIdArr[i];
			boolean alreadyExist = false;
			
			for(VehicleRelation rel : relationsOnDB) {
				if(rel.getVehicleId().equalsIgnoreCase(vehicleId)) {
					alreadyExist = true;
					break;
				}
			}
			
			if(alreadyExist)
				continue;
			
			VehicleRelation relation = new VehicleRelation(company, groupId, vehicleId);
			relations.add(relation);
		}
		
		this.dml.upsertBatch(relations);
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println("{ \"success\" : true, \"msg\" : \"Success to save vehicle relations\" }");
	}
	
	@RequestMapping(value = "/vehicle_relation", method = RequestMethod.GET)
	public void retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		Long groupId = DataUtils.toLong(request.getParameter("group_id"));
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		
		// 1. 총 카운트
		Query query = new Query();
		query.addFilter("company", company).addFilter("group_id", groupId);		
		int totalCount = this.dml.selectSize(VehicleRelation.class, query);
		
		// 2. 페이징하여 조회 
		query.setPageIndex(page - 1);
		query.setPageSize(limit);
		List<VehicleRelation> list = this.dml.selectList(VehicleRelation.class, query);
		
		// 3. 결과 생성 		
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		for(VehicleRelation relation : list) {
			items.add(this.convertItem(request, relation));
		}
		
		Map<String, Object> result = this.getResultSet(true, totalCount, items);
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println(new ObjectMapper().writeValueAsString(result));
	}
	
	/**
	 * company, vehicle group name으로 VehicleGroup을 찾아서 id를 리턴한다. 
	 * 
	 * @param company
	 * @param groupName
	 * @return
	 * @throws Exception
	 */
	private Long getVehicleGroupId(String company, String groupName) throws Exception {
		
		Query q = new Query();
		q.addFilter("company", company).addFilter("name", groupName);
		VehicleGroup group = this.dml.select(VehicleGroup.class, q);
		
		if(group == null)
			throw new Exception("VehicleGroup (company : " + company + ", name : " + groupName + ") Not Found!");
		
		return group.getId();
	}
	
	@Override
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		
		VehicleRelation relation = (VehicleRelation)entity;
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("company", relation.getCompany());
		map.put("vehicle_id", relation.getVehicleId());
		map.put("vehicle_group_id", relation.getGroupId());
		return map;
	}	
	
}
