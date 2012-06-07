#!/bin/bash

DATA="terminal_id=PT-002&datetime=2012-06-07 19:00:00&lat=37.25&lng=127.145&velocity=120&impulse_abs=121&impulse_x=30&impulse_y=34&impulse_z=45&impulse_threshold=100&obd_connected=true&engine_temp=123&engine_temp_threshold=150"
COOKIE_DATA=`cat cookie`
curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --data "$DATA" http://green-fleets.appspot.com/incident/save`
echo $curl

curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --form "terminal_id=PT-002" --form "datetime=2012-06-07 19:00:00" --form "video_clip=@/Users/jhnam/Desktop/v4.mp4;type=video/mp4" http://gf-backend.green-fleets.appspot.com/incident/upload_video`
echo $curl
	
curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --form "terminal_id=PT-002" --form "datetime=2012-06-07 19:00:00" --form "file=@/Users/jhnam/Desktop/IncidentLog.csv" http://green-fleets.appspot.com/incident/upload_log`
echo $curl