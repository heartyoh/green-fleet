#!/bin/bash
lat=37.38
lng=127.11
host="http://heartyoh.appspot.com"

function incident {
	dt_incident=$1
	lat_incident=$2
	lng_incident=$3 

	DATA="company=vitizen&terminal_id=T001&vehicle_id=V001&driver_id=D001&datetime=$dt_incident&lattitude=$lat_incident&longitude=$lng_incident&velocity=100&impulse_abs=121&impulse_x=30&impulse_y=34&impulse_z=45&impulse_threshold=100&obd_connected=true&engine_temp=123&engine_temp_threshold=150"
	echo $DATA

	curl=`curl --data "$DATA" $host/incident/save`
	
	FORM_COMPANY="company=vitizen"
	FORM_TERMINAL="terminal_id=T001"
	FORM_DT="datetime=$1"
	FORM_VIDEO="video_clip=@/Users/heartyoh/Desktop/v.mp4;type=video/mp4"
	
	echo $FORM_COMPANY $FORM_TERMINAL $FORM_DT $FORM_VIDEO
	
	curl=`curl --form $FORM_COMPANY --form $FORM_TERMINAL --form "$FORM_DT" --form $FORM_VIDEO $host/incident/upload_video`
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

    DATA="company=vitizen&terminal_id=T001&vehicle_id=V001&driver_id=D001&datetime=$CURRENT&lattitude=$lat&longitude=$lng&velocity=100"
    echo $DATA
    
    curl=`curl --data "$DATA" $host/track/save`

	if [ $i -eq 1 ]; then
		incident "$CURRENT" $lat $lng 
	fi;

    sleep 60
done