Ext.define('GreenFleet.view.vehicle.OBDCollector', {
	extend : 'Ext.form.Panel',
	
	alias : 'widget.obd',
	
	title : 'Collection OBD Information',
	
//    url: 'obd',

    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },
    
    items : [{
		xtype : 'textfield',
		name : 'vehicle',
		fieldLabel : 'Vehicle',
		value : '1234567890'
	}, {
		xtype : 'textfield',
		name : 'speed',
		fieldLabel : 'Speed',
		value : 120
	}, {
		xtype : 'textfield',
		name : 'gas',
		fieldLabel : 'Gas',
		value : 65
	}, {
		xtype : 'textfield',
		name : 'tirePressure',
		fieldLabel : 'Tire Pressure',
		value : 23
	}, {
		xtype : 'textfield',
		name : 'longitude',
		fieldLabel : 'Longitude',
		value : '126°58\'40.63"E'
	}, {
		xtype : 'textfield',
		name : 'latitude',
		fieldLabel : 'Latitude',
		value : '37°33\'58.87"N'
	}],
	
    buttons: [{
        text: 'Reset',
        handler: function() {
            this.up('form').getForm().reset();
        }
    }, {
        text: 'Submit',
        formBind: true, //only enabled once the form is valid
        disabled: true,
        handler: function() {
            var form = this.up('form').getForm();
            console.log(form);
            if (form.isValid()) {
                form.submit({
                	url : 'obd',
                    success: function(form, action) {
                       GreenFleet.msg('Success', action.result.msg);
                    },
                    failure: function(form, action) {
                        GreenFleet.msg('Failed', action.result.msg);
                    }
                });
            }
        }
    }]
});
