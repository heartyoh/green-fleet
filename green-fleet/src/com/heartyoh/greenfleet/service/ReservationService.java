package com.heartyoh.greenfleet.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.heartyoh.greenfleet.model.Reservation;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class ReservationService {
	private static final Logger logger = LoggerFactory.getLogger(ReservationService.class);

	@RequestMapping(value = "/reservation/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> createVehicle(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String id = request.getParameter("id");
//		Date reservedDate = new Date(request.getParameter("reservedDate"));
		String driver = request.getParameter("driver");
		String vehicle = request.getParameter("vehicle");
		String vehicleType = request.getParameter("vehicleType");
		String deliveryPlace = request.getParameter("deliveryPlace");
		String destination = request.getParameter("destination");
		String purpose = request.getParameter("purpose");
		String status = request.getParameter("status");

		Date now = new Date();

		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
		Key key = KeyFactory.createKey(Reservation.class.getSimpleName(), id);

		boolean created = false;
		Reservation reservation = null;

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Company company = pm.getObjectById(Company.class, companyKey);

			try {
				reservation = pm.getObjectById(Reservation.class, key);
			} catch (JDOObjectNotFoundException e) {
				reservation = new Reservation();
				reservation.setCompany(company);
				reservation.setKey(key);
				reservation.setId(id);
				reservation.setReservedDate(now);
				reservation.setCreatedAt(now);

				created = true;
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			reservation.setDriver(driver);
			reservation.setVehicle(vehicle);
			reservation.setVehicleType(vehicleType);
			reservation.setDeliveryPlace(deliveryPlace);
			reservation.setDestination(destination);
			reservation.setPurpose(purpose);
			reservation.setStatus(status);
			reservation.setUpdatedAt(now);

			reservation = pm.makePersistent(reservation);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", created ? "Reservation created." : "Reservation updated");
		result.put("key", KeyFactory.keyToString(reservation.getKey()));

		return result;
	}

	@RequestMapping(value = "/reservation/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> deleteVehicle(HttpServletRequest request, HttpServletResponse response) {
		String id = request.getParameter("id");

		Key key = KeyFactory.createKey(Reservation.class.getSimpleName(), id);

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Reservation Vehicle = pm.getObjectById(Reservation.class, key);

			pm.deletePersistent(Vehicle);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", "Reservation destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/reservation", method = RequestMethod.GET)
	public @ResponseBody
	List<Reservation> getObdData(HttpServletRequest request, HttpServletResponse response) {

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query query = pm.newQuery(Reservation.class);

		// query.setFilter();
		// query.setOrdering();
		// query.declareParameters();

		return (List<Reservation>) query.execute();
	}

}
