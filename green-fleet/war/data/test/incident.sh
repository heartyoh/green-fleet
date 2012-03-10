#!/bin/bash
lat=37.38
lng=127.11
host="http://green-fleets.appspot.com"
#host="http://localhost:8888"
tid="T016"
did="D016"
vid="V016"

dt_incident=$(date '+%F %T')
lat_incident=$lat
lng_incident=$lng

DATA="company=vitizen&terminal_id=$tid&vehicle_id=$vid&driver_id=$did&datetime=$dt_incident&lattitude=$lat_incident&longitude=$lng_incident&velocity=100&impulse_abs=121&impulse_x=30&impulse_y=34&impulse_z=45&impulse_threshold=100&obd_connected=true&engine_temp=123&engine_temp_threshold=150"
echo $DATA

curl=`curl --data "$DATA" $host/incident/save`
	
FORM_COMPANY="company=vitizen"
FORM_TERMINAL="terminal_id=$tid"
FORM_DT="datetime=$dt_incident"
FORM_VIDEO="video_clip=@/Users/jhnam/Desktop/v.mp4;type=video/mp4"
	
echo $FORM_COMPANY $FORM_TERMINAL $FORM_DT $FORM_VIDEO
	
curl=`curl --form $FORM_COMPANY --form $FORM_TERMINAL --form "$FORM_DT" --form $FORM_VIDEO $host/incident/upload_video`
	
FORM_LOG="file=@/Users/jhnam/Desktop/IncidentLog.csv"
	
curl=`curl --form $FORM_COMPANY --form $FORM_TERMINAL --form "$FORM_DT" --form $FORM_LOG $host/incident/upload_log`
