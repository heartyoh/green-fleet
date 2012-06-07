#!/bin/bash
    
COOKIE_DATA=`cat cookie`
curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --data "terminal_id=PT-001&datetime=2012-06-08 12:00:00&lat=37.354&lng=127.121&velocity=100" http://green-fleets.appspot.com/track/save`
echo $curl