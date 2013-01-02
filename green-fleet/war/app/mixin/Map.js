Ext.define('GreenFleet.mixin.Map',
function() {
    var getLocation = function(lat, lng, callback) {
        if (lat !== undefined && lng !== undefined) {
            var latlng = new google.maps.LatLng(lat, lng);

            geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'latLng': latlng
            },
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        callback(results[0].formatted_address);
                    }
                } else {
                    callback('Geocoder fails due to : ' + status);
                }
            });
        }
    };

    function distance(lat1, lng1, lat2, lng2, unit) {
        var radlat1 = Math.PI * lat1 / 180
        var radlat2 = Math.PI * lat2 / 180
        var radlng1 = Math.PI * lng1 / 180
        var radlng2 = Math.PI * lng2 / 180
        var theta = lng1 - lng2
        var radtheta = Math.PI * theta / 180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180 / Math.PI
        dist = dist * 60 * 1.1515
        if (unit == "K") {
            dist = dist * 1.609344
        }
        if (unit == "N") {
            dist = dist * 0.8684
        }
        return dist
    };

    return {
        map: {
            getLocation: getLocation,
			distance: distance
        }
    };
} ());