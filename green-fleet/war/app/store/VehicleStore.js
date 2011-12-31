Ext.define('GreenFleet.store.VehicleStore', {
	extend : 'Ext.data.Store',

	autoLoad : true,
	
	listeners : {
		datachanged : function(store) {
			store.each(function(record) {
				var lattitude = record.get('lattitude');
				var longitude = record.get('longitude');
				
				if(!lattitude || !longitude)
					return;
				
			    var latlng = new google.maps.LatLng(lattitude, longitude);
			    
				geocoder = new google.maps.Geocoder();
			    geocoder.geocode({'latLng': latlng}, function(results, status) {
			        if (status == google.maps.GeocoderStatus.OK) {
			          if (results[1]) {
			            record.set('location', results[1].formatted_address);
			          }
			        } else {
			          console.log("Geocoder failed due to: " + status);
			        }
			      });
			});
		}
	},

	fields : [ {
		name : 'key',
		type : 'string'
	}, {
		name : 'id',
		type : 'string'
	}, {
		name : 'registrationNumber',
		type : 'string'
	}, {
		name : 'manufacturer',
		type : 'string'
	}, {
		name : 'vehicleType',
		type : 'string'
	}, {
		name : 'birthYear',
		type : 'string'
	}, {
		name : 'ownershipType',
		type : 'string'
	}, {
		name : 'status',
		type : 'string'
	}, {
		name : 'imageClip',
		type : 'string'
	}, {
		name : 'totalDistance',
		type : 'string'
	}, {
		name : 'remainingFuel',
		type : 'string'
	}, {
		name : 'distanceSinceNewOil',
		type : 'string'
	}, {
		name : 'engineOilStatus',
		type : 'string'
	}, {
		name : 'fuelFilterStatus',
		type : 'string'
	}, {
		name : 'brakeOilStatus',
		type : 'string'
	}, {
		name : 'brakePedalStatus',
		type : 'string'
	}, {
		name : 'coolingWaterStatus',
		type : 'string'
	}, {
		name : 'timingBeltStatus',
		type : 'string'
	}, {
		name : 'sparkPlugStatus',
		type : 'string'
	}, {
		name : 'driver',
		type : 'string'
	}, {
		name : 'lattitude',
		type : 'float'
	}, {
		name : 'longitude',
		type : 'float'
	}, {
		name : 'location',
		type : 'string'
	}, {
		name : 'createdAt',
		type : 'date',
		dateFormat:'time'
	}, {
		name : 'updatedAt',
		type : 'date',
		dateFormat:'time'
	} ],
	
	proxy : {
		type : 'ajax',
		url : 'vehicle',
		reader : {
			type : 'json'
		}
	}
});