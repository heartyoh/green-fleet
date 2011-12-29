package com.heartyoh.greenfleet.service;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.jdo.JDOObjectNotFoundException;
import javax.jdo.PersistenceManager;
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
import com.heartyoh.greenfleet.model.Vehicle;
import com.heartyoh.model.Company;
import com.heartyoh.model.CustomUser;
import com.heartyoh.util.PMF;
import com.heartyoh.util.SessionUtils;

@Controller
public class VehicleService {
	private static final Logger logger = LoggerFactory.getLogger(VehicleService.class);
	private static final Class<Vehicle> clazz = Vehicle.class;

	@RequestMapping(value = "/vehicle/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> save(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		String key = request.getParameter("key");
		String id = request.getParameter("id");
		String registrationNumber = request.getParameter("registrationNumber");
		String manufacturer = request.getParameter("manufacturer");
		String vehicleType = request.getParameter("vehicleType");
		String birthYear = request.getParameter("birthYear");
		String ownershipType = request.getParameter("ownershipType");
		String status = request.getParameter("status");
		String imageClip = request.getParameter("imageClip");
		String totalDistance = request.getParameter("totalDistance");
		String remainingFuel = request.getParameter("remainingFuel");
		String distanceSinceNewOil = request.getParameter("distanceSinceNewOil");
		String engineOilStatus = request.getParameter("engineOilStatus");
		String fuelFilterStatus = request.getParameter("fuelFilterStatus");
		String brakeOilStatus = request.getParameter("brakeOilStatus");
		String brakePedalStatus = request.getParameter("brakePedalStatus");
		String coolingWaterStatus = request.getParameter("coolingWaterStatus");
		String timingBeltStatus = request.getParameter("timingBeltStatus");
		String sparkPlugStatus = request.getParameter("sparkPlugStatus");

		Key objKey = null;
		boolean creating = false;

		PersistenceManager pm = PMF.get().getPersistenceManager();
		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());
		Company company = pm.getObjectById(Company.class, companyKey);
		Vehicle obj = null;

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
				obj = new Vehicle();
				obj.setKey(KeyFactory.keyToString(objKey));
				obj.setCompany(company);
				obj.setId(id);
				obj.setCreatedAt(now);
			} else {
				obj = pm.getObjectById(clazz, objKey);
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			if(manufacturer != null)
				obj.setManufacturer(manufacturer);
			if(vehicleType != null)
				obj.setVehicleType(vehicleType);
			if(birthYear != null)
				obj.setBirthYear(birthYear);
			if(ownershipType != null)
				obj.setOwnershipType(ownershipType);
			if(status != null)
				obj.setStatus(status);
			if(imageClip != null)
				obj.setImageClip(imageClip);
			if(totalDistance != null)
				obj.setTotalDistance(Double.parseDouble(totalDistance));
			if(registrationNumber != null)
				obj.setRegistrationNumber(registrationNumber);
			if(remainingFuel != null)
				obj.setRemainingFuel(Double.parseDouble(remainingFuel));
			if(distanceSinceNewOil != null)
				obj.setDistanceSinceNewOil(Double.parseDouble(distanceSinceNewOil));
			if(engineOilStatus != null)
				obj.setEngineOilStatus(engineOilStatus);
			if(fuelFilterStatus != null)
				obj.setFuelFilterStatus(fuelFilterStatus);
			if(brakeOilStatus != null)
				obj.setBrakeOilStatus(brakeOilStatus);
			if(brakePedalStatus != null)
				obj.setBrakePedalStatus(brakePedalStatus);
			if(brakePedalStatus != null)
				obj.setCoolingWaterStatus(coolingWaterStatus);
			if(timingBeltStatus != null)
				obj.setTimingBeltStatus(timingBeltStatus);
			if(sparkPlugStatus != null)
				obj.setSparkPlugStatus(sparkPlugStatus);

			obj.setUpdatedAt(now);

			obj = pm.makePersistent(obj);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();

		result.put("success", true);
		result.put("msg", clazz.getSimpleName() + (creating ? " created." : " updated"));
		result.put("key", obj.getKey());

		return result;
	}

	@RequestMapping(value = "/vehicle/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> delete(HttpServletRequest request, HttpServletResponse response) {
		String key = request.getParameter("key");

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Vehicle obj = pm.getObjectById(clazz, KeyFactory.stringToKey(key));

			pm.deletePersistent(obj);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", clazz.getSimpleName() + " destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/vehicle", method = RequestMethod.GET)
	public @ResponseBody
	List<Vehicle> retrieve(HttpServletRequest request, HttpServletResponse response) {
		CustomUser user = SessionUtils.currentUser();

		Key companyKey = KeyFactory.createKey(Company.class.getSimpleName(), user.getCompany());

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Company company = pm.getObjectById(Company.class, companyKey);

		return company.getVehicles();
	}

}
