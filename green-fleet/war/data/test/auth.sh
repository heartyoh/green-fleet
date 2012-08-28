#!/bin/bash

curl -f -s --output authfile.txt -d Email=maparam419@gmail.com -d Passwd=jhnam2042 -d accountType=GOOGLE -d service=ah -d source=green-fleets https://www.google.com/accounts/ClientLogin
curl -c cookiefile "http://green-fleets.appspot.com/_ah/login?auth=`cat authfile.txt | grep ^Auth= | cut -d= -f2`" > /dev/null
cat cookiefile | grep -v ^'# '| grep -v ^$|cut -f7 > cookie

curl=`curl -H "Cookie: ACSID=$COOKIE_DATA" --data "$DATA" -i $host`