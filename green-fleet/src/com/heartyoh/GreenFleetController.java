package com.heartyoh;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Handles requests for the application home page.
 */
@Controller
public class GreenFleetController {

	private static final Logger logger = LoggerFactory.getLogger(GreenFleetController.class);

//	@RequestMapping(value = "/", method = RequestMethod.GET)
	@RequestMapping(value = "/home1", method = RequestMethod.GET)
	public String home() {
		return "redirect:home";
	}

	@RequestMapping(value = "/test", method = RequestMethod.GET)
	public String test() {
		return "test";
	}

	/**
	 * Simply selects the home view to render by returning its name.
	 */
//	@RequestMapping(value = "/home", method = RequestMethod.GET)
	@RequestMapping(value = "/home2", method = RequestMethod.GET)
	public String main(Locale locale, Model model) {
		return "home";
	}
}
