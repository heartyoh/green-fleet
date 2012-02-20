Ext.define('GreenFleet.store.VehicleMapStore', {
	extend : 'GreenFleet.store.VehicleStore',
	
	listeners : {
		load : function(store, data) {
			Ext.getStore('VehicleFilteredStore').loadData(data);
		}
	}
});