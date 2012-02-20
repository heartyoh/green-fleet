#!/bin/bash
lat=37.38
lng=127.11
#host="http://green-fleets.appspot.com"
host="http://localhost:8888"
tid="T016"
did="D016"
vid="V016"

function incident {
	dt_incident=$1
	lat_incident=$2
	lng_incident=$3 

	DATA="company=vitizen&terminal_id=$tid&vehicle_id=$vid&driver_id=$did&datetime=$dt_incident&lattitude=$lat_incident&longitude=$lng_incident&velocity=100&impulse_abs=121&impulse_x=30&impulse_y=34&impulse_z=45&impulse_threshold=100&obd_connected=true&engine_temp=123&engine_temp_threshold=150"
	echo $DATA

	curl=`curl --data "$DATA" $host/incident/save`
	
	FORM_COMPANY="company=vitizen"
	FORM_TERMINAL="terminal_id=$tid"
	FORM_DT="datetime=$1"
	FORM_VIDEO="video_clip=@/Users/shnam/Desktop/v.mp4;type=video/mp4"
	
	echo $FORM_COMPANY $FORM_TERMINAL $FORM_DT $FORM_VIDEO
	
	curl=`curl --form $FORM_COMPANY --form $FORM_TERMINAL --form "$FORM_DT" --form $FORM_VIDEO $host/incident/upload_video`
	
	FORM_LOG="file=@/Users/shnam/Desktop/IncidentLog.csv"
	
	curl=`curl --form $FORM_COMPANY --form $FORM_TERMINAL --form "$FORM_DT" --form $FORM_LOG $host/incident/upload_log`
}

for i in {1..100}
do
    CURRENT=$(date '+%F %T')
    echo $CURRENT

    let lat_rand=($RANDOM % 5)
    let lat_rand-=1

    let lng_rand=($RANDOM % 5)
    let lng_rand-=1

    lat=`echo "($lat_rand * 0.002) + $lat" | bc -l`
    lng=`echo "($lng_rand * 0.002) + $lng" | bc -l`

    DATA="company=vitizen&terminal_id=$tid&vehicle_id=$vid&driver_id=$did&datetime=$CURRENT&lattitude=$lat&longitude=$lng&velocity=100"
    echo $DATA
    
    curl=`curl --data "$DATA" $host/track/save`

	if [ $i -eq 1 ]; then
		incident "$CURRENT" $lat $lng 
	fi;

    sleep 10
done
