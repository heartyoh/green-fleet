/**
 * 
 */
package com.heartyoh.report;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import net.sf.common.util.ResourceUtils;

import com.heartyoh.model.Filter;
import com.heartyoh.model.Sorter;
import com.heartyoh.util.DataUtils;

/**
 * Abstract reporter
 * 
 * @author jhnam
 */
public abstract class AbstractReporter implements IReporter {

	@Override
	public List<Object> report(HttpServletRequest request) throws Exception {		
		Map<String, Object> params = this.buildParams(request);
		return this.report(params);
	}

	/**
	 * request로 부터 파라미터를 파싱한다. 
	 * 
	 * @param request
	 * @return
	 * @throws Exception
	 */
	protected Map<String, Object> buildParams(HttpServletRequest request) throws Exception {
		
		Map<String, Object> params = DataUtils.toMap(request);
		String[] selectFields = request.getParameterValues("select");
		
		if(!DataUtils.isEmpty(selectFields)) {
			params.put("select", selectFields);
		}
		
		if(params.containsKey("filter")) {
			String filterStr = (String)params.remove("filter");
			List<Filter> filters = DataUtils.parseFilters(filterStr);
			params.put("filter", filters);
		}
		
		if(params.containsKey("sorter")) {
			String sorterStr = (String)params.remove("sorter");
			List<Sorter> sorters = DataUtils.parseSorters(sorterStr);
			params.put("sorter", sorters);			
		}
		
		if(!params.containsKey("company")) {
			params.put("company", DataUtils.getCompany(request));
		}
		
		this.checkRequiredParamsExist(params);
		
		return params;
	}
	
	/**
	 * 필수 파라미터가 빠졌는지 확인해서 빠졌다면 예외를 던짐
	 * 
	 * @param params
	 * @throws Exception
	 */
	protected void checkRequiredParamsExist(Map<String, Object> params) throws Exception {
		// 기본으로는 company만 체크함 
		if(!params.containsKey("company"))
			throw new Exception("Parameter [company] not found!");
	}
	
	/**
	 * report template path로 부터 템플릿 파일을 읽어 내용을 리턴한다.
	 * 
	 * @return
	 * @throws Exception
	 */
	protected String getReportTemplate() throws Exception {
		String path = "com/heartyoh/report/template/" + this.getId() + ".html";
		if (path.endsWith("/") || ResourceUtils.isDirectory(path)) {
			if (!path.endsWith("/"))
				path += "/";
		}
		return ResourceUtils.readText(path);
	}	
	
	@Override
	public String getReportContent(Map<String, Object> params) throws Exception {
		return null;
	}
}
