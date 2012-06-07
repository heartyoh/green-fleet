#!/bin/bash
lat=37.38
lng=127.11
#host="http://green-fleets.appspot.com"
host="http://gf-backend.green-fleets.appspot.com/"
#host="http://localhost:8888"
tid="PT-003"

dt_incident=$(date '+%F %T')
lat_incident=$lat
lng_incident=$lng

DATA="terminal_id=$tid&datetime=$dt_incident&lat=$lat_incident&lng=$lng_incident&velocity=100&impulse_abs=121&impulse_x=30&impulse_y=34&impulse_z=45&impulse_threshold=100&obd_connected=true&engine_temp=123&engine_temp_threshold=150"
echo $DATA

COOKIE_DATA=`cat cookie`
curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --data "$DATA" $host/incident/save`
echo $curl
	
FORM_TERMINAL="terminal_id=$tid"
FORM_DT="datetime=$dt_incident"
FORM_VIDEO="video_clip=@/Users/jhnam/Desktop/v.mp4;type=video/mp4"
	
echo $FORM_TERMINAL $FORM_DT $FORM_VIDEO
	
#curl=`curl --max-time 120 --form $FORM_TERMINAL --form "$FORM_DT" --form $FORM_VIDEO $host/incident/upload_video`
curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --form $FORM_TERMINAL --form "$FORM_DT" --form $FORM_VIDEO $host/incident/upload_video`
echo $curl
	
FORM_LOG="file=@/Users/jhnam/Desktop/IncidentLog.csv"
curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --form $FORM_TERMINAL --form "$FORM_DT" --form $FORM_LOG $host/incident/upload_log`
echo $curl
