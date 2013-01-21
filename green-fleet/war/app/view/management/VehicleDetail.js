Ext.define('GreenFleet.view.management.VehicleDetail', {
	extend : 'Ext.panel.Panel',

	alias : 'widget.management_vehicle_detail',

	title : T('title.vehicle_details'),

	layout : {
		align : 'stretch',
		type : 'vbox'
	},	
	
	initComponent : function() {
		var self = this;
		this.callParent(arguments);
		this.add(this.vehicleForm());		
	},
	
	/**
	 * 차량 상세 페이지 리프레쉬 
	 */
	refresh : function(vehicleId, regNo) {	
		// vehicleId 값이 없거나 이전에 선택한 vehicleId와 현재 선택된 vehicleId가 같다면 skip 
		if(!vehicleId || vehicleId == '' || vehicleId == this.vehicle)
			return;
				
		var self = this;
		this.vehicle = vehicleId;		
		self.formSetDisabled(true);
	
		Ext.Ajax.request({
			url : 'vehicle/find',
			method : 'GET',
			params : {
				id : vehicleId
			},
			success : function(response, opts) {
				var record = Ext.JSON.decode(response.responseText);
				var newRecord = {};
				newRecord.data = {};
				
				// lat, lng 정보가 있다면 location 정보를 얻어와서 vehicle form loading...
	    		if(record.lat !== undefined && record.lng !== undefined && record.lat > 0 && record.lng > 0) {
	    			var latlng = new google.maps.LatLng(record.lat, record.lng);
	    			geocoder = new google.maps.Geocoder();
	    			geocoder.geocode({
	    				'latLng' : latlng
	    			}, function(results, status) {
	    				if (status == google.maps.GeocoderStatus.OK) {
	    					if (results[0]) {
	    						var address = results[0].formatted_address;
	    						record.location = address;
	    						newRecord.data = record;
	    						self.sub('form').loadRecord(newRecord);	    						
	    					}
	    				} else {
	    					console.log("Geocoder failed due to: " + status);
	    				}
	        		});    			
	    		}
			},
			failure : function(response, opts) {
				Ext.Msg.alert(T('label.failure'), response.responseText);
			}
		});		
	},
	
	vehicleForm : function(main) {
		return {
			xtype : 'panel',
			bodyPadding : 10,
			cls : 'hIndexbar',	
			title : T('title.vehicle_details'),
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			flex : 1,
			items : [{
		    	xtype : 'form',
		    	itemId : 'form',
		    	flex : 1,
		    	autoScroll : true,
		    	defaults : {
		    		xtype : 'textfield',
		    		anchor : '100%'
		    	},
		    	items : [ {
		    		name : 'key',
		    		fieldLabel : 'Key',
		    		hidden : true
				}, {
					itemId: 'form_id',
					name : 'id',
					fieldLabel : T('label.id'),
					allowBlank : false,
					afterLabelTextTpl: required
				}, {
					name : 'registration_number',
					fieldLabel : T('label.reg_no'),
					allowBlank : false,
					afterLabelTextTpl: required
				}, {
					name : 'vehicle_model',
					fieldLabel : T('label.vehicle_model'),
					allowBlank : false,
					afterLabelTextTpl: required
				}, {
					xtype : 'codecombo',
					name : 'manufacturer',
					group : 'V-Maker',
					fieldLabel : T('label.manufacturer'),
					afterLabelTextTpl: required
				}, {
					xtype : 'codecombo',
					name : 'vehicle_type',
					group : 'V-Type1',
					fieldLabel : T('label.vehicle_type'),
					afterLabelTextTpl: required
				}, {
					xtype : 'codecombo',
					name : 'fuel_type',
					group : 'V-Fuel',
					fieldLabel : T('label.fuel_type'),
					afterLabelTextTpl: required
				}, {
					xtype : 'codecombo',
					name : 'birth_year',
					group : 'V-BirthYear',
					name : 'birth_year',
					fieldLabel : T('label.birth_year')
				}, {
					xtype : 'combo',
					name : 'ownership_type',
					queryMode : 'local',
					store : 'OwnershipStore',
					displayField : 'desc',
					valueField : 'name',
					fieldLabel : T('label.ownership_type'),
					afterLabelTextTpl: required
				}, {
					xtype : 'combo',
					itemId: 'form_status',
					name : 'status',
					queryMode : 'local',
					store : 'VehicleStatusStore',
					displayField : 'desc',
					valueField : 'status',
					fieldLabel : T('label.status')
				}, {
					itemId: 'form_health_status',
					name : 'health_status',
					fieldLabel : T('label.health'),
					readOnly : true
				}, {
					itemId: 'form_total_distance',
					name : 'total_distance',
					fieldLabel : T('label.total_distance'),
					readOnly : true
				}, {
					itemId: 'form_total_run_time',
					name : 'total_run_time',
					fieldLabel : T('label.total_run_time'),
					readOnly : true
				}, {
					itemId: 'form_official_effcc',
					name : 'official_effcc',
					fieldLabel : T('label.official_effcc'),
					readOnly : true
				}, {
					itemId: 'form_avg_effcc',
					name : 'avg_effcc',
					fieldLabel : T('label.avg_effcc'),
					readOnly : true
				}, {
					itemId: 'form_eco_index',
					name : 'eco_index',
					fieldLabel : T('label.eco_index'),
					readOnly : true
				}, {
					itemId: 'form_eco_run_rate',
					name : 'eco_run_rate',
					fieldLabel : T('label.eco_run_rate'),
					readOnly : true
				}, {
					itemId: 'form_remaining_fuel',
					name : 'remaining_fuel',
					fieldLabel : T('label.remaining_fuel'),
					readOnly : true
				}, {
					name : 'location',
					fieldLabel : T('label.location'),
					readOnly : true
				}, {
					name : 'lat',
					fieldLabel : T('label.latitude'),
					readOnly : true
				}, {
					name : 'lng',
					fieldLabel : T('label.longitude'),
					readOnly : true
				}, {
					xtype : 'filefield',
					name : 'image_file',
					fieldLabel : T('label.image_upload'),
					msgTarget : 'side',
					allowBlank : true,
					buttonText : T('button.file')
				}, {
					xtype : 'displayfield',
					name : 'image_clip',
					itemId : 'image_clip',
					hidden : true
				} ]
			}],
			
			dockedItems : [ {
				xtype : 'entity_form_buttons',
				loader : {
					fn : function(callback) {
						var vehicleStore = Ext.getStore('VehicleImageBriefStore');
						vehicleStore.load(callback);
					},
					resetFn : function(callback) {
						this.formSetDisabled(false);
					},
					scope : this
				}
			} ]
		}
	},
	
	formSetDisabled : function(mode){
		this.sub('form_id').setReadOnly(mode);
	}
	
});