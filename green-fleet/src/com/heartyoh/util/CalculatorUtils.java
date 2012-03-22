/**
 * 
 */
package com.heartyoh.util;

import java.util.Calendar;
import java.util.Date;
import java.util.Map;

import com.google.appengine.api.datastore.Entity;

/**
 * 각종 계산 함수를 제공하는 유틸리티 클래스 
 * 
 * @author jhnam
 *
 */
public class CalculatorUtils {
	
	/**
	 * 소모품의 최근 교체일, 최근 교체 주행거리, 다음 교체일, 다음 교체 주행거리, 건강율, 상태 등의 정보를 업데이트한다. 
	 * 
	 * @param currentVehicleMileage
	 * @param consumable
	 */
	public static void resetConsumable(double currentVehicleMileage, Entity consumable) {
		
		String replUnit = DataUtils.toNotNull(consumable.getProperty("repl_unit"));
		Date nextReplDate = null;
		float nextReplMileage = -1f;
		
		// 다음 교체일 계산
		if(GreenFleetConstant.REPL_UNIT_TIME.equals(replUnit) || GreenFleetConstant.REPL_UNIT_MILEAGE_TIME.equals(replUnit)) {			
			int replMonth = DataUtils.toInt(consumable.getProperty("repl_time"));
			if(replMonth > 0) {
				int amount = replMonth * 30;
				nextReplDate = DataUtils.add(new Date(), amount);
			}
		} 
		
		// 다음 교체 주행거리 계산 
		if(GreenFleetConstant.REPL_UNIT_MILEAGE.equals(replUnit) || GreenFleetConstant.REPL_UNIT_MILEAGE_TIME.equals(replUnit)) {
			float replMiles = DataUtils.toFloat(consumable.getProperty("repl_mileage"));
			if(replMiles > 1f) {
				nextReplMileage = (float)currentVehicleMileage + replMiles;
			}
		}
		
		consumable.setProperty("last_repl_date", new Date());
		consumable.setProperty("miles_last_repl", (float)currentVehicleMileage);
		consumable.setProperty("health_rate", 0f);
		consumable.setProperty("status", "Healthy");
		
		if(nextReplDate != null)
			consumable.setProperty("next_repl_date", nextReplDate);
		
		if(nextReplMileage >= 0f)
			consumable.setProperty("next_repl_mileage", nextReplMileage);		
	}	
	
	/**
	 * consumableChange로 부터 consumable 정보를 모두 재계산하여 업데이트한다.  
	 * 
	 * @param totalMileage
	 * @param consumable
	 * @param consumableChange
	 */
	public static void calcConsumableInfo(double totalMileage, Entity consumable, Entity consumableChange) {
		
		// 교체 단위 
		String replUnit = DataUtils.toNotNull(consumable.getProperty("repl_unit"));
		
		// 교체시 넘어온 마지막 교체일 
		Date lastReplDate = DataUtils.toDate(consumableChange.getProperty("repl_date"));
		if(lastReplDate != null) {
			consumable.setProperty("last_repl_date", lastReplDate);
		}
		
		// 교체시 넘어온 마지막 교체시 주행거리 TODO double 타입 정도로 변경 
		float milesLastRepl = DataUtils.toFloat(consumableChange.getProperty("repl_mileage"));
		if(milesLastRepl > 0) {
			float oldMilesLastRepl = DataUtils.toFloat(consumable.getProperty("miles_last_repl"));
			if(milesLastRepl > oldMilesLastRepl)
				consumable.setProperty("miles_last_repl", milesLastRepl);
		}

		// 누적 비용 
		if(DataUtils.toInt(consumableChange.getProperty("cost")) > 0) {
			int accruedCost = DataUtils.toInt(consumable.getProperty("accrued_cost"));
			accruedCost += DataUtils.toInt(consumableChange.getProperty("cost"));
			consumable.setProperty("accrued_cost", accruedCost);
		}
		
		// 다음 교체 마일리지 
		if(replUnit.equalsIgnoreCase(GreenFleetConstant.REPL_UNIT_MILEAGE) || replUnit.equalsIgnoreCase(GreenFleetConstant.REPL_UNIT_MILEAGE_TIME)) {
			float replMileage = DataUtils.toFloat(consumable.getProperty("repl_mileage"));
			float nextReplMileage = milesLastRepl + replMileage;
			consumable.setProperty("next_repl_mileage", nextReplMileage);
		}
		
		// 다음 교체일자
		if(replUnit.equalsIgnoreCase(GreenFleetConstant.REPL_UNIT_TIME) || replUnit.equalsIgnoreCase(GreenFleetConstant.REPL_UNIT_MILEAGE_TIME)) {
			int replTime = DataUtils.toInt(consumable.getProperty("repl_time"));
			Calendar c = Calendar.getInstance();
			c.setTime(lastReplDate != null ? lastReplDate : new Date());
			c.add(Calendar.DATE, 30 * replTime);
			Date nextReplDate = c.getTime();
			consumable.setProperty("next_repl_date", nextReplDate);
		}
		
		// 건강율, 상태 
		calcConsumableHealth(totalMileage, consumable);
	}
	
	/**
	 * 차량별 소모품별 health rate, status 재계산
	 * 
	 * @param totalMileage
	 * @param consumable
	 * @return 변경된 내용이 있으면 true, 변경된 내용이 없으면 false 
	 */
	public static boolean calcConsumableHealth(double totalMileage, Entity consumable) {
		
		// 계산 로직 
		String replUnit = DataUtils.toNotNull(consumable.getProperty("repl_unit"));
		float newHealthRate = 0f;
		
		// 1. 단위가 miles일 경우
		if(replUnit.equalsIgnoreCase(GreenFleetConstant.REPL_UNIT_MILEAGE)) {
			newHealthRate = calcConsumableHealthByMileage(totalMileage, consumable);
			
		// 2. 단위가 time일 경우	
		} else if(replUnit.equalsIgnoreCase(GreenFleetConstant.REPL_UNIT_TIME)) {
			newHealthRate = calcConsumableHealthByTime(totalMileage, consumable);
					
		// 3. 단위가 miles and time일 경우
		} else if(replUnit.equalsIgnoreCase(GreenFleetConstant.REPL_UNIT_MILEAGE_TIME)) {
			newHealthRate = calcConsumableHealthByMileageTime(totalMileage, consumable);
			
		// 4. 그 외 계산 하지 않음
		} else {
			return false;
		}
		
		if(newHealthRate >= 0f) {
			consumable.setProperty("health_rate", newHealthRate);
			String status = getConsumableHealthStatus(newHealthRate);
			if(status != null) {
				consumable.setProperty("status", status);
			}
			
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 소모품 교체 단위가 Mileage일 경우 health rate 계산, 현재 차량 주행거리에서 마지막 교체 주행거리를 빼서 그 값과 교체 주행거리와의 비율을 계산
	 * 
	 * @param totalMileage
	 * @param consumable
	 * @return
	 */
	public static float calcConsumableHealthByMileage(double totalMileage, Entity consumable) {
		
		// 최근 교체시점의 마일리지 
		float milesLastRepl = DataUtils.toFloat(consumable.getProperty("miles_last_repl"));
		// 교체 주행거리
		float replMileage = DataUtils.toFloat(consumable.getProperty("repl_mileage"));
		
		if(replMileage <= 0f)
			return -1f;
				
		// 최근 교체 후 주행거리 
		float milesAfterRepl = (float)totalMileage - milesLastRepl;
		
		if(DataUtils.toFloat(consumable.getProperty("next_repl_mileage")) <= 0f) {
			float nextReplMileage = milesLastRepl + replMileage;
			consumable.setProperty("next_repl_mileage", nextReplMileage);
		}
		
		if(replMileage < 0 || milesAfterRepl < 0) {
			return -1f;
		} else {
			return (milesAfterRepl / replMileage);
		}
	}
	
	/**
	 * 소모품 교체 단위가 Time일 경우 health rate 계산, 오늘 날짜에서 마지막 교체일을 빼서 그 값과 교체일의 비율을 계산
	 * 
	 * @param totalMileage
	 * @param consumable
	 * @return
	 */
	public static float calcConsumableHealthByTime(double totalMileage, Entity consumable) {
		
		// 최근 교체일  
		Date lastReplDate = DataUtils.toDate(consumable.getProperty("last_repl_date"));
		// 교체 주기
		int replTime = DataUtils.toInt(consumable.getProperty("repl_time"));
		// 다음 교체일
		Date nextReplDate = DataUtils.toDate(consumable.getProperty("next_repl_date"));
		
		// FIXME 최근 교체일이 없다면 아직 한 번도 교체하지 않았다는 의미이므로 차량을 최초 구입한 날짜로 해야하지만 그 정보가 차량에 없다. ==> vehicle에 추가 필요 
		if(lastReplDate == null || replTime == 0)
			return -1f;
				
		// 다음 교체일이 없다면 계산해 줌 
		if(nextReplDate == null) {
			Calendar c = Calendar.getInstance();
			c.setTime(lastReplDate);
			c.add(Calendar.DATE, 30 * replTime);
			nextReplDate = c.getTime();
			consumable.setProperty("next_repl_date", nextReplDate);
		}
		
		// 1. 다음 교체일에서 최근 교체일을 빼줌
		float totalDays = replTime * 30;
		// 2. 다음 교체일에서 오늘날짜를 빼줌 
		float fastDays = (new Date().getTime() - lastReplDate.getTime()) / (1000 * 60 * 60 * 24);
		// 3. 차이 
		float gap = totalDays - fastDays;
		
		// 이 경우는 설정이 잘 못된 경우 
		if(gap < 0)
			return -1f;

		return fastDays / totalDays; 
	}
	
	/**
	 * 소모품 교체 단위가 MileageTime일 경우 health rate 계산, Mileage, Time 두 경우 다 계산 한 후 큰 것을 리턴 
	 * 
	 * @param totalMileage
	 * @param consumable
	 * @return
	 */
	public static float calcConsumableHealthByMileageTime(double totalMileage, Entity consumable) {
		float rateByMileage = calcConsumableHealthByMileage(totalMileage, consumable);
		float rateByTime = calcConsumableHealthByTime(totalMileage, consumable);
		return (rateByMileage > rateByTime) ? rateByMileage : rateByTime;
	}
	
	/**
	 * consumable의 health rate에 따른 status를 리턴 
	 *   
	 * @param healthRate
	 * @return
	 */
	public static String getConsumableHealthStatus(float healthRate) {		
		if(healthRate >= 0f) {
			return (healthRate < 0.9f) ? "Healthy" : "Impending";	
		} else {
			return null;
		}
	}
	
	/**
	 * 소모품 다음 교체 마일리지 계산 
	 * 
	 * @param consumable
	 * @return
	 */
	public static float calcConsumableNextReplMileage(Map<String, Object> consumableMap) {
		
		// 최근 교체시점의 마일리지 
		float milesLastRepl = DataUtils.toFloat(consumableMap.get("miles_last_repl"));
		// 교체 주행거리
		float replMileage = DataUtils.toFloat(consumableMap.get("repl_mileage"));
		
		return (replMileage <= 0f) ? -1f : (milesLastRepl + replMileage);
	}
	
	/**
	 * 소모품의 다음 교체일 계산
	 * 
	 * @param consumableMap
	 * @return
	 */
	public static Date calcConsumableNextReplDate(Map<String, Object> consumableMap) {
		// 최근 교체일  
		Date lastReplDate = DataUtils.toDate(consumableMap.get("last_repl_date"));
		// 교체 주기
		int replTime = DataUtils.toInt(consumableMap.get("repl_time"));
		
		// FIXME 최근 교체일이 없다면 아직 한 번도 교체하지 않았다는 의미이므로 차량을 최초 구입한 날짜로 해야하지만 그 정보가 차량에 없다. ==> vehicle에 추가 필요 
		if(lastReplDate == null || replTime == 0)
			return null;
				
		Calendar c = Calendar.getInstance();
		c.setTime(lastReplDate);
		c.add(Calendar.DATE, 30 * replTime);
		return c.getTime();
	}	
}
