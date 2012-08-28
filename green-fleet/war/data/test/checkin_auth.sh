#!/bin/bash
host=http://green-fleets.appspot.com/checkin_data/save

DATA="company=palmvision&terminal_id=PT-001&vehicle_id=PV-001&driver_id=PD-001&datetime=2012-08-22 17:45:00&distance=230&running_time=320&less_than_10km=10&less_than_20km=20&less_than_30km=30&less_than_40km=40&less_than_50km=50&less_than_60km=60&less_than_70km=70&less_than_80km=80&less_than_90km=90&less_than_100km=40&less_than_110km=30&less_than_120km=20&less_than_130km=10&less_than_140km=5&less_than_150km=0&less_than_160km=0&engine_start_time=2012-08-22 09:00:00&engine_end_time=2012-08-22 17:40:00&average_speed=75&max_speed=146&fuel_consumption=43&fuel_efficiency=3.1&sudden_accel_count=35&sudden_brake_count=32&idle_time=32&eco_driving_time=35&over_speed_time=40&co2_emissions=123&max_cooling_water_temp=65&avg_battery_volt=12.3"

COOKIE_DATA=`cat cookie`

curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --data "$DATA" -L -i $host`

echo $curl

