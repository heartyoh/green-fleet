/**
 * 
 */
package com.heartyoh.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.google.appengine.api.channel.ChannelMessage;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;
import com.heartyoh.model.CustomUser;
import com.heartyoh.util.SessionUtils;

/**
 * Google App Engine에서 제공하는 Channel을 관리하는 서비스
 * 
 * @author jonghonam
 */
@Controller
public class ChannelMgmtService {

	/**
	 * Logger
	 */
	private static final Logger logger = LoggerFactory.getLogger(ChannelMgmtService.class);
	/**
	 * Channel Service
	 */
	private static ChannelService channelService = ChannelServiceFactory.getChannelService();

	/**
	 * 클라이언트로 부터 채널 생성 요청을 받아 채널을 생성하고 토큰을 넘겨준다. 
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value = "/channel/init", method = RequestMethod.POST)
	public void init(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		CustomUser user = SessionUtils.currentUser();
		
		if (user != null) {
			String userKey = user.getEmail();
			String token = channelService.createChannel(userKey);
			
			if(logger.isInfoEnabled())
				logger.info("Channel created channel token [" + token + "]");
			
			response.getWriter().print(token);
		}
	}

	@RequestMapping(value = "/channel/message", method = RequestMethod.POST)
	public void receiveMessage(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
	    String message = request.getParameter("message");
	    String key = request.getParameter("key");
	    key = key.replace("&#64;", "@").replace("&#46;", ".");
	    
	    if(logger.isInfoEnabled())
	    	logger.info("Message [" + message + "] received from [" + key + "]");
	    
	    channelService.sendMessage(new ChannelMessage(key, message));
	}
}
