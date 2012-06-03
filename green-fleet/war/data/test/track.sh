#!/bin/bash
lat=$1
lng=$2
host="http://green-fleets.appspot.com"
#host="http://localhost:8888"
tid=$3
did=$4
vid=$5

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

    DATA="company=vitizen&terminal_id=$tid&vehicle_id=$vid&driver_id=$did&datetime=$CURRENT&lat=$lat&lng=$lng&velocity=100"
    echo $DATA
    
    curl=`curl --data "$DATA" $host/track/save`

    sleep 1
done
