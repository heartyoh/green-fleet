/**
 * 
 */
package com.heartyoh.service.orm;

import java.util.Date;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.heartyoh.model.IEntity;
import com.heartyoh.model.Terminal;
import com.heartyoh.util.DataUtils;

/**
 * Terminal Service
 * 
 * @author jhnam
 */
@Controller
public class TerminalOrmService extends OrmEntityService {

	/**
	 * logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(TerminalOrmService.class);
	/**
	 * key fields
	 */
	private static final String[] KEY_FIELDS = new String[] { "company", "id" };
	
	@Override
	public Class<?> getEntityClass() {
		return Terminal.class;
	}

	@Override
	public String[] getKeyFields() {
		return KEY_FIELDS;
	}
	
	@RequestMapping(value = "/terminal/import", method = RequestMethod.POST)
	public @ResponseBody
	String imports(MultipartHttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.imports(request, response);
	}
	
	@RequestMapping(value = "/terminal/delete", method = RequestMethod.POST)
	public @ResponseBody
	String delete(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.delete(request, response);
	}
	
	@RequestMapping(value = "/terminal", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.retrieve(request, response);
	}
	
	@RequestMapping(value = "/terminal/save", method = RequestMethod.POST)
	public @ResponseBody
	String save(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		return super.save(request, response);
	}
	
	@RequestMapping(value = "/terminal/find", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> find(HttpServletRequest request, HttpServletResponse response) throws Exception {
		return super.find(request, response);
	}
	
	@Override
	protected IEntity onUpdate(HttpServletRequest request, IEntity entity) {
		Terminal terminal = (Terminal)entity;
		terminal.setSerialNo(request.getParameter("serial_no"));
		terminal.setVehicleId(request.getParameter("vehicle_id"));
		terminal.setDriverId(request.getParameter("driver_id"));
		terminal.setComment(request.getParameter("comment"));
		String buyingDateStr = request.getParameter("buying_date");
		
		if(!DataUtils.isEmpty(buyingDateStr)) {
			Date buyingDate = DataUtils.toDate(buyingDateStr);
			terminal.setBuyingDate(buyingDate);
		}
		
		this.updateVehicle(terminal.getCompany(), terminal.getVehicleId(), terminal.getId(), terminal.getDriverId());
		terminal.beforeUpdate();
		return terminal;
	}
	
	/**
	 * vehicle 정보 중 driver_id, terminal_id 정보 업데이트 
	 * 
	 * @param company
	 * @param vehicleId
	 * @param terminalId
	 * @param driverId
	 */
	private void updateVehicle(String company, String vehicleId, String terminalId, String driverId) {
		String sql = "update vehicle set terminal_id = :terminal_id, driver_id = :driver_id where company = :company and id = :vehicle_id";
		Map<String, Object> params = DataUtils.newMap("company", company);
		params.put("vehicle_id", vehicleId);
		params.put("terminal_id", terminalId);
		params.put("driver_id", driverId);
		try {
			this.dml.executeBySql(sql, params);
		} catch (Exception e) {
			logger.error("Failed to update vehicle info!", e);
		}		
	}
	
	@Override
	protected IEntity onCreate(HttpServletRequest request, IEntity entity) {
		
		if(entity == null) {
			entity = new Terminal(this.getCompany(request), request.getParameter("id"));
		}
		
		entity.beforeCreate();
		return entity;
	}
	
	@Override
	protected void postMultipart (IEntity entity, Map<String, Object> paramMap, MultipartHttpServletRequest request) throws Exception {
		
		String imageFile = super.saveFile(request, (MultipartFile) paramMap.get("image_file"));
		if(imageFile != null) {
			paramMap.put("image_clip", imageFile);
			Terminal terminal = (Terminal)entity;
			terminal.setImageClip(imageFile);
			this.dml.update(terminal);
		}

		super.postMultipart(entity, paramMap, request);
	}

}
