/**
 * 
 */
package com.heartyoh.report;

import java.util.Date;

import org.apache.poi.hssf.usermodel.HSSFCell;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.heartyoh.util.DataUtils;
import com.heartyoh.util.SessionUtils;

/**
 * 정비 대상 목록 
 * 
 * @author jhnam
 */
public class RepairReporter1 extends AbstractExcelReporter {

	/**
	 * report id
	 */
	private static final String ID = "repair_list";
	/**
	 * select fields
	 */
	private static final String[] SELECT_FILEDS = new String[] { 
		"vehicle_id", 
		"next_repair_date", 
		"repair_date", 
		"repair_mileage", 
		"repair_man", 
		"content" };	

	/**
	 * cell types
	 */
	private static final int[] CELL_TYPES = new int[] {
		HSSFCell.CELL_TYPE_STRING,
		HSSFCell.CELL_TYPE_FORMULA,
		HSSFCell.CELL_TYPE_FORMULA,
		HSSFCell.CELL_TYPE_NUMERIC,
		HSSFCell.CELL_TYPE_STRING,
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

	@Override
	public void execute() throws Exception {		
		Key companyKey = KeyFactory.createKey("Company", this.report.getCompany());		
		// 오늘 날짜로 정비 스케줄이 잡혀 있는 모든 Repair 조회
		this.findImpendingRepairs(companyKey);
	}
	
	/**
	 * 정비 일정이 다가온 정보를 조회한다. 
	 * 
	 * @param companyKey
	 * @return
	 */
	private void findImpendingRepairs(Key companyKey) {
		
		Query q = new Query("Repair");
		q.setAncestor(companyKey);
		this.setPeriod();
		q.addFilter("next_repair_date", Query.FilterOperator.GREATER_THAN_OR_EQUAL, this.fromDate);
		q.addFilter("next_repair_date", Query.FilterOperator.LESS_THAN_OR_EQUAL, this.toDate);
		q.addSort("next_repair_date", SortDirection.DESCENDING);
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);
		
		for(Entity repair : pq.asIterable()) {
			this.results.add(SessionUtils.cvtEntityToMap(repair, SELECT_FILEDS));
		}
	}
	
	/**
	 * 기간 설정 
	 */
	private void setPeriod() {
		if(fromDate == null) {
			Date[] fromToDate = DataUtils.getFromToDateStToday(-2, -1);
			this.fromDate = fromToDate[0];
			this.toDate = fromToDate[1];
		}		
	}	

	/*private String createContent() {
		
		StringBuffer content = new StringBuffer();
		content.append("<h1 align='center'>");		
		content.append("A maintenance schedule for the following vehicles at the moment!");		
		content.append("</h1><br><br>");
		content.append("<table border='1' align='center'>");
		content.append("<tr>");
		content.append("<td>Vehicle</td>");
		content.append("<td>Previous Repair Date</td>");
		content.append("<td>Previous Repair Mileage(km)</td>");
		content.append("<td>Previous Repair Man</td>");
		content.append("<td>Previous Repair Content</td>");
		content.append("<td>Next Repair Date</td>");
		content.append("</tr>");
		
		if(!DataUtils.isEmpty(this.results.isEmpty())) {
			for(Map<String, Object> repair : this.results) {
				String vehicleId = (String)repair.get("vehicle_id");
				String nextRepairDate = DataUtils.isEmpty(repair.get("next_repair_date")) ? "" : 
					DataUtils.dateToString((Date)repair.get("next_repair_date"), "yyyy-MM-dd");			
				String previousRepairDate = DataUtils.isEmpty(repair.get("repair_date")) ? "" : 
					DataUtils.dateToString((Date)repair.get("repair_date"), "yyyy-MM-dd");
				String previousRepairMileage = (String)repair.get("repair_mileage");
				String repairMan = DataUtils.toNotNull((String)repair.get("repair_main"));
				String repairContent = DataUtils.toNotNull((String)repair.get("content"));
				
				content.append("<tr>");
				content.append("<td>").append(vehicleId).append("</td>");
				content.append("<td align='center'>").append(previousRepairDate).append("</td>");
				content.append("<td align='right'>").append(previousRepairMileage).append("</td>");
				content.append("<td>").append(repairMan).append("</td>");
				content.append("<td>").append(repairContent).append("</td>");
				content.append("<td align='center'>").append(nextRepairDate).append("</td>");
				content.append("</tr>");
			}		
			content.append("</table>");
		} else {
			content.append("There is no data to report!");
		}
		
		return content.toString();		
	}*/

}
