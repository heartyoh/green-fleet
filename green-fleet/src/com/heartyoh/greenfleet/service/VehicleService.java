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
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.heartyoh.greenfleet.model.Vehicle;
import com.heartyoh.util.PMF;

@Controller
public class VehicleService {
	private static final Logger logger = LoggerFactory.getLogger(VehicleService.class);

	@RequestMapping(value = "/vehicle/save", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> createVehicle(HttpServletRequest request, HttpServletResponse response) {
		UserService userService = UserServiceFactory.getUserService();
        User user = userService.getCurrentUser();

		String registrationNumber = request.getParameter("registrationNumber");
		String manufacturer = request.getParameter("manufacturer");
		String vehicleType = request.getParameter("vehicleType");
		String birthYear = request.getParameter("birthYear");
		String ownershipType = request.getParameter("ownershipType");
		String status = request.getParameter("status");
		String imageClip = request.getParameter("imageClip");
		double totalDistance = Double.parseDouble(request.getParameter("totalDistance"));
		double remainingFuel = Double.parseDouble(request.getParameter("remainingFuel"));
		double distanceSinceNewOil = Double.parseDouble(request.getParameter("distanceSinceNewOil"));
		String engineOilStatus = request.getParameter("engineOilStatus");
		String fuelFilterStatus = request.getParameter("fuelFilterStatus");
		String brakeOilStatus = request.getParameter("brakeOilStatus");
		String brakePedalStatus = request.getParameter("brakePedalStatus");
		String coolingWaterStatus = request.getParameter("coolingWaterStatus");
		String timingBeltStatus = request.getParameter("timingBeltStatus");
		String sparkPlugStatus = request.getParameter("sparkPlugStatus");

		Date now = new Date();

		Key key = KeyFactory.createKey(Vehicle.class.getSimpleName(), registrationNumber);

		boolean created = false;
		Vehicle vehicle = null;

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			try {
				vehicle = pm.getObjectById(Vehicle.class, key);
			} catch (JDOObjectNotFoundException e) {
				vehicle = new Vehicle();
				vehicle.setKey(key);
				vehicle.setRegistrationNumber(registrationNumber);
				vehicle.setCreatedAt(now);

				created = true;
			}
			/*
			 * 생성/수정 관계없이 새로 갱신될 정보는 아래에서 수정한다.
			 */

			vehicle.setManufacturer(manufacturer);
			vehicle.setVehicleType(vehicleType);
			vehicle.setBirthYear(birthYear);
			vehicle.setOwnershipType(ownershipType);
			vehicle.setStatus(status);
			vehicle.setImageClip(imageClip);
			vehicle.setTotalDistance(totalDistance);
			vehicle.setRegistrationNumber(registrationNumber);
			vehicle.setRemainingFuel(remainingFuel);
			vehicle.setDistanceSinceNewOil(distanceSinceNewOil);
			vehicle.setEngineOilStatus(engineOilStatus);
			vehicle.setFuelFilterStatus(fuelFilterStatus);
			vehicle.setBrakeOilStatus(brakeOilStatus);
			vehicle.setBrakePedalStatus(brakePedalStatus);
			vehicle.setCoolingWaterStatus(coolingWaterStatus);
			vehicle.setTimingBeltStatus(timingBeltStatus);
			vehicle.setSparkPlugStatus(sparkPlugStatus);
			vehicle.setUpdatedAt(now);

			vehicle = pm.makePersistent(vehicle);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", created ? "Vehicle created." : "Vehicle updated");
		result.put("key", KeyFactory.keyToString(vehicle.getKey()));

		return result;
	}

	@RequestMapping(value = "/vehicle/delete", method = RequestMethod.POST)
	public @ResponseBody
	Map<String, Object> deleteVehicle(HttpServletRequest request, HttpServletResponse response) {
		String registrationNumber = request.getParameter("registrationNumber");

		Key key = KeyFactory.createKey(Vehicle.class.getSimpleName(), registrationNumber);

		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			Vehicle Vehicle = pm.getObjectById(Vehicle.class, key);

			pm.deletePersistent(Vehicle);
		} finally {
			pm.close();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		result.put("msg", "Vehicle destroyed.");

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/vehicle", method = RequestMethod.GET)
	public @ResponseBody
	List<Vehicle> getObdData(HttpServletRequest request, HttpServletResponse response) {

		PersistenceManager pm = PMF.get().getPersistenceManager();

		Query query = pm.newQuery(Vehicle.class);

		// query.setFilter();
		// query.setOrdering();
		// query.declareParameters();

		return (List<Vehicle>) query.execute();
	}


}
