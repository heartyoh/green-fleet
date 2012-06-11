/**
 * 
 */
package com.heartyoh.report;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import com.heartyoh.model.Report;
import com.heartyoh.util.AlarmUtils;
import com.heartyoh.util.DataUtils;

/**
 * abstract reporter
 * 
 * @author jhnam
 */
public abstract class AbstractExcelReporter implements IReporter {

	/**
	 * 등록된 Report 모델 
	 */
	protected Report report;
	/**
	 * 리포터 사이클 : 일별, 주별, 월별, ...
	 */
	protected String cycle;
	/**
	 * 리포트 시작일 
	 */
	protected Date fromDate;
	/**
	 * 리포트 종료일 
	 */
	protected Date toDate;
	/**
	 * execute를 실행해서 조회된 결과
	 */
	protected List<Map<String, Object>> results = new ArrayList<Map<String, Object>>();
	
	/**
	 * 선택할 데이터 필드명 
	 * 
	 * @return
	 */
	protected abstract String[] getSelectFields();
	
	/**
	 * 선택할 데이터 필드명에 매치되는 엑셀 셀의 타입 
	 * 
	 * @return
	 */
	protected abstract int[] getFieldCellTypes();
	
	@Override
	public void setParameter(Report report, String cycle, Date fromDate, Date toDate) {
		this.report = report;
		this.cycle = cycle;
		this.fromDate = fromDate;
		this.toDate = toDate;
	}
	
	@Override
	public List<Map<String, Object>> getResult() {
		return this.results;
	}	

	@Override
	public void sendReport() throws Exception {
		String[] receiverEmails = this.report.getSendTo().split(",");
		HSSFWorkbook workbook = this.createExcelWorkbook();
		AlarmUtils.sendExcelAttachMail(null, null, null, receiverEmails, this.report.getName(), false, this.report.getExpl(), workbook);
	}
	
	/**
	 * 조회된 데이터로 엑셀을 생성 
	 * 
	 * @return
	 */
	protected HSSFWorkbook createExcelWorkbook() {
		
		if(DataUtils.isEmpty(this.results))
			return null;
		
		// 선택 필드 
		String[] selectFields = this.getSelectFields();
		// 선택 필드와 매치되는 셀 타입 
		int[] cellTypes = this.getFieldCellTypes();
		
		// 워크북 생성
		HSSFWorkbook workBook = new HSSFWorkbook();
		// 워크시트 생성
		HSSFSheet sheet = workBook.createSheet();
		// 행 생성
		HSSFRow subjectRow = sheet.createRow(0);
		
		// 제목 행 생성 
		for(int i = 0 ; i < selectFields.length ; i++) {
			HSSFCell cell = subjectRow.createCell(i);
			cell.setCellValue(selectFields[i]);
		}
		
		// 데이터 행 생성 
		for(int i = 0 ; i < this.results.size() ; i++) {
			HSSFRow dataRow = sheet.createRow(i + 1);
			Map<String, Object> data = this.results.get(i);
			
			for(int j = 0 ; j < selectFields.length ; j++) {
				HSSFCell cell = dataRow.createCell(j, cellTypes[j]);
				Object value = data.get(selectFields[j]);
				
				if(value == null)
					continue;
				
				this.setCellValue(cell, value);
			}
		}
		
		return workBook;		
	}
	
	/**
	 * cell type에 따라 cellValue를 설정 
	 * 
	 * @param cell
	 * @param cellValue
	 */
	protected void setCellValue(HSSFCell cell, Object cellValue) {
		
		switch(cell.getCellType()) {
			case HSSFCell.CELL_TYPE_BOOLEAN : 
				cell.setCellValue(DataUtils.toBool(cellValue));
				break;
			case HSSFCell.CELL_TYPE_NUMERIC :
				cell.setCellValue(DataUtils.toDouble(cellValue));
				break;
			case HSSFCell.CELL_TYPE_STRING : 
				cell.setCellValue(DataUtils.toString(cellValue));
				break;
			case HSSFCell.CELL_TYPE_FORMULA :
				this.setFormulaCellValue(cell, cellValue);
				break;
			case HSSFCell.CELL_TYPE_ERROR : 
				cell.setCellValue(DataUtils.toString(cellValue));
				break;
			case HSSFCell.CELL_TYPE_BLANK :
				break;
			default :
				cell.setCellValue(DataUtils.toString(cellValue));
		}
	}
	
	/**
	 * blank cell에 대한 값을 설정 
	 * 
	 * @param cell
	 * @param cellValue
	 */
	protected void setFormulaCellValue(HSSFCell cell, Object cellValue) {
		if(cellValue instanceof Date) {
			cell.setCellValue(DataUtils.toDate(cellValue));
		} else {
			cell.setCellValue(DataUtils.toString(cellValue));
		}
	}

}
