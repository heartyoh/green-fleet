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
import com.heartyoh.model.DriverGroup;
import com.heartyoh.model.DriverRelation;
import com.heartyoh.model.IEntity;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatastoreUtils;
import com.heartyoh.util.SessionUtils;

/**
 * DriverGroup Service
 * 
 * @author jhnam
 */
public class DriverGroupOrmService extends OrmEntityService {
	
	private String[] keyFields = new String[] { "key" };
	
	@Override
	public Class<?> getEntityClass() {
		return DriverGroup.class;
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
	
	@RequestMapping(value = "/driver_group/import", method = RequestMethod.POST)
	public void imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.imports(request, response);
	}
	
	@RequestMapping(value = "/driver_group/delete", method = RequestMethod.POST)
	public void delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.delete(request, response);
	}

	@RequestMapping(value = {"/driver_group", "/m/data/driver_group.json"}, method = RequestMethod.GET)
	public void retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.retrieve(request, response);
	}	
	
	@RequestMapping(value = "/driver_group/save", method = RequestMethod.POST)
	public void save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.save(request, response);
	}
	
	@RequestMapping(value = "/driver_group/find", method = RequestMethod.POST)
	public void find(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		super.find(request, response);
	}
	
	@RequestMapping(value = "/driver_group/drivers", method = RequestMethod.GET)
	public void driversByGroup(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		String company = this.getCompany(request);
		String groupName = request.getParameter("driver_group_id");
		int page = DataUtils.toInt(request.getParameter("page"));
		int limit = DataUtils.toInt(request.getParameter("limit"));
		Long groupId = this.getDriverGroupId(company, groupName);		
		
		// 1. DriverRelation테이블에서 Driver_group_id로 Driver_id를 조회 
		Query query = new Query();
		query.addField("driver_id");
		query.addFilter("company", company).addFilter("group_id", groupId);
		
		// 2. 총 카운트  
		int totalCount = this.dml.selectSize(DriverRelation.class, query);
		
		// 3. 페이징하여 DriverRelation 리스트 조회 
		query.setPageIndex(page - 1);
		query.setPageSize(limit);
		List<Order> orderList = new ArrayList<Order>();
		orderList.add(new Order("driver_id", true));
		query.setOrder(orderList);
		List<DriverRelation> relationList = this.dml.selectList(DriverRelation.class, query);
		
		// 4. Driver을 조회를 위해 검색 조건 DriverId 리스트를 생성 
		List<String> driverIdList = new ArrayList<String>();		
		for(DriverRelation relation : relationList) {
			driverIdList.add(relation.getDriverId());
		}
				
		// 5. Driver 테이블에서 Driver_id로 Driver list 조회		
		List<Map<String, Object>> items = this.retrieveDrivers(company, driverIdList, request.getParameterValues("select"));
		
		// 6. 결과 생성 
		Map<String, Object> result = this.getResultSet(true, totalCount, items);
		response.setContentType("text/html; charset=UTF-8");
		response.getWriter().println(new ObjectMapper().writeValueAsString(result));		
	}
	
	/**
	 * Object to map
	 * 
	 * @param group
	 * @return
	 */
	protected Map<String, Object> convertItem(HttpServletRequest request, IEntity entity) {
		
		// TODO view에서 변경 필요 (DB : id, company, name, expl, created_at, updated_at ==> View : key, company, id, desc, created_at, updated_at)
		DriverGroup group = (DriverGroup)entity;
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
		
		DriverGroup group = (DriverGroup)entity;
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
			entity = new DriverGroup(company, name, expl);
		}
		
		entity.beforeCreate();
		return entity;
	}	
	
	/**
	 * DriverIdList내에 포함된 DriverId로 실제 Driver을 조회 
	 * 
	 * @param company
	 * @param driverIdList
	 * @param selects
	 * @return
	 * @throws Exception
	 */
	private List<Map<String, Object>> retrieveDrivers(String company, List<String> driverIdList, String[] selects) throws Exception {
		
		List<Map<String, Object>> items = new LinkedList<Map<String, Object>>();
		
		if(!driverIdList.isEmpty()) {
			Key companyKey = KeyFactory.createKey("Company", company);
			
			if(!driverIdList.isEmpty()) {
				Iterator<Entity> drivers = DatastoreUtils.findEntities(companyKey, "Driver", DataUtils.newMap("id", driverIdList));
				while (drivers.hasNext()) {
					Entity driver = drivers.next();
					items.add(SessionUtils.cvtEntityToMap(driver, selects));
				}
			}
		}
		
		return items;
	}
	
	/**
	 * company, Driver group name으로 DriverGroup을 찾아서 id를 리턴한다. 
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
	
}
