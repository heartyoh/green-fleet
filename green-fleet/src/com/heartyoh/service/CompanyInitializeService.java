/**
 * 
 */
package com.heartyoh.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * DataInitialize Service
 * 
 * @author jhnam
 */
@Controller
public class CompanyInitializeService {

	@RequestMapping(value = "/company/init", method = RequestMethod.POST)
	public @ResponseBody	
	String initCompany(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		// String newCompany = request.getParameter("new_company");
		
		// * 기준정보 
		// 1. company 생성 
		// 2. code 생성 
		// 3. consumable code 생성
		// 4. driver 생성
		// 5. driver group 생성 
		// 6. driver relation 생성 
		// 7. vehicle 생성 
		// 8. vehicle group 생성 
		// 9. vehicle relation 생성 
		// 10. terminal 생성 
		
		// * 런타임 정보
		// 1. Track
		// 2. Incident
		// 3. 차량별 운행현황 정보 
		// 4. 운전자별 운행현황 정보 
		// 5. 소모품 데이터 
		
		return null;
	}
}
