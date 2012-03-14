package com.heartyoh.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class LocaleService extends EntityService {

	@Override
	protected String getEntityName() {
		return "Locale";
	}

	@Override
	protected String getIdValue(Map<String, Object> map) {
		return null;
	}

	@RequestMapping(value = "/locale", method = RequestMethod.GET)
	public @ResponseBody
	Map<String, Object> retrieve(HttpServletRequest request,
			HttpServletResponse response) {

		Locale[] availableLocales = Locale.getAvailableLocales();		
		List<Object> items = new ArrayList<Object>();

		for (int i = 0; i < availableLocales.length; i++) {
			Map<String, String> localeMap = new HashMap<String, String>();
			Locale locale = availableLocales[i];
			localeMap.put("value", locale.toString());
			localeMap.put("name", locale.getDisplayName());
			items.add(localeMap);
		}
		
		Collections.sort(items, new LocaleComparator());
		
		System.out.println("====================================");
		for (int i = 0; i < items.size(); i++) {
			Map<String, String> localeMap = (Map<String, String>)items.get(i);
			System.out.println("{\"name\":\"" + localeMap.get("name") + "\",\"value\":\"" + localeMap.get("value") + "\"},");
		}
		System.out.println("====================================");		
		return this.packResultDataset(true, items.size(), items);
	}

	class LocaleComparator implements Comparator {
		public int compare(Object o1, Object o2) {
			
			Map<String, String> m1 = (Map<String, String>)o1;
			Map<String, String> m2 = (Map<String, String>)o2;
			String s1 = m1.get("name");
			String s2 = m2.get("name");
			return s1.compareTo(s2);
		}
	}

}
