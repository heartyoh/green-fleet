#!/bin/bash
lat=$1
lng=$2
host="http://green-fleets.appspot.com"
#host="http://localhost:8888"
tid=$3

for i in {1..10}
do
    CURRENT=$(date '+%F %T')
    echo $CURRENT

    let lat_rand=($RANDOM % 5)
    let lat_rand-=1

    let lng_rand=($RANDOM % 5)
    let lng_rand-=1

    lat=`echo "($lat_rand * 0.002) + $lat" | bc -l`
    lng=`echo "($lng_rand * 0.002) + $lng" | bc -l`
	
    DATA="terminal_id=$tid&datetime=$CURRENT&lat=$lat&lng=$lng&velocity=85"
    echo $DATA
    
    COOKIE_DATA=`cat cookie`
	curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --data "$DATA" $host`
	#curl=`curl --data "$DATA" $host/track/save`
    echo $curl

    sleep 1
done
