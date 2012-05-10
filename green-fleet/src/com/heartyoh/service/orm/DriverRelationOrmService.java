/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.dbist.dml.Query;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.DriverGroup;
import com.heartyoh.model.DriverRelation;
import com.heartyoh.model.IEntity;

/**
 * Driver & Driver Group Relation Service
 * 
 * @author jhnam
 */
@Controller
public class DriverRelationOrmService extends OrmEntityService {

	private String[] keyFields = new String[] { "key" };
	
	@Override
	public String[] getKeyFields() {
		return this.keyFields;
	}	

	@Override
	public Class<?> getEntityClass() {
		return DriverRelation.class;
	}
	
	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		return query;
	}

	@RequestMapping(value = "/driver_relation/import", method = RequestMethod.POST)
	public void imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		
		super.imports(request, response);
	}
	
	@RequestMapping(value = "/driver_relation/save", method = RequestMethod.POST)
	public void save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String driverGroupId = request.getParameter("driver_group_id");
		String[] driverIdArr = request.getParameterValues("driver_id");
		
		Long groupId = this.getDriverGroupId(company, driverGroupId);
		Query query = new Query();
		query.addFilter("company", company).addFilter("group_id", groupId).addFilter("driver_id", driverIdArr);
		List<DriverRelation> relationsOnDB = this.dml.selectList(DriverRelation.class, query);
		List<DriverRelation> relations = new ArrayList<DriverRelation>();
		
		for(int i = 0 ; i < driverIdArr.length ; i++) {
			String driverId = driverIdArr[i];
			boolean alreadyExist = false;
			
			for(DriverRelation rel : relationsOnDB) {
				if(rel.getDriverId().equalsIgnoreCase(driverId)) {
					alreadyExist = true;
					break;
				}
			}
			
			if(alreadyExist)
				continue;
			
			DriverRelation relation = new DriverRelation(company, groupId, driverId);
			relations.add(relation);
		}
		
		this.dml.upsertBatch(relations);
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println("{\"success\" : true, \"msg\" : \"Succeeded to save!\"}");
	}
	
	@RequestMapping(value = "/driver_relation", method = RequestMethod.GET)
	public void retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/driver_relation/delete", method = RequestMethod.POST)
	public void delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String driverGroupId = request.getParameter("driver_group_id");
		String[] driverIdArr = request.getParameterValues("driver_id");
		
		Long groupId = this.getDriverGroupId(company, driverGroupId);
		Query query = new Query();
		query.addFilter("company", company).addFilter("group_id", groupId).addFilter("driver_id", driverIdArr);
		List<DriverRelation> relations = this.dml.selectList(DriverRelation.class, query);
		
		if(!relations.isEmpty())
			this.dml.deleteBatch(relations);
		
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println("{ \"success\" : true, \"msg\" : \"Driver group destroyed!\", \"key\" : \"" + groupId + "\" }");
	}
	
	/**
	 * company, driver group name으로 VehicleGroup을 찾아서 id를 리턴한다. 
	 * 
	 * @param company
	 * @param groupName
	 * @return
	 * @throws Exception
	 */
	private Long getDriverGroupId(String company, String groupName) throws Exception {
		
		Query q = new Query();
		q.addFilter("company", company).addFilter("name", groupName);
		DriverGroup group = this.dml.select(DriverGroup.class, q);
		
		if(group == null)
			throw new Exception("DriverGroup (company : " + company + ", name : " + groupName + ") Not Found!");
		
		return group.getId();
	}
	
	@Override
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		
		DriverRelation relation = (DriverRelation)entity;
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("company", relation.getCompany());
		map.put("driver_id", relation.getDriverId());
		map.put("driver_group_id", relation.getGroupId());
		return map;
	}	
	
}
