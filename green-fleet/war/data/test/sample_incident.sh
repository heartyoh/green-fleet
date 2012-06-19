#!/bin/bash

#host=http://localhost:8888

host=http://green-fleets.appspot.com

DATA="company=palmvision&terminal_id=PT-002&datetime=2012-06-19 20:25:00&lat=37.1071&lng=127.137&velocity=120&impulse_abs=121&impulse_x=30&impulse_y=34&impulse_z=45&impulse_threshold=100&obd_connected=true&engine_temp=123&engine_temp_threshold=150"
#COOKIE_DATA=`cat cookie`
#curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --data "$DATA" $host/incident/save`
curl=`curl --data "$DATA" $host/incident/save`
echo $curl

#curl=`curl -v -H "Cookie: ACSID=$COOKIE_DATA" --form "terminal_id=PT-002" --form "datetime=2012-06-19 20:25:00" --form "video_clip=@/Users/jhnam/Desktop/v.mp4;type=video/mp4" $host/incident/upload_video`
curl=`curl -v --form "company=palmvision" --form "terminal_id=PT-002" --form "datetime=2012-06-19 20:25:00" --form "video_clip=@/Users/jhnam/Desktop/v.mp4;type=video/mp4" $host/incident/upload_video`
echo $curl
	
#curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --form "terminal_id=PT-002" --form "datetime=2012-06-19 20:25:00" --form "file=@/Users/jhnam/Desktop/IncidentLog.csv" $host/incident/upload_log`
#echo $curl

curl=`curl --form "company=palmvision" --form "terminal_id=PT-002" --form "datetime=2012-06-19 20:25:00" --form "file=@/Users/jhnam/Desktop/IncidentLog.csv" $host/incident/upload_log`
echo $curl

