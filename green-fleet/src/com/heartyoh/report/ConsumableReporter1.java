/**
 * 
 */
package com.heartyoh.report;

import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.heartyoh.util.SessionUtils;

/**
 * 소모품 교체 대상 목록
 * 
 * @author jhnam
 */
public class ConsumableReporter1 extends AbstractExcelReporter {

	/**
	 * report id
	 */
	private static final String ID = "consumables_to_replace";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { 
		"vehicle_id", 
		"consumable_item", 
		"next_repl_date", 
		"last_repl_date", 
		"repl_mileage", 
		"health_rate", 
		"status" };
	
	/**
	 * select fields
	 */
	private static final int[] CELL_TYPES = new int[] {
		HSSFCell.CELL_TYPE_STRING,
		HSSFCell.CELL_TYPE_STRING,
		HSSFCell.CELL_TYPE_FORMULA,
		HSSFCell.CELL_TYPE_FORMULA,
		HSSFCell.CELL_TYPE_NUMERIC,
		HSSFCell.CELL_TYPE_NUMERIC,
		HSSFCell.CELL_TYPE_STRING
	};	
	
	@Override
	public String getId() {
		return ID;
	}
	
	@Override
	protected String[] getSelectFields() {
		return SELECT_FILEDS;
	}

	@Override
	protected int[] getFieldCellTypes() {
		return CELL_TYPES;
	}	
		
	/**
	 * 소모품 교체 일정이 다가온 소모품 리스트를 조회한다. 조건은 health rate가 0.98 이상인 것들 대상으로 조회
	 */
	@Override
	public void execute() throws Exception {
		
		Key companyKey = KeyFactory.createKey("Company", this.report.getCompany());
		Query q = new Query("VehicleConsumable");
		q.setAncestor(companyKey);
		
		// 조건은 health rate가 0.99 이상인 것들 대상으로 조회
		q.addFilter("health_rate", Query.FilterOperator.GREATER_THAN_OR_EQUAL, 0.99f);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		for(Entity consumable : pq.asIterable()) {
			Map<String, Object> map = SessionUtils.cvtEntityToMap(consumable, SELECT_FILEDS);
			this.results.add(map);
		}
	}
	
	/**
	 * 메일 내용을 생성 
	 * 
	 * @return
	 */
	/*private String createContent() {
		
		StringBuffer content = new StringBuffer();
		content.append("<h1 align='center'>");
		content.append("A consumable replacement schedule for the following vehicles at the moment!");
		content.append("</h1><br><br>");
		content.append("<table border='1' align='center'>");
		content.append("<tr>");
		content.append("<td>Vehicle</td><td>Consumable</td>");
		content.append("<td>Last Replace Date</td>");
		content.append("<td>Last Replace Mileage(km)</td>");
		content.append("<td>Health Rate</td>");
		content.append("<td>Health Status</td>");
		content.append("<td>Next Replace Date</td>");
		content.append("</tr>");
		
		if(!DataUtils.isEmpty(this.results)) {
			for(Map<String, Object> consumable : this.results) {
				String vehicleId = (String)consumable.get("vehicle_id");
				String consumableItem = (String)consumable.get("consumable_item");
				String nextReplDate = DataUtils.isEmpty(consumable.get("next_repl_date")) ? "" : 
					DataUtils.dateToString((Date)consumable.get("next_repl_date"), "yyyy-MM-dd");			
				String lastReplDate = DataUtils.isEmpty(consumable.get("last_repl_date")) ? "" : 
					DataUtils.dateToString((Date)consumable.get("last_repl_date"), "yyyy-MM-dd");
				String lastReplMileage = DataUtils.toNotNull(consumable.get("repl_mileage"));
				int healthRate = (int)(DataUtils.toFloat(consumable.get("health_rate")) * 100);
				String healthStatus = DataUtils.toNotNull(consumable.get("status"));
				
				content.append("<tr>");
				content.append("<td>").append(vehicleId).append("</td>");
				content.append("<td>").append(consumableItem).append("</td>");
				content.append("<td align='center'>").append(lastReplDate).append("</td>");
				content.append("<td align='right'>").append(lastReplMileage).append("</td>");
				content.append("<td>").append(healthRate).append("%</td>");
				content.append("<td>").append(healthStatus).append("</td>");
				content.append("<td align='center'>").append(nextReplDate).append("</td>");
				content.append("</tr>");				
			}
		} else {
			content.append("There is no data to report!");
		}
		
		content.append("</table>");		
		return content.toString();
	}*/

}