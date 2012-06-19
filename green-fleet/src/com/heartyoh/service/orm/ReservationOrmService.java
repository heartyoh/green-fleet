/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.Date;
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
import com.heartyoh.model.Reservation;
import com.heartyoh.model.Task;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.DatasourceUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * 예약 관리 서비스 
 * 
 * @author jhnam
 */
@Controller
public class ReservationOrmService extends OrmEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(ReservationOrmService.class);	
	/**
	 * key fields
	 */
	private static final String[] KEY_FILEDS = new String[] { "id" };
	
	@Override
	public Class<?> getEntityClass() {
		return Reservation.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FILEDS;
	}
 
	@Override
	protected Query getRetrieveQuery(HttpServletRequest request) throws Exception {
		// TODO 날짜로 검색 
		Query query = super.getRetrieveQuery(request);
		query.addOrder("updated_at", false);
		return query;
	}

	@RequestMapping(value = "/reservation/import", method = RequestMethod.POST)
	public @ResponseBody 
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/reservation/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/reservation", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.retrieveByPaging(request, response);
	}
	
	@RequestMapping(value = "/reservation/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {
		// TODO 이미 예약된 차인지 확인 후 저장 ...
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/reservation/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.find(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		Reservation reservation = (Reservation)entity;
		String startDateStr = request.getParameter("start_date");
		String endDateStr = request.getParameter("end_date");
		this.setDateData(reservation, startDateStr, endDateStr);
		reservation.setVehicleId(request.getParameter("vehicle_id"));
		reservation.setDeliveryPlace(request.getParameter("delivery_place"));
		reservation.setDestination(request.getParameter("destination"));
		reservation.setDriverId(request.getParameter("driver_id"));
		reservation.setPurpose(request.getParameter("purpose"));
		reservation.setStatus(request.getParameter("status"));
		reservation.setVehicleType(request.getParameter("vehicle_type"));
		reservation.beforeUpdate();
		
		try {
			this.saveTask(reservation);
		} catch (Exception e) {
			logger.error("Failed to save task by reservation!", e);
		}
		
		return reservation;
	}
	
	@Override
	protected IEntity onDelete(HttpServletRequest request, IEntity entity) {
		
		Reservation reserv = (Reservation)entity;
		
		try {
			this.deleteTask(reserv);
		} catch(Exception e) {
			logger.error("Failed to delete task by reservation!", e);
		}
		
		return entity;
	}
	
	/**
	 * 일정 조회 
	 * 
	 * @param reserv
	 * @return
	 * @throws Exception
	 */
	private Task findTask(Reservation reserv) throws Exception {
		Map<String, Object> params = DataUtils.newMap("company", reserv.getCompany());
		params.put("category", GreenFleetConstant.TASK_TYPE_RESERVATION);
		params.put("url", reserv.getId());		
		return DatasourceUtils.findTask(params);		
	}
	
	/**
	 * 일정관리 연동 - 삭제 
	 * 
	 * @param reserv
	 * @throws Exception
	 */
	private void deleteTask(Reservation reserv) throws Exception {
		Task task = this.findTask(reserv);
		
		if(task != null)
			DatasourceUtils.daleteTask(task.getId());
	}
		
	/**
	 * 일정관리 연동 - 수정 
	 * 
	 * @param reserv
	 * @throws Exception
	 */
	private void saveTask(Reservation reserv) throws Exception {
		
		Task task = this.findTask(reserv);
		
		if(task != null) {
			task.setStartDate(reserv.getStartDate());
			task.setEndDate(reserv.getEndDate());
			task.setTitle("Reservation [" + reserv.getVehicleId() + "] by [" + reserv.getDriverId() + "]");
			DatasourceUtils.updateTask(task);
			
		} else {
			task = new Task();
			task.setCategory(GreenFleetConstant.TASK_TYPE_RESERVATION);
			task.setAllDay(true);
			task.setCompany(reserv.getCompany());
			task.setStartDate(reserv.getStartDate());
			task.setEndDate(reserv.getEndDate());
			task.setUrl("" + reserv.getId());
			task.setTitle("Reservation [" + reserv.getVehicleId() + "] by [" + reserv.getDriverId() + "]");
			DatasourceUtils.createTask(task);			
		}
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			String company = this.getCompany(request);
			String vehicleId = request.getParameter("vehicle_id");
			String startDateStr = request.getParameter("start_date");
			String endDateStr = request.getParameter("end_date");
			Reservation reserv = new Reservation();
			reserv.setCompany(company);
			reserv.setVehicleId(vehicleId);
			this.setDateData(reserv, startDateStr, endDateStr);
			entity = reserv;
		}
		
		entity.beforeCreate();
		return entity;
	}
	
	private void setDateData(Reservation reservation, String startDateStr, String endDateStr) {
		
		Date startDate = null;
		Date endDate = null;
		
		try {
			// TODO 추후 UI 수정되면 같이 수정
			startDate = DataUtils.toDate(startDateStr + " 00:00:00", GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT);
			endDate = DataUtils.toDate(endDateStr + " 14:59:59", GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT);
		} catch(Exception e) {
			logger.error("Failed to parse datetime", e);
		}
		
		reservation.setStartDate(startDate);
		reservation.setEndDate(endDate);
	}
}
