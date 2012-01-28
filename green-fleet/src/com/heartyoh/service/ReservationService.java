package com.heartyoh.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;
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
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.model.Reservation;
import com.heartyoh.model.Vehicle;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class ReservationService {
	private static final Logger logger = LoggerFactory.getLogger(ReservationService.class);
	private static final Class<Reservation> clazz = Reservation.class;

	@RequestMapping(value = "/reservation/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> save(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String id = request.getParameter("id");
//		Date reservedDate = new Date(request.getParameter("reservedDate"));
		String driver = request.getParameter("driver");
		String vehicle = request.getParameter("vehicle");
		String vehicleType = request.getParameter("vehicleType");
		String deliveryPlace = request.getParameter("deliveryPlace");
		String destination = request.getParameter("destination");
		String purpose = request.getParameter("purpose");
		String status = request.getParameter("status");

		Key objKey = null;
		boolean creating = false;

		PersistenceManager pm = PMF.get().getPersistenceManager();
		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
		Company company = pm.getObjectById(Company.class, companyKey);
		Reservation obj = null;

		if (key != null && key.trim().length() > 0) {
			objKey = KeyFactory.stringToKey(key);
		} else {
			objKey = KeyFactory.createKey(companyKey, clazz.getSimpleName(), id);
			try {
				obj = pm.getObjectById(clazz, objKey);
			} catch (JDOObjectNotFoundException e) {
				// It's OK.
				creating = true;

			}
			// It's Not OK. You try to add duplicated identifier.
			if (obj != null)
				throw new EntityExistsException(clazz.getSimpleName() + " with id(" + id + ") already Exist.");
		}

		Date now = new Date();
		
		try {
			if (creating) {
				obj = new Reservation();
				obj.setKey(KeyFactory.keyToString(objKey));
				obj.setCompany(company);
				obj.setId(id);
				obj.setReservedDate(now);
				obj.setCreatedAt(now);
			} else {
				obj = pm.getObjectById(clazz, objKey);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			obj.setDriver(driver);
			obj.setVehicle(vehicle);
			obj.setVehicleType(vehicleType);
			obj.setDeliveryPlace(deliveryPlace);
			obj.setDestination(destination);
			obj.setPurpose(purpose);
			obj.setStatus(status);
			obj.setUpdatedAt(now);

			obj = pm.makePersistent(obj);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("key", obj.getKey());

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
