Ext.define('GreenFleet.mixin.Mixin', {
	mixin : function(clazz, config) {
		try {
			switch (typeof (clazz)) {
			case 'string':
				Ext.apply(Ignite, Ext.create(clazz, config));
				return;
			case 'object':
				Ext.apply(Ignite, clazz);
			}
		} catch (e) {
			console.log(e.stack);
		}
	}
});