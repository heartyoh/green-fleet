package com.heartyoh.greenfleet.service;

import java.io.IOException;
import java.io.Writer;
import java.util.Date;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

@SuppressWarnings("serial")
public class OBDCollector extends HttpServlet {
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		String vehicle = req.getParameter("vehicle");
		String speed = req.getParameter("speed");
		String gas = req.getParameter("gas");
		String tirePressure = req.getParameter("tirePressure");
		String longitude = req.getParameter("longitude");
		String latitude = req.getParameter("latitude");

		Date now = new Date();

		Key key = KeyFactory.createKey("Vehicle", vehicle);

		Entity obd = new Entity("OBD", key);
		obd.setProperty("vehicle", vehicle);
		obd.setProperty("speed", speed);
		obd.setProperty("gas", gas);
		obd.setProperty("tirePressure", tirePressure);
		obd.setProperty("longitude", longitude); // 126°58'40.63"E
		obd.setProperty("latitude", latitude); // 37°33'58.87"N
		obd.setProperty("time", now);

		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.put(obd);

		resp.setStatus(HttpServletResponse.SC_OK);
		resp.setContentType("application/json");
		Writer writer = resp.getWriter();
		writer.write("{success:true}");
		writer.flush();
	}
}
