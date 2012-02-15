Ext.define('GreenFleet.view.form.SearchField', {
	extend : 'Ext.form.field.ComboBox',
	
	alias : 'widget.searchfield',
	
	queryMode : 'local',
	
	displayField : 'id',
	
	matchFieldWidth : false,
	
	typeAhead: true,
	
	emptyText : 'Alt+Q',
	
	store : 'VehicleStore',
	
	initComponent : function() {
		this.store = Ext.getStore('VehicleStore');
		
		this.callParent();
		
		new Ext.util.KeyMap(document, {
			key : 'q',
			alt : true,
			fn : this.focus,
			scope : this
		});
	},
	
	listConfig : {
		loadingText : 'Searching...',
		emptyText : 'No matching vehicles found.',
		getInnerTpl : function() {
			return '<div class="appSearchItem"><span class="id">{id}</span> <span class="registration_number">{registration_number}</span></div>';
		},
		minWidth : 200
	},
	
	listeners : {
		'select' : function(combo, records, eOpts) {
			var store = Ext.getStore('VehicleMapStore');
			
			store.clearFilter();
			
			store.filter([ {
				property : 'id',
				value : records[0].get('id')
			} ]);
			
//			store.load();
		}
	}
	
});