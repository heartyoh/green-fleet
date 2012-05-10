/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.dbist.dml.Order;
import org.dbist.dml.Query;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.model.IEntity;
import com.heartyoh.model.VehicleGroup;
import com.heartyoh.model.VehicleRelation;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

/**
 * VehicleGroup Service
 * 
 * @author jhnam
 */
@Controller
public class VehicleGroupOrmService extends OrmEntityService {

	private String[] keyFields = new String[] { "key" };
			
	@Override
	public Class<?> getEntityClass() {
		return VehicleGroup.class;
	}
	
	@Override
	public String[] getKeyFields() {
		return this.keyFields;
	}
	
	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		Query query = new Query();
		query.addFilter("company", this.getCompany(request));
		query.addOrder("updated_at", false);
		return query;
	}
	
	@RequestMapping(value = "/vehicle_group/import", method = RequestMethod.POST)
	public void imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {
		super.imports(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/delete", method = RequestMethod.POST)
	public void delete(HttpServletRequest request, HttpServletResponse response) throws Exception {
		VehicleGroup group = this.dml.select(VehicleGroup.class, new Long(request.getParameter("key")));
		this.dml.delete(group);
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println("{ 'success' : true, 'msg' : 'Vehicle group destroyed!', 'key' : '" + group.getId() + "'}");
	}
	
	@RequestMapping(value = {"/vehicle_group", "/m/data/vehicle_group.json"}, method = RequestMethod.GET)
	public void retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/save", method = RequestMethod.POST)
	public void save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.save(request, response);
	}
	
	@RequestMapping(value = "/vehicle_group/find", method = RequestMethod.GET)
	public void find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.find(request, response);
	}	
	
	@RequestMapping(value = "/vehicle_group/vehicles", method = RequestMethod.GET)
	public void vehiclesByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String groupName = request.getParameter("vehicle_group_id");
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		Long groupId = this.getVehicleGroupId(company, groupName);		
		
		// 1. VehicleRelation테이블에서 vehicle_group_id로 vehicle_id를 조회 
		Query query = new Query();
		query.addField("vehicle_id");
		query.addFilter("company", company).addFilter("group_id", groupId);
		
		// 2. 총 카운트  
		int total = this.dml.selectSize(VehicleRelation.class, query);
		
		// 3. 페이징하여 VehicleRelation 리스트 조회 
		query.setPageIndex(page - 1);
		query.setPageSize(limit);
		List<Order> orderList = new ArrayList<Order>();
		orderList.add(new Order("vehicle_id", true));
		query.setOrder(orderList);
		List<VehicleRelation> relationList = this.dml.selectList(VehicleRelation.class, query);
		
		// 4. vehicle을 조회를 위해 검색 조건 vehicleId 리스트를 생성 
		List<String> vehicleIdList = new ArrayList<String>();		
		for(VehicleRelation relation : relationList) {
			vehicleIdList.add(relation.getVehicleId());
		}
				
		// 5. Vehicle 테이블에서 vehicle_id로 vehicle list 조회, 결과 생성 	
		List<Map<String, Object>> items = this.retrieveVehicles(company, vehicleIdList, request.getParameterValues("select"));
		Map<String, Object> result = this.getResultSet(true, total, items);
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println(new ObjectMapper().writeValueAsString(result));
	}
	
	@Override
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		
		// TODO view에서 변경 필요 (DB : id, company, name, expl, created_at, updated_at ==> View : key, company, id, desc, created_at, updated_at)
		VehicleGroup group = (VehicleGroup)entity;
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("key", group.getId());
		map.put("company", group.getCompany());
		map.put("id", group.getName());
		map.put("expl", group.getExpl());
		map.put("desc", group.getExpl());
		map.put("created_at", group.getCreatedAt());
		map.put("updated_at", group.getUpdatedAt());
		return map;
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		
		VehicleGroup group = (VehicleGroup)entity;
		group.setName(request.getParameter("id"));
		group.setExpl(request.getParameter("desc"));		
		group.beforeUpdate();
		return group;
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			String company = this.getCompany(request);
			String name = request.getParameter("id");
			String expl = request.getParameter("desc");
			entity = new VehicleGroup(company, name, expl);
		}
		
		entity.beforeCreate();
		return entity;
	}
	
	/**
	 * vehicleIdList내에 포함된 vehicleId로 실제 vehicle을 조회 
	 * 
	 * @param company
	 * @param vehicleIdList
	 * @param selects
	 * @return
	 * @throws Exception
	 */
	private List<Map<String, Object>> retrieveVehicles(String company, List<String> vehicleIdList, String[] selects) 
	throws Exception {
		
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		if(!vehicleIdList.isEmpty()) {
			Key companyKey = KeyFactory.createKey("Company", company);
			
			if(!vehicleIdList.isEmpty()) {
				Iterator<Entity> vehilces = 
						DatastoreUtils.findEntities(companyKey, "Vehicle", DataUtils.newMap("id", vehicleIdList));
				while (vehilces.hasNext()) {
					Entity vehicle = vehilces.next();
					items.add(SessionUtils.cvtEntityToMap(vehicle, selects));
				}
			}
		}
		
		return items;
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

}
