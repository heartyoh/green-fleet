/**
 * 
 */
package com.heartyoh.report;

import java.sql.Types;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

import com.heartyoh.util.DataUtils;
import com.heartyoh.util.GreenFleetConstant;

/**
 * abstract reporter
 * 
 * @author jhnam
 */
public class ExcelConverter {

	/**
	 * execute를 실행해서 조회된 결과
	 */
	private List<Map<String, Object>> results;
	
	/**
	 * 선택할 데이터 필드명 
	 * 
	 * @return
	 */
	private String[] selectFields;
	
	/**
	 * 선택할 데이터 필드 타입 
	 */
	private int[] fieldTypes;
	
	/**
	 * 결과를 엑셀 객체로 변환 
	 * 
	 * @param selectFields
	 * @param fieldTypes
	 * @param results
	 * @return
	 * @throws Exception
	 */
	public Workbook convert(String[] selectFields, int[] fieldTypes, List<Map<String, Object>> results) throws Exception {
		this.selectFields = selectFields;
		this.fieldTypes = fieldTypes;
		this.results = results;
		return this.createExcelWorkbook();
	}

	
	/**
	 * 조회된 데이터로 엑셀을 생성 
	 * 
	 * @return
	 */
	private Workbook createExcelWorkbook() {
		
		if(DataUtils.isEmpty(this.results))
			return null;
				
		// 워크북 생성
		Workbook workBook = new HSSFWorkbook();
		// 워크시트 생성
		Sheet sheet = workBook.createSheet("Sheet1");
		// 행 생성
		Row subjectRow = sheet.createRow(0);
		
		// 제목 행 생성 
		for(int i = 0 ; i < this.selectFields.length ; i++) {
			Cell cell = subjectRow.createCell(i);
			cell.setCellValue(this.selectFields[i]);
		}
		
		// 데이터 행 생성 
		for(int i = 0 ; i < this.results.size() ; i++) {
			Row dataRow = sheet.createRow(i + 1);
			Map<String, Object> data = this.results.get(i);
			
			for(int j = 0 ; j < selectFields.length ; j++) {
				Cell cell = dataRow.createCell(j);
				Object value = data.get(this.selectFields[j]);
				this.setCellValue(workBook, cell, this.fieldTypes[j], value);
			}
		}
		
		return workBook;
	}
	
	/**
	 * cell type에 따라 cellValue를 설정 
	 * 
	 * @param wb
	 * @param cell
	 * @param fieldType
	 * @param cellValue
	 */
	protected void setCellValue(Workbook wb, Cell cell, int fieldType, Object cellValue) {
		
		switch(fieldType) {
			case Types.VARCHAR : 
				cell.setCellValue(DataUtils.toString(cellValue));
				break;
			case Types.DATE :
				CellStyle dateStyle = wb.createCellStyle();
				dateStyle.setDataFormat(wb.getCreationHelper().createDataFormat().getFormat("yyyy-MM-dd"));
			    cell.setCellStyle(dateStyle);
				cell.setCellValue((Date)cellValue);
				break;
			case Types.TIMESTAMP : 
				CellStyle datetimeStyle = wb.createCellStyle();
				datetimeStyle.setDataFormat(wb.getCreationHelper().createDataFormat().getFormat("yyyy-MM-dd HH:mm"));
			    cell.setCellStyle(datetimeStyle);				
				this.setDefaultCellValue(cell, (Date)cellValue);
				break;
			case Types.BOOLEAN : 
				cell.setCellValue(DataUtils.toBool(cellValue));
				break;
			case Types.INTEGER : 
			case Types.SMALLINT :
				cell.setCellValue(DataUtils.toInt(cellValue));
				break;
			case Types.DOUBLE :
				cell.setCellValue(DataUtils.toDouble(cellValue));
				break;
			case Types.FLOAT :
				cell.setCellValue(DataUtils.toFloat(cellValue));
				break;
			case Types.BIGINT :
			case Types.DECIMAL :
				cell.setCellValue(DataUtils.toLong(cellValue));
				break;
			default :
				cell.setCellValue(DataUtils.toString(cellValue));
		}
	}
	
	/**
	 * 기본 셀 값 설정 
	 * 
	 * @param cell
	 * @param cellValue
	 */
	protected void setDefaultCellValue(Cell cell, Object cellValue) {
		
		if(cellValue instanceof Date) {
			cell.setCellValue(DataUtils.dateToString((Date)cellValue, GreenFleetConstant.DEFAULT_DATE_TIME_FORMAT));
		} else {
			cell.setCellValue(DataUtils.toString(cellValue));
		}
	}

}
